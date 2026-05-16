const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionsBitField,
    ChannelType,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

const db = require('../database');

const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID;
const CATEGORY_NAME = "Tickets";

//  TICKET QUESTIONS 
const QUESTIONS = {
    SUPPORT: ["What do you need help with?"
       
    ],
    REPORT: [
        "Who are you reporting & what is their rank?",

        "What did they do?",

        "Do you have proof?"
    ],
    APPEAL: [
        "What is your Roblox username & ID?",

        "Why were you banned?",
        
        "Why should we unban you?"
    ]
};

//  GET TICKET NUMBER 
function getNextTicketNumber(type) {
    return new Promise((resolve) => {
        db.get(
            `SELECT MAX(ticketNumber) as max FROM tickets WHERE ticketType = ?`,
            [type],
            (err, row) => {
                if (err) return resolve(1);
                resolve((row?.max || 0) + 1);
            }
        );
    });
}

//  MAIN CODE
module.exports = (client) => {

    client.on('interactionCreate', async (interaction) => {

        //  SELECT TICKET OPTION 
        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_menu') {

            const type = interaction.values[0].toUpperCase();
            const questions = QUESTIONS[type];

            if (!questions) {
                return interaction.reply({
                    content: "❌ Invalid ticket type.",
                    ephemeral: true
                });
            }

            const modal = new ModalBuilder()
                .setCustomId(`ticket_modal_${type}`)
                .setTitle(`${type} Ticket Form`);

            const components = questions.slice(0, 5).map((q, i) => {
                return new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`q_${i}`)
                        .setLabel(q)
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                );
            });

            modal.addComponents(...components);

            return interaction.showModal(modal);
        }

        //  HANDLE MODAL  
        if (interaction.isModalSubmit() && interaction.customId.startsWith('ticket_modal_')) {

            const type = interaction.customId.split('_')[2];
            const questions = QUESTIONS[type];

            const answers = questions.map((_, i) =>
                interaction.fields.getTextInputValue(`q_${i}`)
            );

            const guild = interaction.guild;

            // Get or create category
            let category = guild.channels.cache.find(c => c.name === CATEGORY_NAME);

            if (!category) {
                category = await guild.channels.create({
                    name: CATEGORY_NAME,
                    type: ChannelType.GuildCategory
                });
            }

            const number = await getNextTicketNumber(type);

            const channel = await guild.channels.create({
                name: `${type.toLowerCase()}-${String(number).padStart(4, '0')}`,
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory
                        ]
                    },
                    {
                        id: STAFF_ROLE_ID,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory
                        ]
                    }
                ]
            });

            db.run(
                `INSERT INTO tickets (userId, channelId, guildId, ticketNumber, ticketType)
                 VALUES (?, ?, ?, ?, ?)`,
                [interaction.user.id, channel.id, guild.id, number, type]
            );

            const embed = new EmbedBuilder()
                .setColor(0x00ff99)
                .setTitle(`🎫 ${type}-${String(number).padStart(4, '0')}`)
                .setDescription("New ticket created.");

            answers.forEach((a, i) => {
                embed.addFields({
                    name: questions[i],
                    value: a.slice(0, 1024)
                });
            });

            const panel = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('claim_ticket')
                    .setLabel('👮 Claim')
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('🔒 Close')
                    .setStyle(ButtonStyle.Danger)
            );

            await channel.send({
                content: `<@&${STAFF_ROLE_ID}> | <@${interaction.user.id}>`,
                embeds: [embed],
                components: [panel]
            });

            return interaction.reply({
                content: `✅ Ticket created: ${channel}`,
                ephemeral: true
            });
        }

        //  CLAIM 
        if (interaction.isButton() && interaction.customId === 'claim_ticket') {

            if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
                return interaction.reply({
                    content: "❌ Staff only.",
                    ephemeral: true
                });
            }

            return interaction.reply({
                content: `👮 Claimed by ${interaction.user}`
            });
        }

        //  CLOSE 
        if (interaction.isButton() && interaction.customId === 'close_ticket') {

            if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
                return interaction.reply({
                    content: "❌ Staff only.",
                    ephemeral: true
                });
            }

            return interaction.reply({
                content: "Are you sure you want to close this ticket?",
                ephemeral: true,
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('confirm_close')
                            .setLabel('✅ Confirm')
                            .setStyle(ButtonStyle.Success)
                    )
                ]
            });
        }

        //  CONFIRM CLOSE 
        if (interaction.isButton() && interaction.customId === 'confirm_close') {

            if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
                return interaction.reply({
                    content: "❌ Staff only.",
                    ephemeral: true
                });
            }

            await interaction.reply({ content: "🔒 Closing ticket..." });
            await interaction.channel.delete();
        }
    });
};