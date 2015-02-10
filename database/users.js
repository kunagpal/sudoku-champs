/**
 * Created by Kunal Nagpal <kunagpal@gmail.com> on 10-02-2015.
 */
var mongo = require('mongodb').MongoClient;
var col = 'users';
var uri = process.env.MONGOLAB_URI || 'mongodb://localhost/project';
var log;
if (process.env.LOGENTRIES_TOKEN)
{
    var logentries = require('node-logentries');
    log = logentries.logger({
        token: process.env.LOGENTRIES_TOKEN
    });
}
var options = { server: { socketOptions: { connectTimeoutMS: 50000 }}};
exports.getCount = function (callback)
{
    mongo.connect(uri, function (err, db)
    {
        if (err)
        {
            throw err;
        }
        else
        {
            db.collection(col).find().count(function (err, count)
            {
                db.close();
                if (err)
                {
                    throw err;
                }
                else
                {
                    callback(null, count);
                }
            });
        }
    });
};

exports.insert = function (doc, callback)
{
    mongo.connect(uri, function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            db.collection(col).insert(doc, {w: 1}, function (err, docs)
            {
                db.close();
                if (err)
                {
                    callback(err, null);
                }
                else
                {
                    callback(null, docs);
                }
            });
        }
    });
};

exports.fetch = function (doc, callback)
{
    mongo.connect(uri, function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            db.collection(col).findOne(doc, function (err, document)
            {
                db.close();
                if (err)
                {
                    callback(err, null);
                }
                else if (document)
                {
                    db.close();
                    if (doc['_id'] === document['_id'])
                    {
                        callback(null, document);
                    }
                    else
                    {
                        callback(false, null);
                    }
                }
                else
                {
                    callback(false, null);
                }
            });
        }
    });
};

exports.getleader = function (doc, callback)
{
    mongo.connect(uri, function (err, db)
    {
        console.log("Leaderboard 2");
        if (err)
        {
            callback(err);
        }
        else
        {
            console.log("Leaderboard 3");
            var options =
            {
                "limit": 10,
                "sort": [
                    ['points', 'desc'],
                    ['net_run_rate', 'desc']
                ]
            };
            var collection = db.collection(col);
            collection.find({}, options).toArray(function (err, documents)
            {
                if (err)
                {
                    callback(err, null);
                }
                else
                {
                    console.log("get Leader Function4");
                    var onFetchOne = function (err, document)
                    {
                        if (err)
                        {
                            callback(err, null);
                        }
                        else
                        {
                            db.close();
                            documents.push(document);
                            callback(null, documents);
                        }
                    };
                    collection.findOne(doc, onFetchOne);
                }
            });
        }
    });
};

exports.forgotPassword = function (doc, callback)
{
    mongo.connect(uri, function (err, db)
    {
        if (err)
        {
            callback(err, null);
        }
        else
        {
            var collection = db.collection(col);
            collection.findOne(doc, function (err, document)
            {
                db.close();
                if (err)
                {
                    callback(err, null);
                }
                else
                {
                    db.close();
                    if (document)
                    {
                        callback(null, document);
                    }
                    else
                    {
                        callback(false, null);
                    }
                }
            });
        }

    });
};

exports.updateUserTeam = function (doc, arr, stats, callback)
{
    mongo.connect(uri, function (err, db)
    {
        if (err)
        {
            throw err;
        }
        else
        {
            db.collection(col).findAndModify(doc, [], {$set: {'team': arr, 'stats' : stats}}, {}, function (err, document)
            {
                if (err)
                {
                    callback(err, null);
                }
                else
                {
                    db.close();
                    callback(true, document);
                }
            })
        }
    });
};

exports.updateMatchSquad = function (doc, arr, callback)
{
    mongo.connect(uri, function (err, db)
    {
        if (err)
        {
            throw err;
        }
        else
        {
            db.collection(col).findAndModify(doc, [], {$set: {'squad': arr}}, {}, function (err, document)
            {
                if (err)
                {
                    callback(err, null);
                }
                else
                {
                    console.log("Done");
                    db.close();
                    callback(null, document);
                }
            });
        }
    });
};

exports.fetchUser = function (doc, callback)
{
    mongo.connect(uri, function (err, db)
    {
        if (err)
        {
            callback(err);
        }
        else
        {
            db.collection(col).findOne(doc, function (err, document)
            {
                db.close();
                if (err)
                {
                    callback(err, null);
                }
                else if (document)
                {
                    callback(null, document);
                }

            });
        }
    });
};

exports.update = function (query, update, callback)
{
    mongo.connect(uri, options, function (err, db)
    {
        if (err)
        {
            if (log) log.log('debug', {Error: err, Message: err.message});
        }
        else
        {
            db.collection(col).findAndModify(query, {}, update, {"upsert": true}, function (err, doc)
            {
                db.close();
                if (err)
                {
                    if (log) log.log('debug', {Error: err, Message: err.message});
                    callback(true, null);
                }
                else
                {
                    callback(null, doc);
                }
            });
        }
    });
};

