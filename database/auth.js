// Created by Kunal Nagpal <kunagpal@gmail.com> on 28-02-2015.
var path = require('path'),
    passport = require('passport'),
    mongo = require('mongodb').MongoClient,
    user = require(path.join(__dirname, 'user')),
    github = require('passport-github').Strategy,
    google = require('passport-google').Strategy,
    twitter = require('passport-twitter').Strategy,
    linkedin = require('passport-linkedin').Strategy,
    facebook = require('passport-facebook').Strategy,
    key = require(path.join(__dirname, '..', 'key')),
    uri = process.env.MONGO || 'mongodb://127.0.0.1:27017/project';

passport.use(new facebook({
    clientID : key.fb_id || process.env.FB_ID,
    clientSecret : key.fb_key || process.env.FB_KEY,
    callbackURL : 'https://127.0.0.1:3000/FB'
    },
    function(token, refreshToken, profile, done) {
            process.nextTick(function() {
                mongo.connect(uri, function(err, db){
                    if(err)
                    {
                        console.log(err.message);
                    }
                    else
                    {
                        db.collection('users').findOne({ _id : profile.name.givenName + ' ' + profile.name.familyName }, function(err, doc) {
                            db.close();
                            if (err)
                            {
                                console.log(err.message);
                            }
                            else if (doc)
                            {
                                return done(null, doc);
                            }
                            else
                            {
                                user._id = profile.name.givenName + ' ' + profile.name.familyName;
                                user.dob = new Date();
                                user.token = token;
                                user.email = profile.emails[0].value;
                                user.save(function(err) {
                                    if (err)
                                    {
                                        throw err;
                                    }
                                    return done(null, user);
                                });
                            }
                        });
                    }
                });
        });
    })
);
passport.use(new twitter({
    consumerKey : key.fb_id || process.env.TW_ID,
    consumerSecret : key.fb_key || process.env.TW_KEY,
    callbackURL : 'https://127.0.0.1:3000/TW'
    },
    function(token, refreshToken, profile, done){
        process.nextTick(function() {
            mongo.connect(uri, function(err, db){
                if(err)
                {
                    console.log(err.message);
                }
                else
                {
                    db.collection('users').findOne({ _id : profile.username }, function(err, doc) {
                        db.close();
                        if (err)
                        {
                            console.log(err.message);
                        }
                        else if (doc)
                        {
                            return done(null, doc);
                        }
                        else
                        {
                            user._id = profile.username;
                            user.token = profile.token;
                            user.save(function(err) {
                                if (err)
                                {
                                    throw err;
                                }
                                return done(null, user);
                            });
                        }
                    });
                }
            });
        });
    }
));
passport.use(new google({
        realm : key.go_id || process.env.GO_ID,
        returnURL : 'https://127.0.0.1:3000/GO'
    },
    function(accessToken, refreshToken, profile, done){
        process.nextTick(function() {
            mongo.connect(uri, function(err, db){
                if(err)
                {
                    console.log(err.message);
                }
                else
                {
                    db.collection('users').findOne({ _id: profile.displayName }, function(err, doc) {
                        db.close();
                        if(err)
                        {
                            console.log(err.message);
                        }
                        else if (doc)
                        {
                            done(null, doc);
                        }
                        else
                        {
                            user._id = profile.displayName;
                            user.dob = Date.now();
                            user.save(function(err) {
                                if(err)
                                {
                                    console.log(err.message);
                                }
                                else
                                {
                                    console.log("saving user ...");
                                    done(null, user);
                                }
                            });
                        }
                    });
                }
            });
        });
    }
));
passport.use(new github({
        clientID : key.gi_id || process.env.GI_ID,
        clientSecret : key.gi_key || process.env.GI_KEY,
        callbackURL : 'https://127.0.0.1:3000/GI'
    },
    function(accessToken, refreshToken, profile, done){
        process.nextTick(function() {
            mongo.connect(uri, function(err, db){
                if(err)
                {
                    console.log(err.message);
                }
                else
                {
                    db.collection('users').findOne({ _id: profile.displayName }, function(err, doc) {
                        db.close();
                        if(err)
                        {
                            console.log(err.message);
                        }
                        else if (doc)
                        {
                            done(null, doc);
                        }
                        else
                        {
                            user._id = profile.displayName;
                            user.dob = Date.now();
                            user.save(function(err) {
                                if(err)
                                {
                                    console.log(err.message);
                                }
                                else
                                {
                                    console.log("saving user ...");
                                    done(null, user);
                                }
                            });
                        }
                    });
                }
            });
        });
    }
));
passport.use(new linkedin({
        consumerKey : key.li_id || process.env.LI_ID,
        consumerSecret : key.li_key || process.env.LI_KEY,
        callbackURL : 'https://127.0.0.1:3000/LI'
    },
    function(token, tokenSecret, profile, done){
        process.nextTick(function() {
            mongo.connect(uri, function(err, db){
                if(err)
                {
                    console.log(err.message);
                }
                else
                {
                    db.collection('users').find({ _id: profile.displayName }, function (err, doc) {
                        db.close();
                        if(err)
                        {
                            console.log(err.message);
                        }
                        else if (doc)
                        {
                            done(null, doc);
                        }
                        else
                        {
                            user._id = profile.displayName;
                            user.dob = Date.now();
                            user.save(function(err) {
                                if(err)
                                {
                                    console.log(err.message);
                                }
                                else
                                {
                                    done(null, user);
                                }
                            });
                        }
                    });
                }
            });
        });
    }
));