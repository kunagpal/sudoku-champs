var path = require('path');
var async = require('async');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var router = require('express').Router();
var mongo = require('mongodb').MongoClient;
var users = require(path.join(__dirname, '..', 'database', 'users'));
var uri = process.env.MONGOLAB_URI || 'mongodb://localhost/project';
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
// GET developers page
router.get('/developers', function(req, res, next) {
    res.render('developers', { title: 'Express' });
});
//GET rules
router.get('/rules', function(req, res, next) {
    res.render('rules', { title: 'Express' });
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
                res.render('reset', { user: req.user, title: 'Title' });
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
    res.render('leader', { title: 'Express' });
});
// GET game page
router.get('/play', function(req, res, next) {
    if (req.signedCookies.name)
    {
        res.render('game', { title: 'Express' });
    }
    else
    {
        res.redirect('/login');
    }
});
// POST play page
router.post('/play', function(req, res, next) {
    res.render('game', { title: 'Express' });
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
                console.log("Login Successful" + req.body.name);
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
                var newUser =
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
                users.insert(newUser, function (err, docs)
                {
                    if (err)
                    {
                        console.log(err.message);
                        // Make it more user friendly, output the error to the view
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
                subject: 'Time to get back in the game',
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
