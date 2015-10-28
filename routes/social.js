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

var path = require('path'),
    passport = require('passport'),
    router = require('express').Router();

require(path.join(__dirname, '..', 'database', 'auth'));

router.get('/fb', passport.authenticate('facebook', {scope : 'email'}));

router.get('/FB', passport.authenticate('facebook', {
        successRedirect : '/play',
        failureRedirect : '/login'
    }),
    function(req, res){
        if (req.signedCookies.name)
        {
            res.clearCookie('name', {});
        }
        res.cookie('name', doc._id, {maxAge: 86400000, signed: true});
        res.redirect('/play');
    }
);

router.get('/go', passport.authenticate('google', {scope : 'https://www.googleapis.com/auth/plus.login'}));

router.get('/GO', passport.authenticate('google', {
        successRedirect : '/play',
        failureRedirect : '/login'
    }),
    function(req, res){
        if (req.signedCookies.name)
        {
            res.clearCookie('name', {});
        }
        res.cookie('name', doc._id, {maxAge: 86400000, signed: true});
        res.redirect('/play');
    }
);

router.get('/tw', passport.authenticate('twitter'));

router.get('/TW', passport.authenticate('twitter', {
        successRedirect : '/play',
        failureRedirect : '/login'
    }),
    function(req, res){
        if (req.signedCookies.name)
        {
            res.clearCookie('name', {});
        }
        res.cookie('name', doc._id, {maxAge: 86400000, signed: true});
        res.redirect('/play');
    }
);

module.exports = router;