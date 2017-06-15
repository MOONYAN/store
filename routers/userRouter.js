var { storeId, storeSecret } = require('../config/storeConfig').store,
    express = require('express'),
    router = express.Router(),
    async = require('async'),
    User = require('../models/userModel'),
    Account = require('../models/accountModel');

var passport = require('passport'),
    jwt = require('jsonwebtoken'),
    user = require('../helpers/accessControl');

router.post('/', function (req, res) {
    console.log('on register');
    var user = new User({
        username: req.body.username,
        deviceToken: req.body.deviceToken
    });
    User.register(user, req.body.password, function (err) {
        if (err)
            return res.json({ error: '帳號已存在' });
        else {
            var roleToken = jwt.sign({ role: 'member' }, storeSecret, { expiresIn: '30m' });
            res.header('Authorization', `Bearer ${roleToken}`);
            return res.json({ loginUser: user });
        }
    });
});

router.post('/login', function (req, res) {
    passport.authenticate('local', { session: false }, function (err, user, errInfo) {
        if (err)
            return res.json({ error: '登入錯誤' });
        else if (errInfo) {
            if (errInfo.name === 'IncorrectPasswordError')
                return res.json({ error: '密碼錯誤' });
            else if (errInfo.name === 'IncorrectUsernameError')
                return res.json({ error: '帳號不存在' });
        } else {
            user.update({ $set: { deviceToken: req.body.deviceToken ? req.body.deviceToken : user.deviceToken } }, function (err) {
                if (err)
                    return res.json({ error: '裝置註冊錯誤' });
                else {
                    var roleToken = jwt.sign({ role: 'member' }, storeSecret, { expiresIn: '30m' });
                    res.header('Authorization', `Bearer ${roleToken}`);
                    return res.json({ loginUser: user });
                }
            });
        }
    })(req, res);
});

//console.log(jwt.sign({ role: 'line' }, storeSecret, { expiresIn: '60D' }));

module.exports = router;
