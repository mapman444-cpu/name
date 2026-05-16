const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Shows latency'),

    async execute(interaction, client) {

        const sent = await interaction.reply({
            content: 'Pinging...',
            fetchReply: true
        });

        const responseTime =
            sent.createdTimestamp - interaction.createdTimestamp;

        const apiLatency =
            Math.round(client.ws.ping);

        const embed = new EmbedBuilder()
            .setColor(0x0000CF)
            .setTitle('🏓 Pong!')
            .addFields(
                {
                    name: '📡 API Latency',
                    value: `${apiLatency}ms`,
                    inline: true
                },
                {
                    name: '⚡ Response Time',
                    value: `${responseTime}ms`,
                    inline: true
                }
            );

        await interaction.editReply({
            content: '',
            embeds: [embed]
        });

    }
};