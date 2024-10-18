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

    if (!interaction.member.permissions.has("MANAGE_CHANNELS")) {
      const embed = createEmbed({
        description: "❌ No tienes permiso para usar este comando.",
      });
      return interaction.followUp({ embeds: [embed] });
    }

    const guildId = interaction.guildId;
    const nombre = interaction.options.getString("nombre");
    const streamers = guildSettings.get(guildId, "streamers", []);

    const indiceStreamer = streamers.findIndex(
      (s) => s.name.toLowerCase() === nombre.toLowerCase()
    );

    if (indiceStreamer === -1) {
      const embed = createEmbed({
        description: `❌ El streamer ${nombre} no se encontró en la lista de seguimiento.`,
      });
      return interaction.followUp({ embeds: [embed] });
    }

    streamers.splice(indiceStreamer, 1);
    guildSettings.set(guildId, "streamers", streamers);

    const embed = createEmbed({
      description: `✅ Se eliminó exitosamente a ${nombre} de la lista de seguimiento.`,
    });
    await interaction.followUp({ embeds: [embed] });
  }
};
