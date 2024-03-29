
// const crypto = require('crypto'),
var fs = require("fs");
//
// var privateKey = fs.readFileSync('key.pem').toString();
// var certificate = fs.readFileSync('cert.pem').toString();
//
// var credentials = crypto.createCredentials({key: privateKey, cert: certificate});


/*
Load Twilio configuration from .env config file - the following environment
variables should be set:
process.env.TWILIO_ACCOUNT_SID
process.env.TWILIO_API_KEY
process.env.TWILIO_API_SECRET
process.env.TWILIO_CONFIGURATION_SID
*/
require('dotenv').load();
var http = require('http');
var https = require('https');

var path = require('path');
var AccessToken = require('twilio').AccessToken;
var VideoGrant = AccessToken.VideoGrant;
var express = require('express');
var randomUsername = require('./randos');

// Create Express webapp
var app = express();
app.use(express.static(path.join(__dirname, 'public')));

/*
Generate an Access Token for a chat application user - it generates a random
username for the client requesting a token, and takes a device ID as a query
parameter.
*/
app.get('/token', function(request, response) {
    var identity = randomUsername();
    
    // Create an access token which we will sign and return to the client,
    // containing the grant we just created
    var token = new AccessToken(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_API_KEY,
        process.env.TWILIO_API_SECRET
    );

    console.log([        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_API_KEY,
        process.env.TWILIO_API_SECRET
    ]);

    // Assign the generated identity to the token
    token.identity = identity;

    //grant the access token Twilio Video capabilities
    var grant = new VideoGrant();
    grant.configurationProfileSid = process.env.TWILIO_CONFIGURATION_SID;
    token.addGrant(grant);

    // Serialize the token to a JWT string and include it in a JSON response
    response.send({
        identity: identity,
        token: token.toJwt()
    });
});


var credentials = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

// Create http server and run it
// var server = http.createServer(app);
// var server = http.createServer(options, function(){
//
// });
// var port = process.env.PORT || 3000;
//
// server.listen(port, function() {
//     console.log('Express server running on *:' + port);
// });

console.log(credentials);

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(process.env.PORT || 3000);
// httpsServer.listen(3003);