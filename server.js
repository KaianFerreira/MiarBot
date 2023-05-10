import { Client, GatewayIntentBits } from 'discord.js'
import axios from 'axios'
import {
  joinVoiceChannel,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
} from '@discordjs/voice'


import ytdl from 'ytdl-core'
import dotenv from 'dotenv'
dotenv.config()
const client = new Client({ intents: [
  GatewayIntentBits.DirectMessages,
  GatewayIntentBits.Guilds,
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
      const stream = ytdl(musicURL, {
        filter: 'audioonly',
        highWaterMark: 1 << 62,
      })
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
      })
    } catch (error) {
      console.log(error)
    }

  },
  gpt: async (interaction) => {
    interaction.reply('Estou pensando...')
    const channel = client.channels.cache.get(interaction.channelId)

    const question = interaction.options.data[0].value
    const { data } = await axios.post('http://localhost:3000/chat', {
      message: question
    })
    await channel.send(`pergunta: ${question} \n resposta: ${data}`)
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
      const stream = ytdl('https://www.youtube.com/watch?v=I4YDuG4XYtw', { filter: 'audioonly' })
      const dispatcher = connection.play(stream)
      dispatcher.on('end', () => voiceChannel.leave())
    })
  }
})


client.login(process.env.APP_TOKEN)