const { SlashCommandBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hello')
    .setDescription('Say Hi and provides information about the user.'),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })
    await interaction.user
      .send(`Hey ${interaction.user.username}!`)
      .catch((error) => {
        console.log(`Could not send DM to ${interaction.user.tag}.`)
        console.error(error)
      })
    await interaction.editReply({
      content: `You can start talking with me in DM.`,
      ephemeral: true,
    })
  },
}
