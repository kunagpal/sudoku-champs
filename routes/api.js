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

var router = require('express').Router(),
    op = {dob : 0, hash : 0, email : 0, token : 0, expires : 0, form : 0, num : 0};

var api = function(req, res, next)
{
    if(!req.headers.referer)
    {
        return res.redirect('/');
    }
    if(req.signedCookies.user || (req.headers.referer.split('/')[2] === req.headers.host))
    {
        return next();
    }

    res.end();
};

router.get('/register/:email', api, function(req, res, next){
    db.find({email: req.params.email}).limit(1).next(function(err, doc){
        if(err)
        {
            res.status(422);
            return next(err);
        }

        res.json(+!doc);
    });
});

router.get('/stats', api, function(req, res){
    db.find({name: req.signedCookies.user}, op).limit(1).next(function(err, doc){
        if(err)
        {
            res.status(422);
            return next(err);
        }
        if(!doc)
        {
            res.end();
        }

        temp = [doc.practice, doc.h2h, doc.challenge, doc.solo].sort();
        doc.avg = parseInt(doc.time / doc.played, 10);
        doc.avg = parseInt(doc.avg / 60, 10) + ' : ' + (doc.avg % 60 > 9 ? '' : '0') + doc.avg % 60;
        doc.fav = doc.practice === temp[3] ? 'Practice' : doc.challenge === temp[3] ? 'Challenge' : doc.solo === temp[3] ? 'Solo' : 'Head to head';
        doc.fav += ' (' + temp[3] + ' of ' + doc.played + ' games)';
        doc.best = doc.best !== Number.MAX_VALUE ? parseInt(doc.best / 60, 10) + ' : ' + (doc.best % 60 > 9 ? '' : '0') + doc.best % 60 : 'NA';
        doc.worst = doc.worst !== -1 ? parseInt(doc.worst / 60, 10) + ' : ' + (doc.worst % 60 > 9 ? '' : '0') + doc.worst % 60 : 'NA';
        res.json(doc);
    });
});

module.exports = router;
