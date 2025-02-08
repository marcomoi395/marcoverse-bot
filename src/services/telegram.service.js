'use strict';

const { Telegraf } = require('telegraf');
const { UNAUTHORIZED, BAD_REQUEST } = require('../core/responseHandler');

class TelegramBot {
    constructor() {
        if (!process.env.BOT_TELE_TOKEN)
            throw new UNAUTHORIZED('Missing Bot Token');

        this.bot = new Telegraf(process.env.BOT_TELE_TOKEN);

        this.bot.command('start', (ctx) => {
            console.log(ctx.message);

            ctx.reply('Hello cu!!');
        });

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

    startBot() {
        if (this.bot.launched) return;
        this.bot.launched = true;
        this.bot.launch();
    }
}

module.exports = TelegramBot;
