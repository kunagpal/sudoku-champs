// Created by Kunal Nagpal <kunagpal@gmail.com> on 28-02-2015.
var key,
    path = require('path'),
    passport = require('passport'),
    mongo = require('mongodb').MongoClient,
    user = require(path.join(__dirname, 'user')),
    github = require('passport-github2').Strategy,
    twitter = require('passport-twitter').Strategy,
    linkedin = require('passport-linkedin').Strategy,
    facebook = require('passport-facebook').Strategy,
    google = require('passport-google-oauth').OAuth2Strategy,
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
    callbackURL : 'https://sudokuchamps.herokuapp.com/FB'
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
    consumerKey : process.env.TW_ID || key.fb_id,
    consumerSecret : process.env.TW_KEY || key.fb_key,
    callbackURL : 'https://sudokuchamps.herokuapp.com/TW'
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
        clientID : process.env.GO_ID || key.go_id,
        clientSecret : process.env.GO_KEY || key.go_key,
        callbackURL : 'http://localhost:3000/GO'
    },
    function(accessToken, refreshSecret, profile, done){
        process.nextTick(function() {
            mongo.connect(uri, function(err, db){
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
passport.use(new github({
        clientID :  process.env.GI_ID ||  key.gi_id ,
        clientSecret :  process.env.GI_KEY || key.gi_key,
        callbackURL : 'http://127.0.0.1:3000/GI'
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
passport.use(new linkedin({
        consumerKey : process.env.LI_ID || key.li_id,
        consumerSecret : process.env.LI_KEY || key.li_key,
        callbackURL : 'http://127.0.0.1:3000/LI'
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
                    user._id = profile.displayName;
                    user.dob = Date.now();
                    db.collection('users').findOneAndUpdate({ _id: profile.displayName }, {$setOnInsert : user}, {upsert : true}, function (err, doc) {
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