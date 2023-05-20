import { Client, GatewayIntentBits } from 'discord.js'
import axios from 'axios'
import {
  joinVoiceChannel,
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

const currentPlayers = []



const musicPlayer = async (interaction, guildPlayer) => {
  const channel = client.channels.cache.get(interaction.channelId)
  const song = guildPlayer.queue.songs.shift()

  const stream = await ytdl(song.url, {
    filter: 'audioonly',
    highWaterMark: 1 << 62,
  })

  setTimeout(() => {
    if (guildPlayer.queue.songs.length > 0) musicPlayer(interaction, guildPlayer)
    else guildPlayer.queue.playing = false
  }, song.duration)

  stream.on('finish', (content) => {
    console.log('download finished')
  })

  stream.on('error', error => {
    console.log(error)
    guildPlayer.queue.songs.shift()
    musicPlayer(interaction)
  })

  stream.on('info', async info => {
    const message = `Playing: ${info.videoDetails.title }`
    try {
      await interaction.reply(message)
    } catch (error) {
      console.log(error)
      await channel.send(message)
    }
  })
  const resource = createAudioResource(stream)
  player.play(resource)
}

const commands = {
  play: async (interaction) => {
    try {
      const guildId = interaction.member.guild.id
      let guildPlayer = currentPlayers.find(guild => guild.id === guildId)
      if (!guildPlayer) {
        guildPlayer = {
          id: guildId,
          queue: {
            songs: [],
            connection: null,
            playing: false
          }
        }
        currentPlayers.push(guildPlayer)
      }

      const channelId = interaction.member.voice.channelId
      const musicURL = interaction.options.data[0].value
      const songInfo = await ytdl.getInfo(musicURL)
      const song = {
        title: songInfo.videoDetails.title,
        author: songInfo.videoDetails.author,
        url: songInfo.videoDetails.video_url,
        duration: songInfo.videoDetails.lengthSeconds * 1000
      }

      guildPlayer.queue.songs.push(song)

      if (!guildPlayer.queue.playing) {
        guildPlayer.queue.playing = true
        guildPlayer.queue.connection = await joinVoiceChannel({
          channelId,
          guildId,
          adapterCreator: interaction.member.voice.guild.voiceAdapterCreator,
        })
        guildPlayer.queue.connection.subscribe(player)
        musicPlayer(interaction, guildPlayer)
      } else {
        await interaction.reply(`Musica adicionada na fila: ${song.title}`)
      }

    } catch (error) {
      console.log(error)
    }

  },
  queue: async (interaction) => {
    const guildId = interaction.member.guild.id
    let guildPlayer = currentPlayers.find(guild => guild.id === guildId)
    if (guildPlayer.queue.songs.length === 0) {
      await interaction.reply('A fila está vazia!')
      return
    }

    // Cria uma nova lista numerada de músicas
    const queueList = guildPlayer.queue.songs.map((song, index) => {
      return `${index+1}. ${song.title}`
    })
    // Cria a mensagem com a lista numerada de músicas
    const queueMessage = `Músicas na fila:\n${queueList.join('\n')}`

    interaction.reply(queueMessage)
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
  try {
    commands[interaction.commandName](interaction)
  } catch (error) {
    console.log(error)
  }
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


process.on('uncaughtException', function (err) {
  console.error(err)
  console.log('Node NOT Exiting...')
})