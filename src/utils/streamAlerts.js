// src/utils/streamAlerts.js
const { guildSettings } = require("../../db");
const { createEmbed } = require("./embed");
const { MessageActionRow, MessageButton } = require('discord.js');
const { checkTwitchLive } = require("./twitch");
const { checkYouTubeLive } = require("./youtube");
const { checkRumbleLive } = require("./rumble");
const { checkKickLive } = require("./kick");
const puppeteer = require('puppeteer'); // Importar Puppeteer

const lastLiveData = new Map();

module.exports = {
  init: (client) => {
    setInterval(() => checkStreamers(client), 60 * 1000);
  },
};

// Función para verificar si el streamer está en vivo
async function checkIfLive(streamer) {
  const platformCheckers = {
    twitch: checkTwitchLive,
    youtube: checkYouTubeLive,
    rumble: checkRumbleLive,
    kick: checkKickLive,
    // Si deseas verificar TikTok, puedes agregarla aquí
  };

  const checker = platformCheckers[streamer.platform.toLowerCase()];
  if (checker) {
    return checker(streamer);
  }
  
  // Si no hay un verificador específico, intenta usar Puppeteer
  if (streamer.platform.toLowerCase() === 'custom') {
    return checkWithPuppeteer(streamer.url); // Llama a la función de Puppeteer
  }
  
  return { isLive: false, streamer };
}

// Función para verificar el estado del stream usando Puppeteer
async function checkWithPuppeteer(url) {
  let isLive = false;
  let title = '';
  let imageUrl = '';

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Aquí debes implementar la lógica para verificar si está en vivo.
  // Por ejemplo, usando selectores específicos de la página que se está visitando:
  // Estos selectores deben cambiarse a los correctos para la plataforma que estés verificando.
  
  try {
    // Ejemplo para verificar un título o un elemento que indique que el stream está en vivo
    title = await page.$eval('h1.stream-title-selector', el => el.innerText); // Cambia el selector por el correcto
    imageUrl = await page.$eval('img.stream-thumbnail-selector', el => el.src); // Cambia el selector por el correcto
    isLive = true; // Cambiar según el contenido que verifiques
  } catch (error) {
    console.error('Error al verificar con Puppeteer:', error);
  } finally {
    await browser.close();
  }

  return { isLive, streamer: { title, imageUrl } };
}

// Función principal que verifica a los streamers
async function checkStreamers(client) {
  if (client.guilds.cache.size === 0) return;

  for (const [guildId, guild] of client.guilds.cache) {
    let streamers = guildSettings.get(guildId, "streamers") || [];

    for (let i = 0; i < streamers.length; i++) {
      try {
        const liveInfo = await checkIfLive(streamers[i]);
        const liveStreamKey = `${guildId}-${streamers[i].id}`;
        const lastLive = lastLiveData.get(liveStreamKey);

        const shouldSendEmbed =
          liveInfo.isLive &&
          (!lastLive || lastLive.title !== liveInfo.streamer.title);

        if (shouldSendEmbed) {
          const channel = client.channels.cache.get(streamers[i].channelID);
          if (channel) {
            const { embed, components } = createStreamerEmbed(liveInfo.streamer);
            await channel.send({ embeds: [embed], components });
          }

          lastLiveData.set(liveStreamKey, {
            title: liveInfo.streamer.title,
            imageUrl: liveInfo.streamer.imageUrl,
            isLive: liveInfo.isLive,
          });
        }

        if (!liveInfo.isLive && lastLiveData.has(liveStreamKey)) {
          lastLiveData.delete(liveStreamKey);
        }

        streamers[i] = {
          ...streamers[i],
          ...liveInfo.streamer,
          lastLiveAt: liveInfo.isLive ? new Date() : streamers[i].lastLiveAt,
        };
        await guildSettings.set(guildId, "streamers", streamers);
      } catch (error) {
        console.error(
          `Error during live check for ${streamers[i].name}:`,
          error
        );
      }
    }
  }
}

function createStreamerEmbed(streamer) {
  const platformDetails = {
    twitch: { color: '#9146FF', emoji: '🟪' },
    youtube: { color: '#FF0000', emoji: '🟥' },
    rumble: { color: '#90EE90', emoji: '🟩' },
    kick: { color: '#00FF00', emoji: '🟩' },
    tiktok: { color: '#000000', emoji: '🔳' },
  };

  const currentPlatform = platformDetails[streamer.platform.toLowerCase()] || { color: 'DEFAULT', emoji: '🔴' };

  let description = `@everyone ${streamer.username || streamer.name} está en directo por [${
    streamer.platform
  }](${streamer.url}).`;

  const fields = [];
  if (streamer.viewers) {
    fields.push({
      name: "👀 Espectadores",
      value: streamer.viewers.toString(),
      inline: true,
    });
  }
  if (streamer.startedAt) {
    let startedAtDate = new Date(streamer.startedAt);
    if (!startedAtDate.getTime()) {
      startedAtDate = new Date(streamer.startedAt + 'Z');
    }
  }

  const followerLabel =
    streamer.platform.toLowerCase() === "youtube"
      ? "👥 Suscriptores"
      : "👥 Seguidores";
  if (streamer.followersCount) {
    fields.push({
      name: followerLabel,
      value: streamer.followersCount.toString(),
      inline: true,
    });
  }
  if (streamer.verified) {
    fields.push({ name: "✅ Verificado", value: "Sí", inline: true });
  }

  const button = new MessageButton()
    .setLabel(`${streamer.name} está en directo por ${streamer.platform}!`)
    .setStyle('LINK')
    .setURL(streamer.url)
    .setEmoji(currentPlatform.emoji);

  const row = new MessageActionRow().addComponents(button);

  return {
    embed: createEmbed({
      title: streamer.title || "En directo",
      url: streamer.url,
      description: description,
      color: currentPlatform.color,
      image: streamer.imageUrl || undefined,
      fields: fields,
    }),
    components: [row]
  };
}
