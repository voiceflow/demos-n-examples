const { SlashCommandBuilder } = require('discord.js')
const { interact } = require('../utils/dialogapi.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask Voiceflow Bot a question.')
    .addStringOption((option) =>
      option
        .setName('question')
        .setDescription('User question to Voiceflow Bot.')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })
    await interact(interaction, interaction.user.id, true)
  },
}
