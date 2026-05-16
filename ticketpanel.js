const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    PermissionFlagsBits
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel')
        .setDescription('Sends the ticket panel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel),

    async execute(interaction) {

        const allowedRoleId = '1505346194342416555';

        // Check Role Perms
        if (!interaction.member.roles.cache.has(allowedRoleId)) {
            return interaction.reply({
                content: '❌ You do not have permission to use this command.',
                ephemeral: true
            });
        }

        // DELETE OLD PANELS
        const messages = await interaction.channel.messages.fetch({ limit: 30 });

        const oldPanels = messages.filter(msg =>
            msg.author.id === interaction.client.user.id &&
            msg.embeds.length > 0 &&
            msg.embeds[0].title?.includes('Need Help')
        );

        for (const msg of oldPanels.values()) {
            await msg.delete().catch(() => {});
        }

        //  EMBED 
        const embed = new EmbedBuilder()
            .setColor(0xff7a18)
            .setAuthor({ name: 'Testing Server Support System' })
            .setTitle('🎫 Need Help?')
            .setDescription(
`Before opening a ticket, please check **FAQ & Common Fixes**
Many issues can be solved without staff assistance.


────────────────────────


🏠 **General Support**
Questions, comments, or concerns.

⠀

📌 **Staff Team Report**
Report staff members for rule violations or misconduct.

⠀

🚫 **Ingame Ban Appeal**
Appeal bans or punishments. Please include full details and proof if available.


────────────────────────


👇 Select a category below to open a ticket`
            )
            .setFooter({ text: 'Testing Server • Support System' });

        //  MENU OPTIONS
        const menu = new StringSelectMenuBuilder()
            .setCustomId('ticket_menu')
            .setPlaceholder('Select a ticket category...')
            .addOptions(
                {
                    label: 'General Support',
                    value: 'support',
                    description: 'Questions, comments, or concerns',
                    emoji: '🏠'
                },
                {
                    label: 'Staff Team Report',
                    value: 'report',
                    description: 'Report staff members',
                    emoji: '📌'
                },
                {
                    label: 'Ingame Ban Appeal',
                    value: 'appeal',
                    description: 'Appeal bans or punishments',
                    emoji: '🚫'
                }
            );

        const row = new ActionRowBuilder().addComponents(menu);

        // SEND PANEL 
        await interaction.channel.send({
            embeds: [embed],
            components: [row]
        });

        // confirm panel sent
        await interaction.reply({
            content: '✅ Ticket panel has been updated.',
            ephemeral: true
        });
    }
};