var { storeSecret } = require('../config/storeConfig').store,
    express = require('express'),
    router = express.Router(),
    async = require('async'),
    Account = require('../models/accountModel'),
    Product = require('../models/productModel');

var user = require('../helpers/accessControl');

router.post('/', user.can('product'), function (req, res) {
    Product.create({ name: req.body.name, price: req.body.price, imageUrl: req.body.url }, function (err, product) {
        if (err)
            return res.json({ error: '上架錯誤' });
        else
            return res.json({});
    });
});

router.get('/', user.can('products'), function (req, res) {
    Product.find({}, function (err, products) {
        if (err)
            return res.json({ error: '商品列表錯誤' });
        else
            return res.json({ products: products });
    });
});

module.exports = router;
