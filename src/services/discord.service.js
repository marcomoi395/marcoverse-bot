const {
    Client,
    REST,
    Routes,
    Events,
    GatewayIntentBits,
} = require('discord.js');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

class DiscordBot {
    static count = DiscordBot.loadCount();

    constructor() {
        this.client = new Client({ intents: [GatewayIntentBits.Guilds] });
        this.registerEvents();
        this.sendMessageDaily();
    }

    static loadCount() {
        try {
            const filePath = path.join(__dirname, 'count.json');
            if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf-8');
                return JSON.parse(data).count || 1;
            }
        } catch (error) {
            console.error('Lỗi khi đọc file count.json:', error);
        }
        return 1;
    }

    static saveCount() {
        try {
            const filePath = path.join(__dirname, 'count.json');
            fs.writeFileSync(
                filePath,
                JSON.stringify({ count: this.count }),
                'utf-8',
            );
        } catch (error) {
            console.error('Lỗi khi ghi file count.json:', error);
        }
    }

    static getCount() {
        return this.count;
    }

    static increateCount() {
        this.count++;
        this.saveCount();
    }

    static resetCount() {
        this.count = 1;
        this.saveCount();
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

            if (interaction.commandName === 'r') {
                DiscordBot.resetCount();
                await interaction.reply('Counter đã reset về 1.');
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

    sendMessageDaily(channelId = '1346036441276350464') {
        cron.schedule(
            '0 6 * * *',
            () => {
                DiscordBot.increateCount();
                const message = `Ngày thứ ${DiscordBot.getCount()}.`;
                this.sendMessageToChannel(channelId, message);
            },
            {
                timezone: 'Asia/Ho_Chi_Minh',
            },
        );
    }
}

module.exports = DiscordBot;
