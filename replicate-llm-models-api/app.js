import express from 'express'
import Replicate from 'replicate'
import dotenv from 'dotenv'
import models from './models.json' assert { type: 'json' }

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

const replicate = new Replicate({
  auth: process.env.REPLICATE_TOKEN,
})

app.use(express.json())

app.post('/api', async (req, res) => {
  try {
    const {
      prompt,
      model = 'dolly-v2-12b',
      max_tokens = 100,
      max_length = 100,
      top_p = 1,
      top_k,
      decoding = 'top_p',
      temperature = 0.75,
      repetition_penalty = 1.2,
    } = req.body
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' })
    }
    const startTime = process.hrtime()
    let output = await replicate.run(models[model].id, {
      input: {
        prompt,
        max_tokens,
        max_length,
        decoding,
        top_p,
        top_k,
        temperature,
        repetition_penalty,
      },
    })
    if (models[model].split === true) {
      output = output.join('')
    }
    const elapsedTime = process.hrtime(startTime)
    const elapsedTimeSec = elapsedTime[0] + elapsedTime[1] / 1e9
    const elapsedTimeRounded = parseFloat(elapsedTimeSec.toFixed(2))

    res.json({
      success: true,
      response: output,
      processingTimeSec: elapsedTimeRounded,
    })
  } catch (error) {
    console.error('Error generating output:', error)
    res.status(500).json({
      success: false,
      error: `An error occurred while processing your request. ${error}`,
      processingTimeMs: elapsedTimeMs,
    })
  }
})

app.listen(port, () => {
  console.log(`Replicate API listening at http://localhost:${port}`)
})
