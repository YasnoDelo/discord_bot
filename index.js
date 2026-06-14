require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const TOKEN = process.env.DISCORD_TOKEN;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID;
const TRACK_USER_ID = process.env.TRACK_USER_ID;

function shouldTrack(userId) {
  if (!TRACK_USER_ID) return true;
  return userId === TRACK_USER_ID;
}

async function sendLog(guild, embed) {
  const channel = await guild.channels.fetch(LOG_CHANNEL_ID).catch(() => null);

  if (!channel) {
    console.log("Лог-канал не найден");
    return;
  }

  await channel.send({ embeds: [embed] });
}

client.once("clientReady", () => {
  console.log(`Бот запущен как ${client.user.tag}`);
  console.log("LOG_CHANNEL_ID:", LOG_CHANNEL_ID);
  console.log("VOICE_CHANNEL_ID:", VOICE_CHANNEL_ID);
});

client.on("voiceStateUpdate", async (oldState, newState) => {
  const member = newState.member || oldState.member;
  if (!member || member.user.bot) return;
  if (!shouldTrack(member.user.id)) return;

  const oldChannelId = oldState.channelId;
  const newChannelId = newState.channelId;

  // Человек вошёл именно в отслеживаемый голосовой канал
  if (oldChannelId !== VOICE_CHANNEL_ID && newChannelId === VOICE_CHANNEL_ID) {
    console.log("VOICE JOIN:", member.user.tag);

    const embed = new EmbedBuilder()
      .setTitle("Пользователь вошёл в голосовой канал")
      .setColor(0x57f287)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        {
          name: "Пользователь",
          value: `${member.user.tag} (${member.user.id})`,
        },
        {
          name: "Канал",
          value: `<#${VOICE_CHANNEL_ID}>`,
        },
        {
          name: "Время",
          value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
        }
      );

    await sendLog(newState.guild, embed);
  }

  // Человек вышел именно из отслеживаемого голосового канала
  if (oldChannelId === VOICE_CHANNEL_ID && newChannelId !== VOICE_CHANNEL_ID) {
    console.log("VOICE LEAVE:", member.user.tag);

    const embed = new EmbedBuilder()
      .setTitle("Пользователь вышел из голосового канала")
      .setColor(0xed4245)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        {
          name: "Пользователь",
          value: `${member.user.tag} (${member.user.id})`,
        },
        {
          name: "Канал",
          value: `<#${VOICE_CHANNEL_ID}>`,
        },
        {
          name: "Время",
          value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
        }
      );

    await sendLog(oldState.guild, embed);
  }
});

client.on("error", console.error);
client.on("warn", console.warn);

client.login(TOKEN);