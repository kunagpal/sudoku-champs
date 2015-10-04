// Created by Kunal Nagpal <kunagpal@gmail.com> on 28-02-2015.
var path = require('path'),
    passport = require('passport'),
    user = require(path.join(__dirname, 'user')),
    mongo = require('mongodb').MongoClient.connect,
    twitter = require('passport-twitter').Strategy,
    facebook = require('passport-facebook').Strategy,
    google = require('passport-google-oauth').OAuth2Strategy,
    uri = process.env.MONGO || 'mongodb://127.0.0.1:27017/project';

passport.use(new facebook({
    clientID :  process.env.FB_ID,
    clientSecret : process.env.FB_KEY,
    callbackURL : 'https://sudokuchamps.herokuapp.com/FB'
    },
    function(token, refreshToken, profile, done) {
            process.nextTick(function() {
                mongo(uri, function(err, db){
                    if(err)
                    {
                        console.log(err.message);
                    }
                    else
                    {
                        user._id = profile.name.givenName + ' ' + profile.name.familyName;
                        user.dob = new Date();
                        user.token = token;
                        user.email = profile.emails[0].value;
                        db.collection('users').findOneAndUpdate({ _id : profile.name.givenName + ' ' + profile.name.familyName }, {$setOnInsert : user}, {upsert : true}, function(err, doc) {
                            db.close();
                            if (err)
                            {
                                console.log(err.message);
                            }
                            else if (doc)
                            {
                                return done(null, doc);
                            }
                        });
                    }
                });
        });
    })
);
passport.use(new twitter({
    consumerKey : process.env.TW_ID,
    consumerSecret : process.env.TW_KEY,
    callbackURL : 'https://sudokuchamps.herokuapp.com/TW'
    },
    function(token, refreshToken, profile, done){
        process.nextTick(function() {
            mongo(uri, function(err, db){
                if(err)
                {
                    console.log(err.message);
                }
                else
                {
                    user._id = profile.username;
                    user.token = profile.token;
                    db.collection('users').findOneAndUpdate({ _id : profile.username }, {$setOnInsert : user}, {upsert : true}, function(err, doc) {
                        db.close();
                        if (err)
                        {
                            console.log(err.message);
                        }
                        else
                        {
                            return done(null, doc ? doc : user);
                        }
                    });
                }
            });
        });
    }
));
passport.use(new google({
        clientID : process.env.GO_ID,
        clientSecret : process.env.GO_KEY,
        callbackURL : 'http://localhost:3000/GO'
    },
    function(accessToken, refreshSecret, profile, done){
        process.nextTick(function() {
            mongo(uri, function(err, db){
                if(err)
                {
                    console.log(err.message);
                }
                else
                {
                    user._id = profile.id;
                    user.dob = Date.now();
                    db.collection('users').findOneAndUpdate({ _id: profile.id }, {$setOnInsert : user}, {upsert : true}, function(err, doc) {
                        db.close();
                        if(err)
                        {
                            console.log(err.message);
                        }
                        else
                        {
                            done(null, doc ? doc : user);
                        }
                    });
                }
            });
        });
    }
));