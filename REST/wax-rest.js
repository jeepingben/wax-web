var fs = require("fs");
var sqlite3 = require("sqlite3").verbose();
var http = require('http');
var url = require('url');
const NO_WAX = '{' +
    '"color":"none",' +
    '"brand":"none",' +
    '"picture":"waxless.png",' +
    '"name":"none"' +
    '}';
//TODO have a service return the list of valid brands

var server = http.createServer(function(req, res) {
    var dbFile = "waxdb.db";
    var db = new sqlite3.Database(dbFile);
    //  db.on('trace', function(stmt) {
    //  	 console.log(stmt);
    //  });
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

    if (!query.brands) {
        res.end(query.callback + '(JSON.parse(\'' + NO_WAX + '\'));');
        return;
    }

    //The sqlite plugin doesn't seem to allow preparing the columns used in statements
    //This section of code gets the valid brands and only allows the user supplied strings through
    //if they exactly match a valid brand.
    var brands = query.brands.split(',');
    var getBrandsStmt = db.prepare('select distinct brand from Waxes');

    getBrandsStmt.all(function(err, rows) {
        var validBrands = [];
        for (i = 0; i < rows.length; i++) {
            validBrands.push(rows[i].brand);
        }
        //Build the brand string.  
        var brandString = "(";
        var doQuery = false;
        var noBrands = true;
        for (var brand in brands) {

            for (i = 0; i < validBrands.length; i++) {
                if (brands[brand] === validBrands[i]) {
                    if (brandString.endsWith("'")) { //this is not the first brand, include separator
                        brandString += " OR ";
                    }
                    brandString += "brand == '" + brands[brand] + "'";
                    doQuery = true;
                    break;
                }
            }
        }
        brandString += ")";
        if (!doQuery) {
            res.end(query.callback + '(JSON.parse(\'' + NO_WAX + '\'));');
            return;
        }
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
                jsonData = NO_WAX;
            }
            res.end(query.callback + '(JSON.parse(\'' + jsonData + '\'));');
        });

        stmt.finalize();


    });
});


var server = server.listen(12581); // This is just a sample script. Paste your real code (javascript or HTML) here.