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

var opt =
    {
        $set: {},
        $inc:
        {
            xp: 1,
            form: 1,
            streak: 1,
            played: 1,
            challenge: 1
        }
    },
    path = require('path'),
    router = require('express').Router(),
    onGame = function(req, res, next)
    {
        opt.$set.prevType = req.url.slice(1);
        opt.$inc.win = parseInt(req.body.win, 10);
        opt.$inc.loss = parseInt(req.body.loss, 10);
        opt.$inc.time = parseInt(req.body.time, 10);
        opt.$set.prevTime = parseInt(req.body.time, 10);

        db.updateOne({name: req.signedCookies.user}, opt, function(err){
            if(err)
            {
                console.error(err.message);
                return next(err);
            }

            res.redirect(req.headers.referer);
        });
    },
    quote = require(path.join(__dirname, '..', 'database', 'quote')),
    check = function(req, res, next)
    {
        if(req.signedCookies.user)
        {
            return next();
        }

        res.redirect('/');
    };

// GET home page
router.get('/home', check, function(req, res){
    res.render('home');
});

router.get('/logout', check, function(req, res){
    res.clearCookie('user', {});
    res.redirect('/');
});

// GET forgot password page
router.get('/forgot', function(req, res){
    res.render('forgot', {token: req.csrfToken(), msg: res.flash()});
});

// GET guest page
router.get('/guest', function(req, res){
    if (req.signedCookies.user)
    {
        return res.redirect('/play');
    }

    res.render('game', {token: req.csrfToken(), mode: 'guest'});
});

// GET practice page
router.get(/^\/practice|h2h|challenge|solo$/, check, function(req, res){
    res.render('game', {token: req.csrfToken(), mode: req.url});
});

router.post(/^\/h2h|practice|solo|challenge$/, onGame);

module.exports = router;