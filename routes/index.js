/*
 *  Sudoku Champs <sudokuchampster@gmail.com>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var i,
    j,
    temp,
    lead,
    flag,
    token,
    bcrypt,
    ref =
    [
        '/h2h',
        '/solo',
        '/practice',
        '/challenge',
        '/stats'
    ],
    message,
    path = require('path'),
    crypto = require('crypto'),
    router = require('express').Router(),
    op = {'_id' : 1, 'points' : 1, 'played' : 1, 'streak' : 1},
    user = require(path.join(__dirname, '..', 'database', 'user')),
    email = require(path.join(__dirname, '..', 'database', 'email')),
    frame = {'sort' : [['points', -1], ['played' , 1], ['streak' , -1]]};

message = email.wrap({from : 'sudokuchampster@gmail.com'});

try
{
    bcrypt = require('bcrypt');
}
catch(err)
{
    try
    {
        bcrypt = require('bcryptjs');
    }
    catch(err)
    {
        throw 'Failure to compile run time requirement Bcrypt(js)';
    }
}

router.get('/', function(req, res){
    res.render('index');
});

// GET leaderboard
router.get('/leader', function(req, res){
    i = 0;
    lead = [{}];
    flag = !req.signedCookies.name;
    db.find({}, op, frame).toArray(function(err, docs){
        if(err)
        {
            console.error(err.message);
            res.redirect('/game');
        }
        else
        {
            for(j = 0; j < docs.length; ++j)
            {
                if(docs[j]._id === req.signedCookies.name)
                {
                    flag = true;
                    docs[j].rank = parseInt(j, 10) + 1;
                    lead.push(docs[j]);
                }
                else if(lead.length < 6)
                {
                    lead.push(docs[j]);
                }
                else if(flag)
                {
                    break;
                }
            }

            res.render('leader', {lead: lead, head: head, foot: foot});
        }
    });
});

// POST login page
router.post('/login', function(req, res){
    res.clearCookie('user', {});

    db.find({_id : req.body.name, $or: [{strategy: 'local'}, {strategy: 'admin'}]}, {}, {'limit' : 1}).next(function(err, doc){
        if(err || !doc)
        {
            req.flash('Incorrect credentials!');
            res.redirect('/login');
        }
        else
        {
            bcrypt.compare(req.body.password, doc.hash, function(err, result){
                if(err)
                {
                    req.flash('Unexpected error occurred, please re-try.');
                    res.redirect('/login');
                }
                else if(result)
                {
                    temp = req.session.route;
                    delete req.session.route;
                    res.cookie(doc.strategy === 'local' ? 'user' : 'admin', req.body.name, {maxAge: 86400000, signed: true});
                    if(doc.strategy === 'local')
                    {
                        res.cookie('best', doc.best, {maxAge: 86400000, signed: true});
                        res.cookie('worst', doc.worst, {maxAge: 86400000, signed: true});
                    }
                    res.redirect(ref[temp] || '/play');
                }
                else
                {
                    req.flash('Incorrect credentials!');
                    res.redirect('/login');
                }
            });
        }
    });
});

// POST register page
router.post('/register', function(req, res) {
    if(req.body.password === req.body.confirm)
    {
        db.count(function(err, num){
            if(err)
            {
                console.error(err.message);
                req.flash('An unexpected error has occurred. Please retry.');
                res.redirect('/register');
            }
            else
            {
                user._id = req.body.name;
                user.dob = new Date();
                user.num = parseInt(num, 10) + 1;
                user.email = req.body.email;
                user.strategy = 'local';

                bcrypt.hash(req.body.password, 10, function(err, hash){
                    if(err)
                    {
                        req.flash('An unexpected error occurred, please re-try.');
                        res.redirect('/register');
                    }
                    else
                    {
                        user.hash = hash;
                        db.insertOne(user, {w : 1}, function(err){
                            if(err)
                            {
                                console.error(err.message);
                                req.flash('That username is already taken, please choose a different one.');
                                res.redirect('/register');
                            }
                            else
                            {
                                res.cookie('user', user._id, {maxAge: 86400000, signed: true});
                                res.cookie('best', user.best, {maxAge: 86400000, signed: true});
                                res.cookie('worst', user.worst, {maxAge: 86400000, signed: true});

                                message.header.to = user.email;
                                message.header.subject = "Registration successful!";

                                message.attach_alternative("Hey there " + user._id + ",<br>Welcome to Sudoku Champs!<br><br>Regards,<br>The Sudoku champs team");
                                email.send(message, function(err){
                                    if(err)
                                    {
                                        console.error(err.message);
                                    }

                                    res.redirect('/play');
                                });
                            }
                        });
                    }
                });
            }
        });
    }
    else
    {
        req.flash('Passwords do not match!');
        res.redirect('/register');
    }
});

// POST forgot password page
router.post('/forgot', function(req, res) {
    crypto.randomBytes(20, function(err, buf) {
        if(err)
        {
            req.flash('An unexpected error had occurred, please retry.');
            res.redirect('/forgot/password');
        }

        token = buf.toString('hex');
        message.header.subject = 'Time to get back in the game';
        message.attach_alternative("Hey there, " + req.body.name + ".<br>A little birdie told us that you were having troubles with your Sudoku champs password.<br>" +
            "That really hurts us, so please click <a href='http://" + req.headers.host + "/reset/" + token + "'>here</a> within sixty minutes of seeing this message in order to" +
            " reset your password.<br>We would love to have you back as a user.<br> In the event that this password reset was not requested by you, please ignore this" +
            " message and your password shall remain intact.<br>Regards,<br>The Sudoku Champs team.");

        db.updateOne({email : req.body.email, _id : req.body.name, strategy : 'local'}, {$set:{token : token, expire : Date.now() + 3600000}}, function(err, doc){
            if(err)
            {
                console.error(err.message);
                req.flash('An unexpected error has occurred. Please retry.');
                res.redirect('/forgot');
            }
            else if(!doc)
            {
                req.flash('No matches found!');
                res.redirect('/forgot');
            }
            else
            {
                message.header.to = req.body.email;
                email.send(message, function(err){
                    if(err)
                    {
                        console.error(err.message);
                    }

                    req.flash(err ? 'Email sending error...' : 'An email has been sent to ' + req.body.email + ' with further instructions.');
                    res.redirect('/login');
                });
            }
        });
    });
});

// GET reset token page
router.get('/reset/:token', function(req, res){
    db.find({token: req.params.token, expire: {$gt: Date.now()}}, {limit : 1}).next(function(err, doc){
        if (err || !doc)
        {
            req.flash('No matches found!');
            res.redirect('/forgot');
        }
        else
        {
            res.render('reset', {token: req.csrfToken(), msg: req.flash(), head: head, foot: foot});
        }
    });
});

// POST reset token page
router.post('/reset/:token', function(req, res){
    if(req.body.password === req.body.confirm)
    {
        var query =
        {
            token: req.params.token,
            expire:
            {
                $gt: Date.now()
            }
        },
        op =
        {
            $set:
            {
                hash: ''
            },
            $unset:
            {
                token: '',
                expire: ''
            }
        };

        bcrypt.hash(req.body.password, 10, function(err, hash){
            if(err)
            {
                req.flash('An unexpected error has occured, please re-try.');
                res.redirect('/reset/' + req.params,token);
            }
            else
            {
                op.$set.hash = hash;

                db.findOneAndUpdate(query, op, function(err, doc){
                    if(err || !doc)
                    {
                        console.error(err.message);
                        req.flash('This password reset link is either invalid or has expired. Please retry.');
                        res.redirect('/forgot');
                    }
                    else
                    {
                        message.header.to = doc.value.email;
                        console.log(doc.value.email);
                        message.header.subject = 'Password change successful!';
                        message.attach_alternative("Hey there," + doc.value._id + ".<br>We're just writing in to let you "
                            + "know that the recent password change for your account with Sudoku Champs was successful." +
                            "<br><br>Regards,<br>The Sudoku Champs team.");
                        email.send(message, function(err){
                            if(err)
                            {
                                console.error(err.message);
                            }

                            req.flash(err ? 'Email send failure' : 'Updated successfully!');
                            res.redirect('/login');
                        });
                    }
                });
            }
        });
    }
    else
    {
        req.flash('Passwords do not match!');
        res.render('reset', {token: req.csrfToken(), head: head, foot: foot});
    }
});

router.get('/admin', function(req, res){
    if(req.signedCookies.admin || !process.env.NODE_ENV)
    {
        res.render('admin');
    }
    else
    {
        res.redirect('/login');
    }
});

module.exports = router;
