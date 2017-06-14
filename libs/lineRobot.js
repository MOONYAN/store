var { storeId } = require('../config/storeConfig').store;
var { lineJwt } = require('../config/storeConfig').line;
var { lineIconUrl, lineUserUrl, lineDepositUrl, lineBuyUrl, lineProdutsUrl } = require('../config/storeConfig').url;
var LineBot = require('node-line-messaging-api');
var lineBot = require('../helpers/lineBot');

var async = require('async'),
    axios = require('axios');

var Account = require('../models/accountModel'),
    Transaction = require('../models/transactionModel');

var Messages = LineBot.Messages;

lineBot.on('follow', function (event) {
    var { replyToken } = event;
    var lineMessages = new Messages().addButtons({
        thumbnailImageUrl: lineIconUrl,
        altText: '帳戶設定',
        title: 'Line@iStore',
        text: '歡迎使用Line@iStore口袋商店',
        actions: [{
            "type": "uri",
            "label": "進入iStore",
            "uri": `${lineUserUrl}?lineId=${event.source.userId}`
        }]
    });
    lineBot.replyMessage(replyToken, lineMessages.commit());
});

lineBot.onText(/^儲值(\d+)元$/, function (event, [, amount]) {
    var { replyToken } = event;
    var lineMessages = new Messages();
    axios({
        method: 'put',
        url: lineDepositUrl,
        headers: { Authorization: lineJwt },
        data: { lineId: event.source.userId, amount: amount },
    }).then(function (response) {
        if (response.data.error) {
            lineMessages.addText(response.data.error);
            lineBot.replyMessage(replyToken, lineMessages.commit());
        } else {
            var account = response.data.account;
            lineMessages.addText(`商店:Store${storeId}\n帳戶:${account.name}\n餘額:${account.balance}`);
            lineMessages.addSticker({ packageId: 1, stickerId: 2 });
            lineBot.replyMessage(replyToken, lineMessages.commit());
        }
    }).catch(function (err) {
        lineMessages.addText('儲值錯誤');
        lineBot.replyMessage(replyToken, lineMessages.commit());
    });
});

lineBot.onText(/商品/, function (event, match) {
    var { replyToken } = event;
    var lineMessages = new Messages();
    axios({
        method: 'get',
        url: lineProdutsUrl,
        headers: { Authorization: lineJwt }
    }).then(function (response) {
        if (response.data.error) {
            lineMessages.addText('商品錯誤');
            lineBot.replyMessage(replyToken, lineMessages.commit());
        } else {
            var products = response.data.products;
            if(products.length > 0){
                var columns = products.map(function (product) {
                    return {
                        thumbnailImageUrl: product.imageUrl,
                        title: `特價商品:${product.name}`,
                        text: `價格:${product.price}`,
                        actions: [{
                            "type": "postback",
                            "label": "購買",
                            "data":`{"productId":${product._id}}`
                        }]
                    };
                });
                lineMessages.addSticker({ packageId: 1, stickerId: 402 });
                lineMessages.addCarousel({ altText: 'iStore商品列表', columns: columns });               
            }else{
                lineMessages.addSticker({ packageId: 1, stickerId: 121 });
                lineMessages.addText(`目前無商品`);
            }
            lineBot.replyMessage(replyToken, lineMessages.commit());
        }
    }).catch(function (err) {
        
        lineMessages.addText('商品錯誤');
        lineBot.replyMessage(replyToken, lineMessages.commit());
    });
});

lineBot.on('postback', function (event) {
    var data = JSON.parse(event.postback.data);

    var { replyToken } = event;
    var lineMessages = new Messages();
    axios({
        method: 'put',
        url: lineBuyUrl,
        headers: { Authorization: lineJwt },
        data: { lineId: event.source.userId, productId: data.productId },
    }).then(function (response) {
        if (response.data.error) {
            lineMessages.addText(response.data.error);
            lineBot.replyMessage(replyToken, lineMessages.commit());
        } else {
            var account = response.data.account;
            lineMessages.addText(`商店:Store${storeId}\n帳戶:${account.name}\n餘額:${account.balance}`);
            lineBot.replyMessage(replyToken, lineMessages.commit());
        }
    }).catch(function (err) {
        lineMessages.addText('採購錯誤');
        lineBot.replyMessage(replyToken, lineMessages.commit());
    });
});