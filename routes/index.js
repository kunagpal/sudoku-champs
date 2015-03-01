var i,
    lead,
    path = require('path'),
    crypto = require('crypto'),
    email = require('nodemailer'),
    bcrypt = require('bcrypt-nodejs'),
    router = require('express').Router(),
    mongo = require('mongodb').MongoClient,
    key = require(path.join(__dirname, '..', 'key')).password,
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
            var op = {dob : 0, hash : 0, email : 0, token : 0, expires : 0, form : 0, team_no : 0};
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
            db.collection('users').findOne({ token: req.params.token, expire: { $gt: Date.now() } }, function(err, user) {
                db.close();
                if(err)
                {
                    console.log(err.message);
                }
                else if (!user)
                {
                    return res.redirect('/forgot');
                }
                res.render('reset', {  user: req.user, title: 'Title' });
            });
        }
    });
   
});
// GET leaderboard
router.get('/leader', function(req, res) {
    i = 1;
    lead = [];
    flag = req.signedCookies.name ? false : true;
    console.log(req.signedCookies.name);
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
router.post('/login', function(req, res) {
    if (req.signedCookies.name)
    {
        res.clearCookie('name', { });
    }
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
            if (bcrypt.compareSync(req.body.password, doc['hash']))
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
router.post('/register', function(req, res) {
    users.getCount(function (err, number)
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
                var ob =
                {
                    _id : req.body.name,
                    dob : new Date(),
                    num : parseInt(number) + 1,
                    hash : bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
                    email : req.body.email,
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
            db.collection('users').findOne({email : req.body.email}, function(err, doc){
                if(err)
                {
                    console.log(err.message);
                }
                else if(!doc)
                {
                    console.log('Oh No !');
                    db.close();
                }
                else
                {
                    var smtpTransport = email.createTransport('SMTP', {
                        service: 'Gmail',
                        auth: {
                            user: 'sudokuchampster@gmail.com',
                            pass: process.env.PASSWORD || key
                        }
                    });
                    var token;
                    crypto.randomBytes(20, function(err, buf) {
                        token = buf.toString('hex');
                        var mailOptions = {
                            from: 'sudokuchampster@gmail.com',
                            subject: 'Time to get back in the game',
                            text: 'Hey there, ' + doc.email.split('@')[0] + '\n' + 'A little birdie told us that you were having troubles with your Sudoku champs password.\n'
                            + "That really hurts us, so please click on http://" + req.headers.host + '/reset/' + token + " in order to reset your password. We \n"
                            +  'would love to have you back as a user.\n In the event that this password reset was not requested by you,'
                            + ' please ignore this message and your password shall remain intact.\n\nRegards, The Sudoku Champs team.'
                        };
                        db.close(function(err){
                            if(err)
                            {
                                console.log(err.message);
                            }
                            else
                            {
                                mongo.connect(uri, function(err, db){
                                    if(err)
                                    {
                                        console.log(err.message);
                                    }
                                    else
                                    {
                                        db.collection('users').update({}, {$set : {token : token, expire : Date.now()}}, function (err, doc){
                                            db.close();
                                            if(err)
                                            {
                                                console.log(err.message);
                                            }
                                            else
                                            {
                                                console.log(doc);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                        mailOptions.to = doc.email;
                        smtpTransport.sendMail(mailOptions, function(err) {
                            console.log('okay');
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
    mongo.connect(uri, function(err, db){
        if(err)
        {
            throw err;
        }
        else
        {
            db.collection('users').findOne({ token: req.params.token, expire: { $gt: Date.now() } }, function(err, user) {
                 if(err)
                 {
                         console.log(err.message);
                 }
                 else if (!user)
                 {
                       db.close();
                       return res.redirect('back');
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
                                mongo.connect(uri, function(err, db){
                                   if(err)
                                   {
                                        console.log(err.message);
                                   }
                                   else
                                   {
                                       db.collection('users').update({_id : user._id},{$set : {hash : bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))}, $unset : {token : '', expire : ''}}, function(err){
                                          if(err)
                                          {
                                              console.log(err.message);
                                          }
                                          else
                                          {
                                              db.close(function(err) {
                                                  if (err)
                                                  {
                                                      console.log(err.message);
                                                  }
                                                  else
                                                  {
                                                      mailOptions.to = user.email;
                                                      mailOptions.subject = 'Password chage succeful !';
                                                      mailOptions.text = 'Hey there, ' + user.email.split('@')[0] + ' we\'re just writing in to let you know that the recent password change for your account with Sudoku Champs was successful.' +
                                                                         '\nRegards,\nThe Sudoku Champs team';
                                                      smtpTransport.sendMail(mailOptions, function(err) {
                                                          done(err);
                                                      });
                                                  }
                                              });
                                              console.log('Updated successfully!');
                                          }
                                       });
                                   }
                                });
                           }
                       });
                 }
            });
        }
    });
});

module.exports = router;