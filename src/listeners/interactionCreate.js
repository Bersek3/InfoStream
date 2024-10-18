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
      // Verifica si es una interacción de componente de mensaje
      if (!interaction.isMessageComponent()) return;

      // Aquí puedes manejar las interacciones, por ejemplo, botones o menús desplegables
      // Tu lógica para manejar la interacción irá aquí

    } catch (error) {
      console.error(`Error handling interaction ${interaction.customId}:`, error);

      const errorEmbed = createEmbed({
        title: "An error occurred",
        description: "Please try again later.",
        footer: {
          text: process.env.FOOTER_TEXT // Utilizamos la variable de entorno en lugar del config.json
        }
      });

      // Enviar respuesta de error de manera efímera (visible solo para el usuario)
      if (interaction.replied || interaction.deferred) {
        // Si la interacción ya fue respondida o está en proceso de respuesta
        await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
      } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
  }
};
