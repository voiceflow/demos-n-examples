const axios = require('axios')
require('dotenv').config()
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js')

let noReplyTimeout = null

module.exports = {
  interact: async (interaction, user, isFollow, reset) => {
    let action
    if (interaction?.customId?.includes('path-')) {
      action = {
        type: interaction.customId,
        payload: {
          actions: [],
        },
      }
    } else if (interaction?.customId?.includes('intent-')) {
      let intentName = interaction.customId.replace('intent-', '')
      action = {
        type: 'intent',
        payload: {
          actions: [],
          entities: [],
          intent: {
            name: `${intentName}`,
          },
        },
      }
    } else if (interaction?.options?.getString('question')) {
      const question = interaction.options.getString('question') ?? ''
      console.log('Type QUESTION:', question)
      action = {
        type: 'text',
        payload: question,
      }
    } else if (interaction?.commandName == 'image') {
      console.log('DALL-E')
      action = {
        type: 'intent',
        payload: {
          actions: [],
          entities: [],
          intent: {
            name: 'Generate Image',
          },
        },
      }
    } else {
      console.log('Type TEXT')
      const messageWithoutMention = interaction.content
        .replace(/^<@\!?(\d+)>/, '')
        .trim()
      console.log(messageWithoutMention)
      action = {
        type: 'text',
        payload: messageWithoutMention,
      }
    }
    await dialogAPI(interaction, user, isFollow, action)
  },
}

async function dialogAPI(interaction, user, isFollow, action) {
  clearTimeout(noReplyTimeout)
  const response = await axios.post(
    `${process.env.VOICEFLOW_API_URL}/state/user/${user}/interact`,
    {
      action: action,
      config: {
        tts: false,
        stripSSML: true,
        stopAll: true,
        excludeTypes: ['path', 'debug', 'flow', 'block'],
      },
    },
    {
      headers: {
        Authorization: process.env.VOICEFLOW_API_KEY,
        'Content-Type': 'application/json',
      },
    }
  )

  if (response.data.length != 0) {
    let isEnding = response.data.some((item) => item.type === 'end')
    const noReply = getNoReplyTimeout(response.data)

    for (const trace of response.data) {
      if (trace.type === 'text') {
        if (isFollow) {
          await interaction.followUp({
            content: trace.payload.message,
            ephemeral: true,
          })
        } else {
          await interaction.reply({
            content: trace.payload.message,
            ephemeral: true,
          })
        }
      } else if (trace.type === 'choice') {
        const actionRow = new ActionRowBuilder()
        trace.payload.buttons.forEach((button, index) => {
          if (index < 5) {
            let customId = button.request.type
            if (button.request.type == 'intent') {
              customId = `intent-${button.request.payload.intent.name}`
            }
            actionRow.addComponents(
              new ButtonBuilder()
                .setCustomId(customId)
                .setLabel(button.name)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(false)
            )
          }
        })
        if (isFollow) {
          await interaction.followUp({
            components: [actionRow],
            ephemeral: true,
          })
        } else {
          await interaction.reply({
            components: [actionRow],
            ephemeral: true,
          })
        }
      } else if (
        trace.type === 'visual' &&
        trace.payload.visualType === 'image'
      ) {
        const embed = new EmbedBuilder()
          .setImage(trace.payload.image)
          .setTitle('Image')

        if (isFollow) {
          await interaction.followUp({ embeds: [embed], ephemeral: true })
        } else {
          await interaction.reply({ embeds: [embed], ephemeral: true })
        }
      }
    }
    if (noReply && isEnding === false) {
      noReplyTimeout = setTimeout(async () => {
        action = {
          type: 'no-reply',
        }
        await dialogAPI(interaction, user, true, action)
      }, noReply)
    }
  }
}

function getNoReplyTimeout(arr) {
  const noReplyItem = arr.find((item) => item.type === 'no-reply')
  if (noReplyItem) {
    return noReplyItem.payload.timeout * 1000
  } else {
    return null
  }
}
