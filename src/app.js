const express = require('express');
require('dotenv').config();
const TelegramBot = require('./services/telegram.service');
const DiscordBot = require('./services/discord.service');
const app = express();

// Init middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Init database
// require("./dbs/init.mongodb");

// Init bots
const telegramBot = new TelegramBot();
const discordBot = new DiscordBot();
discordBot.startBot();
telegramBot.startBot();

// Init routes
app.get('', async (req, res) => {
    res.send('ok');
});

app.post('/webhook', async (req, res) => {
    try {
        const { type, message } = req.body;

        for (const item of type) {
            if (item === 'telegram') {
                await telegramBot.sendMessage(
                    process.env.USER_ID_TELE,
                    message,
                );
            }
            if (item === 'discord') {
                await discordBot.sendMessageToChannel(
                    process.env.CHANNEL_DISCORD_ID,
                    message,
                );
            }
        }
        res.send('webhook here!!!');
    } catch (error) {
        console.error('Error when sending webhook:', error.message);
        res.status(500).send('Error when sending webhook');
    }
});

app.get('/discord/register-commands', async (req, res) => {
    await DiscordBot.registerCommands(req.body);
    res.send('Register commands successfully');
});

// Hanling Error
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

module.exports = app;
