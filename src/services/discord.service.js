const {
    Client,
    REST,
    Routes,
    Events,
    GatewayIntentBits,
    AttachmentBuilder,
} = require('discord.js');
const path = require('path');
const commands = require('../utils/commands');
const { log } = require('console');
const { serialize } = require('v8');
const AzureTranslator = require('./azureTranslation.service');
const SubtitleProcessor = require('./subtitleProcess');
const convertVttToSrt = require('../utils/convertVttToSrt');

class DiscordBot {
    constructor() {
        this.client = new Client({ intents: [GatewayIntentBits.Guilds] });
        this.registerCommands(commands);
        this.registerEvents();
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

            if (interaction.commandName === 'mwtm') {
                const input = interaction.options.getString('code');

                const codeArray = input.split(',').map((code) => code.trim());
                await interaction.deferReply();
                const attachments = [];

                for (const [index, code] of codeArray.entries()) {
                    const url = `https://mixwiththemasters.com/videos/_/get_subtitles/${code}.vtt`;
                    const response = await fetch(url);
                    if (!response.ok)
                        throw new Error(`Lỗi tải file: ${response.statusText}`);

                    const vttText = await response.text();
                    const srtText = convertVttToSrt(vttText);

                    // Translate the subtitle from ENG to VI
                    const translator = new AzureTranslator(
                        process.env.SUBSCRIPTION_KEY,
                        'southeastasia',
                    );
                    const processor = new SubtitleProcessor(translator);
                    const translatedSubtitles =
                        await processor.translateSubtitles(srtText, 'en', 'vi');

                    const buffer = Buffer.from(translatedSubtitles, 'utf-8');
                    attachments.push(
                        new AttachmentBuilder(buffer, {
                            name: `Part ${index + 1}.srt`,
                        }),
                    );
                }

                await interaction.followUp({
                    content: 'OK',
                    files: attachments,
                });
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

    async registerCommands(commands = []) {
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

    async sendFile(channelId) {
        const filePath = path.join(__dirname, 'example.txt');

        try {
            const channel = await this.client.channels.fetch(channelId);

            if (channel) {
                await channel.send({
                    content: 'OK',
                    files: [filePath],
                });
            } else {
                console.log(`Channel with ID ${channelId} not found`);
            }
        } catch (err) {
            console.error('Error sending file:', err);
            this.sendMessageToChannel(channelId, 'Error sending file');
        }
    }
}

module.exports = DiscordBot;
