var express = require('express');
var app = express();
app.use(require('compression')());
require('dotenv').load();
var re = 0,
    users,
    social,
    index,
    fresh = 0,
    connection,
    path = require('path'),
    passport = require('passport'),
    bodyParser = require('body-parser'),
    mongo = require('mongodb').MongoClient.connect;

app.use(function(req, res, next){
    if(!connection)
    {
        connection = mongo(process.env.MONGO || 'mongodb://localhost/project');
        console.log('f',++fresh);
    }
    else
    {
        console.log('r',++re);
    }
    connection.then(function (db) {
            req.db = db;
            next();
        })
        .catch(function (err) {
            connection = undefined;
            next(err);
        });
});

users = require(path.join(__dirname, 'routes', 'users'));
social = require(path.join(__dirname, 'routes', 'social'));
index = require(path.join(__dirname, 'routes', 'index'));

// view engine setup
app.set('view engine', 'ejs');
app.set('case sensitive routing', true);
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.use(require('morgan')('dev'));
app.use(bodyParser.json());
app.use(require('cookie-parser')("secret"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('serve-favicon')(__dirname + '/public/images/main.jpg'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('express-session')({ secret : 'session secret key', resave : '', saveUninitialized : ''}));
app.use(passport.initialize());
app.use(passport.session());
app.use(require('csurf')());
app.use('/', index);
app.use('/', social);
app.use('/', users);
app.enable('trust proxy');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    res.render('error');
    next(err);
});
// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development')
{
    app.use(function(err, req, res) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;