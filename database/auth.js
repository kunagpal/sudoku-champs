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

var path = require('path'),
    passport = require('passport'),
    ref = {
        "production" : "http://sudokuchamps.herokuapp.com/",
        undefined : "http://localhost:3000/"
    },
    user = require(path.join(__dirname, 'user')),
    twitter = require('passport-twitter').Strategy,
    facebook = require('passport-facebook').Strategy,
    google = require('passport-google-oauth').OAuth2Strategy;

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

// used to deserialize the user
passport.deserializeUser(function (id, done) {
    mongoUsers.fetchUser({'_id' : id}, done);
});

passport.use(new facebook({
    clientID :  process.env.FB_ID,
    clientSecret : process.env.FB_KEY,
    callbackURL : ref[process.env.NODE_ENV] + 'FB'
    },
    function(token, refreshToken, profile, done) {
            process.nextTick(function() {
                user._id = profile.name.givenName + ' ' + profile.name.familyName;
                user.dob = new Date();
                user.token = token;
                user.email = profile.emails[0].value;
                db('users').findOneAndUpdate({ _id : profile.name.givenName + ' ' + profile.name.familyName }, {$setOnInsert : user}, {upsert : true}, function(err, doc) {
                    if (err)
                    {
                        console.log(err.message);
                    }
                    else
                    {
                        return done(null, doc || user);
                    }
                });
        });
    })
);

passport.use(new twitter({
    consumerKey : process.env.TW_ID,
    consumerSecret : process.env.TW_KEY,
    callbackURL : ref[process.env.NODE_ENV] + 'TW'
    },
    function(token, refreshToken, profile, done){
        process.nextTick(function() {
            user._id = profile.username;
            user.token = profile.token;
            db('users').findOneAndUpdate({ _id : profile.username }, {$setOnInsert : user}, {upsert : true}, function(err, doc) {
                if (err)
                {
                    console.log(err.message);
                }
                else
                {
                    return done(null, doc || user);
                }
            });
        });
    }
));

passport.use(new google({
        clientID : process.env.GO_ID,
        clientSecret : process.env.GO_KEY,
        callbackURL : ref[process.env.NODE_ENV] + 'GO'
    },
    function(accessToken, refreshSecret, profile, done){
        process.nextTick(function() {
            user._id = profile.id;
            user.dob = Date.now();
            db('users').findOneAndUpdate({ _id: profile.id }, {$setOnInsert : user}, {upsert : true}, function(err, doc) {
                if(err)
                {
                    console.log(err.message);
                }
                else
                {
                    done(null, doc || user);
                }
            });
        });
    }
));