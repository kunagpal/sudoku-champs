var i,
    lead,
    flag,
    ref = {
        'h':'/h2h',
        's':'/solo',
        'pl':'/play',
        'pr':'/practice',
        'c':'/challenge'
    },
    path = require('path'),
    crypto = require('crypto'),
    bcrypt = require('bcrypt-nodejs'),
    router = require('express').Router(),
    mongo = require('mongodb').MongoClient,
    user = require(path.join(__dirname, '..', 'database', 'user')),
    uri = process.env.MONGO || 'mongodb://127.0.0.1:27017/project',
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
    op = {'_id' : 1, 'points' : 1, 'played' : 1, 'streak' : 1},
    frame = {'sort' : [['points', -1], ['played' , 1], ['streak' , -1]], 'limit' : 5};

try{
    var key = require(path.join(__dirname, '..', 'key')).key;
}
catch(err){
    console.log(err.message);
    key.key = 0;
}
var email = require('nodemailer').createTransport({
    service: 'Gmail',
    auth: {
        user: 'sudokuchampster@gmail.com',
        pass: process.env.PASSWORD || key
        }
    });
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
            res.render('index', {stats : 0});
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
            res.render('forgot');
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
                    res.redirect('/forgot', {msg : "The link is invalid or has expired."});
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
    flag = !req.signedCookies.name;
    mongo.connect(uri, function(err, db) {
        if(err)
        {
            console.log(err.message);
            res.render('leader', {lead : []});
        }
        else
        {
            db.collection('users').find({}, op, frame).each(function(err, doc) {
                if(err)
                {
                    console.log(err.message);
                    res.render('leader', {lead : []});
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
                            res.render('leader', {lead : lead, name : ""});
                        }
                        else if(!flag && req.signedCookies.name)
                        {
                            mongo.connect(uri, function (err, db) {
                                if (err)
                                {
                                    console.log(err.message);
                                    res.render('leader', {lead : []});
                                }
                                else
                                {
                                    db.collection('users').find({}, op, {sort : [['points', -1], ['played' , 1], ['steak', -1]]}).each(function (err, doc) {
                                        db.close();
                                        if (err)
                                        {
                                            console.log(err.message);
                                            res.render('leader', {lead : []});
                                        }
                                        else if(doc)
                                        {
                                            if(doc._id == req.signedCookies.name)
                                            {
                                                doc.rank = i;
                                                lead.push(doc);
                                                res.render('leader', {lead: lead, name : req.signedCookies.name});
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
                    });
                    if(flag)
                    {
                        res.render('leader', {lead : lead, name : req.signedCookies.name});
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
    mongo.connect(uri, function(err, db){
        if(err)
        {
            console.log(err.message);
            res.redirect('/login');
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
                        res.redirect(ref[req.headers.referer.split('?')[1]] || '/play');
                    }
                    else
                    {
                        res.redirect('/login');
                    }
                }
            });
        }
    });
});
// POST register page
router.post('/register', function(req, res) {
    mongo.connect(uri, function(err, db){
        if(err)
        {
            console.log(err.message);
        }
        else
        {
            db.collection('users').count(function(err, num){
                if(err)
                {
                    console.log(err.message);
                }
                else
                {
                    console.log(num);
                    db.close(function(){
                        if (req.body.password === req.body.confirm)
                        {
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
                                    db.collection('users').insert(user, {w : 1}, function(err, docs){
                                        db.close();
                                        if(err)
                                        {
                                            console.log(err.message);
                                            res.render('register', {msg: "That username is already taken, please choose a different one"});
                                        }
                                        else
                                        {
                                            console.log(docs);
                                            res.cookie('name', docs[0]._id, {maxAge: 86400000, signed: true});
                                            res.redirect('/play');
                                        }
                                    });
                                }
                            });
                        }
                        else
                        {
                            console.log("Incorrect Password");
                            res.render('register', {msg: "Passwords do not match"});
                        }
                    });
                }
            });
        }
    });
});
// POST forgot password page
router.post('/forgot', function(req, res) {
    mongo.connect(uri, function(err, db){
        if(err)
        {
            console.log(err.message);
            res.render('home');
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
                    + "That really hurts us, so please click on http://" + req.headers.host + '/reset/' + token + " within sixty minutes of seeing this message in order to" +
                    ' reset your password.\nWe would love to have you back as a user.\n In the event that this password reset was not requested by you, please ignore this' +
                    ' message and your password shall remain intact.\n\nRegards, \nThe Sudoku Champs team.'
                };
                db.collection('users').findAndModify({email : req.body.email, _id : req.body.name}, [], {$set:{token : token, expire : Date.now() + 3600000}}, {}, function(err, doc){
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
            res.render('home');
        }
        else
        {
            if(req.body.password === req.body.confirm)
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
                        res.redirect('/forgot', {msg : "Incorrect details !"});
                    }
                    else
                    {
                        var options = {
                            to : doc.email,
                            subject : 'Password change successful !',
                            text : 'Hey there, ' + doc._id + ' we\'re just writing in to let you know that the recent password change for your account with Sudoku Champs was successful.' +
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
                                res.redirect('/login', {msg : "Congratulations ! Your Password change was successful !"});
                            }
                        });
                    }
                });
            }
            else
            {
                console.log("Passwords do not match !");
                res.redirect('/reset/' + req.params.token);
            }
        }
    });
});

module.exports = router;