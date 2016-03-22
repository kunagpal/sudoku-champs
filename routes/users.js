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
        $set : {},
        $inc :
        {
            xp : 1,
            form : 1,
            streak : 1,
            played : 1,
            challenge : 1
        }
    },
    temp = [],
    path = require('path'),
    router = require('express').Router(),
    onGame = function(req, res, next)
    {
        opt.$inc.win = parseInt(req.body.win, 10);
        opt.$inc.loss = parseInt(req.body.loss, 10);
        opt.$inc.time = parseInt(req.body.time, 10);
        opt.$set.prevTime = parseInt(req.body.time, 10);
        opt.$set.prevType = req.headers.referer.split('/')[3];
        opt.$set.best = Math.min(req.signedCookies.best, parseInt(req.body.time, 10));
        opt.$set.worst = Math.max(req.signedCookies.worst, parseInt(req.body.time, 10));

        db.updateOne({_id : req.signedCookies.user}, opt, function(err){
            if(err)
            {
                console.error(err.message);
                return next(err);
            }

            res.cookie('best', opt.$set.best, {maxAge : 86400000, signed : true});
            res.cookie('worst', opt.$set.worst, {maxAge : 86400000, signed : true});
            res.redirect(req.headers.referer);
        });
    },
    quote = require(path.join(__dirname, '..', 'database', 'quote')),
    rand = function(arg)
    {
        return arg[parseInt(Math.random() * 10000000000000000, 10) % arg.length];
    },
    op = {dob : 0, hash : 0, email : 0, token : 0, expires : 0, form : 0, num : 0},
    check = function(req, res, next)
    {
        if(req.signedCookies.user || req.signedCookies.admin || !process.env.NODE_ENV)
        {
            return next();
        }

        res.redirect('/login');
    };

// GET logout page
router.get('/logout', check, function(req, res){
    res.render('logout', {main: rand(quote.title), quit: rand(quote.away), stay: rand(quote.stay), token: req.csrfToken()});
});

// POST logout page
router.post('/logout', function(req, res){
    db.updateOne({_id: req.signedCookies.name}, {$inc: {visit: 1}}, function(err) {
        if(err)
        {
            console.error(err.message);
            req.flash('An unexpected error has occurred. Please retry.');
            return res.redirect('/');
        }

        res.redirect('/login');
    });

    res.clearCookie('user', {});
    res.clearCookie('best', {});
    res.clearCookie('worst', {});
});

//GET rules
router.get(/^\/rules|privacy|solved$/, function(req, res){
    res.render(req.originalUrl.slice(1));
});

// GET forgot password page
router.get(/^\/forgot|settings$/, function(req, res){
    res.render(req.originalUrl.slice(1), {token: req.csrfToken(), msg: req.flash()});
});

// GET guest page
router.get('/guest', function(req, res){
    if (req.signedCookies.name)
    {
        return res.redirect('/play');
    }

    res.render('game', {token: req.csrfToken(), mode: 'guest'});
});

// GET play page
router.get('/play', check, function(req, res){
    res.render('play');
});

// GET practice page
router.get(/^\/practice|h2h|challenge|solo$/, check, function(req, res){
    res.render('game', {token: req.csrfToken(), mode: req.originalUrl});
});

router.post(/^\/h2h|practice|solo|challenge$/, onGame);

router.get('/stats', check, function(req, res){
    db.find({_id : req.signedCookies.name}, op).limit(1).next(function(err, doc){
        if(err)
        {
            console.error(err.message);
            req.flash('Error fetching stats...');
            return res.redirect('/game');
        }
        if(!doc.played)
        {
            return res.render('stats', {flash: req.flash(), stats : 0});
        }

        temp = [doc.practice, doc.h2h, doc.challenge, doc.solo].sort();
        doc.fav = doc.practice === temp[3] ? 'Practice' : doc.challenge === temp[3] ? 'Challenge' : doc.solo === temp[3] ? 'Solo' : 'Head to head';
        doc.fav += ' (' + temp[3] + ' of ' + doc.played + ' games)';
        doc.avg = parseInt(doc.time / doc.played, 10);
        doc.avg = parseInt(doc.avg / 60, 10) + ' : ' + (doc.avg % 60 > 9 ? '' : '0') + doc.avg % 60;
        doc.best = doc.best !== Number.MAX_VALUE ? parseInt(doc.best / 60, 10) + ' : ' + (doc.best % 60 > 9 ? '' : '0') + doc.best % 60 : 'NA';
        doc.worst = doc.worst !== -1 ? parseInt(doc.worst / 60, 10) + ' : ' + (doc.worst % 60 > 9 ? '' : '0') + doc.worst % 60 : 'NA';
        res.render('stats', {stats : doc, flash: req.flash()});
    });
});

module.exports = router;
