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

var ref =
    {
        'GO': 'google',
        'TW': 'twitter',
        'FB': 'facebook'
    },
    path = require('path'),
    passport = require('passport'),
    email = require(path.join(__dirname, '..', 'database', 'email')),
    message = email.wrap({
        from: 'sudokuchampster@gmail.com',
        subject: 'Registration successful!'
    }),
    cook = function(req, res, next)
    {
        passport.authenticate(ref[req.originalUrl.slice(1, 3)], function(err, user)
        {
            if (err)
            {
                return next(err);
            }
            if (!user)
            {
                return res.redirect('/login');
            }
            else
            {
                res.cookie('user', user._id, {maxAge: 86400000, signed: true});
                message.header.to = user.email;
                message.attach_alternative("Hey there " + user._id + ",<br>Welcome to Sudoku Champs!<br><br>Regards,<br>The Sudoku champs team");
                email.send(message, function(err){
                    if(err)
                    {
                        console.error(err.message);
                    }

                    return res.redirect('/play');
                });
            }
        })(req, res, next);
    },
    router = require('express').Router();

require(path.join(__dirname, '..', 'database', 'auth'));

router.get('/auth/fb', passport.authenticate('facebook', {scope : 'email'}));

router.get('/auth/go', passport.authenticate('google', {
        scope :
        [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    }
));

router.get('/auth/tw', passport.authenticate('twitter', {scope: 'email'}));

router.get(/^\/FB|GO|TW$/, cook);

module.exports = router;
