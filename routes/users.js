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
        $set :
        {
            prevType : 'Challenge'
        },
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
    },
    update = function()
    {
        opt.$inc.win = parseInt(req.body.win);
        opt.$inc.loss = parseInt(req.body.loss);
        opt.$inc.time = parseInt(req.body.time);
        opt.$set.prevTime = parseInt(req.body.time);
        opt.$set.best = Math.min(req.signedCookies.best, parseInt(req.body.time));
        opt.$set.worst = Math.max(req.signedCookies.worst, parseInt(req.body.time));
    },
    quote = require(path.join(__dirname, '..', 'database', 'quote')),
    rand = function(arg)
    {
        return arg[parseInt(Math.random() * 10000000000000000) % arg.length];
    },
    op = {dob : 0, hash : 0, email : 0, token : 0, expires : 0, form : 0, num : 0};

// GET logout page
router.get('/logout', check, function(req, res) {
    res.render('logout', {main : rand(quote.title), quit : rand(quote.away), stay : rand(quote.stay), token : req.csrfToken(), head: head, foot: foot});
});

// POST logout page
router.post('/logout', function(req, res){
    db.updateOne({_id: req.signedCookies.name}, {$inc : {visit : 1}}, function(err) {
        if (err)
        {
            console.log(err.message);
            req.flash('err', 'An unexpected error has occurred. Please retry.');
            res.redirect('/');
        }
        else
        {
            res.redirect('/login');
        }
    });

    res.clearCookie('user', {});
    res.clearCookie('best', {});
    res.clearCookie('worst', {});
});

// GET login page
router.get('/login', function(req, res) {
    if(req.signedCookies.name)
    {
        res.redirect('/');
    }
    else
    {
        res.render('login', {token : req.csrfToken(), flash: req.flash(), head: head, foot: foot});
    }
});

// GET forum page
router.get('/forum', check, function(req, res) {
    res.render('forum', {head: head, foot: foot});
});

// GET dev page
router.get('/developers', function(req, res) {
    res.render('developers', {head: head, foot: foot});
});

//GET rules
router.get('/rules', function(req, res) {
    res.render('rules', {head: head, foot: foot});
});

//GET privacy
router.get('/privacy', function(req, res) {
    res.render('privacy', {head: head, foot: foot});
});

// GET forgot password page
router.get('/forgot', function(req, res) {
    res.render('forgot', {token : req.csrfToken(), flash: req.flash(), head: head, foot: foot});
});

// GET solved example
router.get('/solved', function(req, res) {
    res.render('solved', {head: head, foot: foot});
});

// GET guest page
router.get('/guest', function(req, res) {
    if (req.signedCookies.name)
    {
        res.redirect('/play')
    }
    else
    {
        res.render('game', {token : req.csrfToken(), head: head, foot: foot});
    }
});

// GET play page
router.get('/play', check, function(req, res) {
    res.render('play', {head: head, foot: foot});
});

// GET practice page
router.get('/practice', check, function(req, res) {
    res.render('game', {token : req.csrfToken(), mode : 'practice', head: head, foot: foot});
});

// GET h2h page
router.get('/h2h', check, function(req, res) {
    res.render('game', {token : req.csrfToken(), mode : 'h2h', head: head, foot: foot});
});

// GET challenge page
router.get('/challenge', check, function(req, res) {
    res.render('game', {token : req.csrfToken(), mode : 'challenge', head: head, foot: foot});
});

// GET solo page
router.get('/solo', check, function(req, res) {
    res.render('game', {token : req.csrfToken(), mode : 'solo', head: head, foot: foot});
});

// GET registration page
router.get('/register', function(req, res) {
    res.render('register', {token : req.csrfToken(), flash: req.flash(), head: head, foot: foot});
});

router.post('/challenge', function(req, res){
    opt.$set.prevType = 'Challenge';

    update();
    db.updateOne({_id : req.signedCookies.name}, opt, function(err){
        if(err)
        {
            console.log(err.message);
            req.flash('err', 'Error updating details...');
            res.redirect('/game');
        }
        else
        {
            res.cookie('best', opt.$set.best, {maxAge : 86400000, signed : true});
            res.cookie('worst', opt.$set.worst, {maxAge : 86400000, signed : true});
            res.redirect('/challenge');
        }
    });
});

router.post('/h2h', function(req, res){
    opt.$set.prevType = 'Head 2 head';

    update();
    db.updateOne({_id : req.signedCookies.name}, opt, function(err){
        if(err)
        {
            console.log(err.message);
            req.flash('err', 'Error updating details...');
            res.redirect('/game');
        }
        else
        {
            res.cookie('best', opt.$set.best, {maxAge: 86400000, signed: true});
            res.cookie('worst', opt.$set.worst, {maxAge: 86400000, signed: true});
            res.redirect('/h2h');
        }
    });
});

router.post('/solo', function(req, res){
    opt.$set.prevType = 'Solo';

    update();
    db.updateOne({_id : req.signedCookies.name}, opt, function(err){
        if(err)
        {
            console.log(err.message);
            req.flash('err', 'Error updating details...');
            res.redirect('/game');
        }
        else
        {
            res.cookie('best', opt.$set.best, {maxAge: 86400000, signed: true});
            res.cookie('worst', opt.$set.worst, {maxAge: 86400000, signed: true});
            res.redirect('/solo');
        }
    });
});

router.post('/practice', function(req, res){
    opt.$set.prevType = 'Practice';

    update();
    db.updateOne({_id : req.signedCookies.name}, opt, function(err){
        if(err)
        {
            console.log(err.message);
            req.flash('err', 'Error updating details...');
            res.redirect('/game');
        }
        else
        {
            res.cookie('best', opt.$set.best, {maxAge: 86400000, signed: true});
            res.cookie('worst', opt.$set.worst, {maxAge: 86400000, signed: true});
            res.redirect('/practice');
        }
    });
});

router.get('/stats', check, function(req, res){
    db.find({_id : req.signedCookies.name}, op).limit(1).next(function(err, doc){
        if(err)
        {
            console.log(err.message);
            req.flash('err', 'Error fetching stats...');
            res.redirect('/game');
        }
        else if(!doc.played)
        {
            res.render('stats', {flash: req.flash(), stats : 0, head: head, foot: foot});
        }
        else
        {
            temp = [doc.practice, doc.h2h, doc.challenge, doc.solo].sort();
            doc.fav = doc.practice == temp[3] ? 'Practice' : doc.challenge == temp[3] ? 'Challenge' : doc.solo == temp[3] ? 'Solo' : 'Head to head';
            doc.fav += ' (' + temp[3] + ' of ' + doc.played + ' games)';
            doc.avg = parseInt(doc.time / doc.played);
            doc.avg = parseInt(doc.avg / 60) + ' : ' + (doc.avg % 60 > 9 ? '' : '0') + doc.avg % 60;
            doc.best = doc.best != Number.MAX_VALUE ? parseInt(doc.best / 60) + ' : ' + (doc.best % 60 > 9 ? '' : '0') + doc.best % 60 : 'NA';
            doc.worst = doc.worst != -1 ? parseInt(doc.worst / 60) + ' : ' + (doc.worst % 60 > 9 ? '' : '0') + doc.worst % 60 : 'NA';
            res.render('stats', {stats : doc, flash: req.flash(), head: head, foot: foot});
        }
    });
});

//GET generic route
//router.get(/\/.*/, function(req, res){
//    res.redirect('/');
//});

router.get('/settings', check, function(req, res){
    res.render('settings', {token : req.csrfToken(), flash: req.flash(), head: head, foot: foot});
});

module.exports = router;