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

var express = require('express');
var app = express();
app.use(require('compression')());
if(!process.env.NODE_ENV)
{
    require('dotenv').load();
}
var index,
    users,
    social,
    status,
    path = require('path'),
    passport = require('passport'),
    bodyParser = require('body-parser');

check = function(req, res, next)
{
    if(req.signedCookies.user || !process.env.NODE_ENV)
    {
        next();
    }
    else
    {
        res.redirect('/login');
    }
};

users = require(path.join(__dirname, 'routes', 'users'));
social = require(path.join(__dirname, 'routes', 'social'));
index = require(path.join(__dirname, 'routes', 'index'));

head = "<nav>"+
            "<ul>"+
                "<li><a href='/'>HOME</a></li>"+
                "<li><a href='/play'>PLAY</a></li>"+
                "<li><a href='/rules'>RULES</a></li>"+
                "<li><a href='/leader'>LEADERBOARD</a></li>"+
            "</ul>"+
        "</nav>";
foot = "<footer>"+
            "<nav>"+
                "<ul>"+
                    "<li><a href='/logout'>I wish to leave</a></li>"+
                    "<li><a href='/privacy'>Privacy</a></li>"+
                    "<li><a href='/forum'>Forum</a></li>"+
                "</ul>"+
            "</nav>"+
        "</footer>";

// view engine setup
app.set('view engine', 'hbs');
app.set('case sensitive routing', true);
app.set('port', 3000);
app.set('views', path.join(__dirname, 'views'));
app.use(require('morgan')('dev'));
app.use(bodyParser.json());
app.use(require('cookie-parser')("secret"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('express-session')({ secret : 'session secret key', resave : '', saveUninitialized : ''}));
app.use(require('flash')());
app.use(passport.initialize());
app.use(require('csurf')());
app.use('/', index);
app.use('/', social);
app.use('/', users);
app.enable('trust proxy');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    status = err.status || 500;
    res.status(status);
    if(err.code === 'EBADCSRFTOKEN')
    {
        req.flash('err', 'That form submission had expired, please retry.');
        res.redirect(req.headers.referer);
    }
    else
    {
        res.render('error', {
            head: head,
            foot: foot,
            status: status,
            message: err.message,
            session: process.env.NODE_ENV,
            stack: process.env.NODE_ENV ? '' : err.stack
        });
    }
});

module.exports = app;