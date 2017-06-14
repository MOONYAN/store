var { storeSecret } = require('../config/storeConfig').store,
    express = require('express'),
    router = express.Router(),
    async = require('async'),
    axios = require('axios'),
    Account = require('../models/accountModel'),
    Product = require('../models/productModel');

var jwt = require('jsonwebtoken'),
    user = require('../helpers/accessControl');

var LineBot = require('node-line-messaging-api');
var lineBot = require('../helpers/lineBot');

var Messages = LineBot.Messages;

router.post('/product', user.can('linePushProducts'), function (req, res) {
    async.waterfall([function (next) {
        Account.find({}).select('lineId').exec(function (err, accounts) {
            if (err)
                return res.json({ error: '帳號錯誤' });
            else {
                var lineIds = [];
                accounts.filter(function (account) {
                    if (account.lineId !== undefined && account.lineId !== null) {
                        lineIds.push(account.lineId);
                    }
                });
                next(null, lineIds);
            }
        });
    }, function (lineIds, next) {
        Product.find({ _id: { $in: req.body.productIds } }).exec(function (err, products) {
            if (err)
                res.json({ error: '產品錯誤' });
            else {
                var columns = [];
                products.filter(function (product) {
                    columns.push({
                        thumbnailImageUrl: product.imageUrl,
                        title: `特價商品:${product.name}`,
                        text: `價格:${product.price}`,
                        actions: [{
                            "type": "postback",
                            "label": "購買",
                            "data": `{"productId":${product._id}}`
                        }]
                    });
                });
                var pushMessages = new Messages().addCarousel({
                    altText: '購物列表',
                    columns: columns
                });
                next(null, lineIds, pushMessages);
            }
        })
    }, function (lineIds, pushMessages) {
        lineBot.multicast(lineIds, pushMessages.commit())
            .then(function () {
                return res.json({});
            }).catch(function (err) {
                console.log(err);
                res.json({ error: '推播錯誤' });
            });
    }]);
});

router.post('/location', user.can('linePushLocation'), function (req, res) {
    async.waterfall([function (next) {
        Account.find({}).select('lineId').exec(function (err, accounts) {
            if (err)
                return res.json({ error: '帳號錯誤' });
            else {
                var lineIds = [];
                accounts.filter(function (account) {
                    if (account.lineId !== undefined && account.lineId !== null) {
                        lineIds.push(account.lineId);
                    }
                });
                next(null, lineIds);
            }
        });
    }, function (lineIds) {
        axios.get(`http://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(req.body.address)}`)
            .then(function (response) {
                var pushMessages = new Messages().addLocation({
                    title: '特賣會商品',
                    address: req.body.address,
                    latitude: response.data.results[0].geometry.location.lat,
                    longitude: response.data.results[0].geometry.location.lng
                })
                lineBot.multicast(lineIds, pushMessages.commit())
                    .then(function () {
                        return res.json({});
                    }).catch(function () {
                        res.json({ error: '推播錯誤' });
                    });
            }).catch(function (err) {
                res.json({ error: '轉址錯誤' });
            });
    }]);
});

module.exports = router;
