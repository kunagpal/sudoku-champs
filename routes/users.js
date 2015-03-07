var path = require('path'),
    router = require('express').Router(),
    auth = require(path.join(__dirname, '..', 'database', 'auth'));
// GET logout page
router.get('/logout', function(req, res) {
    if (req.signedCookies.name)
    {
        res.clearCookie('name');
    }
    res.redirect('/login');
});
// GET login page
router.get('/login', function(req, res) {
    if(req.signedCookies.name)
    {
        res.redirect('/');
    }
    else
    {
        res.render('login', {token : req.csrfToken()});
    }
});
// GET contact page
router.get('/contact', function(req, res) {
    res.render('contact');
});
// GET developers page
router.get('/developers', function(req, res) {
    res.render('developers');
});
//GET rules
router.get('/rules', function(req, res) {
    res.render('rules');
});
//GET privacy
router.get('/privacy', function(req, res) {
    res.render('privacy');
});
// GET forgot password page
router.get('/forgot', function(req, res) {
    res.render('forgot', {token : req.csrfToken()});
});
// GET solved example
router.get('/solved', function(req, res) {
    res.render('solved');
});
// GET guest page
router.get('/guest', function(req, res) {
    if (req.signedCookies.name)
    {
        res.render('play')
    }
    else
    {
        res.render('guest');
    }
});
// GET play page
router.get('/play', function(req, res) {
    if (req.signedCookies.name)
    {
        res.render('play');
    }
    else
    {
        res.redirect('/login?pl');
    }
});
// GET practice page
router.get('/practice', function(req, res) {
    if (req.signedCookies.name)
    {
        res.render('practice');
    }
    else
    {
        res.redirect('/login?pr');
    }
});
// GET h2h page
router.get('/h2h', function(req, res) {
    if (req.signedCookies.name)
    {
        res.render('h2h');
    }
    else
    {
        res.redirect('/login?h');
    }
});
// GET challenge page
router.get('/challenge', function(req, res) {
    if (req.signedCookies.name)
    {
        res.render('challenge');
    }
    else
    {
        res.redirect('/login?c');
    }
});
// GET solo page
router.get('/solo', function(req, res) {
    if (req.signedCookies.name)
    {
        res.render('solo');
    }
    else
    {
        res.redirect('/login?s');
    }
});
// GET registration page
router.get('/register', function(req, res) {
        res.render('register', {token : req.csrfToken()});
});
module.exports = router;
