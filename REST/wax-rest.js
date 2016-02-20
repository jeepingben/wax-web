var fs = require("fs");
var sqlite3 = require("sqlite3").verbose();
var http = require('http');
var url = require('url');

var server = http.createServer(function(req, res) {
    var dbFile = "waxdb.db";
    var db = new sqlite3.Database(dbFile);
    //db.on('trace', function(stmt) {
    //	 console.log(stmt);
    //});
    var headers = {};
    headers["Content-Type"] = "application/json";
    // respond to the request
    res.writeHead(200, headers);
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;

    var minTempStr = "newMinTemp";
    var maxTempStr = "newMaxTemp";
    var isKlister = 0;
    if (query.conditions === "Transformed") {
        minTempStr = "transMinTemp";
        maxTempStr = "transMaxTemp";
    } else if (query.conditions === 'Ice' || query.conditions === 'Corn') {
        isKlister = 1;
    }

    //Build the brand string.  TODO - is this safe?
    var brandString = "(";
    var brands = query.brands.split(',');
    for (var brand in brands) {
        if (brandString.endsWith("'")) { //this is not the first brand, include separator
            brandString += " OR ";
        }
        brandString += "brand == '" + brands[brand] + "'";
    }
    brandString += ")";

    var stmt = db.prepare('select * from Waxes where ' + brandString + " AND " + minTempStr + '<= (?) AND ' + maxTempStr + ' >= (?) AND isKlister==? order by abs\( (?) - \(' + maxTempStr + "+" + minTempStr + '/ 2\)\)');
    stmt.get(query.temperature, query.temperature, isKlister, query.temperature, function(err, row) {
        if (!!err) {
            console.log(err);
        }
        var jsonData;
        if (!!row) {
            jsonData = '{' +
                '"color":"' + row.color + '",' +
                '"brand":"' + row.brand + '",' +
                '"picture":"' + row.picture + '",' +
                '"name":"' + row.name + '"' +
                '}';

        } else {
            jsonData = '{' +
                '"color":"none",' +
                '"brand":"none",' +
                '"picture":"waxless.png",' +
                '"name":"none"' +
                '}';
        }
        res.end(query.callback + '(JSON.parse(\'' + jsonData + '\'));');
    });

    stmt.finalize();


});



var server = server.listen(12581); // This is just a sample script. Paste your real code (javascript or HTML) here.