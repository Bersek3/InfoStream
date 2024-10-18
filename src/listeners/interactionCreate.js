// src/interaction-handlers/interactionCreate.js
const { Listener } = require("@sapphire/framework");
const { createEmbed } = require("../utils/embed");

module.exports = class extends Listener {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "interactionCreate",
    });
  }

  async run(interaction) {
    try {
      if (!interaction.isMessageComponent()) return;
    } catch (error) {
      console.error("An error occurred:", error);

      const errorEmbed = createEmbed({
        title: "An error occurred",
        description: "Please try again later.",
        footer: {
          text: process.env.BOT_FOOTER_TEXT || "",
          iconURL: process.env.BOT_FOOTER_ICON || undefined,
        },
      });

      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
};
