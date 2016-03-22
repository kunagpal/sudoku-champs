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

var router = require('express').Router();

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
    db.find({_id: req.params.email}).limit(1).next(function(err, doc){
        if(err)
        {
            res.status(403);
            return next(err);
        }

        res.json(+!doc);
    });
});

module.exports = router;
