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

var assert = require('assert');
var mongo = require('mongodb').MongoClient.connect;

before(function(done){
    mongo('mongodb://127.0.0.1/testgpl', function(err, db){
        if(err)
        {
            throw 'Please ensure that mongod is running as a localhost instance and is accepting connections on port 27017'
        }

        testDb = db;
        done();
    });
});

describe('Authentication tests', function(){
    //console.log(testDb);
});
