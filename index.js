require('dotenv').config();
const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    REST,
    Routes,
    EmbedBuilder
} = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Shows detailed bot latency')
        .toJSON()
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// Register commands
(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            { body: commands }
        );

        console.log('Slash commands registered!');
    } catch (err) {
        console.error(err);
    }
})();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {

        const start = Date.now();

        await interaction.reply({ content: 'Pinging...' });

        const apiLatency = Math.round(client.ws.ping);
        const responseTime = Date.now() - start;

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31) // dark webhook-style grey
            .setTitle('🏓 Pong!')
            .addFields(
                { name: '📡 API Latency', value: `${apiLatency}ms`, inline: true },
                { name: '⚡ Response Time', value: `${responseTime}ms`, inline: true },
                { name: '🔁 WebSocket', value: `${apiLatency}ms`, inline: true }
            )
            .setFooter({ text: 'Webhook-style latency check' })
            .setTimestamp();

        await interaction.editReply({ content: null, embeds: [embed] });
    }
});

client.login(process.env.TOKEN);