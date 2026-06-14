require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

const TOKEN = process.env.DISCORD_TOKEN;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
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

client.once("ready", () => {
  console.log(`Бот запущен как ${client.user.tag}`);
});

client.on("guildMemberAdd", async (member) => {
  if (!shouldTrack(member.user.id)) return;

  const embed = new EmbedBuilder()
    .setTitle("Участник вошёл на сервер")
    .setColor(0x57f287)
    .setThumbnail(member.user.displayAvatarURL())
    .addFields(
      {
        name: "Пользователь",
        value: `${member.user.tag} (${member.user.id})`,
      },
      {
        name: "Аккаунт создан",
        value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`,
      },
      {
        name: "Вошёл",
        value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
      }
    );

  await sendLog(member.guild, embed);
});

client.on("guildMemberRemove", async (member) => {
  if (!shouldTrack(member.user.id)) return;

  const embed = new EmbedBuilder()
    .setTitle("Участник вышел с сервера")
    .setColor(0xed4245)
    .setThumbnail(member.user.displayAvatarURL())
    .addFields(
      {
        name: "Пользователь",
        value: `${member.user.tag} (${member.user.id})`,
      },
      {
        name: "Вышел",
        value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
      }
    );

  await sendLog(member.guild, embed);
});

client.login(TOKEN);