/**
 * Created by Kunal Nagpal <kunagpal@gmail.com> on 10-02-2015.
 */
var mongo = require('mongodb').MongoClient,
    col = 'users',
    uri = process.env.MONGOLAB_URI || 'mongodb://127.0.0.1:27017/project',
    log;
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

