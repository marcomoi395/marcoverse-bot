'use strict';

const { Telegraf } = require('telegraf');
const { UNAUTHORIZED, BAD_REQUEST } = require('../core/responseHandler');

class TelegramBot {
    constructor() {
        this.bot = new Telegraf(process.env.BOT_TELE_TOKEN);

        this.bot.command('start', (ctx) => {
            ctx.reply('Hello cu!!');
        });

        process.once('SIGINT', () => this.bot.stop('SIGINT'));
        process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    }

    async sendMessage(chatId, message) {
        if (!process.env.BOT_TELE_TOKEN)
            throw new UNAUTHORIZED('Missing Bot Token');

        try {
            await this.bot.telegram.sendMessage(chatId, message);
        } catch (e) {
            throw new BAD_REQUEST(e);
        }
    }

    async startBot() {
        await this.bot.launch();
    }
}

module.exports = TelegramBot;
