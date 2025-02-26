'use strict';

const { Telegraf, session } = require('telegraf');
const { UNAUTHORIZED, BAD_REQUEST } = require('../core/responseHandler');
const { saveConfession } = require('../repository/confession.repo');
const responseConfessionMessage = require('../utils/responseConfessionMessage');
const auth = require('../middleware/auth');

class TelegramBot {
    constructor() {
        if (!process.env.BOT_TELE_TOKEN)
            throw new UNAUTHORIZED('Missing Bot Token');

        this.bot = new Telegraf(process.env.BOT_TELE_TOKEN);

        this.bot.use(session());

        this.bot.command('start', (ctx) => {
            console.log(ctx.message);

            ctx.reply('Hello cu!!');
        });

        this.bot.command('confession', auth, TelegramBot.addConfession);

        // this.bot.command('syncBank', (ctx) => {
        //     ctx.reply('Đang thực hiện đồng bộ hóa...');
        //     syncData();
        //     ctx.reply('Đã hoàn tất đồng bộ hóa!');
        // });

        this.bot.on('message', auth, TelegramBot.messageHandler);

        process.once('SIGINT', () => this.bot.stop('SIGINT'));
        process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    }

    async sendMessage(chatId, message) {
        try {
            await this.bot.telegram.sendMessage(chatId, message);
        } catch (e) {
            throw new BAD_REQUEST(e);
        }
    }

    static async addConfession(ctx) {
        const sentMessage = await ctx.reply(
            'Mình luôn sẵn sàng lắng nghe, dù là chuyện vui hay buồn. Mình ở đây nếu bạn cần. Hãy nói điều gì đó nhá 😘',
        );
        ctx.session.logging = true;
        ctx.session.sentMessageId = sentMessage.message_id;

        // Xóa tin nhắn của người dùng
        await ctx.deleteMessage(ctx.message.message_id);

        // Xóa tin nhắn khi không nhập gì trong 5p
        setTimeout(async () => {
            if (ctx.session.logging === true) {
                try {
                    ctx.session.logging = false;
                    await ctx.deleteMessage(sentMessage.message_id);
                } catch (error) {}
            }
        }, 300000);
    }

    static async messageHandler(ctx) {
        const message = ctx.message.text;
        try {
            if (ctx.session.logging) {
                await saveConfession(message);

                ctx.session.logging = false;
                const sentMessage = await ctx.reply(
                    responseConfessionMessage(),
                );

                // Xóa tin nhắn sau 5p
                setTimeout(async () => {
                    try {
                        await ctx.deleteMessage(ctx.message.message_id);
                        await ctx.deleteMessage(sentMessage.message_id);
                        await ctx.deleteMessage(ctx.session.sentMessageId);
                        ctx.session = {};
                    } catch (error) {
                        ctx.reply('Có lỗi rồi bạn ơi 🥹');
                    }
                }, 30000);
            } else {
                const sentMessage = await ctx.reply(
                    'Đang nói gì vậy mình không hiểu 😅',
                );
                setTimeout(async () => {
                    try {
                        await ctx.deleteMessage(ctx.message.message_id);
                        await ctx.deleteMessage(sentMessage.message_id);
                    } catch (error) {}
                }, 5000);
            }
        } catch (e) {
            ctx.reply(e);
        }
    }

    startBot() {
        if (this.bot.launched) return;
        this.bot.launched = true;
        this.bot.launch();
    }
}

module.exports = TelegramBot;
