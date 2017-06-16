var lineSecret = require('../config/storeConfig').line.channelSecret,
    lineToken = require('../config/storeConfig').line.channelAccessToken,
    botPort = require('../config/storeConfig').line.botPort,
    { storeId } = require('../config/storeConfig').store;

var LineBot = require('node-line-messaging-api');

var lineBot = new LineBot({
    secret: lineSecret,
    token: lineToken,
    options: {
        port: botPort,
        tunnel: false,
        verifySignature: true,
        endpoint: `/apps${storeId}/line/webhook`
    }
})

module.exports = lineBot;