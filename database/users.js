/**
 * Created by Kunal Nagpal <kunagpal@gmail.com> on 10-02-2015.
 */
var log,
    col = 'users',
    mongo = require('mongodb').MongoClient,
    uri = process.env.MONGOLAB_URI || 'mongodb://127.0.0.1:27017/project';

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
