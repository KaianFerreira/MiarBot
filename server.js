import { Client, GatewayIntentBits } from 'discord.js'

import {
  joinVoiceChannel,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource
} from '@discordjs/voice'


import ytdl from 'ytdl-core'
import dotenv from 'dotenv'

dotenv.config()
const client = new Client({ intents: [
  GatewayIntentBits.DirectMessages,
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildBans,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildVoiceStates,
]})
const player = createAudioPlayer()


const commands = {
  play: (interaction) => {
    try {
      const musicURL = interaction.options.data[0].value

      const channelId = interaction.member.voice.channelId
      const guildId = interaction.member.guild.id
      const stream = ytdl(musicURL, { filter: 'audioonly' })
      stream.on('info', async info => {
        await interaction.reply(`Playing: ${info.videoDetails.title }`)
      })
      const connection = joinVoiceChannel( {
        channelId,
        guildId,
        adapterCreator: interaction.member.voice.guild.voiceAdapterCreator,
      })
      const resource = createAudioResource(stream)
      connection.subscribe(player)
      player.play(resource)
      connection.on(VoiceConnectionStatus.Ready, () => {
        console.log('here')
      })
    } catch (error) {
      console.log(error)
    }

  },
  pause: () => {

  },
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return
  commands[interaction.commandName](interaction)
})

client.on('messageCreate', msg => {
  if (msg.content === '!play') {
    const voiceChannel = msg.channelId
    voiceChannel.join().then(connection => {
      const stream = ytdl('https://www.youtube.com/watch?v=I4YDuG4XYtw&ab_channel=ternorei', { filter: 'audioonly' })
      const dispatcher = connection.play(stream)
      dispatcher.on('end', () => voiceChannel.leave())
    })
  }
})

client.login('token')