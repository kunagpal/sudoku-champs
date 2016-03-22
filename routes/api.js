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

var i;
var temp;
var lead;
var flag;
var referer;
var router = require('express').Router();

var api = function(req, res, next)
{
    if(!req.headers.referer)
    {
        return res.redirect('/');
    }

    temp = req.url.split('/')[1];
    referer = req.headers.referer.split('/');

    if(req.signedCookies.name || (referer.slice(-1)[0] === temp && referer[2] === req.headers.host))
    {
        return next();
    }

    res.end();
};

router.get('/register/:name', api, function(req, res, next){
    db.find({_id: req.params.name}, function(err, doc){
        if(err)
        {
            res.status(403);
            return next(err);
        }

        res.send(+!doc);
    });
});

router.get('/leaderboard', api, function(req, res){
    i = 0;
    lead = [{}];
    flag = !req.signedCookies.name;
    db.find({}, op, frame).toArray(function(err, docs){
        if(err)
        {
            console.error(err.message);
            res.redirect('/game');
        }
        else
        {
            for(j = 0; j < docs.length; ++j)
            {
                if(docs[j]._id === req.signedCookies.name)
                {
                    flag = true;
                    docs[j].rank = parseInt(j, 10) + 1;
                    lead.push(docs[j]);
                }
                else if(lead.length < 6)
                {
                    lead.push(docs[j]);
                }
                else if(flag)
                {
                    break;
                }
            }

            res.json(lead);
        }
    });
});

module.exports = router;
