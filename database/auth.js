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

var user,
    path = require('path'),
    passport = require('passport'),
    callback = function(token, refresh, profile, done)
    {
        process.nextTick(function() {
            user = record;
            user.token = token;
            user.dob = new Date();
            user.profile = profile.id;
            user._id = profile.displayName;
            user.strategy = profile.provider;

            if(profile.provider !== 'twitter')
            {
                user.email = profile.emails[0].value;
            }

            db.findOneAndUpdate({_id: profile.displayName, strategy: profile.provider}, {$setOnInsert : user}, {upsert : true}, function(err, doc)
            {
                return done(err, ((doc || {}).value || {})._id || user._id);
            });
        });
    },
    ref =
    {
        undefined : "http://localhost:3000/",
        "production" : "http://sudokuchamps.herokuapp.com/"
    },
    record = require(path.join(__dirname, 'user')),
    twitter = require('passport-twitter').Strategy,
    facebook = require('passport-facebook').Strategy,
    google = require('passport-google-oauth').OAuth2Strategy;

passport.use(new facebook({
        clientID :  process.env.FB_ID,
        clientSecret : process.env.FB_KEY,
        callbackURL : ref[process.env.NODE_ENV] + 'FB'
    }, callback
));

passport.use(new twitter({
        consumerKey : process.env.TW_ID,
        consumerSecret : process.env.TW_KEY,
        callbackURL : ref[process.env.NODE_ENV] + 'TW'
    }, callback
));

passport.use(new google({
        clientID : process.env.GO_ID,
        clientSecret : process.env.GO_KEY,
        callbackURL : ref[process.env.NODE_ENV] + 'GO'
    }, callback
));