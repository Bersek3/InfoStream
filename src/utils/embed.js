// src/utils/createEmbed.js
const { EmbedBuilder } = require("discord.js");

const config = {
  color: process.env.COLOR || "#61CB2B",
  footerText: process.env.FOOTER_TEXT || "Desarrollado por: Bersek",
  footerIcon: process.env.FOOTER_ICON || "",
};

module.exports.createEmbed = (options = {}) => {
  const embed = new EmbedBuilder(); // Asegúrate de que esta línea no arroje un error

  embed.setColor(config.color || "DEFAULT");

  if (options.title) embed.setTitle(options.title);
  if (options.description) embed.setDescription(options.description);
  if (options.url) embed.setURL(options.url);
  if (options.fields) embed.addFields(options.fields);
  
  if (options.author) {
    embed.setAuthor({
      name: options.author.name,
      iconURL: options.author.icon || null,
      url: options.author.url || null,
    });
  }
  
  if (options.thumbnail) embed.setThumbnail(options.thumbnail);
  if (options.image) embed.setImage(options.image);

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
