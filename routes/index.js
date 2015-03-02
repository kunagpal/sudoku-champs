var i,
    lead,
    path = require('path'),
    crypto = require('crypto'),
    bcrypt = require('bcrypt-nodejs'),
    router = require('express').Router(),
    mongo = require('mongodb').MongoClient,
    key = require(path.join(__dirname, '..', 'key')).key,
    uri = process.env.MONGO || 'mongodb://127.0.0.1:27017/project',
    users = require(path.join(__dirname, '..', 'database', 'users')),
    index = {
        best : 'Best',
        _id : 'Player',
        worst: 'Worst',
        avg: 'Average',
        ratio : 'Ratio',
        points : 'Points',
        streak : 'Streak',
        rep: 'Reputation',
        win : 'Matches won',
        loss : 'Matches lost',
        tied : 'Matches tied',
        played : 'Matches played'
    },
    email = require('nodemailer').createTransport({
        service: 'Gmail',
        auth: {
            user: 'sudokuchampster@gmail.com',
            pass: process.env.PASSWORD || key
        }
    }),
    op = {'_id' : 1, 'points' : 1, 'played' : 1, 'streak' : 1},
    frame = {'sort' : [['points', -1], ['played' , 1], ['streak' , -1]], 'limit' : 2};

if (process.env.LOGENTRIES_TOKEN)
{
    var log = require('node-logentries').logger({token: process.env.LOGENTRIES_TOKEN});
}
/* GET home page. */
router.get('/', function(req, res)
{
    mongo.connect(uri, function(err, db){
        if(err)
        {
            console.log(err.message);
            res.render('index', {stats : {}});
        }
        else
        {
            var op = {dob : 0, hash : 0, email : 0, token : 0, expires : 0, form : 0, num : 0};
            db.collection('users').findOne({_id : req.signedCookies.name}, op, function(err, doc){
               db.close();
               if(err)
               {
                   console.log(err.message);
               }
               else
               {
                   res.render('index', {stats : doc ? doc : 0, index : index});
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
            console.log(err.message);
        }
        else
        {
            db.collection('users').findOne({ token: req.params.token, expire: { $gt: Date.now() } }, function(err, doc) {
                db.close();
                if(err)
                {
                    console.log(err.message);
                }
                else if (!doc)
                {
                    res.redirect('/forgot');
                }
                else
                {
                    console.log('Found!');
                    res.render('reset');
                }
            });
        }
    });
});
// GET leaderboard
router.get('/leader', function(req, res) {
    i = 1;
    lead = [];
    flag = req.signedCookies.name ? false : true;
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
                                        db.collection('users').find({}, op, {sort : [['points', -1], ['played' , 1], ['steak', -1]]}).each(function (err, doc) {
                                            db.close();
                                            if (err)
                                            {
                                                console.log(err.message);
                                            }
                                            else if(doc)
                                            {
                                                if(doc._id == req.signedCookies.name)
                                                {
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
router.post('/login', function(req, res) {
    if (req.signedCookies.name)
    {
        res.clearCookie('name', { });
    }
    if (log)
    {
        console.log(req.body.name + " " + req.body.password + "received");
    }
    mongo.connect(uri, function(err, db){
        if(err)
        {
            console.log(err.message);
        }
        else
        {
            db.collection('users').findOne({_id : req.body.name}, function(err, doc){
                db.close();
                if(err)
                {
                    console.log(err.message);
                }
                else if(!doc)
                {
                    console.log('Incorrect credentials!');
                    res.redirect('/login');
                }
                else
                {
                    if (bcrypt.compareSync(req.body.password, doc.hash))
                    {
                        res.cookie('name', req.body.name, {maxAge: 86400000, signed: true});
                        res.redirect('/play');
                    }
                }
            });
        }
    });
});
// POST register page
router.post('/register', function(req, res) {
    users.getCount(function (err, num)
    {
        if (err)
        {
            console.log(err.message);
        }
        else
        {
            console.log("Reached");
            if (req.body.password === req.body.confirm)
            {
                var user = require(path.join(__dirname, '..', 'database', 'user'));
                user._id = req.body.name;
                user.dob = new Date();
                user.num = parseInt(num) + 1;
                user.hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
                user.email = req.body.email;
                users.insert(user, function (err, docs)
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
    });
});
// POST forgot password page
router.post('/forgot', function(req, res) {
    mongo.connect(uri, function(err, db){
        if(err)
        {
            console.log(err.message);
        }
        else
        {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                var options = {
                    from: 'sudokuchampster@gmail.com',
                    to : req.body.email,
                    subject: 'Time to get back in the game',
                    text: 'Hey there, ' + req.body.email.split('@')[0] + '\n' + 'A little birdie told us that you were having troubles with your Sudoku champs password.\n'
                    + "That really hurts us, so please click on http://" + req.headers.host + '/reset/' + token + " in order to reset your password.\nWe"
                    + ' would love to have you back as a user.\n In the event that this password reset was not requested by you,'
                    + ' please ignore this message and your password shall remain intact.\n\nRegards, \nThe Sudoku Champs team.'
                };
                db.collection('users').findAndModify({email : req.body.email}, [], {$set:{token : token, expire : Date.now() + 3600000}}, {new : false}, function(err, doc){
                    db.close();
                    if(err)
                    {
                        console.log(err.message);
                    }
                    else if(!doc)
                    {
                        console.log('Oh No !');
                    }
                    else
                    {
                        email.sendMail(options, function(err) {
                            if(err)
                            {
                                console.log(err.message);
                            }
                            else
                            {
                                res.redirect('/login');
                            }
                        });
                    }
                });
            });
        }
    });
});
// POST reset token page
router.post('/reset/:token', function(req, res) {
    mongo.connect(uri, function(err, db){
        if(err)
        {
            console.log(err.message);
        }
        else
        {
            var query = {token : req.params.token, expire : {$gt: Date.now()}},
                op = {$set : {hash : bcrypt.hashSync(req.body.pass, bcrypt.genSaltSync(10))}, $unset : {token : '', expire : ''}};
            db.collection('users').findAndModify(query, [], op, {new : true}, function(err, doc) {
                db.close();
                if(err)
                {
                    console.log(err.message);
                }
                else if(!doc)
                {
                    console.log('No matches!');
                    res.redirect('/forgot');
                }
                else
                {
                    var options = {
                        to : doc.email,
                        subject : 'Password change successful !',
                        text : 'Hey there, ' + doc.email.split('@')[0] + ' we\'re just writing in to let you know that the recent password change for your account with Sudoku Champs was successful.' +
                        '\nRegards,\nThe Sudoku Champs team.'
                    };
                    email.sendMail(options, function(err, doc) {
                        if(err)
                        {
                            console.log(err.message);
                        }
                        else
                        {
                            console.log('Updated successfully!');
                            res.redirect('/login');
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;