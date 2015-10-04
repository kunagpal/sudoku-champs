var opt,
    temp = [],
    path = require('path'),
    router = require('express').Router(),
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
        {
            req.db.collection('users').updateOne({_id: req.signedCookies.name}, {$inc : {visit : 1}}, function(err) {
                if (err)
                {
                    console.log(err.message);
                    req.session.info = 'An unexpected error has occurred. Please retry.';
                    res.redirect('/');
                }
                else
                {
                    res.redirect('/login');
                }
            });
        }
    res.clearCookie('name', {});
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
        res.redirect('/login');
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
        req.session.route = 2;
        res.redirect('/login');
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
        req.session.route = 0;
        res.redirect('/login');
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
        req.session.route = 3;
        res.redirect('/login');
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
        req.session.route = 1;
        res.redirect('/login');
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
        {
            opt =  {
                $set : {
                    prevType : 'Challenge',
                    prevTime : parseInt(req.body.time),
                    best : req.signedCookies.best < parseInt(req.body.time) ? req.signedCookies.best : parseInt(req.body.time),
                    worst : req.signedCookies.worst > parseInt(req.body.time) ? req.signedCookies.worst : parseInt(req.body.time)
                },
                $inc : {
                    xp : 1,
                    form : 1,
                    streak : 1,
                    played : 1,
                    challenge : 1,
                    win : parseInt(req.body.win),
                    loss : parseInt(req.body.loss),
                    time : parseInt(req.body.time)
                }
            };
            req.db.collection('users').updateOne({_id : req.signedCookies.name}, opt, function(err, doc){
                if(err)
                {
                    console.log(err.message);
                }
                else
                {
                    res.cookie('best', opt.$set.best, {maxAge : 86400000, signed : true});
                    res.cookie('worst', opt.$set.worst, {maxAge : 86400000, signed : true});
                    res.redirect('/challenge');
                }
            });
        }
    });

router.post('/h2h', function(req, res){
        {
            opt =  {
                $set : {
                    prevType : 'Head to head',
                    prevTime : parseInt(req.body.time),
                    best : req.signedCookies.best < parseInt(req.body.time) ? req.signedCookies.best : parseInt(req.body.time),
                    worst : req.signedCookies.worst > parseInt(req.body.time) ? req.signedCookies.worst : parseInt(req.body.time)
                },
                $inc : {
                    xp : 1,
                    h2h : 1,
                    form : 1,
                    streak : 1,
                    played : 1,
                    win : parseInt(req.body.win),
                    loss : parseInt(req.body.loss),
                    time : parseInt(req.body.time)
                }
            };
            req.db.collection('users').updateOne({_id : req.signedCookies.name}, opt, function(err, doc){
                if(err)
                {
                    console.log(err.message);
                }
                else
                {
                    res.cookie('best', opt.$set.best, {maxAge: 86400000, signed: true});
                    res.cookie('worst', opt.$set.worst, {maxAge: 86400000, signed: true});
                    res.redirect('/h2h');
                }
            });
        }
});

router.post('/solo', function(req, res){
    opt =  {
        $set : {
            prevType : 'Solo',
            prevTime : parseInt(req.body.time),
            best : req.signedCookies.best < parseInt(req.body.time) ? req.signedCookies.best : parseInt(req.body.time),
            worst : req.signedCookies.worst > parseInt(req.body.time) ? req.signedCookies.worst : parseInt(req.body.time)
        },
        $inc : {
            xp : 1,
            solo : 1,
            form : 1,
            streak : 1,
            played : 1,
            win : parseInt(req.body.win),
            loss : parseInt(req.body.loss),
            time : parseInt(req.body.time)
        }
    };
    req.db.collection('users').updateOne({_id : req.signedCookies.name}, opt, function(err, doc){
        if(err)
        {
            console.log(err.message);
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
    opt =  {
        $set : {
            best : req.signedCookies.best < req.body.time ? req.signedCookies.best : parseInt(req.body.time),
            worst : req.signedCookies.worst > parseInt(req.body.time) ? req.signedCookies.worst : parseInt(req.body.time),
            prevType : 'Practice',
            prevTime : parseInt(req.body.time)
        },
        $inc : {
            xp : 1,
            form : 1,
            played : 1,
            practice : 1,
            time : parseInt(req.body.time)
        }
    };
    req.db.collection('users').updateOne({_id : req.signedCookies.name}, opt, function(err, doc){
        if(err)
        {
            console.log(err.message);
        }
        else
        {
            res.cookie('best', opt.$set.best, {maxAge: 86400000, signed: true});
            res.cookie('worst', opt.$set.worst, {maxAge: 86400000, signed: true});
            res.redirect('/practice');
        }
    });
});

router.get('/stats', function(req, res){
    if(req.signedCookies.name)
    {
            {
                req.db.collection('users').findOne({_id : req.signedCookies.name}, op, function(err, doc){
                    if(err)
                    {
                        console.log(err.message);
                    }
                    else if(!doc.played)
                    {
                        res.render('stats', {stats : 0});
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
                        res.render('stats', {stats : doc});
                    }
                });
            }
    }
    else
    {
        req.session.route = 4;
        res.redirect('/login');
    }
});

//GET generic route
//router.get(/\/.*/, function(req, res){
//    res.redirect('/');
//});

module.exports = router;