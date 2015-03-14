/**
 * Created by Kunal Nagpal <kunagpal@gmail.com> on 01-03-2015.
 */
var path = require('path'),
    passport = require('passport'),
    router = require('express').Router(),
    auth = require(path.join(__dirname, '..', 'database', 'auth'));

router.get('/fb', passport.authenticate('facebook', {scope : 'email'}));

router.get('/FB', passport.authenticate('facebook', {
        successRedirect : '/play',
        failureRedirect : '/login'
    }),
    function(req, res){
        if (req.signedCookies.name)
        {
            res.clearCookie('name', { });
        }
        res.cookie('name', doc._id, {maxAge: 86400000, signed: true});
        res.redirect('/play');
    }
);

router.get('/go', passport.authenticate('google'));

router.get('/GO', passport.authenticate('google', {
        successRedirect : '/play',
        failureRedirect : '/login'
    }),
    function(req, res){
        if (req.signedCookies.name)
        {
            res.clearCookie('name', { });
        }
        res.cookie('name', doc._id, {maxAge: 86400000, signed: true});
        res.redirect('/play');
    }
);

router.get('/gi', passport.authenticate('github'));

router.get('/GI', passport.authenticate('github', {
        successRedirect : '/play',
        failureRedirect : '/login'
    }),
    function(req, res){
        if (req.signedCookies.name)
        {
            res.clearCookie('name', { });
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
            res.clearCookie('name', { });
        }
        res.cookie('name', doc._id, {maxAge: 86400000, signed: true});
        res.redirect('/play');
    }
);

router.get('/li', passport.authenticate('linkedin', {scope : ['r_emailaddress', 'r_basicprofile']}));

router.get('/LI', passport.authenticate('linkedin', {
        successRedirect : '/play',
        failureRedirect : '/login'
    }),
    function(req, res){
        if (req.signedCookies.name)
        {
            res.clearCookie('name', { });
        }
        res.cookie('name', doc._id, {maxAge: 86400000, signed: true});
        res.redirect('/play');
    }
);

module.exports = router;