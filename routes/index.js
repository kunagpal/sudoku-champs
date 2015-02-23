var path = require('path'),
    async = require('async'),
    crypto = require('crypto'),
    bcrypt = require('bcrypt-nodejs'),
    nodemailer = require('nodemailer'),
    router = require('express').Router(),
    mongo = require('mongodb').MongoClient,
    uri = process.env.MONGOLAB_URI || 'mongodb://127.0.0.1:27017/project',
    users = require(path.join(__dirname, '..', 'database', 'users')),
    key = require(path.join(__dirname, '..', 'key'));
if (process.env.LOGENTRIES_TOKEN)
{
    var log = require('node-logentries').logger({token: process.env.LOGENTRIES_TOKEN});
}
/* GET home page. */
router.get('/', function(req, res, next)
{
    var index = {
      _id : 'Player',
      win : 'Matches won',
      loss : 'Matches lost',
      tied : 'Matches tied',
      played : 'Matches played',
      points : 'Points',
      ratio : 'Ratio',
      streak : 'Streak',
      worst: 'Worst',
      best : 'Best',
      avg: 'Average',
      rep: 'Reputation'
    };
    mongo.connect(uri, function(err, db){
        if(err)
        {
            console.log(err.message);
            res.render('index', {stats : {}});
        }
        else
        {
            var op = {dob : 0, password_hash : 0, email : 0, phone : 0, token : 0, expires : 0, form : 0, team_no : 0};
            db.collection('users').findOne({_id : req.signedCookies.name}, op, function(err, doc){
               if(err)
               {
                   console.log(err.message);
               }
               else
               {
                   db.close();
                   doc = doc ? doc : 0;
                   console.log(doc);
                   res.render('index', {stats : doc, index : index});
               }
            });
        }
    });
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
// GET leaderboard
router.get('/leader', function(req, res, next) {
    console.log(req.signedCookies.name);
    var i = 1,
        lead = [],
        flag = req.signedCookies.name ? false : true,
        op = {'_id' : 1, 'points' : 1, 'played' : 1, 'streak' : 1},
        frame = {'sort' : [['points', -1], ['played' , 1], ['streak' , -1]], 'limit' : 2};
    mongo.connect(uri, function(err, db) {
        if(err)
        {
            console.log(err.message);
        }
        else
        {
            db.collection('users').find({}, op, frame).each(function(err, doc) {
                if(err)
                {
                    console.log(err.message);
                }
                else if(doc)
                {
                    lead.push(doc);
                    if(doc._id == req.signedCookies.name)
                    {
                        flag = true;
                    }
                }
                else
                {
                    db.close(function(err){
                        if(err)
                        {
                            console.log(err.message);
                        }
                        else
                        {
                            if(!flag && req.signedCookies.name)
                            {
                                mongo.connect(uri, function (err, db) {
                                    if (err)
                                    {
                                        console.log(err.message);
                                    }
                                    else
                                    {
                                        db.collection('users').find({}, op, {sort : [['points', -1]]}).each(function (err, doc) {
                                            if (err)
                                            {
                                                console.log(err.message);
                                            }
                                            else if(doc)
                                            {
                                                if(doc._id == req.signedCookies.name)
                                                {
                                                    db.close();
                                                    doc.rank = i;
                                                    lead.push(doc);
                                                    res.render('leader', {lead: lead});
                                                }
                                                else
                                                {
                                                    ++i;
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });
                    if(flag)
                    {
                        res.render('leader', {lead : lead});
                    }
                }
            });
        }
    });
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
        console.log(req.body.name + " " + req.body.password + "received");
    }
    users.fetch({_id : req.body.name}, function (err, doc)
    {
        if (err)
        {
            console.log(err.message);
            res.render('index', {response: "Incorrect credentials"});
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
                    num : parseInt(number) + 1,
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
                        user.token = token;
                        user.expire = Date.now() + 3600000; // 1 hour
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
                'For the purposes of security, the above link is valid for sixty minutes only. ' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n' +
                'Regards,\nThe Sudoku Champs team'
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
                    db.collection('users').findOne({ token: req.params.token, expire: { $gt: Date.now() } }, function(err, user) {
                        if (!user) {
                            req.flash('error', 'Password reset token is invalid or has expired.');
                            return res.redirect('back');
                        }
                        user.password = req.body.password;
                        user.token = undefined;
                        user.expire = undefined;
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
                    pass: process.env.PASSWORD || key
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'sudokuchampster@gmail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n' +
                'Regards,\nThe Sudoku Champs team'
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