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