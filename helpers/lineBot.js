var lineSecret = require('../config/storeConfig').line.channelSecret,
    lineToken = require('../config/storeConfig').line.channelAccessToken,
    { storeId } = require('../config/storeConfig').store;

var LineBot = require('node-line-messaging-api');

var lineBot = new LineBot({
    secret: lineSecret,
    token: lineToken,
    options: {
        port: `31${storeId}`,
        tunnel: false,
        verifySignature: true,
        endpoint: `/apps${storeId}/line/webhook`
    }
})

module.exports = lineBot;