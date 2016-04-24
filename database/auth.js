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

var key,
    user,
    path = require('path'),
    passport = require('passport'),
    record = require(path.join(__dirname, 'user')),
    email = require(path.join(__dirname, '..', 'database', 'email')),
    message = email.wrap({
        from: 'sudokuchampster@gmail.com',
        subject: 'Registration successful!'
    }),
    callback = function(token, refresh, profile, done)
    {
        process.nextTick(function() {
            user = record;
            user.token = token;
            user.dob = new Date();
            user.profile = profile.id;
            user.name = profile.displayName;
            user.strategy = profile.provider;
            user._id = profile.emails[0].value;

            db.findOneAndUpdate({_id: user._id, strategy: profile.provider}, {$setOnInsert: user}, {upsert: true}, function(err, doc)
            {
                if(err)
                {
                    console.error(err.message);
                    return done(err);
                }
                if(doc.value)
                {
                    return done(err, user);
                }

                message.header.to = user._id;
                message.attach_alternative("Hey there " + user.name + ",<br>Welcome to Sudoku Champs!<br><br>Regards,<br>The Sudoku champs team");
                email.send(message, function(err){
                    if(err)
                    {
                        console.error(err.message);
                    }

                    return done(null, user);
                });
            });
        });
    },
    ref =
    {
        undefined: "http://localhost:3000/",
        production: "http://sudokuchamps.herokuapp.com/"
    },
    facebook = require('passport-facebook').Strategy,
    google = require('passport-google-oauth').OAuth2Strategy,
    strategies =
    {
        GO: google,
        FB: facebook
    };

for(key in strategies)
{
	if(strategies.hasOwnProperty(key))
	{
		passport.use(new strategies[key]({
			enableProof: true,
			clientID: process.env[`${key}_ID`],
			clientSecret: process.env[`${key}_KEY`],
			callbackURL: ref[process.env.NODE_ENV] + key,
			profileFields: ['id', 'email', 'displayName']
		  }, callback
		));
	}
}