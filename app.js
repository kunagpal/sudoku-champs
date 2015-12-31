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

var index,
    users,
    social,
    status,
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
    cookie = require('cookie-parser')(process.env.COOKIE_SECET || "secret"),
    stat = express.static(path.join(__dirname, 'public'), {maxAge:86400000*30}),
    session = require('express-session')({secret: 'session secret key', resave: '', saveUninitialized: ''});

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
index = require(path.join(__dirname, 'routes', 'index'));
social = require(path.join(__dirname, 'routes', 'social'));

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
app.use(compress);
// view engine setup
app.set('view engine', 'hbs');
app.set('case sensitive routing', true);
app.set('port', 3000);
app.set('views', path.join(__dirname, 'views'));
app.use(helmet);
app.use(morgan);
app.use(body);
app.use(cookie);
app.use(url);
app.use(stat);
app.use(session);
app.use(function(req, res, next){
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
});
app.use(passport);
app.use(csrf);
app.use('/', index);
app.use('/', social);
app.use('/', users);
app.enable('trust proxy');

// catch 404 and forward to error handler
app.use(function(req, res){
    res.redirect('/');
});

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