const {
    Client,
    REST,
    Routes,
    Events,
    GatewayIntentBits,
} = require('discord.js');

class DiscordBot {
    constructor() {
        this.client = new Client({ intents: [GatewayIntentBits.Guilds] });
        this.registerEvents();
        this.sendMessageDaily();
    }

    registerEvents() {
        this.client.on(Events.ClientReady, () => {
            console.log(`Logged in as ${this.client.user.tag}!`);
        });

        this.client.on(Events.InteractionCreate, async (interaction) => {
            if (!interaction.isChatInputCommand()) return;

            if (interaction.commandName === 'ping') {
                await interaction.reply('Pong!');
            }

            if (interaction.commandName === 'reset') {
                DiscordBot.resetCount();
                await interaction.reply('Counter đã reset về 1.');
            }

            if (interaction.commandName === 'sync') {
                await interaction.reply('Đã gửi request đồng bộ.');
                DiscordBot.sendRequestToSynchronous();
            }
        });
    }

    async startBot() {
        try {
            await this.client.login(process.env.BOT_DISCORD_TOKEN);
            console.log('Bot đã được khởi động thành công.');
        } catch (error) {
            console.error('Lỗi khi khởi động bot:', error);
        }
    }

    static async sendRequestToSynchronous() {
        try {
            const response = await fetch(process.env.REQUEST_URL, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(
                    `Request failed with status ${response.status}`,
                );
            }

            console.log('Request successfull:', await response.text());
        } catch (error) {
            console.error('Error accessing gateway:', error);
        }
    }

    static async registerCommands(commands = []) {
        try {
            const rest = new REST({ version: '10' }).setToken(
                process.env.BOT_DISCORD_TOKEN,
            );
            console.log('Started refreshing application (/) commands.');

            await rest.put(
                Routes.applicationCommands(process.env.BOT_DISCORD_ID),
                {
                    body: commands,
                },
            );

            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    }

    async sendMessageToChannel(channelId, message) {
        try {
            const channel = await this.client.channels.fetch(channelId);
            if (channel) {
                await channel.send(message);
            } else {
                console.log(`Channel with ID ${channelId} not found`);
            }
        } catch (error) {
            console.error('Error sending message to channel:', error);
        }
    }

    // sendMessageDaily(channelId = '1346036441276350464') {
    //     cron.schedule(
    //         '0 6 * * *',
    //         () => {
    //             const message = `Ngày thứ ${DiscordBot.getCount()}.`;
    //             this.sendMessageToChannel(channelId, message);
    //         },
    //         {
    //             timezone: 'Asia/Ho_Chi_Minh',
    //         },
    //     );
    // }
}

module.exports = DiscordBot;
