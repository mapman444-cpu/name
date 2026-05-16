require('dotenv').config();
const TOKEN = process.env.TOKEN;
const fs = require('fs');

const {
    Client,
    GatewayIntentBits,
    Collection,
    REST,
    Routes
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();

const commandFiles = fs
    .readdirSync('./commands')
    .filter(file => file.endsWith('.js'));

const commands = [];

for (const file of commandFiles) {

    const command = require(`./commands/${file}`);

    client.commands.set(
        command.data.name,
        command
    );

    commands.push(
        command.data.toJSON()
    );

}

const rest = new REST({
    version: '10'
}).setToken(process.env.TOKEN);

(async () => {

    try {

        console.log(
            'Registering slash commands...'
        );

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            {
                body: commands
            }
        );

        console.log(
            'Slash commands registered!'
        );

    } catch (error) {

        console.error(error);

    }

})();

client.once('clientReady', () => {

    console.log(
        `Logged in as ${client.user.tag}`
    );

    client.user.setPresence({
        activities: [
            {
                name: '/ping',
                type: 0
            }
        ],
        status: 'online'
    });

});

client.on(
    'interactionCreate',
    async interaction => {

        if (
            !interaction.isChatInputCommand()
        ) return;

        const command = client.commands.get(
            interaction.commandName
        );

        if (!command) return;

        try {

            await command.execute(
                interaction,
                client
            );

        } catch (error) {

            console.error(error);

            if (
                interaction.replied ||
                interaction.deferred
            ) {

                await interaction.followUp({
                    content:
                        'There was an error while executing this command.',
                    ephemeral: true
                });

            } else {

                await interaction.reply({
                    content:
                        'There was an error while executing this command.',
                    ephemeral: true
                });

            }

        }

    }
);

require('./events/automod')(client);
require('./events/tickets')(client);
client.login(process.env.TOKEN);