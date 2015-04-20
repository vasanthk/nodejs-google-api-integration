/**
 * Server side JavaScript
 *
 * Basic Setup
 */

var express = require('express');
var bodyParser = require('body-parser');
var google = require('googleapis');

/**
 * API related Code
 */

var app = express();

// Configure the app to use bodyParser()
// This will let us get the data from POST
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var PORT = 8084;

// Routes for our API
var router = express.Router();

// middleware to use for all requests
router.use(function (req, res, next) {
    console.log('Something is going on here in the Server side');
    next(); // Makes sure we go to the next route and don't stop here.
});

// Test route to make sure everythigns is working
router.get('/', function (req, res) {
    res.json({
        message: 'Yey! Welcome to our API'
    });
});

// routes that end with /google
// CRUD
router.route('/google')
    // CREATE a connection to Google API
    .post(function (req, res) {  // Accessed at POST http://localhost.com/api/google
        var callGoogleAPI = 'Call Google API here';
        var connectStatus = true;

        if (connectStatus) {
            res.json({
                message: 'Account Connected to Google'
            });
        } else {
            res.json({
                message: 'Google connect failed'
            });
        }
    });

router.route('/google/:email')  // Accessed at GET http://localhost:8084/api/google/:email
    // READ an email account from the connected account.
    .get(function (req, res) {
        var email = req.params.email;
        var emailInfoStatus = true;

        // Get any info based on the email info here.

        if (emailInfoStatus) {
            res.json({
                message: 'Email account returned for ' + email
            });
        } else {
            res.json({
                message: 'Google connect failed'
            });
        }
    })
    // UPDATE a meeting in the connected account.
    .put(function (req, res) {    // Accessed at PUT http://localhost:8084/api/google/:email with meetignId passed in the body.
        var email = req.params.email;
        var meetingId = req.body.meetingId;
        var meetingDescription = req.body.meetingDescription;
        var updateStatus = true;

        // Update the MeetingId info in the system
        console.log('Meeting Id: ' + meetingId);
        console.log('Meeting Description: ' + meetingDescription);


        if (updateStatus && meetingDescription) {
            res.json({
                message: 'Meeting description has been updated for Meeting id: ' + meetingId
            });
        } else {
            res.json({
                message: 'Google connect failed'
            });
        }
    })
    // DELETE a meeting in the connected account.
    .delete(function (req, res) {    // Accessed at DELETE http://localhost:8084/api/google/:email with meetignId passed in the body.
        var email = req.params.email;
        var meetingId = req.body.meetingId;
        var deleteStatus = true;

        // Code to delete the meeting from the system, by using the meetingid param.

        if (deleteStatus && meetingId) {
            res.json({
                message: 'Deleted meeting with id: ' + meetingId
            });
        } else {
            res.json({
                message: 'Google connect failed'
            });
        }
    });

// Register API routes
app.use('/api', router);

// Start the server
app.listen(PORT);
console.log('Magic happens on port' + PORT);


/**
 * Google Calendar API related code
 */

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var calendar = google.calendar('v3');

var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-api-quickstart.json';

fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
    }
    // Authorize a client with the loaded credentials, then call the Calendar API.
    authorize(JSON.parse(content), getEvents);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function (err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function (code) {
        rl.close();
        oauth2Client.getToken(code, function (err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Gets the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getEvents(auth) {
    calendar.events.list({
        auth: auth,
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 2,
        singleEvents: true,
        orderBy: 'startTime'
    }, function (err, response) {
        if (err) {
            console.log('There was an error contacting the Calendar service: ' + err);
            return;
        }
        var events = response.items;
        if (events.length == 0) {
            console.log('No upcoming events found.');
        } else {
            //console.log(response);
            console.log('Upcoming 10 events:');
            for (var i = 0; i < events.length; i++) {
                var event = events[i];
                var start = event.start.dateTime || event.start.date;
                console.log('%s - %s', start, event.summary);
            }
        }
    });
}

/**
 * Google Calendar API - push notifications
 */
calendar.events.watch({
        calendarId: 'primary'
    },
    {
        id: 'push-notif-vasanthvignesh@gmail.com',
        address: 'https://gotomeeting.com/google-api/notifications',    // TODO: Modify sample URL when ready
        type: 'web_hook'
    }, function (err, res) {
        console.log("err, res:", err, res);
    }
);

/**
 * Listen to POST events received from Google API push notifications
 */
router.route('/notifications    ')
    // CREATE a connection to Google API
    .post(function (req, res) {  // Accessed at POST http://localhost.com/api/notifications
        var data = '';
        req.on('data', function (chunk) {
            data += chunk;
        });

        req.on('end', function () {
            console.log('Received notification data:');
            console.log(data.toString());
        });
        res.writeHead(statusCode, {'Content-Type': 'text/plain'});
        res.end();
    });


// TODO: Check if oAuth can be performed on click and the response be sent to the nodejs server.
// TODO: Perform initial full; synvc with an Ajaxy get request.

// nextSyncToken (string): Token used at a later point in time to retrieve only the entries that have changed since this result was returned.
// Omitted if further results are available, in which case nextPageToken is provided.
