const lineBot = require('@line/bot-sdk');
const config =require('../config/storeConfig').line;

module.exports = {
    middleware: lineBot.middleware(config),
    client: new lineBot.Client(config),
    Messages: lineBot.messages
};