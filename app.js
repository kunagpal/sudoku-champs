var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require(path.join(__dirname, 'routes', 'index'));
var users = require(path.join(__dirname, 'routes', 'users'));
var social = require(path.join(__dirname, 'routes', 'social'));
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 3000);
app.set('case sensitive routing', true);
app.use(favicon(__dirname + '/public/images/main.jpg'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser("secret"));
app.use(session({ secret : 'session secret key', resave : '', saveUninitialized : ''}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);
app.use('/', users);
app.use('/', social);
app.enable('trust proxy');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
