require('dotenv').config()
const fs = require('node:fs')
const path = require('node:path')
const {
  Client,
  Routes,
  Collection,
  GatewayIntentBits,
  Partials,
} = require('discord.js')
const { DISCORD_TOKEN, APP_ID, SERVER_ID } = process.env

const client = new Client({
  intents: [
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
  rest: { version: '10' },
})

const commands = []
client.commands = new Collection()
const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file)
  const command = require(filePath)
  commands.push(command.data.toJSON())
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command)
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    )
  }
}

const eventsPath = path.join(__dirname, 'events')
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith('.js'))

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file)
  const event = require(filePath)
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
}

client.rest.setToken(DISCORD_TOKEN)

async function main() {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    )

    const data = await client.rest.put(
      Routes.applicationGuildCommands(APP_ID, SERVER_ID),
      { body: commands }
    )

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    )
    await client.login(DISCORD_TOKEN)
  } catch (err) {
    console.log(err)
  }
}

main()
