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
    lead,
    flag,
    token,
    message,
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
    },
    path = require('path'),
    crypto = require('crypto'),
	bcrypt = require('bcrypt'),
    router = require('express').Router(),
    slice = {_id:0, name: 1, points: 1, played: 1, streak: 1},
    user = require(path.join(__dirname, '..', 'database', 'user')),
    email = require(path.join(__dirname, '..', 'database', 'email')),
    frame = {sort: [['points', -1], ['played' , 1], ['streak' , -1]]};

message = email.wrap({from : 'sudokuchampster@gmail.com'});

router.get('/', function(req, res){
    if(req.signedCookies.user)
    {
        return res.redirect('/home');
    }

    res.render('index', {token: req.csrfToken()});
});

// POST login page
router.post('/login', function(req, res){
    res.clearCookie('user', {});

    db.find({_id: req.body.email, $or: [{strategy: 'local'}, {strategy: 'admin'}]}).limit(1).next(function(err, doc){
        if(err || !doc)
        {
            res.flash('Incorrect credentials!');
            return res.redirect('/');
        }

        bcrypt.compare(req.body.password, doc.hash, function(err, result){
            if(err)
            {
                res.flash('Unexpected error occurred, please re-try.');
                return res.redirect('/');
            }
            if(!result)
            {
                res.flash('Incorrect credentials!');
                return res.redirect('/');
            }

            res.cookie(doc.strategy === 'local' ? 'user' : 'admin', doc.name, {signed: true});
            res.redirect('/home');
        });
    });
});

// POST register page
router.post('/register', function(req, res) {
    if(req.body.password === req.body.confirm)
    {
        user.dob = new Date();
        user.strategy = 'local';
        user._id = req.body.email;
        user.name = user._id.split('@')[0].trim();

        bcrypt.hash(req.body.password, 10, function(err, hash){
            if(err)
            {
                res.flash('An unexpected error occurred, please re-try.');
                return res.redirect('/');
            }

            user.hash = hash;

            db.insertOne(user, {w : 1}, function(err){
                if(err)
                {
                    res.flash('That username is already taken, please choose a different one.');
                    return res.redirect('/');
                }

                res.cookie('user', user.name, {maxAge: 86400000, signed: true});
                message.header.to = user.email;
                message.header.subject = "Registration successful!";

                message.attach_alternative("Hey there " + user.name + ",<br>Welcome to Sudoku Champs!<br><br>Regards,<br>The Sudoku champs team");
                email.send(message, function(err){
                    if(err)
                    {
                        console.error(err.message);
                    }

                    res.redirect('/home');
                });
            });
        });
    }
    else
    {
        res.flash('Passwords do not match!');
        res.redirect('/');
    }
});

// GET leaderboard page
router.get('/leader', function(req, res){
    res.render('leader');
});

router.get('/leaderboard', function(req, res){
    lead = [];
    flag = !req.signedCookies.user;
    db.find({}, slice, frame).toArray(function(err, docs){
        if(err)
        {
            console.error(err.message);
            return res.redirect('/home');
        }

        for(j = 0; j < docs.length; ++j)
        {
			flag |= docs[i]._id === req.signedCookies.user;

			if (j < 5 || flag)
			{
				lead.push(docs[i]);
			}
			if (flag && lead.length > 4)
			{
				lead[lead.length - 1].rank = j + 1;
				break;
			}
        }

        res.json(lead);
    });
});

// POST forgot password page
router.post('/forgot', function(req, res) {
    crypto.randomBytes(20, function(err, buf) {
        if(err)
        {
            res.flash('An unexpected error had occurred, please retry.');
            return res.redirect('/forgot/password');
        }

        token = buf.toString('hex');
        db.findOneAndUpdate({_id: req.body.email, strategy: 'local'}, {$set: {token: token, expire: Date.now() + 3600000}}, function(err, doc){
            if(err)
            {
                res.flash('An unexpected error has occurred. Please retry.');
                return res.redirect('/forgot');
            }
            if(!doc.value)
            {
                res.flash('No matches found!');
                return res.redirect('/forgot');
            }

            message.header.to = doc.value._id;
            message.header.subject = 'Time to get back in the game';
            message.attach_alternative("Hey there, " + doc.value.name + ".<br>A little birdie told us that you were having troubles with your Sudoku champs password.<br>" +
            "That really hurts us, so please click <a href='http://" + req.headers.host + "/reset/" + token + "'>here</a> within sixty minutes of seeing this message in order to" +
            " reset your password.<br>We would love to have you back as a user.<br> In the event that this password reset was not requested by you, please ignore this" +
            " message and your password shall remain intact.<br>Regards,<br>The Sudoku Champs team.");

            email.send(message, function(err){
                if(err)
                {
                    console.error(err.message);
                }

                res.flash(err ? 'Email sending error...' : 'An email has been sent to ' + req.body.email + ' with further instructions.');
                res.redirect('/');
            });
        });
    });
});

// GET reset token page
router.get('/reset/:token', function(req, res){
    db.find({token: req.params.token, expire: {$gt: Date.now()}}).limit(1).next(function(err, doc){
        if (err || !doc)
        {
            res.flash('No matches found!');
            return res.redirect('/forgot');
        }

        res.render('reset', {token: req.csrfToken(), msg: res.flash()});
    });
});

// POST reset token page
router.post('/reset/:token', function(req, res){
    if (req.body.password !== req.body.confirm)
    {
        res.flash('Passwords do not match!');
        return res.render('reset', {token: req.csrfToken()});
    }

    var query =
    {
        token: req.params.token,
        expire:
        {
            $gt: Date.now()
        }
    };

    bcrypt.hash(req.body.password, 10, function(err, hash){
        if(err)
        {
            res.flash('An unexpected error has occured, please re-try.');
            return res.redirect('/reset/' + req.params,token);
        }

        op.$set.hash = hash;

        db.findOneAndUpdate(query, op, function(err, doc){
            if(err || !doc.value)
            {
                console.error(err.message);
                res.flash('This password reset link is either invalid or has expired. Please retry.');
                return res.redirect('/forgot');
            }

            message.header.to = doc.value.email;
            message.header.subject = 'Password change successful!';
            message.attach_alternative("Hey there," + doc.value.name + ".<br>We're just writing in to let you "
                + "know that the recent password change for your account with Sudoku Champs was successful." +
                "<br><br>Regards,<br>The Sudoku Champs team.");

            email.send(message, function(err){
                if(err)
                {
                    console.error(err.message);
                }

                res.flash(err ? 'Email send failure' : 'Updated successfully!');
                res.redirect('/');
            });
        });
    });
});

router.get('/admin', function(req, res){
    if(req.signedCookies.admin || !process.env.NODE_ENV)
    {
        return res.render('admin');
    }

    res.redirect('/');
});

router.get('/administrator', function(req, res){
	if(req.signedCookies.admin)
	{
		db.count(function(err, doc){
			if(err || !doc)
			{
				res.end();
			}

		  	res.json({});
		});
	}
  	else
	{
		res.redirect('/');
	}
});

module.exports = router;