import express from 'express'
import http from 'http'
import axios from 'axios'
import crypto from 'crypto'
import * as fs from 'fs/promises'

import { createWriteStream } from 'fs'
import { parse as parseUrl } from 'url'
import { join, extname, basename } from 'path'

/* Open AI | LLM*/
import { OpenAI } from 'langchain/llms/openai'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { HuggingFaceInferenceEmbeddings } from 'langchain/embeddings/hf'
import { PromptTemplate } from 'langchain/prompts'
import {
  loadQAStuffChain,
  loadQAMapReduceChain,
  RetrievalQAChain,
  LLMChain,
  VectorDBQAChain,
} from 'langchain/chains'
import { HuggingFaceInference } from 'langchain/llms/hf'
import { Replicate } from 'langchain/llms/replicate'
import { HNSWLib } from 'langchain/vectorstores/hnswlib'

/* Parsers */
import { WebBrowser } from 'langchain/tools/webbrowser'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio'
import { UnstructuredLoader } from 'langchain/document_loaders/fs/unstructured'
import { Document } from 'langchain/document'
import SitemapXMLParser from 'sitemap-xml-parser'

/* Tools */
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { RedisCache } from 'langchain/cache/redis'
import { createClient } from 'redis'
import sanitizeHtml from 'sanitize-html'

/* OpenSearch */
/*
import { Client } from '@opensearch-project/opensearch'
import { OpenSearchVectorStore } from 'langchain/vectorstores/opensearch'

const client = new Client({
  nodes: [process.env.OPENSEARCH_URL ?? 'http://127.0.0.1:9200'],
}) */

import { AI_PROMPT, Client, HUMAN_PROMPT } from '@anthropic-ai/sdk'

/* Load environment variables from .env file */
import * as dotenv from 'dotenv'
dotenv.config()

const claude = new Client(process.env.ANTHROPIC_API_KEY)

/* Init Redis for cache */
const clientRedis = createClient({
  url: process.env.REDIS_URL,
})

const cache = new RedisCache(clientRedis)
clientRedis.connect()
clientRedis.on('error', (err) => {
  console.error('Error connecting to Redis:', err)
})

clientRedis.on('ready', () => {
  console.log('Connected to Redis server.')
})

/* Set up Express app */
const app = express()

/* Middleware to parse JSON request bodies */
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

/* Create HTTP server */
http.createServer(app).listen(process.env.PORT)
console.info('Voiceflow Langchain API is listening on port ' + process.env.PORT)

/* Get endpoint to check current status  */
app.get('/api/health', async (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
  })
})

/* Clear Redis cache  */
app.get('/api/clearcache', async (req, res) => {
  try {
    clientRedis.sendCommand(['FLUSHDB'], (err, result) => {
      if (err) {
        console.error('Error flushing database:', err)
      } else {
        console.log('Database flushed:', result)
      }
    })

    res.json({ success: true, message: 'Cache cleared' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error clearing the cache' })
  }
})

/* Delete a collection  */
app.delete('/api/collection', async (req, res) => {
  const { collection } = req.body
  if (!collection) {
    res.status(500).json({ message: 'Missing collection' })
    return
  }
  let encodedCollection = await sanitize(collection)
  try {
    let vectorStore = await OpenSearchVectorStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      {
        client,
        indexName: encodedCollection,
      }
    )
    vectorStore.deleteIfExists()
    vectorStore = null
    res.json({ success: true, message: `${collection} has been deleted` })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error deleting the collection' })
  }
})

/* Main endpoint to add content to OpenSearch  */
app.post('/api/add', async (req, res) => {
  const {
    url,
    collection = process.env.OPENSEARCH_DEFAULT_INDEX,
    filter,
    limit,
    chunkSize = 1000,
    chunkOverlap = 250,
    sleep = 0,
  } = req.body

  if (!url) {
    res.status(500).json({ message: 'Missing URL' })
    return
  }
  let encodedCollection = await sanitize(collection)
  const directory = `./collections/${encodedCollection}/`
  const downloadDir = process.env.DOCS_DIRECTORY || 'docs'

  let type = getFileType(url)

  if (type === 'URL' || type === 'HTML') {
    try {
      await addURL(url, directory, chunkSize, chunkOverlap)
      // Return the response to the user
      res.json({ response: 'added', collection: collection })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Error processing the request' })
    }
  } else if (type === 'SITEMAP') {
    try {
      const sitemap = await parseSitmap(url, filter, limit)

      const asyncFunction = async (item) => {
        console.log('\nAdding >>', item)
        await addURL(item, directory, chunkSize, chunkOverlap)
      }

      const iterateAndRunAsync = async (array) => {
        for (const item of array) {
          await asyncFunction(item)
          await sleepWait(sleep)
        }
      }

      iterateAndRunAsync(sitemap).then(async () => {
        console.log('\nDone! | Collection:', collection)

        // Return the response to the user
        res.json({ response: 'started', collection: collection })
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Error processing the sitemap' })
    }
  } else if (type === 'PDF') {
    try {
      const filename = getUrlFilename(url)
      if (!filename) {
        res.status(400).json({ message: 'The provided URL is not a PDF file.' })
        return
      }
      const filePath = await fetchAndSaveFile(url, filename, downloadDir)

      const loader = new PDFLoader(filePath, {
        splitPages: true,
      })
      const docs = await loader.load()

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: chunkSize,
        chunkOverlap: chunkOverlap,
      })

      const docOutput = await textSplitter.splitDocuments(docs)

      /* Clean metadata for OpenSearch */
      docOutput.forEach((document) => {
        document.metadata.source = basename(document.metadata.source)
        delete document.metadata.pdf
        delete document.metadata.loc
      })

      let already = false
      let vectorStore
      try {
        // Load the vector store from the exisiting directory
        console.log('Dir:', directory)

        vectorStore = await HNSWLib.load(directory, new OpenAIEmbeddings())
        // new OpenAIEmbeddings({ stripNewLines: true })

        // Load the JSON file
        const data = await fs.readFile(`${directory}docstore.json`)
        const db = JSON.parse(data)

        // Check if metadata with the same source already exists
        const source = url
        const exists = db.some(
          ([id, { metadata }]) => metadata && metadata.source === source
        )

        // Check if the source already exists
        if (exists) {
          already = true
          console.log(`✔ Source "${source}" already exists`)
          await vectorStore.addDocuments(docOutput)
          // Save the vector store to a directory
          await vectorStore.save(directory)
        } else {
          console.log(`✔ Source "${source}" has been added to vector store`)
          await vectorStore.addDocuments(docOutput)
          // Save the vector store to a directory
          await vectorStore.save(directory)
        }
      } catch (err) {
        // If the vector store doesn't exist yet, create a new one
        vectorStore = await HNSWLib.fromDocuments(
          docOutput,
          new OpenAIEmbeddings()
        )
        /*
    vectorStore = await HNSWLib.fromDocuments(
      docOutput,
      new HuggingFaceInferenceEmbeddings()
    )
    */
        // Save the vector store to a directory
        await vectorStore.save(directory)
        console.log('✔ Added!')
      }

      vectorStore = null
      // Return the response to the user
      res.json({ response: 'added', collection: collection })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Error processing the PDF' })
    }
  } else if (type === 'UNSTRUCTURED') {
    try {
      // Check if the URL points to a file and extract the filename with the extension.
      const filename = getUrlFilename(url)

      if (!filename) {
        res.status(400).json({ message: 'The provided URL is not a file URL.' })
        return
      }

      const filePath = await fetchAndSaveFile(url, filename, downloadDir)

      const loader = new UnstructuredLoader(
        `${process.env.UNSTRUCTURED_URL}/general/v0/general`,
        filePath
      )

      const docs = await loader.load()

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: chunkSize,
        chunkOverlap: chunkOverlap,
      })

      const docOutput = await textSplitter.splitDocuments(docs)

      /* Clean metadata for OpenSearch */
      docOutput.forEach((document) => {
        document.metadata.source = document.metadata.filename
        delete document.metadata.filename
        delete document.metadata.category
        delete document.metadata.loc
      })

      // Create a new document for the URL
      let vectorStore = await OpenSearchVectorStore.fromDocuments(
        docOutput,
        new OpenAIEmbeddings(),
        {
          client,
          indexName: encodedCollection,
        }
      )
      vectorStore = null
      console.log('Added!')
      // Return the response to the user
      res.json({ response: 'added', collection: collection })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Error processing the file.' })
    }
  }
})

/* Get a response using live webpage as context */
app.post('/api/live', async (req, res) => {
  const { url, question, temperature = 0 } = req.body
  if (!url || !question) {
    res.status(500).json({ message: 'Missing URL/Question' })
    return
  }
  try {
    const model = new ChatOpenAI({
      temperature: temperature,
    })
    const embeddings = new OpenAIEmbeddings()
    const browser = new WebBrowser({ model, embeddings })
    const result = await browser.call(`"${url}","${question}"`)

    // Return the response to the user
    res.json({ response: result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error processing the request' })
  }
})

/* Get a response using the vector store */
app.post('/api/question', async (req, res) => {
  // replicate/llama-7b:2014ee1247354f2e81c0b3650d71ca715bc1e610189855f134c30ecb841fae21
  // replicate/vicuna-13b:a68b84083b703ab3d5fbf31b6e25f16be2988e4c3e21fe79c2ff1c18b99e61c1
  const {
    question,
    collection = process.env.OPENSEARCH_DEFAULT_INDEX,
    model = 'stability-ai/stablelm-tuned-alpha-7b:c49dae362cbaecd2ceabb5bd34fdb68413c4ff775111fea065d259d577757beb',
    k = 3,
    temperature = 0.2,
    max_tokens = 400,
  } = req.body

  let encodedCollection = await sanitize(collection)

  const directory = `./collections/${encodedCollection}/`
  console.log('Collection:', directory)

  const OpenAISearch = new OpenAI({
    model: 'gpt-3.5-turbo',
    concurrency: 15,
    max_tokens: max_tokens,
    //maxConcurrency: 5,
    //timeout: 10000,
    cache: false,
    temperature: temperature,
  })

  /* const llm = new Replicate({
    model: model,
    max_tokens: max_tokens,
    //verbose: true,
    cache: false,
    temperature: temperature,
  }) */

  //deepset/roberta-base-squad2
  //gpt2
  //bert-base-uncased
  //Jornt/distilbert-base-uncased-finetuned-squad
  //stabilityai/stablelm-tuned-alpha-7b
  //OpenAssistant/stablelm-7b-sft-v7-epoch-3
  //stabilityai/stablelm-base-alpha-7b
  //stabilityai/stablelm-base-alpha-13b
  //databricks/dolly-v2-12b
  //THUDM/chatglm-6b
  //anon8231489123/vicuna-13b-GPTQ-4bit-128g
  //OpenAssistant/oasst-sft-6-llama-30b-xor

  //ethzanalytics/stablelm-tuned-alpha-7b-sharded-8bit

  /* const llm = new HuggingFaceInference({
    model: 'stablelm-base-alpha-13b', //'gpt2',
    //max_tokens: max_tokens,
    temperature: 0.1,
  }) */

  let vectorStore
  try {
    /* vectorStore = await HNSWLib.load(directory, new OpenAIEmbeddings()) */

    vectorStore = await HNSWLib.load(directory, new OpenAIEmbeddings())
  } catch (err) {
    vectorStore = null
    console.info(`Collection ${collection} does not exist.`)
  }

  try {
    if (vectorStore) {
      console.log('Using Vector Store')

      /* const chain = RetrievalQAChain.fromLLM(llm, vectorStore.asRetriever(), {
        k: k,
        returnSourceDocuments: true,
      }) */

      /* const chain = await VectorDBQAChain.fromLLM(llm, vectorStore, {
        k: k,
        returnSourceDocuments: true,
      }) */

      /* const chain = await VectorDBQAChain.fromLLM(OpenAISearch, vectorStore, {
        k: k,
        returnSourceDocuments: true,
      }) */

      /* const response = await chain.call({
        query: question,
      }) */

      //console.log(response)

      const response = await vectorStore.similaritySearch(question, 3)
      //console.log(response)

      // Get the sources from the response
      //let sources = response.sourceDocuments

      function combinePageContent(arr) {
        let combinedContent = ''

        for (let i = 0; i < arr.length; i++) {
          combinedContent += arr[i].pageContent
        }

        return combinedContent
      }

      const combinedContent = combinePageContent(response)
      //console.log(combinedContent)
      let sources = response
      sources = sources.map((sources) => sources.metadata.source)
      // Remove duplicates
      sources = [...new Set(sources)]
      //console.log('Sources:', sources)

      // Get the filenames from the response
      //let filenames = response.sourceDocuments
      let filenames = response
      filenames = filenames.map((filenames) => filenames.metadata.filename)
      // Remove duplicates
      filenames = [...new Set(filenames)]
      console.log('Filenames:', filenames)

      vectorStore = null
      claude
        .complete({
          prompt: `${HUMAN_PROMPT}: Here is a document:\n\n<document>${combinedContent}</document>\n\nUsing this document, try to answer the following question: ${question}. Don't start your answer with 'According to the document'.\n\n${AI_PROMPT}`,
          stop_sequences: [HUMAN_PROMPT],
          max_tokens_to_sample: 500,
          temperature: temperature,
          model: model,
          //model: 'claude-v1',
        })
        .then((finalSample) => {
          //console.log(finalSample.completion)
          let sanitizedAnswer = cleanText(finalSample.completion)
          res.json({ response: sanitizedAnswer, sources })
        })
        .catch((error) => {
          console.error(error)
          res.json({ response: null, sources: null, error: error })
        })

      // Return the response to the user

      /* let sanitizedAnswer = await cleanText(response.text)
      sanitizedAnswer = await replaceAllSingleCommas(sanitizedAnswer)
      sanitizedAnswer = await sanitizeHtml(sanitizedAnswer)

      res.json({ response: sanitizedAnswer, sources }) */
    } else {
      console.log('No vector store found.')
      // We don't have a vector store yet, so we'll just use a template
      const template =
        "Your are a helpful AI Assistant. Try to answer the following question: {question} If you don't know the answer, just say \"Hmm, I'm not sure.\" Don't try to make up an answer."
      const prompt = new PromptTemplate({
        template: template,
        inputVariables: ['question'],
      })
      const chain = new LLMChain({ llm: OpenAISearch, prompt: prompt })
      const response = await chain.call({ question: question })

      // Return the response to the user
      res.json({ response: cleanText(response.text) })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error processing the request' })
  }
})

function cleanFilePath(filePath) {
  // Define a regular expression that matches all non-alphanumeric characters and hyphens
  const regex = /[^a-zA-Z0-9\-]/g
  // Replace all non-matching characters with an empty string
  const cleanedFilePath = filePath.replace(regex, '')
  return cleanedFilePath
}

/* Clean the text by removing newlines in the beginning of the string */
function cleanText(text) {
  const regex = /^[\n]+/
  const cleanedText = text.replace(regex, '')
  return cleanedText.trim()
}

/* Sanitize the collection name for OpenSearch */
async function sanitize(collection) {
  /* Milvus
  const sanitized = collection
    .replace(/[^a-zA-Z0-9_ -]/g, '')
    .replace(/[ -]/g, '_')
  */

  /* OpenSearch */
  const sanitized = collection
    .replace(/[^a-zA-Z0-9_\- ]/g, '')
    .replace(/ /g, '-')
  return sanitized
}

/* Extract the filename from the URL if exist */
function getUrlFilename(url) {
  const parsedUrl = parseUrl(url)
  const pathname = parsedUrl.pathname
  const extension = extname(pathname)

  if (extension) {
    return basename(pathname)
  }

  return null
}

/* Get the file type from the URL */
function getFileType(url) {
  const sitemap = /sitemap\.xml$/i
  const image = /\.(jpg|jpeg|png|gif)$/i
  const pdf = /\.pdf$/i
  const powerpoint = /\.(ppt|pptx)$/i
  const text = /\.(txt|md)$/i
  const html = /\.(html|htm)$/i

  if (url.match(image)) {
    return 'UNSTRUCTURED'
  } else if (url.match(pdf)) {
    return 'PDF'
  } else if (url.match(powerpoint)) {
    return 'UNSTRUCTURED'
  } else if (url.match(text)) {
    return 'UNSTRUCTURED'
  } else if (url.match(sitemap)) {
    return 'SITEMAP'
  } else if (url.match(html)) {
    return 'HTML'
  } else {
    return 'URL'
  }
}

/* Download a file before adding to OpenSearch */
async function fetchAndSaveFile(url, filename, downloadDir) {
  /* Ensure the directory exists */
  try {
    await fs.access(downloadDir)
  } catch {
    await fs.mkdir(downloadDir)
  }

  const outputPath = join(downloadDir, filename)

  const response = await axios.get(url, {
    responseType: 'stream',
  })

  const writer = createWriteStream(outputPath)

  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(outputPath))
    writer.on('error', (err) => reject(err))
  })
}

/* Function to wait for a certain amount of time */
const sleepWait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/* Function for the sitemap parser */
async function parseSitmap(url, filter, limit) {
  const options = {
    delay: 4000,
    limit: 5,
  }

  const sitemapXMLParser = new SitemapXMLParser(url, options)

  return sitemapXMLParser.fetch().then((result) => {
    let list = result
      .map((item) => item.loc[0].trim().replace(/\r\n/g, ' '))
      .filter((item) => !filter || item.includes(filter))
    return limit ? list.slice(0, limit) : list
  })
}

/* Using Cheerio to parse HTML from the URL */
async function addURL(url, directory, chunkSize, chunkOverlap) {
  let loader = new CheerioWebBaseLoader(url)
  let docs = await loader.load()

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: chunkSize || 1536,
    chunkOverlap: chunkOverlap || 0,
  })

  const docOutput = await textSplitter.splitDocuments(docs)

  /* Clean metadata for OpenSearch */
  docOutput.forEach((document) => {
    delete document.metadata.loc
  })

  let already = false
  let vectorStore
  try {
    // Load the vector store from the exisiting directory
    console.log('Dir:', directory)

    vectorStore = await HNSWLib.load(directory, new OpenAIEmbeddings())
    // new OpenAIEmbeddings({ stripNewLines: true })

    // Load the JSON file
    const data = await fs.readFile(`${directory}docstore.json`)
    const db = JSON.parse(data)

    // Check if metadata with the same source already exists
    const source = url
    const exists = db.some(
      ([id, { metadata }]) => metadata && metadata.source === source
    )

    // Check if the source already exists
    if (exists) {
      already = true
      console.log(`✔ Source "${source}" already exists`)
      //await vectorStore.addDocuments(docOutput)
      // Save the vector store to a directory
      //await vectorStore.save(directory)
    } else {
      console.log(`✔ Source "${source}" has been added to vector store`)
      await vectorStore.addDocuments(docOutput)
      // Save the vector store to a directory
      await vectorStore.save(directory)
    }
  } catch (err) {
    // If the vector store doesn't exist yet, create a new one
    vectorStore = await HNSWLib.fromDocuments(docOutput, new OpenAIEmbeddings())
    /*
    vectorStore = await HNSWLib.fromDocuments(
      docOutput,
      new HuggingFaceInferenceEmbeddings()
    )
    */
    // Save the vector store to a directory
    await vectorStore.save(directory)
    console.log('✔ Added!')
  }

  vectorStore = null
}

/*
const model = new HuggingFaceInference({
  model: 'gpt-j-6b',
})
const res = await model.call('My name is Teven and I am')
console.log({ res })
*/

async function replaceAllSingleCommas(str) {
  return str.replace(/([^,]),(?!,)/g, '$1').replace(/,,/g, ',')
}
