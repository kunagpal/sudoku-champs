var router = require('express').Router(),
    path = require('path'),
    async = require('async'),
    crypto = require('crypto'),
    bcrypt = require('bcrypt-nodejs'),
    nodemailer = require('nodemailer'),
    mongo = require('mongodb').MongoClient,
    uri = process.env.MONGOLAB_URI || 'mongodb://127.0.0.1:27017/project',
    users = require(path.join(__dirname, '..', 'database', 'users'));
// GET logout page
router.get('/logout', function(req, res, next) {
    if (req.signedCookies.name)
    {
        res.clearCookie('name', {});
    }
    res.redirect('/login');
});
// GET login page
router.get('/login', function(req, res, next) {
    res.render('login', {});
});
// GET contact page
router.get('/contact', function(req, res, next) {
    res.render('contact', {});
});
// GET developers page
router.get('/developers', function(req, res, next) {
    res.render('developers', {});
});
//GET rules
router.get('/rules', function(req, res, next) {
    res.render('rules', {});
});
//GET privacy
router.get('/privacy', function(req, res, next) {
    res.render('privacy', {});
});
// GET forgot password page
router.get('/forgot', function(req, res, next) {
    res.render('forgot', {});
});
// GET solved example
router.get('/solved', function(req, res, next) {
    res.render('solved', {});
});
// GET guest page
router.get('/guest', function(req, res, next) {
    if (req.signedCookies.name)
    {
        res.render('play', {title: 'Express'})
    }
    else
    {
        req.flash('info', 'You must login to play.');
        res.render('guest', {title: 'Express'});
    }
});
// GET play page
router.get('/play', function(req, res, next) {
    if (req.signedCookies.name)
    {
        res.render('play', {});
    }
    else
    {
        req.flash('info', 'You must login to play.');
        res.redirect('/login');
    }
});
// GET practice page
router.get('/play/practice', function(req, res, next) {
    if (req.signedCookies.name)
    {
        res.render('practice', {});
    }
    else
    {
        req.flash('info', 'You must login to play.');
        res.redirect('/login');
    }
});
// GET h2h page
router.get('/play/h2h', function(req, res, next) {
    if (req.signedCookies.name)
    {
        res.render('h2h', {});
    }
    else
    {
        req.flash('info', 'You must login to play.');
        res.redirect('/login');
    }
});
// GET challenge page
router.get('/play/challenge', function(req, res, next) {
    if (req.signedCookies.name)
    {
        res.render('challenge', {});
    }
    else
    {
        req.flash('info', 'You must login to play.');
        res.redirect('/login');
    }
});
// GET solo page
router.get('/play/solo', function(req, res, next) {
    if (req.signedCookies.name)
    {
        res.render('solo', {});
    }
    else
    {
        req.flash('info', 'You must login to play.');
        res.redirect('/login');
    }
});
// POST play page
router.post('/play', function(req, res, next) {
    res.render('play', {});
});
// GET registration page
router.get('/register', function(req, res, next) {
    res.render('register', { response: "" });
});
module.exports = router;
