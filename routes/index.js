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
    bcrypt = require('bcryptjs');
}

router.get('/', function(req, res) {
    res.render('index', {head: head, foot: foot});
});

// GET leaderboard
router.get('/leader', function(req, res) {
    i = 0;
    lead = [{}];
    flag = !req.signedCookies.name;
    db.find({}, op, frame).toArray(function(err, docs) {
        if(err)
        {
            console.log(err.message);
            res.redirect('/game');
        }
        else
        {
            for(j = 0; j < docs.length; ++j)
            {
                if(docs[j]._id === req.signedCookies.name)
                {
                    flag = true;
                    docs[j].rank = parseInt(j) + 1;
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

            res.render('leader', {lead : lead, head: head, foot: foot});
        }
    });
});

// POST login page
router.post('/login', function(req, res) {
    res.clearCookie('user', {});

    db.find({_id : req.body.name}, {}, {'limit' : 1}).next(function(err, doc){
        if(err || !doc)
        {
            req.flash('err', 'Incorrect credentials!');
            res.redirect('/login');
        }
        else
        {
            if (bcrypt.compareSync(req.body.password, doc.hash))
            {
                temp = req.session.route;
                delete req.session.route;
                res.cookie('user', req.body.name, {maxAge: 86400000, signed: true});
                res.cookie('best', doc.best, {maxAge: 86400000, signed: true});
                res.cookie('worst', doc.worst, {maxAge: 86400000, signed: true});
                res.redirect(ref[temp] || '/play');
            }
            else
            {
                req.flash('err', 'Incorrect credentials!');
                req.flash('name', req.body.name);
                res.redirect('/login');
            }
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
                console.log(err.message);
                req.flash('err', 'An unexpected error has occurred. Please retry.');
                res.redirect('/register');
            }
            else
            {
                user._id = req.body.name;
                user.dob = new Date();
                user.num = parseInt(num) + 1;
                user.hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
                user.email = req.body.email;
                user.strategy = 'local';

                db.insertOne(user, {w : 1}, function(err){
                    if(err)
                    {
                        console.log(err.message);
                        req.flash('err', 'That username is already taken, please choose a different one.');
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
                                console.log(err.message);
                            }

                            res.redirect('/play');
                        });
                    }
                });
            }
        });
    }
    else
    {
        req.flash('info', 'Passwords do not match!');
        req.flash('name', req.body.name);
        req.flash('email', req.body.email);
        res.redirect('/register');
    }
});

// POST forgot password page
router.post('/forgot', function(req, res) {
    crypto.randomBytes(20, function(err, buf) {
        token = buf.toString('hex');
        message.header.subject = 'Time to get back in the game';
        message.attach_alternative("Hey there, " + req.body.name + ".<br>A little birdie told us that you were having troubles with your Sudoku champs password.<br>" +
            "That really hurts us, so please click <a href='http://" + req.headers.host + "/reset/" + token + "'>here</a> within sixty minutes of seeing this message in order to" +
            " reset your password.<br>We would love to have you back as a user.<br> In the event that this password reset was not requested by you, please ignore this" +
            " message and your password shall remain intact.<br>Regards,<br>The Sudoku Champs team.");

        db.updateOne({email : req.body.email, _id : req.body.name, strategy : 'local'}, {$set:{token : token, expire : Date.now() + 3600000}}, function(err, doc){
            if(err)
            {
                console.log(err.message);
                req.flash('err', 'An unexpected error has occurred. Please retry.');
                res.redirect('/forgot');
            }
            else if(!doc)
            {
                req.flash('info', 'No matches found!');
                res.redirect('/forgot');
            }
            else
            {
                message.header.to = req.body.email;
                email.send(message, function(err) {
                    if(err)
                    {
                        console.log(err.message);
                    }

                    req.flash(err ? 'err' : 'info', err ? 'Email sending error...' : 'An email has been sent to ' + req.body.email + ' with further instructions.');
                    res.redirect('/login');
                });
            }
        });
    });
});

// GET reset token page
router.get('/reset/:token', function(req, res) {
    db.find({token: req.params.token, expire: {$gt: Date.now()}}, {limit : 1}).next(function(err, doc) {
        if (err || !doc)
        {
            req.flash('err', 'No matches found!');
            res.redirect('/forgot');
        }
        else
        {
            res.render('reset', {token: req.csrfToken(), flash: req.flash(), head: head, foot: foot});
        }
    });
});

// POST reset token page
router.post('/reset/:token', function(req, res) {
    if(req.body.password === req.body.confirm)
    {
        var query =
        {
            token : req.params.token,
            expire :
            {
                $gt: Date.now()
            }
        },
        op =
        {
            $set :
            {
                hash : bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
            },
            $unset :
            {
                token : '',
                expire : ''
            }
        };

        db.findOneAndUpdate(query, op, function(err, doc) {
            if(err || !doc)
            {
                console.log(err.message);
                req.flash('err', 'This password reset link is either invalid or has expired. Please retry.');
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
                email.send(message, function(err) {
                    if(err)
                    {
                        console.log(err.message);
                    }

                    req.flash(err ? 'err' : 'info', err ? 'Email send failure' : 'Updated successfully!');
                    res.redirect('/login');
                });
            }
        });
    }
    else
    {
        req.flash('info', 'Passwords do not match!');
        res.render('reset', {token: req.csrfToken(), head: head, foot: foot});
    }
});

router.get('/check/:query', function(req, res) {
    db.find({_id : req.params.query}, function(err, doc){
        if(err)
        {
            console.log(err.message);
        }
        else
        {
            res.send(+!doc);
        }
    });
});

module.exports = router;