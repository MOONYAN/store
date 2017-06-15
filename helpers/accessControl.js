var ConnectRoles = require('connect-roles');

var user = new ConnectRoles({
    failureHandler: (req, res, action) => {
        res.status(403).json({ error: '帳戶未具此權限' });
    }
});

user.use('loginAccount', function (req) {
    if (req.user && (req.user.role === 'member' || req.user.role === 'line')) {
        return true;
    }
});

user.use('roleChange', function (req) {
    if (req.user && (req.user.role === 'manager' || req.user.role === 'customer')) {
        return true;
    }
});

user.use('openAccount', function (req) {
    if (req.user && req.user.role === 'member' || req.user.role === 'line') {
        return true;
    }
});

user.use('closeAccount', function (req) {
    if (req.user && req.user.role === 'customer') {
        return true;
    }
});

user.use('buy', function (req) {
    if (req.user && req.user.role === 'customer' || req.user.role === 'line') {
        return true;
    }
});

user.use('deposit', function (req) {
    if (req.user && req.user.role === 'customer' || req.user.role === 'line') {
        return true;
    }
});

user.use('transactions', function (req) {
    if (req.user && (req.user.role === 'manager' || req.user.role === 'customer')) {
        return true;
    }
});

user.use('accounts', function (req) {
    if (req.user && req.user.role === 'manager') {
        return true;
    }
});

user.use('sendMessage', function (req) {
    if (req.user && req.user.role === 'manager') {
        return true;
    }
});

user.use('messages', function (req) {
    if (req.user && (req.user.role === 'manager' || req.user.role === 'customer')) {
        return true;
    }
});

user.use('product', function (req) {
    if (req.user && (req.user.role === 'manager')) {
        return true;
    }
});

user.use('products', function (req) {
    if (req.user && (req.user.role === 'manager' || req.user.role === 'customer' || req.user.role === 'line')) {
        return true;
    }
});

user.use('linePushProducts', function (req) {
    if (req.user && req.user.role === 'manager') {
        return true;
    }
});

user.use('linePushLocation', function (req) {
    if (req.user && req.user.role === 'manager') {
        return true;
    }
});

module.exports = user;