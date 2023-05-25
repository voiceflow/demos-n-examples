const { Events } = require('discord.js')
const { interact } = require('../utils/dialogapi.js')

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName)

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`
        )
        return
      }

      try {
        await command.execute(interaction)
      } catch (error) {
        console.error(`Error executing ${interaction.commandName}`)
        console.error(error)
      }
    }

    if (interaction.isButton()) {
      console.log('Button interaction!')

      await interaction.deferReply({ ephemeral: true })

      try {
        await interact(interaction, interaction.user.id, true)
      } catch (error) {
        console.error('Error interacting with the API:', error)
        await interaction.followUp(
          'There was an error interacting with the API.'
        )
      }
    }
  },
}
