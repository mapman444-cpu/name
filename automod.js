const { WebhookClient, EmbedBuilder, PermissionsBitField } = require('discord.js');

const bannedWords = [
    'nigger',
    'nigga',
    'negro',
    'fag',
    'faggot',
    'retard',
    'bastard',
    'neger',
    'cunt',
    'racist',
    'dick head',
    'retard',
    'nig',
    'nigg',
    'n word',
    'n-word',
    'nword',
    'neegar',
    'nihga',
    'reighcyst'

];

const logWebhook = new WebhookClient({
    url: 'https://discord.com/api/webhooks/1504611078792024214/06487SCSMUAyd3W0AVYPXjjiMElLPqQ5_TLJL2oQSaYYgwq_buI40dC-4CxRZxNfpJvp'
});

module.exports = (client) => {

    console.log('AutoMod loaded');

    client.on('messageCreate', async (message) => {

        if (!message.guild) return;
        if (message.author.bot) return;

        const content = message.content.toLowerCase();

        const hitWord = bannedWords.find(word =>
            content.includes(word)
        );

        if (!hitWord) return;

        try {

            await message.delete().catch(() => {});

            if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                await logWebhook.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFFA500)
                            .setTitle('⚠️ AutoMod Bypass (Admin)')
                            .addFields(
                                { name: 'User', value: message.author.tag, inline: true },
                                { name: 'Word', value: hitWord, inline: true },
                                { name: 'Action', value: 'Message deleted only' }
                            )
                            .setTimestamp()
                    ]
                });

                return;
            }

           
            if (message.member.moderatable) {

                await message.member.timeout(
                    60 * 60 * 1000,
                    'Used a banned word'
                );

                await logWebhook.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0x0000CF)
                            .setTitle('🚨 AutoMod Triggered')
                            .addFields(
                                { name: '👤 User', value: message.author.tag, inline: true },
                                { name: '🆔 ID', value: message.author.id, inline: true },
                                { name: '📍 Channel', value: message.channel.name, inline: true },
                                { name: '⛔ Trigger Word', value: `||${String(hitWord).replace(/\|/g, '\\|')}||` },
                                { name: '🔨 Action', value: '1 hour timeout + delete' }
                            )
                            .setFooter({ text: 'AutoMod System' })
                            .setTimestamp()
                    ]
                });

            } else {

                await logWebhook.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setTitle('⚠️ Cannot Timeout User')
                            .addFields(
                                { name: 'User', value: message.author.tag },
                                { name: 'Reason', value: 'Not moderatable' },
                                { name: 'Trigger', value: hitWord }
                            )
                            .setTimestamp()
                    ]
                });

            }

        } catch (error) {
            console.error('AutoMod error:', error);

            await logWebhook.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('❌ AutoMod Error')
                        .setDescription(error.message)
                        .setTimestamp()
                ]
            }).catch(() => {});
        }

    });

};