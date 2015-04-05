var i,
    lead,
    flag,
    bcrypt,
    ref = {
        'h':'/h2h',
        's':'/solo',
        'pl':'/play',
        'pr':'/practice',
        'c':'/challenge'
    },
    path = require('path'),
    crypto = require('crypto'),
    router = require('express').Router(),
    mongo = require('mongodb').MongoClient,
    user = require(path.join(__dirname, '..', 'database', 'user')),
    uri = process.env.MONGO || 'mongodb://127.0.0.1:27017/project',
    op = {'_id' : 1, 'points' : 1, 'played' : 1, 'streak' : 1},
    frame = {'sort' : [['points', -1], ['played' , 1], ['streak' , -1]]};

try{
    bcrypt = require('bcrypt');
}
catch(err){
    bcrypt = require('bcryptjs');
}
try{
    var key = require(path.join(__dirname, '..', 'key')).key;
}
catch(err){
    console.log(err.message);
    key = 0;
}
var email = require('nodemailer').createTransport({
    service: 'Gmail',
    auth: {
        user: 'sudokuchampster@gmail.com',
        pass: process.env.PASSWORD || key
        }
    });

// GET home page.
router.get('/', function(req, res)
{
    res.render('index');
});

// GET reset token page
router.get('/reset/:token', function(req, res) {
    mongo.connect(uri, function(err, db) {
        if(err)
        {
            console.log(err.message);
            req.session.info = 'An unexpected error has occurred. Please retry.';
            res.redirect('/forgot');
        }
        else
        {
            db.collection('users').find({token: req.params.token, expire: {$gt: Date.now()}}, {limit : 1}).forEach(function(doc) {
                db.close();
                if (!doc)
                {
                    console.log('No matches found !');
                    req.session.info = 'No matches found!';
                    res.redirect('/forgot');
                }
                else
                {
                    res.redirect('/reset');
                    console.log('Found!');
                }
            });
        }
    });
});

// GET leaderboard
router.get('/leader', function(req, res) {
    i = 0;
    lead = [];
    flag = !req.signedCookies.name;
    mongo.connect(uri, function(err, db) {
        if(err)
        {
            console.log(err.message);
            res.render('leader', {lead : 0});
        }
        else
        {
            db.collection('users').find({}, op, frame).toArray(function(err, docs) {
                db.close();
                if(err)
                {
                    console.log(err.message);
                }
                else
                {
                    for(j in docs)
                    {
                        if(docs[j]._id == req.signedCookies.name)
                        {
                            flag = true;
                            docs[j].rank = parseInt(j) + 1;
                            lead.push(docs[j]);
                        }
                        else if(lead.length < 5)
                        {
                            lead.push(docs[j]);
                        }
                        else if(flag)
                        {
                            break;
                        }
                    }
                    res.render('leader', {lead : lead, name : flag ? req.signedCookies.name : ''});
                }
            });
        }
    });
});

// POST login page
router.post('/login', function(req, res) {
    if (req.signedCookies.name)
    {
        res.clearCookie('name', { });
    }
    mongo.connect(uri, function(err, db){
        if(err)
        {
            console.log(err.message);
            req.session.info = 'An unexpected error has occurred, please try again.';
            res.redirect('/login');
        }
        else
        {
            db.collection('users').find({_id : req.body.name}, {}, {'limit' : 1}).forEach(function(doc){
                db.close();
                if(!doc)
                {
                    req.session.info = 'Incorrect credentials!';
                    res.redirect('/login');
                }
                else
                {
                    if (bcrypt.compareSync(req.body.password, doc.hash))
                    {
                        res.cookie('name', req.body.name, {maxAge: 86400000, signed: true});
                        res.redirect(ref[req.headers.referer.split('?')[1]] || '/play');
                    }
                    else
                    {
                        req.session.info = 'Incorrect credentials!';
                        req.session.name = req.body.name;
                        res.redirect('/login');
                    }
                }
            });
        }
    });
});

// POST register page
router.post('/register', function(req, res) {
    if(req.body.password === req.body.confirm)
    {
        mongo.connect(uri, function(err, db){
            if(err)
            {
                console.log(err.message);
                req.session.msg = 'An unexpected error has occurred. Please retry.';
                res.redirect('/register');
            }
            else
            {
                db.collection('users').count({}, function(err, num){
                    if(err)
                    {
                        console.log(err.message);
                        req.session.msg = 'An unexpected error has occurred. Please retry.';
                        res.redirect('/register');
                    }
                    else
                    {
                        console.log(num);
                        db.close(function(){
                            user._id = req.body.name;
                            user.dob = new Date();
                            user.num = parseInt(num) + 1;
                            user.hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
                            user.email = req.body.email;
                            mongo.connect(uri, function(err, db){
                                if(err)
                                {
                                    console.log(err.message);
                                }
                                else
                                {
                                    db.collection('users').insertOne(user, function(err, docs){
                                        db.close();
                                        if(err)
                                        {
                                            console.log(err.message);
                                            req.session.info = 'That username is already taken, please choose a different one.';
                                            res.redirect('/register');
                                        }
                                        else
                                        {
                                            res.cookie('name', docs[0]._id, {maxAge: 86400000, signed: true});
                                            res.redirect('/play');
                                        }
                                    });
                                }
                            });
                        });
                    }
                });
            }
        });
    }
    else
    {
        req.session.msg = 'Passwords do not match!';
        req.session.name = req.body.name;
        req.session.email = req.body.email;
        res.redirect('/register');
    }
});

// POST forgot password page
router.post('/forgot', function(req, res) {
    mongo.connect(uri, function(err, db){
        if(err)
        {
            console.log(err.message);
            res.redirect('/');
        }
        else
        {
            db.collection('users').updateOne({email : req.body.email, _id : req.body.name}, {$set:{token : token, expire : Date.now() + 3600000}}, function(err, doc){
                db.close();
                if(err)
                {
                    console.log(err.message);
                    req.session.info = 'An unexpected error has occurred. Please retry.';
                    res.redirect('/forgot');
                }
                else if(!doc)
                {
                    console.log('Oh No !');
                    req.session.info = 'No matches found!';
                    res.redirect('/forgot');
                }
                else
                {
                    crypto.randomBytes(20, function(err, buf) {
                        var token = buf.toString('hex');
                        var options = {
                            from: 'sudokuchampster@gmail.com',
                            to : req.body.email,
                            subject: 'Time to get back in the game',
                            text: 'Hey there, ' + req.body.name + '\n' + 'A little birdie told us that you were having troubles with your Sudoku champs password.\n'
                            + 'That really hurts us, so please click on http://' + req.headers.host + '/reset/' + token + ' within sixty minutes of seeing this message in order to' +
                            ' reset your password.\nWe would love to have you back as a user.\n In the event that this password reset was not requested by you, please ignore this' +
                            ' message and your password shall remain intact.\n\nRegards,\n\nThe Sudoku Champs team.'
                        };
                        email.sendMail(options, function(err) {
                            if(err)
                            {
                                console.log(err.message);
                            }
                            else
                            {
                                req.session.info = 'An email has been sent to ' + options.to + ' with further instructions.';
                            }
                            res.redirect('/login');
                        });
                    });
                }
            });
        }
    });
});

// POST reset token page
router.post('/reset/:token', function(req, res) {
    if(req.body.password === req.body.confirm)
    {
        mongo.connect(uri, function(err, db){
            if(err)
            {
                console.log(err.message);
                res.render('index', {stats : []});
            }
            else
            {
                var query = {token : req.params.token, expire : {$gt: Date.now()}},
                    op = {$set : {hash : bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))}, $unset : {token : '', expire : ''}};
                db.collection('users').findOneAndUpdate(query, op, function(err, doc) {
                    db.close();
                    if(err || !doc)
                    {
                        console.log(err.message);
                        req.session.info = 'The password reset link associated with this instance is either invalid or has expired. Please retry.';
                        res.redirect('/forgot');
                    }
                    else
                    {
                        var options = {
                            from : 'sudokuchampster@gmail.com',
                            to : doc.email,
                            subject : 'Password change successful!',
                            text : 'Hey there, ' + doc._id + '.\nWe\'re just writing in to let you know that the recent password change for your account with Sudoku Champs was successful.' +
                            '\nRegards,\nThe Sudoku Champs team.'
                        };
                        email.sendMail(options, function(err) {
                            if(err)
                            {
                                console.log(err.message);
                            }
                            else
                            {
                                console.log('Updated successfully!');
                                req.session.info = 'Updated successfully!';
                            }
                            res.redirect('/login');
                        });
                    }
                });
            }
        });
    }
    else
    {
        console.log('Passwords do not match !');
        req.session.msg = 'Passwords do not match!';
        res.redirect('/reset');
    }
});

module.exports = router;