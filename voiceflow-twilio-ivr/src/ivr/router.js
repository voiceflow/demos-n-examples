const Router = require('express').Router
const { launch, interaction, dial } = require('./handler')

const router = new Router()

router.post('/interaction', async (req, res) => {
  const { Called, Caller, SpeechResult, Digits } = req.body
  res.send(await interaction(Called, Caller, SpeechResult, Digits))
})

router.post('/launch', async (req, res) => {
  const { Called, Caller } = req.body
  res.send(await launch(Called, Caller))
})

module.exports = router
