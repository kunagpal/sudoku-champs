/**
 * Created by Kunal Nagpal on 28-02-2015.
 */
var passport = require('passport'),
    mongo = require('mongodb').MongoClient,
    github = require('passport-github').Strategy,
    google = require('passport-google').Strategy,
    twitter = require('passport-twitter').Strategy,
    linkedin = require('passport-linkedin').Strategy,
    facebook = require('passport-facebook').Strategy,
    uri = process.env.MONGO || 'mongodb://127.0.0.1:27017/project';

    passport.use(new facebook({
    clientID : 'clientID',
    clientSecret : 'clientSecret',
    callbackURL : 'callbackURL'
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
                        db.collection('users').findOne({ 'facebook.id' : profile.id }, function(err, doc) {
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
                                var newUser            = new User();
                                newUser.facebook.id    = profile.id;
                                newUser.facebook.token = token;
                                newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                                newUser.facebook.email = profile.emails[0].value;
                                newUser.save(function(err) {
                                    if (err)
                                    {
                                        throw err;
                                    }
                                    return done(null, newUser);
                                });
                            }
                            db.close();
                        });
                    }
                });

        });
    })
);
passport.use(new twitter({
    consumerKey : 'consumerKey',
    consumerSecret : 'consumerSecret',
    callbackURL : 'callbackURL'
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
                    db.collection('users').findOne({ 'twitter.id' : profile.id }, function(err, doc) {
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
                            var newUser                 = new User();
                            newUser.twitter.id          = profile.id;
                            newUser.twitter.token       = token;
                            newUser.twitter.username    = profile.username;
                            newUser.twitter.displayName = profile.displayName;
                            newUser.save(function(err) {
                                if (err)
                                {
                                    throw err;
                                }
                                return done(null, newUser);
                            });
                        }
                        db.close();
                    });
                }
            });
        });
    }
));
passport.use(new google({
        realm : 'realm',
        returnURL : 'returnURL'
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
                    db.collection('users').findOne({ oauthID: profile.id }, function(err, doc) {
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
                            var user = new User({
                                oauthID: profile.id,
                                name: profile.displayName,
                                created: Date.now()
                            });
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
                        db.close();
                    });
                }
            });
        });
    }
));
passport.use(new github({
        clientID : 'clientID',
        clientSecret : 'clientSecret',
        callbackURL : 'callbackURL'
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
                    db.collection('users').findOne({ oauthID: profile.id }, function(err, doc) {
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
                            var user = new User({
                                oauthID: profile.id,
                                name: profile.displayName,
                                created: Date.now()
                            });
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
                        db.close();
                    });
                }
            });
        });
    }
));
passport.use(new linkedin({
        consumerKey : 'consumerKey',
        consumerSecret : 'consumerSecret',
        callbackURL : 'callbackURL'
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
                    db.collection('users').findOrCreate({ linkedinId: profile.id }, function (err, doc) {
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
                            var user = new User({
                                oauthID: profile.id,
                                name: profile.displayName,
                                created: Date.now()
                            });
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
                        db.close();
                    });
                }
            });
        });
    }
));
