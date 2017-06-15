var { storeId, storeSecret, storeTopic } = require('../config/storeConfig').store,
    { fcmServerKey } = require('../config/storeConfig').istore,
    express = require('express'),
    router = express.Router(),
    async = require('async'),
    User = require('../models/userModel'),
    Account = require('../models/accountModel'),
    Message = require('../models/messageModel'),
    Transaction = require('../models/transactionModel'),
    Product = require('../models/productModel');

var jwt = require('jsonwebtoken'),
    user = require('../helpers/accessControl');

var FCM = require('fcm-push'),
    fcm = new FCM(fcmServerKey);

router.post('/login', user.can('loginAccount'), function (req, res) {
    async.waterfall([function (next) {
        Account.findById(req.body.accountId, function (err, account) {
            if (err)
                return res.json({ error: '帳戶不存在' });
            else
                next(null, account);
        });
    }, function (account, next) {
        account.lineId = req.body.lineId || account.lineId;
        account.save(function (err) {
            if (err) {
                return res.json({ error: 'line註冊錯誤' });
            }
            else {
                next(null, account);
            }
        });
    }, function (account, next) {
        Account.update({ lineId: account.lineId, _id: { $ne: account._id } }, { $set: { lineId: null } }, function (err) {
            if (err) {
                return res.json({ error: 'lineId轉移錯誤' });
            } else {
                var roleToken = jwt.sign({ role: account.role || 'customer' }, storeSecret, { expiresIn: '30m' });
                res.header('Authorization', `Bearer ${roleToken}`);
                return res.json({ account: account });
            }
        });
    }]);
});

router.post('/', user.can('openAccount'), function (req, res) {
    async.waterfall([function (next) {
        Account.create({
            name: req.body.username.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase()),
            balance: 0,
            role: req.user.role,
            user: req.body.userId,
            lineId: req.body.lineId || null
        }, function (err, account) {
            if (err)
                return res.json({ error: '帳戶已存在' });
            else
                next(null, account);
        });
    }, function (account, next) {
        Account.update({ lineId: account.lineId, _id: { $ne: account._id } }, { $set: { lineId: null } }, function (err) {
            if (err) {
                return res.json({ error: 'lineId轉移錯誤' });
            } else {
                next(null, account);
            }
        });
    }, function (account) {
        User.findByIdAndUpdate(req.body.userId, { $addToSet: { accounts: { storeId: storeId, accountId: account._id } } }, function (err, user) {
            if (err)
                return res.json({ error: '帳號設定錯誤' });
            else {
                var roleToken = jwt.sign({ role: account.role }, storeSecret, { expiresIn: '30m' });
                res.header('Authorization', `Bearer ${roleToken}`);
                res.json({ account: account });
            }
        });
    }]);
});

router.put('/role', user.can('roleChange'), function (req, res) {
    Account.findByIdAndUpdate(req.body.accountId, { $set: { role: req.body.role } }, { new: true }, function (err, account) {
        if (err)
            res.json({ error: "更改權限錯誤" });
        else {
            var roleToken = jwt.sign({ role: account.role }, storeSecret, { expiresIn: '30m' });
            res.header('Authorization', `Bearer ${roleToken}`);
            res.json({ account: account });
        }
    });
});

router.put('/deposit', user.can('deposit'), function (req, res) {
    async.waterfall([function (next) {
        var condition = req.body.accountId ? { _id: req.body.accountId } : { lineId: req.body.lineId };
        Account.findOne(condition, function (err, account) {
            if (err)
                return res.json({ error: '帳號錯誤' });
            else
                next(null, account);
        });
    }, function (account, next) {
        account.balance += parseInt(req.body.amount);
        Transaction.create({
            account: req.body.accountId,
            amount: req.body.amount,
            balance: account.balance,
            type: 1
        }, function (err, transaction) {
            if (err)
                return res.json({ error: '交易紀錄錯誤' });
            else
                next(null, account, transaction._id);
        });
    }, function (account, transactionId) {
        Account.findByIdAndUpdate(account._id, { "$addToSet": { "transactions": transactionId }, "$set": { "balance": account.balance } }, { new: true }, function (err, account) {
            if (err) {
                return res.json({ error: '交易錯誤' });
            } else {
                return res.json({ account: account });
            }
        });
    }]);
});

router.put('/buy', user.can('buy'), function (req, res) {
    async.waterfall([function (next) {
        var condition = req.body.accountId ? { _id: req.body.accountId } : { lineId: req.body.lineId };
        Account.findOne(condition, function (err, account) {
            if (err)
                return res.json({ error: '帳戶錯誤' });
            else
                next(null, account);
        });
    }, function (account, next) {
        Product.findById(req.body.productId, function (err, product) {
            if (err)
                return res.json({ error: '商品錯誤' });
            else if (account.balance < product.price)
                return res.json({ error: `餘額不足，僅餘${account.balance}元` });
            else
                next(null, account, product);
        });
    }, function (account, product, next) {
        account.balance -= product.price;
        Transaction.create({
            amount: product.price,
            balance: account.balance,
            product: product._id,
            type: 0
        }, function (err, transaction) {
            if (err)
                return res.json({ error: '交易紀錄錯誤' });
            else
                next(null, account, transaction._id);
        });
    }, function (account, transactionId) {
        Account.findByIdAndUpdate(account._id, { "$addToSet": { "transactions": transactionId }, "$set": { "balance": account.balance } }, { new: true }, function (err, account) {
            if (err) {
                return res.json({ error: '交易錯誤' });
            } else {
                return res.json({ account: account });
            }
        });
    }]);
});

router.delete('/:accountId', user.can('closeAccount'), function (req, res) {
    async.waterfall([function (next) {
        Transaction.remove({ account: req.params.accountId }, function (err, transaction) {
            if (err)
                return res.json({ error: '刪除交易明細錯誤' });
            else {
                next();
            }
        });
    }, function (next) {
        Account.findByIdAndRemove(req.params.accountId, function (err, account) {
            if (err || account === null)
                return res.json({ error: '關閉帳戶錯誤' });
            else
                next(null, account.user);
        });
    }, function (userId) {
        User.findByIdAndUpdate(userId, { $pull: { account: { storeId: req.params.storeId } } }, { new: true }, function (err, user) {
            if (err || user === null)
                return res.json({ error: '關閉帳號錯誤' });
            else {
                var roleToken = jwt.sign({ role: 'member' }, storeSecret, { expiresIn: '30m' });
                res.header('Authorization', `Bearer ${roleToken}`);
                return res.json({});
            }
        });
    }]);
});

router.get('/', user.can('accounts'), function (req, res) {
    Account.find({}, function (err, accounts) {
        if (err)
            return res.json({ error: '帳戶列表錯誤' });
        else {
            return res.json({ accounts: accounts });
        }
    })
});

router.get('/transaction/:accountId', user.can('transactions'), function (req, res) {
    Account.findOne({ _id: req.params.accountId })
        .populate({ path: 'transactions', populate: { path: 'product' } })
        .exec(function (err, account) {
            if (err)
                res.json({ error: '交易明細錯誤' });
            else {
                res.json({ transactions: account.transactions });
            }
        });
});

router.get('/message/:accountId', user.can('messages'), function (req, res) {
    Account.findOne({ _id: req.params.accountId })
        .populate('messages')
        .exec(function (err, account) {
            if (err)
                res.json({ error: '訊息明細錯誤' });
            else {
                res.json({ messages: account.messages });
            }
        });
});

router.post('/message', user.can('sendMessage'), function (req, res) {
    async.waterfall([function (next) {
        if (req.body.accountIds) {
            var deviceTokens = [];
            User.find({ 'accounts': { $elemMatch: { storeId: storeId, accountId: { $in: req.body.accountIds } } } }, function (err, users) {
                users.filter(function (user) {
                    if (user.deviceToken !== undefined)
                        deviceTokens.push(user.deviceToken);
                });
                next(null, deviceTokens);
            });
        } else
            next(null, null);
    }, function (deviceTokens, next) {
        var fcmMessage = {
            notification: {
                title: req.body.title,
                body: req.body.content,
                sound: "default",
                click_action: "FCM_PLUGIN_ACTIVITY",
                icon: "fcm_push_icon"
            },
            data: {
                title: req.body.title,
                body: req.body.content,
            },
            priority: "high"
        };

        if (req.body.accountIds)
            fcmMessage['registration_ids'] = deviceTokens;
        else
            fcmMessage['to'] = storeTopic;

        fcm.send(fcmMessage, function (err, response) {
            if (err)
                return res.json({ error: '訊息發送錯誤' });
            else
                next(null);
        });
    }, function (next) {
        Message.create({ title: req.body.title, content: req.body.content }, function (err, message) {
            if (err)
                return res.json({ error: '訊息儲存錯誤' });
            else
                next(null, message);
        });
    }, function (message) {
        var condition;

        if (req.body.accountIds)
            condition = { _id: { $in: req.body.accountIds } };
        else
            condition = {};

        Account.update(condition, { "$addToSet": { "messages": message._id } }, { multi: true }, function (err, accounts) {
            if (err)
                return res.json({ error: '訊息儲存錯誤' });
            else {
                return res.json({});
            }
        });
    }]);
});

module.exports = router;
