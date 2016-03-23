/*
*  Sudoku Champs <sudokuchampster@gmail.com>
*
*  This program is free software: you can redistribute it and/or modify
*  it under the terms of the GNU General Public License as published by
*  the Free Software Foundation, either version 3 of the License, or
*  (at your option) any later version.
*
*  This program is distributed in the hope that it will be useful,
*  but WITHOUT ANY WARRANTY; without even the implied warranty of
*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*  GNU General Public License for more details.
*
*  You should have received a copy of the GNU General Public License
*  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

if(!process.env.NODE_ENV)
{
    require('dotenv').load();
}

var status,
    path = require('path'),
    async = require('async'),
    csrf = require('csurf')(),
    express = require('express'),
    app = express(),
    helmet = require('helmet')(),
    parser = require('body-parser'),
    body = parser.json(),
    morgan = require('morgan')('dev'),
    compress = require('compression')(),
    url = parser.urlencoded({extended:true}),
    passport = require('passport').initialize(),
    raven = require('raven').middleware.express,
    error = raven.errorHandler(process.env.SENTRY),
    request = raven.requestHandler(process.env.SENTRY),
    api = require(path.join(__dirname, 'routes', 'api')),
    index = require(path.join(__dirname, 'routes', 'index')),
    users = require(path.join(__dirname, 'routes', 'users')),
    social = require(path.join(__dirname, 'routes', 'social')),
    cookie = require('cookie-parser')(process.env.COOKIE_SECET || "secret"),
    stat = express.static(path.join(__dirname, 'public'), {maxAge:86400000 * 30}),
    session = require('express-session')({secret: 'session secret key', resave: '', saveUninitialized: ''}),
    flash = function(req, res, next)
    {
        if(!req.session.flash)
        {
            req.session.flash = [];
        }

        req.flash = function(content)
        {
            if(content)
            {
                this.session.flash.push(content);
            }
            else
            {
                return this.session.flash.pop();
            }
        };

        next();
    };

app.use(function(req, res, next)
    {
        async.each([compress, helmet, request, morgan, body, url, stat, session], function(middleware, callback){
            middleware(req, res, callback);
        }, next);
    }
);
//app.use(compress);
// view engine setup
app.set('view engine', 'ejs');
app.set('case sensitive routing', true);
app.set('port', 3000);
app.set('views', path.join(__dirname, 'views'));
app.use(function(req, res, next)
    {
        async.each([cookie, flash, passport, csrf], function(middleware, callback){
            middleware(req, res, callback);
        }, next);
    }
);
app.use('/', index);
app.use('/', social);
app.use('/', users);
app.use('/', api);
app.enable('trust proxy');

// catch 404 and redirect to index
app.use(function(req, res){
    res.redirect('/' + req.signedCookies.user ? 'home' : '');
});

if(process.env.NODE_ENV)
{
    app.use(error);
}

// error handler, do not remove the parameter 'next' from the method signature
app.use(function(err, req, res, next){
    status = err.status || 500;
    res.status(status);
    if(err.code === 'EBADCSRFTOKEN')
    {
        req.flash('That form submission had expired, please retry.');
        res.redirect(req.headers.referer);
    }
    else
    {
        res.render('error', {
            status: status,
            message: err.message,
            session: process.env.NODE_ENV,
            stack: process.env.NODE_ENV ? '' : err.stack
        });
    }
});

module.exports = app;
