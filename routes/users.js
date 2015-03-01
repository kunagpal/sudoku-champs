var path = require('path'),
    passport = require('passport'),
    router = require('express').Router(),
    auth = require(path.join(__dirname, '..', 'database', 'auth'));

// GET logout page
router.get('/logout', function(req, res) {
    if (req.signedCookies.name)
    {
        res.clearCookie('name');
        req.logout();
    }
    res.redirect('/login');
});
// GET login page
router.get('/login', function(req, res) {
    res.render('login');
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
    res.render('forgot');
});
// GET solved example
router.get('/solved', function(req, res) {
    res.render('solved');
});
// GET guest page
router.get('/guest', function(req, res) {
    if (req.signedCookies.name)
    {
        res.render('play', {title: 'Express'})
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
        res.redirect('/login');
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
        res.redirect('/login');
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
        res.redirect('/login');
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
        res.redirect('/login');
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
        res.redirect('/login');
    }
});
// POST play page
router.post('/play', function(req, res) {
    res.render('play');
});
// GET registration page
router.get('/register', function(req, res) {
    res.render('register', { response: "" });
    
});

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

module.exports = router;
