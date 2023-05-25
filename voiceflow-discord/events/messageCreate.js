require('dotenv').config()
const { Events } = require('discord.js')
const { interact } = require('../utils/dialogapi.js')

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) {
      return
    }

    if (
      message.client.user.id === process.env.APP_ID &&
      message.channel.type === 1
    ) {
      console.log('DM BOT')
      await interact(message, message.author.id, false)
      return
    }

    const mentionedUser = message.mentions.users.get(process.env.APP_ID)
    if (mentionedUser && mentionedUser.bot) {
      console.log('Mention BOT')
      await interact(message, message.author.id, false)
      return
    }

    if (message.content.includes('##secret##')) {
      message.author.send(`Hey ${message.author.username}!`).catch((error) => {
        console.log(`Could not send DM to ${message.author.tag}.`)
        console.error(error)
      })
      return
    }
  },
}
