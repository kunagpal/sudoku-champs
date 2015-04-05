var temp = [],
    path = require('path'),
    router = require('express').Router(),
    mongo = require('mongodb').MongoClient,
    uri = 'mongodb://127.0.0.1:27017/project',
    quote = require(path.join(__dirname, '..', 'database', 'quote')),
    rand = function(arg){
        return arg[parseInt(Math.random() * 10000000000000000) % arg.length];
    },
    op = {dob : 0, hash : 0, email : 0, token : 0, expires : 0, form : 0, num : 0};

// GET logout page
router.get('/logout', function(req, res) {
    if (req.signedCookies.name)
    {
        res.render('logout', {head : rand(quote.title), quit : rand(quote.away), stay : rand(quote.stay), token : req.csrfToken()});
    }
    else
    {
        res.redirect('/');
    }
});

// POST logout page
router.post('/logout', function(req, res){
    mongo.connect(uri, function(err, db) {
        if(err)
        {
            console.log(err.message);
            req.session.info = 'An unexpected error has occurred. Please retry.';
            res.redirect('/');
        }
        else
        {
            db.collection('users').updateOne({_id: req.signedCookies.name}, {$inc : {visit : 1}}, function(err, num) {
                db.close();
                if (err)
                {
                    console.log(err.message);
                    req.session.info = 'An unexpected error has occurred. Please retry.';
                    res.redirect('/');
                }
                else
                {
                    console.log(num, ' document updated.');
                    res.redirect('/login');
                }
            });
        }
    });
    res.clearCookie('name', {});
});

// GET login page
router.get('/login', function(req, res) {
    if(req.signedCookies.name)
    {
        res.redirect('/');
    }
    else
    {
        temp[0] = req.session.msg ? req.session.msg : 0;
        delete req.session.msg;
        temp[1] = req.session.info ? req.session.info : 0;
        delete req.session.info;
        temp[2] = req.session.name ? req.session.name : 0;
        delete req.session.name;
        res.render('login', {token : req.csrfToken(), msg : temp[0], info : temp[1], name : temp[2]});
    }
});

// GET forum page
router.get('/forum', function(req, res) {
    res.render('forum');
});

// GET dev page
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
    temp[0] = req.session.msg ? req.session.msg : 0;
    delete req.session.msg;
    temp[1] = req.session.info ? req.session.info : 0;
    delete req.session.info;
    res.render('forgot', {token : req.csrfToken(), msg : temp[0], info : temp[1]});
});

// GET solved example
router.get('/solved', function(req, res) {
    res.render('solved');
});

// GET guest page
router.get('/guest', function(req, res) {
    if (req.signedCookies.name)
    {
        res.redirect('/play')
    }
    else
    {
        res.render('guest', {token : req.csrfToken()});
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
        res.render('practice', {token : req.csrfToken()});
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
        res.render('h2h', {token : req.csrfToken()});
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
        res.render('challenge', {token : req.csrfToken()});
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
        res.render('solo', {token : req.csrfToken()});
    }
    else
    {
        res.redirect('/login?s');
    }
});

// GET registration page
router.get('/register', function(req, res) {
    temp[0] = req.session.msg ? req.session.msg : 0;
    delete req.session.msg;
    temp[1] = req.session.info ? req.session.info : 0;
    delete req.session.info;
    temp[2] = req.session.name ? req.session.name : 0;
    delete req.session.name;
    temp[3] = req.session.email ? req.session.email : 0;
    delete req.session.email;
    res.render('register', {token : req.csrfToken(), msg : temp[0], info : temp[1], name : temp[2], email : temp[3]});
});

router.post('/challenge', function(req, res){
    mongo.connect(uri, function(err, db){
        if(err)
        {
            console.log(err.message);
        }
        else
        {
            db.collection('users').updateOne({_id : req.signedCookies.name}, {$inc : {challenge : 1, played : 1, xp : 1, form : 1, win : req.body.win, loss : req.body.loss, time : req.body.time}}, function(err, doc){
                if(err)
                {
                    console.log(err.message);
                }
                else
                {
                    console.log(doc);
                    res.redirect('/challenge');
                }
            });
        }
    });
});

router.post('/h2h', function(req, res){
    mongo.connect(uri, function(err, db){
        if(err)
        {
            console.log(err.message);
        }
        else
        {
            db.collection('users').updateOne({_id : req.signedCookies.name}, {$inc : {h2h : 1, played : 1, xp : 1, rep : 1, form : 1, win : req.body.win, loss : req.body.loss, time : req.body.time}}, function(err, doc){
                if(err)
                {
                    console.log(err.message);
                }
                else
                {
                    console.log(doc);
                    res.redirect('/h2h');
                }
            });
        }
    });
});

router.post('/solo', function(req, res){
    mongo.connect(uri, function(err, db){
        if(err)
        {
            console.log(err.message);
        }
        else
        {
            db.collection('users').updateOne({_id : req.signedCookies.name}, {$inc : {solo : 1, played : 1, form : 1, xp : 1, win : req.body.win, loss : req.body.loss, time : req.body.time}}, function(err, doc){
                if(err)
                {
                    console.log(err.message);
                }
                else
                {
                    console.log(doc);
                    res.redirect('/solo');
                }
            });
        }
    });
});

router.post('/practice', function(req, res){
    mongo.connect(uri, function(err, db){
        if(err)
        {
            console.log(err.message);
        }
        else
        {
            db.collection('users').updateOne({_id : req.signedCookies.name}, {$inc : {practice : 1, played : 1, form : 1, xp : 1, win : req.body.win, loss : req.body.loss, time : req.body.time}}, function(err, doc){
                if(err)
                {
                    console.log(err.message);
                }
                else
                {
                    console.log(doc);
                    res.redirect('/practice');
                }
            });
        }
    });
});

router.get('/stats', function(req, res){
    if(req.signedCookies.name)
    {
        mongo.connect(uri, function(err, db){
            if(err)
            {
                console.log(err.message);
                res.render('stats', {stats : 0});
            }
            else
            {
                db.collection('users').findOne({_id : req.signedCookies.name}, op, function(err, doc){
                    db.close();
                    if(err)
                    {
                        console.log(err.message);
                    }
                    else
                    {
                        res.render('stats', {stats : doc ? doc : 0});
                    }
                });
            }
        });
    }
    else
    {
        res.redirect('/login');
    }
});

//GET generic route
router.get(/\/.*/, function(req, res){
    res.redirect('/');
});

module.exports = router;