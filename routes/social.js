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
        res.redirect('/play');
    }
);

router.get('/go', passport.authenticate('google'));

router.get('/GO', passport.authenticate('google', {
        successRedirect : '/play',
        failureRedirect : '/login'
    }),
    function(req, res){
        res.redirect('/play');
    }
);

router.get('/gi', passport.authenticate('github'));

router.get('/GI', passport.authenticate('github', {
        successRedirect : '/play',
        failureRedirect : '/login'
    }),
    function(req, res){
        res.redirect('/play');
    }
);

router.get('/tw', passport.authenticate('twitter'));

router.get('/TW', passport.authenticate('twitter', {
        successRedirect : '/play',
        failureRedirect : '/login'
    }),
    function(req, res){
        res.redirect('/play');
    }
);

router.get('/li', passport.authenticate('linkedin', {scope : 'r_emailaddress'}));

router.get('/LI', passport.authenticate('linkedin', {
        successRedirect : '/play',
        failureRedirect : '/login'
    }),
    function(req, res){
        res.redirect('/play');
    }
);

router.get('/error', function(req, res){
    res.render('error');
});

module.exports = router;