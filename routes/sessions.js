/*
 * routes/session.js
 *
 * This scripts contains all the endpoints (paths) associated to the Session Router.
 * A "session" is a persistent piece of information used to identify a track the interaction of a client
 * with the server. 
 * Since no direct identification/authentication is currently required, the server will create a session if
 * is not already associated to an existing session, or it will try correlate the client to an existing session.
 * A session is identified by an Identifier (sid, session id), that express automatically generates through the "session" middleware.
 * The SessionID is then stored inside a Session Cookie that express sends back to the client. Express uses the "Set-Cookie" header
 * to pass the cookie to a client which is not already provided with one. Express then expects to find a Session Cookie in order to 
 * find the related session.
 * 
 */


const express = require('express');
const router = express.Router();
const User = require('../schema/user');
const View = require("../schema/view");
const Metrics = require("../schema/metrics");
const {name} = require("../session");


/*
 * GET /sessions 
 *
 * Get the list of all sessions ever registered.
 */
router.get('/', async function (req, res, next) {
    const users = await User.find();
    res.status(200).json(users);
});

/* 
 * POST /sessions
 *
 * Create a new session and associate it to the current request. 
 * The session is stored in the DB if it does not already exists,
 * otherwise if a session cookie is passed along with the request, the server will look for an existing session on the DB.
 * 
 * #NOTE: this method should be always called when a client first wants to connect to the server.
 */
router.post('/', async function (req, res, next) {
    // Extract client IP address and user agent
    const clientIp = req.clientIp;
    const userAgent = req.headers['user-agent'];

    // Extract session ID from cookies
    const sessionId = req.session.id
    req.session.connections++;

    await User.findOne({sessionId: sessionId, clientIp: clientIp, userAgent: userAgent})
        .then((user) => {
                if (!user) {
                    const response = {
                        sessionId,
                        clientIp,
                        userAgent,
                        timestamp: new Date().toISOString(),
                    };
                    const newUser = new User(response);
                    newUser.save().then(
                        (session) => {
                            console.log(`${sessionId} saved to database`);
                            // Send a response back to the client
                            res.status(200).json(session);
                        }
                    );
                } else {
                    console.log(`${sessionId} already exists`);
                    res.status(200).json(user);
                }
            }
        );
});

module.exports = router;
