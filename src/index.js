// src/index.js
require("sapphire-plugin-modal-commands/register");
require('dotenv').config(); // Cargar variables del archivo .env
const { SapphireClient } = require("@sapphire/framework");
const { guildSettings } = require("../db");
const streamAlerts = require("./utils/streamAlerts");

const activities = [
  {
    text: "on {streamerCount} streams | {serverCount} servers",
    type: "PLAYING",
  },
  {
    text: "over {streamerCount} live streams | {serverCount} servers",
    type: "WATCHING",
  },
  {
    text: "to {streamerCount} streamers | {serverCount} servers",
    type: "LISTENING",
  },
];

const client = new SapphireClient({
  intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES"],
});

client.once("ready", () => {
  console.log("Bot is online!");
  streamAlerts.init(client);

  let activityIndex = 0;

  setInterval(async () => {
    let totalStreamers = 0;

    client.guilds.cache.each((guild) => {
      const guildStreamers = guildSettings.get(guild.id, "streamers", []);
      totalStreamers += guildStreamers.length;
    });

    const serverCount = client.guilds.cache.size;

    const activity = activities[activityIndex % activities.length];
    let formattedText = activity.text
      .replace("{streamerCount}", totalStreamers)
      .replace("{serverCount}", serverCount);

    client.user.setActivity(formattedText, { type: activity.type });

    activityIndex++;
  }, 30000);
});

// Aquí usamos process.env para obtener el token desde el archivo .env
client.login(process.env.BOT_TOKEN);
