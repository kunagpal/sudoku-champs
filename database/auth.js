// Created by Kunal Nagpal <kunagpal@gmail.com> on 28-02-2015.
var key,
    path = require('path'),
    passport = require('passport'),
    mongo = require('mongodb').MongoClient,
    user = require(path.join(__dirname, 'user')),
    github = require('passport-github').Strategy,
    google = require('passport-google').Strategy,
    twitter = require('passport-twitter').Strategy,
    linkedin = require('passport-linkedin').Strategy,
    facebook = require('passport-facebook').Strategy,
    uri = process.env.MONGO || 'mongodb://127.0.0.1:27017/project';

try{
    key = require(path.join(__dirname, '..', 'key'));
}
catch(err){
    console.log(err.message);
    key = {
        fb_id : 0,
        fb_key: 0,
        gi_id : 0,
        gi_key: 0,
        tw_id : 0,
        tw_key: 0,
        li_id : 0,
        li_key: 0,
        go_id : 0,
        go_key: 0
    }
}

passport.use(new facebook({
    clientID :  process.env.FB_ID || key.fb_id,
    clientSecret : process.env.FB_KEY || key.fb_key,
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
    consumerKey : process.env.TW_ID || key.fb_id,
    consumerSecret : process.env.TW_KEY || key.fb_key,
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
        realm : process.env.GO_ID || key.go_id,
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
        clientID :  process.env.GI_ID ||  key.gi_id ,
        clientSecret :  process.env.GI_KEY || key.gi_key,
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
        consumerKey : process.env.LI_ID || key.li_id,
        consumerSecret : process.env.LI_KEY || key.li_key,
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