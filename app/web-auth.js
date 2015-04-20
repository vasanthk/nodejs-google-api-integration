/**
 * Authenticate using Web app
 */
var express = require('express');
var google = require('googleapis');

var app = express();
var moment = require('moment');
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

    var code = req.param('code');

    if(code) {
        // Get an access token based on our OAuth code
        oAuthClient.getToken(code, function(err, tokens) {

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
