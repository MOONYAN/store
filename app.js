var { storeDB, storeSecret, storePath } = require('./config/storeConfig').store,
    express = require('express'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    cors = require('cors');

var mongoose = require('mongoose'),
    connection = mongoose.connect(storeDB),
    autoIncrement = require('mongoose-auto-increment');

mongoose.Promise = global.Promise;
autoIncrement.initialize(connection);

var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    User = require('./models/userModel'),
    expressJwt = require('express-jwt'),
    user = require('./helpers/accessControl');

var userRouter = require('./routers/userRouter'),
    accountRouter = require('./routers/accountRouter'),
    productRouter = require('./routers/productRouter'),
    linePushRouter = require('./routers/lineRouter');

require('./libs/lineRobot');
var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ exposedHeaders: 'Authorization' }));

app.use(passport.initialize());
passport.use(new LocalStrategy(User.authenticate()));
app.use(user.middleware());
app.use(`${storePath}/public`, express.static('public'));

app.all('*', expressJwt({ secret: storeSecret })
    .unless({
        path: [
            { url: `${storePath}/user/login` },
            { url: `${storePath}/user`, methods: ['POST'] },
            { url: `${storePath}/line/webhook`, methods: ['POST'] }]
    }), function (req, res, next) {
        next();
    });

app.use(`${storePath}/user`, userRouter);
app.use(`${storePath}/account`, accountRouter);
app.use(`${storePath}/product`, productRouter);
app.use(`${storePath}/line`, linePushRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ error: 'Service Not Found' });
});

module.exports = app;
