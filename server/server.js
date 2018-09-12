// Declare our dependencies

var fs = require('fs');
var http = require('http');
var https = require('https');
var pem = require('pem');
var mongoose = require('mongoose');

var sslsuccess = false;
var local = false;
var connectionString; // Set this to the real connection string once we have it in AWS (?)

//
//SSL key and certificate
try {
    var sslkey = fs.readFileSync('/etc/letsencrypt/live/klimato.se/privkey.pem');
    var sslcert = fs.readFileSync('/etc/letsencrypt/live/klimato.se/cert.pem');
    var sslca = fs.readFileSync('/etc/letsencrypt/live/klimato.se/chain.pem');
} catch (err) { //Above causes error when run in local env.
    var sslkey = 'mock';
    var sslcert = 'mock';
    var sslca = 'mock';
    console.log('Running locally.')
    local = true;
    connectionString = require('./config/config.js').devConnectionString;
}

var ssloptions = {
    key: sslkey,
    cert: sslcert,
    ca: sslca
};

//
// END OF SSL
//

// Establishing mongoDB connection
mongoose.connect(connectionString, { useMongoClient: true });
mongoose.Promise = global.Promise;

var express = require('express');
var request = require('superagent');
var cors = require('cors');
var bodyParser = require('body-parser');

if (!local) {
    pem.createCertificate({ days: 1, selfSigned: true }, function (err, keys) {
        if (err) {
            throw err;
        }

        StartServer(local);
    });
} else {
    StartServer(local);
}

function StartServer(local) {
    // Create our express app
    var app = express();

    //Cors is (currently) used to accept all cross domain requests (since vue and node is run on different servers. Probably, they should be moved to run at the same. )
    app.use(cors());
    //Use bodyParser middleware. 
    app.use(bodyParser.json());

    app.use('/api', require('./api/router.js'));

    var httpServer = http.createServer(app);
    if (!local) {
        var httpsServer = https.createServer(ssloptions, app);
        httpsServer.listen(3000);
    } else {
        httpServer.listen(3000);
    }
}
