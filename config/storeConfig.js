var storeId = '24';
var domain = 'https://ostore.herokuapp.com';

//var domain = 'http://127.0.0.1:3000';

module.exports = {
    istore: {
        fcmServerKey: 'AIzaSyCa_MXHiw6SS9aqYYJ_VXmTm-_xNRFdl9g',
        istoreJwt: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE0OTUyNjMyMjcsImV4cCI6MTUyNjc5OTIyN30.IoFk47eFUTp6lfY_iO6slaubWz02LnL3_oqezZ5tOjo',
        istoreSecret: 'apps2017'
    },

    store: {
        storeId: storeId,
        storeName: `Store ${storeId}`,
        storeDB: process.env.MONGODB_URI,
        storeSecret: `store${storeId}`,
        storePath: `/apps${storeId}/store`,
        storeTopic: `/topics/store${storeId}`
    },

    line: {
        channelSecret: process.env.ChannelSecret,
        channelAccessToken: process.env.ChannelAccessToken,
        lineJwt: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoibGluZSIsImlhdCI6MTQ5NTE4MDE3OSwiZXhwIjoxNTAwMzY0MTc5fQ.D8njA7lMUnZ_Nj5tOEoK3JkwZWFu-IihanJxiYU1Yp4'
    },

    url: {
        lineIconUrl: `${domain}/apps${storeId}/store/public/picture/2017Apps_icon.png`,
        lineUserUrl: `${domain}/apps${storeId}/store/public/www/index.html#/user`,
        lineDepositUrl: `${domain}/apps${storeId}/store/account/deposit`,
        lineBuyUrl: `${domain}/apps${storeId}/store/account/buy`,
        lineProdutsUrl: `${domain}/apps${storeId}/store/product`
    }
};