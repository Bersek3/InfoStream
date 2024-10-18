// src/utils/kick.js
const { KickApiWrapper } = require("kick.com-api");

async function checkKickLive(streamer) {
  const kickApi = new KickApiWrapper();

  try {
    const data = await kickApi.fetchChannelData(streamer.name);

    // Validar que se recibió data y que la información requerida está presente
    if (data && data.user && data.livestream) {
      const { livestream, user } = data;

      // Comprobar si el streamer está en vivo
      if (livestream.is_live) {
        const cleanedBio = user.bio ? user.bio.replace(/\[7TV:[^\]]+\]/g, "").trim() : "Sin biografía disponible";

        const result = {
          isLive: true,
          streamer: {
            platform: "kick",
            username: user.username,
            bio: cleanedBio,
            followersCount: data.followers_count,
            profileImageUrl: user.profile_pic,
            verified: data.verified,
            name: streamer.name,
            title: livestream.session_title || "Sin título",
            viewers: livestream.viewer_count || 0,
            imageUrl: user.profile_pic,
            startedAt: livestream.start_time || new Date().toISOString(),
            url: `https://kick.com/${streamer.name}`,
          },
        };

        return result;
      }
    }

    return { isLive: false };
  } catch (error) {
    console.error(`Error checking Kick live status for ${streamer.name}:`, error);
    return { isLive: false, error: error.message || "Error desconocido" };
  }
}

module.exports = {
  checkKickLive,
};
