
// ADDS A USER TO A TICKET

const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Add a user to the current ticket')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to add')
                .setRequired(true)
        ),

    async execute(interaction) {

        const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID;

        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
            return interaction.reply({
                content: "❌ Staff only.",
                ephemeral: true
            });
        }

        const user = interaction.options.getUser('user');

        await interaction.channel.permissionOverwrites.edit(user.id, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
        });

        return interaction.reply({
            content: `➕ Added ${user} to the ticket.`
        });
    }
};