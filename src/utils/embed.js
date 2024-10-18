// src/utils/createEmbed.js
const { MessageEmbed } = require("discord.js");
require('dotenv').config(); // Cargar variables del archivo .env

module.exports.createEmbed = (options = {}) => {
  if (!options || Object.keys(options).length === 0) {
    return new MessageEmbed();
  }

  const embed = new MessageEmbed();

  // Acceder a las variables desde process.env
  embed.setColor(process.env.BOT_COLOR || "DEFAULT");

  if (options.title) embed.setTitle(options.title);

  if (options.description) embed.setDescription(options.description);

  if (options.url) embed.setURL(options.url);

  if (options.fields) embed.addFields(options.fields);

  if (options.author) {
    embed.setAuthor({
      name: options.author.name,
      iconURL: options.author.icon,
      url: options.author.url,
    });
  }

  if (options.thumbnail) embed.setThumbnail(options.thumbnail);

  if (options.image) embed.setImage(options.image);

  if (options.video) embed.setVideo(options.video);

  // Usar las variables de entorno para el pie de página
  if (process.env.BOT_FOOTER_TEXT || process.env.BOT_FOOTER_ICON) {
    embed.setFooter({
      text: process.env.BOT_FOOTER_TEXT || "",
      iconURL: process.env.BOT_FOOTER_ICON || undefined,
    });
  }

  if (options.timestamp) {
    embed.setTimestamp(new Date());
  }

  return embed;
};
