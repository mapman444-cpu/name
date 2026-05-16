
// REMOVES A USER FROM A TICKET

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a user from the current ticket')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to remove')
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

        await interaction.channel.permissionOverwrites.delete(user.id);

        return interaction.reply({
            content: `➖ Removed ${user} from the ticket.`
        });
    }
};