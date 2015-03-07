var path = require('path'),
    csurf = require('csurf'),
    logger = require('morgan'),
    express = require('express'),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser'),
    ua = require('universal-analytics'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    users = require(path.join(__dirname, 'routes', 'users')),
    routes = require(path.join(__dirname, 'routes', 'index')),
    social = require(path.join(__dirname, 'routes', 'social')),
    app = express();

try{
    var key = require(path.join(__dirname, 'key')).ua_id;
}
catch(err){
    console.log(err.message);
    key = 0;
}
// view engine setup
app.set('view engine', 'ejs');
app.set('case sensitive routing', true);
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cookieParser("secret"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(favicon(__dirname + '/public/images/main.jpg'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret : 'session secret key', resave : '', saveUninitialized : ''}));
app.use(csurf());
app.use(ua.middleware(process.env.UA_ID || key.ua_id, {cookieName: '_ga'}));
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
