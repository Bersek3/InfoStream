// src/commands/social/removestreamer.js
const { Command } = require("@sapphire/framework");
const { guildSettings } = require("../../../db");
const { createEmbed } = require("../../utils/embed");

module.exports = class RemoveStreamerCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "eliminarstreamer",
      description: "Eliminar un streamer del seguimiento.",
    });
  }

  async registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
          option
            .setName("nombre")
            .setDescription("El nombre del streamer a eliminar")
            .setRequired(true)
        )
    );
  }

  async chatInputRun(interaction) {
    await interaction.deferReply({ ephemeral: true });

    // Check if the user has MANAGE_CHANNELS permission
    if (!interaction.member.permissions.has("MANAGE_CHANNELS")) {
      const embed = createEmbed({
        description: "❌ No tienes permiso para usar este comando.",
      });
      return interaction.followUp({ embeds: [embed] });
    }

    const guildId = interaction.guildId;
    const nombre = interaction.options.getString("nombre");
    const streamers = guildSettings.get(guildId, "streamers", []);

    // Find the index of the streamer to be removed
    const indiceStreamer = streamers.findIndex(
      (s) => s.nombre.toLowerCase() === nombre.toLowerCase()  // Fixed to use 'nombre' instead of 'name'
    );

    // If the streamer is not found, inform the user
    if (indiceStreamer === -1) {
      const embed = createEmbed({
        description: `❌ El streamer ${nombre} no se encontró en la lista de seguimiento.`,
      });
      return interaction.followUp({ embeds: [embed] });
    }

    // Remove the streamer from the list
    streamers.splice(indiceStreamer, 1);
    guildSettings.set(guildId, "streamers", streamers);

    // Send confirmation message
    const embed = createEmbed({
      description: `✅ Se eliminó exitosamente a ${nombre} de la lista de seguimiento.`,
    });
    await interaction.followUp({ embeds: [embed] });
  }
};
