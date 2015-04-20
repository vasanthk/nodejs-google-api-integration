/**
 * Basic Calendar Auth Setup
 */

var express = require('express');
var bodyParser = require('body-parser');
var google = require('googleapis');
var calendar = google.calendar('v3');
var moment = require('moment');

var app = express();
var googleConfig = {
    clientID: '949105085593-spfei6laj15r3o0brcqc21p8cal1sbja.apps.googleusercontent.com',
    clientSecret: 'bjWqvGZHEcB6_FxwBBdCLeYR',
    calendarId: 'primary',
    redirectURL: 'http://localhost:8084/auth'
};

var PORT = 8084;

var oAuthClient = new google.auth.OAuth2(googleConfig.clientID, googleConfig.clientSecret, googleConfig.redirectURL);
var authed = false;

app.get('/', function(req, res) {

    // If we're not authenticated, fire off the OAuth flow
    if (!authed) {

        // Generate an OAuth URL and redirect there
        var url = oAuthClient.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/calendar'
        });
        res.redirect(url);
    } else {

        // Format today's date
        var today = moment().format('YYYY-MM-DD') + 'T';

        // Call google to fetch events for today on our calendar
        calendar.events.list({
            calendarId: googleConfig.calendarId,
            maxResults: 10,
            //timeMin: today + '00:00:00.000Z',
            //timeMax: today + '23:59:59.000Z',
            auth: oAuthClient
        }, function(err, events) {
            if(err) {
                console.log('Error fetching events');
                console.log(err);
            } else {

                // Send our JSON response back to the browser
                console.log('Successfully fetched events');
                res.send(events);
            }
        });
    }
});

// Return point for oAuth flow, should match googleConfig.redirectURL
app.get('/auth', function(req, res) {
    console.log('In Auth');

    var code = req.param('code');

    if(code) {
        // Get an access token based on our OAuth code
        oAuthClient.getToken(code, function(err, tokens) {
            console.log('Get Token');

            if (err) {
                console.log('Error authenticating')
                console.log(err);
            } else {
                console.log('Successfully authenticated');
                console.log(tokens);

                // Store our credentials and redirect back to our main page
                oAuthClient.setCredentials(tokens);
                authed = true;
                res.redirect('/');
            }
        });
    }
});

var server = app.listen(PORT);
console.log('Magic happens on port' + PORT);


// TODO: Perform initial full; synvc with an Ajaxy get request.
// nextSyncToken (string): Token used at a later point in time to retrieve only the entries that have changed since this result was returned.
// Omitted if further results are available, in which case nextPageToken is provided.
