// src/utils/createEmbed.js
const { EmbedBuilder } = require("discord.js");

const config = {
  color: process.env.COLOR || "#61CB2B", // Color por defecto si no se define en las variables de entorno
  footerText: process.env.FOOTER_TEXT || "Desarrollado por: Bersek",
  footerIcon: process.env.FOOTER_ICON || "",
};

module.exports.createEmbed = (options = {}) => {
  if (!options || Object.keys(options).length === 0) {
    return new EmbedBuilder();
  }

  const embed = new EmbedBuilder();

  embed.setColor(config.color || "DEFAULT");

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

  // Discord.js v14 no soporta directamente videos en los embeds
  // Si usas una versión diferente puedes agregar soporte aquí

  if (config.footerText || config.footerIcon) {
    embed.setFooter({
      text: config.footerText,
      iconURL: config.footerIcon || null,
    });
  }

  if (options.timestamp) {
    embed.setTimestamp(new Date());
  }

  return embed;
};
