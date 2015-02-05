var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var router = require('express').Router();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
// GET login page
router.get('/login', function(req, res, next) {
    res.render('login', { title: 'Express' });
});
// GET registration page
router.get('/register', function(req, res, next) {
    res.render('register', { title: 'Express' });
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
router.post('/forgot', function(req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport('SMTP', {
                service: 'Gmail',
                auth: {
                    user: 'kunagpal@gmail.com',
                    pass: 'kunal398nagpal'
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'kunagpal@gmail.com',
                subject: 'Node.js Password Reset',
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
    res.render('game', { title: 'Express' });
});
router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('reset', {
            user: req.user,
            title: 'Title'
        });
    });
});
router.post('/reset/:token', function(req, res) {
    async.waterfall([
        function(done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
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
        },
        function(user, done) {
            var smtpTransport = nodemailer.createTransport('SMTP', {
                service: 'Gmail',
                auth: {
                    user: 'kunagpal@gmail.com',
                    pass: 'kunal398nagpal'
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'kunagpal@gmail.com',
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
module.exports = router;
