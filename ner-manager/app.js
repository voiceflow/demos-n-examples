#!/usr/bin/env node
import fs from 'fs'
import { createArrayCsvWriter as createCsvWriter } from 'csv-writer'
import readline from 'readline'
import winkNLP from 'wink-nlp'
import model from 'wink-eng-lite-web-model'
import chalk from 'chalk'
import inquirer from 'inquirer'
import gradient from 'gradient-string'
import figlet from 'figlet'
import { createSpinner } from 'nanospinner'

const originalEmitWarning = process.emitWarning
process.emitWarning = function (warning, ...args) {
  if (/experimental feature/.test(warning)) {
    return
  }
  originalEmitWarning.call(this, warning, ...args)
}

const packageJson = await import('./package.json', {
  assert: { type: 'json' },
})

const appVersion = packageJson.default.version + ' BETA'
const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms))
let inputFile, outputFile

async function start() {
  figlet(`CSV NER TOOL`, (err, data) => {
    console.log(gradient.vice.multiline(data))
  })
  await sleep(100)
  const spinner = createSpinner('Loading...').start()
  await sleep(1000)

  spinner.stop({
    text: `Named-entity recognition tool | ${appVersion}\n\n`,
    mark: '',
    color: 'magenta',
  })
}

async function askInputFile() {
  const input = await inquirer.prompt({
    name: 'inputFile',
    type: 'input',
    message: 'CSV file to import:',
    default() {
      return null
    },
  })
  return input.inputFile
}

async function askOutputFile() {
  const input = await inquirer.prompt({
    name: 'outputFile',
    type: 'input',
    message: 'Export name:',
    default() {
      return 'output.csv'
    },
  })
  return input.outputFile
}

// Main detection function
async function detect(inputFile, outputFile) {
  // Clean up file names
  const inFile = inputFile.replace('.csv', '') + '.csv'
  const outFile = outputFile.replace('.csv', '') + '.csv'

  // Load model
  const nlp = winkNLP(model)
  const its = nlp.its
  const as = nlp.as

  // Default entities to match in CSV import
  const ner = [
    { name: 'number', patterns: ['CARDINAL'] },
    { name: 'date', patterns: ['DATE'] },
    { name: 'duration', patterns: ['DURATION'] },
    { name: 'time', patterns: ['TIME'] },
    { name: 'location', patterns: ['LOC'] },
    { name: 'email', patterns: ['EMAIL'] },
    { name: 'phone', patterns: ['PHONE'] },
  ]

  const nerCustom = [
    { name: 'number', patterns: ['CARDINAL'] },
    { name: 'date', patterns: ['DATE'] },
    { name: 'duration', patterns: ['DURATION'] },
    { name: 'time', patterns: ['TIME'] },
    { name: 'location', patterns: ['LOC'] },
    { name: 'email', patterns: ['EMAIL'] },
    { name: 'phone', patterns: ['PHONE'] },
    // User custom entities to match in CSV import
    { name: 'insurance_type', patterns: ['[car|cars|house|home|boat]'] },
    { name: 'action', patterns: ['[reset|logout|change]'] },
    { name: 'quote', patterns: ['[quote|pricing|estimation]'] },
  ]

  // Process each utterance
  function processUtterance(utterance) {
    const doc = nlp.readDoc(utterance)
    let entityCount = 0

    const customEntities = doc.customEntities().out(its.detail)
    if (customEntities.length > 0) {
      for (let i = 0; i < customEntities.length; i++) {
        let regex = new RegExp(customEntities[i].value, 'g')
        utterance = utterance.replace(regex, `{${customEntities[i].type}}`)
      }
      entityCount++
    }
    return { utterance, entityCount }
  }

  // Process CSV file and save to output file
  async function processCsvFile(inFile, outFile) {
    // Use custom entities
    nlp.learnCustomEntities(ner, {
      matchValue: false,
      usePOS: true,
      useEntity: true,
    })

    const data = []
    let totalUtterances = 0
    let totalEntities = 0
    const processedIntents = new Set()
    console.log('')
    const spinner = createSpinner('Processing CSV file...').start()
    await sleep(1000)

    try {
      const readStream = fs.createReadStream(inFile)
      readStream.on('error', (error) => {
        spinner.error({
          text: `Unable to process ${inFile}\n`,
          mark: '✖',
          color: 'red',
        })
        process.exit(0)
      })
      const rl = readline.createInterface({
        input: readStream,
        output: process.stdout,
        terminal: false,
      })

      rl.on('line', (line) => {
        const row = line.split(',')
        const { utterance, entityCount } = processUtterance(row[1])
        data.push([row[0], utterance])
        totalUtterances++
        totalEntities += entityCount
        processedIntents.add(row[0])
      })

      rl.on('close', () => {
        const csvWriter = createCsvWriter({
          path: outFile,
        })

        csvWriter.writeRecords(data).then(() => {
          spinner.stop({
            text: `${inFile} was successfully processed.\n`,
            mark: '✔',
            color: 'cyan',
          })
          spinner.stop({
            text: `total utterances analyzed`,
            mark: totalUtterances,
            color: 'cyan',
          })
          spinner.stop({
            text: `total entities detected\n`,
            mark: totalEntities,
            color: 'cyan',
          })
          spinner.stop({
            text: `${outFile} was successfully created.\n`,
            mark: '✔',
            color: 'green',
          })
        })
      })
    } catch (error) {
      spinner.error({
        text: `Unable to process ${inFile}\n`,
        mark: '✖',
        color: 'red',
      })
      process.exit(0)
    }
  }

  // Run function to process CSV file
  processCsvFile(inFile, outFile)
}

// Clear console
console.clear()
// Start app
await start()
// Ask for input file
inputFile = await askInputFile()
// Ask for output file name or use default 'output.csv' name
outputFile = await askOutputFile()
// Run detection
await detect(inputFile, outputFile)
