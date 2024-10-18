// src/utils/confirm.js
const { MessageActionRow, MessageButton } = require("discord.js");

const confirm = async (interaction, prompt) => {
  // Deferir la interacción para evitar problemas de tiempo de espera
  await interaction.deferReply({ ephemeral: true });

  const row = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId("confirm_yes")
      .setLabel("Yes")
      .setStyle("SUCCESS"),
    new MessageButton()
      .setCustomId("confirm_no")
      .setLabel("No")
      .setStyle("DANGER")
  );

  try {
    await interaction.followUp({ content: prompt, components: [row] });
  } catch (error) {
    console.error('Error sending confirmation message:', error);
    return false; // Retorna false si hay un error
  }

  const filter = (i) => {
    // Verifica que el autor de la interacción sea el mismo que la interacción inicial
    return i.user.id === interaction.user.id && 
           (i.customId === "confirm_yes" || i.customId === "confirm_no");
  };

  return new Promise((resolve) => {
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 30000,
    });

    collector.on("collect", (i) => {
      i.deferUpdate(); // Deferir la interacción para evitar errores
      resolve(i.customId === "confirm_yes");
      collector.stop();
    });

    collector.on("end", () => {
      resolve(false); // Resuelve como false si el tiempo se agota
    });
  });
};

module.exports = confirm;
