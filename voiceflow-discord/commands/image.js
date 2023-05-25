const { SlashCommandBuilder } = require('discord.js')
const { interact } = require('../utils/dialogapi.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('image')
    .setDescription('Use DALL-E to generate a random image.'),

  async execute(interaction) {
    await interaction.reply({
      content: 'Generating your image...',
      ephemeral: true,
      fetchReply: true,
    })
    await interact(interaction, interaction.user.id, true)
    await interaction.editReply('Done!')
  },
}
