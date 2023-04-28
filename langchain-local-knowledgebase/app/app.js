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
import { PromptTemplate } from 'langchain/prompts'
import { LLMChain, VectorDBQAChain } from 'langchain/chains'

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

/* OpenSearch */
import { Client } from '@opensearch-project/opensearch'
import { OpenSearchVectorStore } from 'langchain/vectorstores/opensearch'

const client = new Client({
  nodes: [process.env.OPENSEARCH_URL ?? 'http://127.0.0.1:9200'],
})

/* Load environment variables from .env file */
import * as dotenv from 'dotenv'
dotenv.config()

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

app.delete('/api/collection', async (req, res) => {
  const { name } = req.body
  if (!name) {
    res.status(500).json({ message: 'Missing collection name' })
  }
  try {
    const cdb = new ChromaClient()
    await cdb.getCollection(name)
    let error = await cdb.deleteCollection(name)

    // Return the response to the user
    if (!error) {
      res.json({
        success: true,
        message: `Collection ${name} has been deleted`,
        result,
      })
    } else {
      res.json({
        success: false,
        message: `Error deleting ${name}`,
        error,
      })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error processing the request' })
  }
})

/* Main endpoint to add content to OpenSearch  */
app.post('/api/add', async (req, res) => {
  const {
    url,
    collection = process.env.OPENSEARCH_DEFAULT_INDEX,
    filter,
    limit,
    chunkSize = 2000,
    chunkOverlap = 250,
    sleep = 0,
  } = req.body

  const downloadDir = process.env.DOCS_DIRECTORY || 'docs'

  if (!url) {
    res.status(500).json({ message: 'Missing URL' })
    return
  }

  let encodedCollection = await sanitize(collection)
  let type = getFileType(url)

  if (type === 'URL' || type === 'HTML') {
    try {
      await addURL(url, encodedCollection, chunkSize, chunkOverlap)
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
        console.log('Adding >>', item)
        await addURL(item, encodedCollection, chunkSize, chunkOverlap)
      }

      const iterateAndRunAsync = async (array) => {
        for (const item of array) {
          await asyncFunction(item)
          await sleepWait(sleep)
        }
      }

      iterateAndRunAsync(sitemap).then(async () => {
        console.log('Done!')
        console.log('Collection:', collection)

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
      console.log(docs)
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: chunkSize,
        chunkOverlap: chunkOverlap,
      })

      const docOutput = await textSplitter.splitDocuments(docs)

      docOutput.forEach((document) => {
        delete document.metadata.pdf
        delete document.metadata.loc
      })

      const vectorStore = await OpenSearchVectorStore.fromDocuments(
        docOutput,
        new OpenAIEmbeddings(),
        {
          client,
          indexName: encodedCollection,
        }
      )

      console.log('Added!')
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

      // Create a new document for the URL
      const vectorStore = await OpenSearchVectorStore.fromDocuments(
        docOutput,
        new OpenAIEmbeddings(),
        {
          client,
          indexName: encodedCollection,
        }
      )
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
  const {
    question,
    collection = process.env.OPENSEARCH_DEFAULT_INDEX,
    model = 'gpt-3.5-turbo',
    temperature = 0,
    max_tokens = 400,
  } = req.body

  let encodedCollection = await sanitize(collection)

  const llm = new OpenAI({
    modelName: model,
    concurrency: 15,
    //maxConcurrency: 5,
    //timeout: 10000,
    cache,
    temperature: temperature,
  })

  let loadCollection = await sanitize(collection)

  const vectorStore = await OpenSearchVectorStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    {
      client,
      indexName: encodedCollection,
    }
  )

  try {
    if (vectorStore) {
      console.log('Using Vector Store')
      const chain = VectorDBQAChain.fromLLM(llm, vectorStore, {
        k: 1,
        returnSourceDocuments: true,
      })
      const response = await chain.call({
        query: question,
      })

      // Get the sources from the response
      let sources = response.sourceDocuments
      sources = sources.map((sources) => sources.metadata.source)
      // Remove duplicates
      sources = [...new Set(sources)]
      console.log('Sources:', sources)
      // Return the response to the user
      res.json({ response: response.text, sources })
    } else {
      console.log('No vector store found.')
      // We don't have a vector store yet, so we'll just use a template
      const template =
        "Your are a helpful AI Assistant. Try to answer the following question: {question} If you don't know the answer, just say \"Hmm, I'm not sure.\" Don't try to make up an answer."
      const prompt = new PromptTemplate({
        template: template,
        inputVariables: ['question'],
      })
      const chain = new LLMChain({ llm: llm, prompt: prompt })
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
  return cleanedText
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
    limit: 1,
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
async function addURL(url, encodedCollection, chunkSize, chunkOverlap) {
  let loader = new CheerioWebBaseLoader(url)
  let docs = await loader.load()

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: chunkSize || 500,
    chunkOverlap: chunkOverlap || 100,
  })

  const docOutput = await textSplitter.splitDocuments(docs)

  docOutput.forEach((document) => {
    delete document.metadata.loc
  })

  const vectorStore = await OpenSearchVectorStore.fromDocuments(
    docOutput,
    new OpenAIEmbeddings(),
    {
      client,
      indexName: encodedCollection,
    }
  )
  console.log(`${url} has been added!`)
}
