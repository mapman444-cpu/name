const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Shows how long the bot has been running'),

    async execute(interaction) {

        const uptime = interaction.client.uptime;

        const totalSeconds = Math.floor(uptime / 1000);

        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const embed = new EmbedBuilder()
            .setColor(0x2b6fff)
            .setTitle('🟢 Bot Uptime')
            .setDescription(
`Here is the current uptime of the bot:

📅 **Days:** ${days}
⏰ **Hours:** ${hours}
⏱️ **Minutes:** ${minutes}
⌛ **Seconds:** ${seconds}

────────────────────

📡 Running smoothly without restart.`
            )
            .setFooter({ text: 'System Status' })
            .setTimestamp();

        return interaction.reply({
            embeds: [embed]
        });
    }
};