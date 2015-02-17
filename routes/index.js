var path = require('path'),
    async = require('async'),
    crypto = require('crypto'),
    bcrypt = require('bcrypt-nodejs'),
    nodemailer = require('nodemailer'),
    router = require('express').Router(),
    mongo = require('mongodb').MongoClient,
    uri = process.env.MONGOLAB_URI || 'mongodb://localhost/project',
    users = require(path.join(__dirname, '..', 'database', 'users'));
if (process.env.LOGENTRIES_TOKEN)
{
    var log = require('node-logentries').logger({token: process.env.LOGENTRIES_TOKEN});
}
/* GET home page. */
router.get('/', function(req, res, next)
{
    res.render('index', {response: "" });
});
// GET login page
router.get('/login', function(req, res, next) {
    res.render('login', { title: 'Express' });
});
// GET contact page
router.get('/contact', function(req, res, next) {
    res.render('contact', { title: 'Express' });
});
// GET developers page
router.get('/developers', function(req, res, next) {
    res.render('developers', { title: 'Express' });
});
//GET rules
router.get('/rules', function(req, res, next) {
    res.render('rules', { title: 'Express' });
});
//GET privacy
router.get('/privacy', function(req, res, next) {
    res.render('privacy', { title: 'Express' });
});
// GET forgot password page
router.get('/forgot', function(req, res, next) {
    res.render('forgot', { title: 'Express' });
});
// GET reset token page
router.get('/reset/:token', function(req, res) {
    mongo.connect(uri, function(err, db) {
        if(err)
        {
            throw err;
        }
        else
        {
            db.collection('users').findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                if (!user)
                {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('/forgot');
                }
                res.render('reset', {  user: req.user, title: 'Title' });
            });
        }
    });
});
// GET solved example
router.get('/solved', function(req, res, next) {
    res.render('solved', { title: 'Express' });
});
// GET leaderboard
router.get('/leader', function(req, res, next) {
    var leader = [],
        op = {'_id' : 1, 'points' : 1, 'played' : 1, 'streak' : 1},
        frame = {'sort' : [['points', -1], ['played' , 1], ['streak' , -1]], 'limit' : 20};
    mongo.connect(uri, function(err, db) {
        if(err)
        {
            console.log(err.message);
            res.redirect('/');
        }
        else
        {
            db.collection('users').find({}, op, frame).toArray(function(err, doc) {
                db.close();
                if(err)
                {
                    console.log('Sorting error!: ', err.message);
                }
                else
                {
                    res.render('leader', { title: 'Express', leader : doc });
                }
            })
        }
    });
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
        res.render('play', { title: 'Express' });
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
        res.render('practice', { title: 'Express' });
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
        res.render('h2h', { title: 'Express' });
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
        res.render('challenge', { title: 'Express' });
    }
    else
    {
        req.flash('info', 'You must login to play.');
        res.redirect('/login');
    }
});
// GET
router.get('/play/solo', function(req, res, next) {
    if (req.signedCookies.name)
    {
        res.render('solo', { title: 'Express' });
    }
    else
    {
        req.flash('info', 'You must login to play.');
        res.redirect('/login');
    }
});
// POST play page
router.post('/play', function(req, res, next) {
    res.render('play', { title: 'Express' });
});
// POST login page
router.post('/login', function(req, res, next) {
    if (req.signedCookies.name)
    {
        res.clearCookie('name', { });
    }
    //console.log('here');
    if (log)
    {
        log.log(req.body.name + " " + req.body.password + "received");
    }
    users.fetch({_id : req.body.name}, function (err, doc)
    {
        if (err)
        {
            console.log(err.message);
            res.render('index', {response: "Incorrect Username"});
        }
        else if (doc)
        {
            if (bcrypt.compareSync(req.body.password, doc['password_hash']))
            {
                console.log("Login Successful " + req.body.name);
                res.cookie('name', doc['_id'], {maxAge: 86400000, signed: true});
                res.redirect('/play');
            }
            else
            {
                console.log('Incorrect Credentials');
                res.render('index', {response: "Incorrect Password"});
            }
        }
        else
        {
            console.log('No such user exists');
            res.render('index', {response: "Invalid Username"});
        }
    });
});
// GET registration page
router.get('/register', function(req, res, next) {
        res.render('register', { response: "" });
});
// POST register page
router.post('/register', function(req, res, next) {
    users.getCount(function (err, number)
    {
        if (err)
        {
            console.log(err);
        }
        else
        {
            console.log("Reached");
            if (req.body.password === req.body.confirm)
            {
                var ob =
                {
                    _id : req.body.name,
                    dob : new Date(),
                    team_no : parseInt(number) + 1,
                    password_hash : bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
                    email : req.body.email,
                    phone : req.body.phone,
                    win : 0,
                    loss : 0,
                    tied : 0,
                    played : 0,
                    points : 0,
                    ratio : 0.0,
                    form : 1,
                    streak: 0,
                    worst : -1,
                    best : Number.MAX_VALUE,
                    avg : 0,
                    rep : 0
                };
                users.insert(ob, function (err, docs)
                {
                    if (err)
                    {
                        console.log(err.message);
                        res.render('register', {response: "Please choose a different user name"});
                    }
                    else
                    {
                        res.cookie('name', docs[0]['_id'], {maxAge: 86400000, signed: true});
                        res.redirect('/play');
                    }
                });
            }
            else
            {
                console.log("Incorrect Password");
                res.render('register', {response: "Passwords do not match"});
            }
        }
    }
    )
});
// POST forgot password page
router.post('/forgot', function(req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            mongo.connect(uri, function(err, db) {
                if(err)
                {
                    throw err;
                }
                else
                {
                    db.collection('users').findOne({ email: req.body.email }, function(err, user) {
                        if (!user)
                        {
                            req.flash('error', 'No account with that email address exists.');
                            return res.redirect('/forgot');
                        }
                        user.resetPasswordToken = token;
                        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                        console.log(user);
                        db.collection('users').save(user, function(err) {
                                done(err, token, user);
                            }
                        );
                    })
                }
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport('SMTP', {
                service: 'Gmail',
                auth: {
                    user: 'sudokuchampster@gmail.com',
                    pass: process.env.PASSWORD
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'sudokuchampster@gmail.com',
                subject: 'Time to get back in the play',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
});
// POST reset token page
router.post('/reset/:token', function(req, res) {
    async.waterfall([
        function(done) {
            mongo.connect(uri, function(err, db){
                if(err)
                {
                    throw err;
                }
                else
                {
                    db.collection('users').findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                        if (!user) {
                            req.flash('error', 'Password reset token is invalid or has expired.');
                            return res.redirect('back');
                        }
                        user.password = req.body.password;
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;
                        user.save(function(err) {
                            req.logIn(user, function(err) {
                                done(err, user);
                            });
                        });
                    });
                }
            });
        },
        function(user, done) {
            var smtpTransport = nodemailer.createTransport('SMTP', {
                service: 'Gmail',
                auth: {
                    user: 'sudokuchampster@gmail.com',
                    pass: process.env.PASSWORD
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'sudokuchampster@gmail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function(err) {
        res.redirect('/');
    });
});
// POST logout page
router.get('/logout', function(req, res, next) {
    if (req.signedCookies.name)
    {
        res.clearCookie('name', {});
    }
    res.redirect('/login');
});
module.exports = router;