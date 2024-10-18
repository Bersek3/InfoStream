// src/commands/social/addstreamer.js
const { Command } = require("@sapphire/framework");
const { guildSettings } = require("../../../db");
const { createEmbed } = require("../../utils/embed");

module.exports = class AddStreamerCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "agregarstreamer",
      description: "Agregar un streamer para hacer seguimiento.",
    });
  }

  async registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
          option
            .setName("plataforma")
            .setDescription("La plataforma del streamer")
            .setRequired(true)
            .addChoices(
              { name: "YouTube", value: "youtube" },
              { name: "Twitch", value: "twitch" },
              { name: "Kick", value: "kick" },
              { name: "Rumble", value: "rumble" },
              { name: "TikTok", value: "tiktok" }
            )
        )
        .addStringOption((option) =>
          option
            .setName("nombre")
            .setDescription("El nombre del streamer")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("canal")
            .setDescription("El canal para enviar notificaciones")
            .setRequired(true)
        )
    );
  }

  async chatInputRun(interaction) {
    await interaction.deferReply({ ephemeral: true });

    if (!interaction.member.permissions.has("ADMINISTRATOR")) {
      const embed = createEmbed({
        description: "❌ No tienes permiso para usar este comando.",
      });
      return interaction.followUp({ embeds: [embed] });
    }

    const guildId = interaction.guildId;
    const plataforma = interaction.options.getString("plataforma");
    const nombre = interaction.options.getString("nombre");
    const canal = interaction.options
      .getString("canal")
      .replace(/[<#>]/g, "");

    const datosStreamerPorDefecto = {
      streamers: [],
    };

    const streamers = guildSettings.ensure(
      guildId,
      datosStreamerPorDefecto
    ).streamers;

    const nuevoStreamer = {
      id: `${plataforma}:${nombre}`,
      nombre,
      plataforma,
      channelID: canal,
      isLive: false,
      lastLiveAt: null,
    };

    if (streamers.some((s) => s.id === nuevoStreamer.id)) {
      const embed = createEmbed({
        description: "❌ Este streamer ya está siendo seguido.",
      });
      return interaction.followUp({ embeds: [embed] });
    }

    streamers.push(nuevoStreamer);
    guildSettings.set(guildId, { streamers });

    const embed = createEmbed({
      description: `✅ Se agregó exitosamente a ${nombre} en ${plataforma} a la lista de seguimiento.`,
    });
    await interaction.followUp({ embeds: [embed] });
  }
};
