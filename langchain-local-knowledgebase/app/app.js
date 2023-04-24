import express from 'express'
import http from 'http'
import axios from 'axios'
import { createWriteStream } from 'fs'
import { parse as parseUrl } from 'url'
import { join, extname, basename } from 'path'
import crypto from 'crypto'
import { HNSWLib } from 'langchain/vectorstores/hnswlib'
import { WebBrowser } from 'langchain/tools/webbrowser'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PromptTemplate } from 'langchain/prompts'
import { OpenAI } from 'langchain/llms/openai'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { LLMChain, VectorDBQAChain } from 'langchain/chains'
import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { UnstructuredLoader } from 'langchain/document_loaders/fs/unstructured'
//import { Document } from 'langchain/document'
import SitemapXMLParser from 'sitemap-xml-parser'
import { RedisCache } from 'langchain/cache/redis'
import { createClient } from 'redis'
import * as fs from 'fs/promises'

// Load environment variables from .env file
import * as dotenv from 'dotenv'
dotenv.config()

// Setup the secret phrase and IV
const key = crypto.createHash('sha256').update(process.env.SECRET).digest()
const iv = Buffer.alloc(16)

// Redis cache
const client = createClient({
  url: process.env.REDIS_URL,
})
const cache = new RedisCache(client)
client.connect()
client.on('error', (err) => {
  console.error('Error connecting to Redis:', err)
})

client.on('ready', () => {
  console.log('Connected to Redis server.')
})

// Set up Express app
const app = express()

// Middleware to parse JSON request bodies
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/api/health', async (req, res) => {
  // Return the response to the user
  res.json({
    success: true,
    message: 'Server is healthy',
  })
})

app.get('/api/clearcache', async (req, res) => {
  try {
    client.sendCommand(['FLUSHDB'], (err, result) => {
      if (err) {
        console.error('Error flushing database:', err)
      } else {
        console.log('Database flushed:', result)
      }
    })

    // Return the response to the user
    res.json({ success: true, message: 'Cache cleared' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error processing the request' })
  }
})

app.post('/api/file', async (req, res) => {
  const { url, apikey } = req.body
  const downloadDir = 'tmp'

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
    chunkSize: 2500,
    chunkOverlap: 300,
  })

  const docOutput = await textSplitter.splitDocuments(docs)
  // Create an AES-256-CBC cipher using the secret phrase and IV
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  let encrypted = cipher.update(apikey, 'utf8', 'base64')
  encrypted += cipher.final('base64')
  const directory = `./collections/${cleanFilePath(encrypted)}/`

  // Create a new document for the URL
  let vectorStore
  let already = false

  try {
    // Load the vector store from the exisiting directory
    vectorStore = await HNSWLib.load(directory, new OpenAIEmbeddings())

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
      console.log(`Source "${source}" already exists`)
    } else {
      console.log(`Source "${source}" added to vector store`)
      await vectorStore.addDocuments(docOutput)
    }
  } catch (err) {
    // If the vector store doesn't exist yet, create a new one
    vectorStore = await HNSWLib.fromDocuments(docOutput, new OpenAIEmbeddings())
  }

  // Save the vector store to a directory
  await vectorStore.save(directory)

  try {
    // Return the response to the user
    res.json({ response: 'success', already: already })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error processing conversation request' })
  }
})

// Question endpoint
app.post('/api/question', async (req, res) => {
  // Get the search query and APIKey from the request body
  const { question, apikey } = req.body

  // Create an AES-256-CBC cipher using the secret phrase and IV
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)

  // Encrypt the APIKey using the cipher
  let encrypted = cipher.update(apikey, 'utf8', 'base64')
  encrypted += cipher.final('base64')

  // Instantiate the OpenAI model
  const llm = new OpenAI({
    modelName: 'gpt-3.5-turbo',
    //modelName: 'gpt-4',
    concurrency: 15,
    max_tokens: 400,
    cache,
    temperature: 0,
  })

  // Use the encrypted APIKey as the directory name
  const directory = `./collections/${cleanFilePath(encrypted)}/`
  // Load the vector store from the same directory
  let vectorStore
  try {
    vectorStore = await HNSWLib.load(directory, new OpenAIEmbeddings())
  } catch (err) {
    // If the vector store doesn't exist yet, create a default one
    vectorStore = null
  }

  try {
    if (vectorStore) {
      // Load the Q&A map reduce chain
      const chain = VectorDBQAChain.fromLLM(llm, vectorStore, {
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

      // Get the filenames from the response
      let filenames = response.sourceDocuments
      filenames = filenames.map((filenames) => filenames.metadata.filename)
      // Remove duplicates
      filenames = [...new Set(filenames)]
      console.log('Filenames:', filenames)

      // Return the response to the user
      res.json({ response: response.text, sources, filenames })
    } else {
      // We don't have a vector store yet, so we'll just use a template
      const template =
        "Your are a helpfull AI Assistant. Try to answer the following question: {question} If you don't know the answer, just say \"Hmm, I'm not sure.\" Don't try to make up an answer."
      const prompt = new PromptTemplate({
        template: template,
        inputVariables: ['question'],
      })
      const chain = new LLMChain({ llm: llm, prompt: prompt })
      const response = await chain.call({ question: question })

      // Return the response to the user
      res.json({ response: cleanText(response.text), sources: null })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error processing the request' })
  }
})

app.post('/api/parser', async (req, res) => {
  const { url, apikey } = req.body
  const loader = new CheerioWebBaseLoader(url)
  const docs = await loader.load()

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2500,
    chunkOverlap: 200,
  })

  const docOutput = await textSplitter.splitDocuments(docs)
  // Create an AES-256-CBC cipher using the secret phrase and IV
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  let encrypted = cipher.update(apikey, 'utf8', 'base64')
  encrypted += cipher.final('base64')
  const directory = `./collections/${cleanFilePath(encrypted)}/`

  // Create a new document for the URL
  let vectorStore
  let already = false

  try {
    // Load the vector store from the exisiting directory
    vectorStore = await HNSWLib.load(directory, new OpenAIEmbeddings())

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
      console.log(`Source "${source}" already exists`)
    } else {
      console.log(`Source "${source}" added to vector store`)
      await vectorStore.addDocuments(docOutput)
    }
  } catch (err) {
    // If the vector store doesn't exist yet, create a new one
    vectorStore = await HNSWLib.fromDocuments(docOutput, new OpenAIEmbeddings())
  }

  // Save the vector store to a directory
  await vectorStore.save(directory)

  try {
    // Return the response to the user
    res.json({ response: 'success', already: already })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error processing conversation request' })
  }
})

function cleanFilePath(filePath) {
  // Define a regular expression that matches all non-alphanumeric characters and hyphens
  const regex = /[^a-zA-Z0-9\-]/g
  // Replace all non-matching characters with an empty string
  const cleanedFilePath = filePath.replace(regex, '')
  return cleanedFilePath
}

function cleanText(text) {
  // Define a regular expression that matches all newlines in the beginning of the string
  const regex = /^[\n]+/
  const cleanedText = text.replace(regex, '')
  return cleanedText
}

function getUrlFilename(url) {
  const parsedUrl = parseUrl(url)
  const pathname = parsedUrl.pathname
  const extension = extname(pathname)

  if (extension) {
    return basename(pathname)
  }

  return null
}

async function fetchAndSaveFile(url, filename, downloadDir) {
  // Ensure the 'downloadDir' directory exists
  try {
    await fs.access(downloadDir)
  } catch {
    await fs.mkdir(downloadDir)
  }

  // Join the 'downloadDir' directory path and the filename to create the output path
  const outputPath = join(downloadDir, filename)

  // Fetch and save PDF file from the URL
  const response = await axios.get(url, {
    responseType: 'stream',
  })

  const writer = createWriteStream(outputPath)

  // Save the PDF file
  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(outputPath))
    writer.on('error', (err) => reject(err))
  })
}

// Create HTTP server
http.createServer(app).listen(process.env.PORT)
console.info('KB API is listening on port ' + process.env.PORT)
