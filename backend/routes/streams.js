/*
 * routes/streams.js
 *
 * This scripts contains all the endpoints (paths) associated to the Stream Router.
 * A "stream" both identifies a video or a live stream.
 */

const express = require('express');
const router = express.Router();
const Stream = require("../schema/stream");
const Metrics = require("../schema/metrics");
const View = require("../schema/view");
const StreamKey = require("../schema/streamKey");

/*
 * POST /streams/key
 *
 * Create a new stream and return its key.
 */
router.post('/key', async function (req, res, next) {
    // Extract client IP address and user agent
    const {sessionId} = getClientInfo(req);

    const streamKey = new StreamKey({
        key: StreamKey.generate(),
        sessionId,
        timestamp: new Date().toISOString(),
    });
    streamKey.save().then(() => {
        res.status(200).json(streamKey);
    });
});

/*
 * GET /streams
 *
 * Get the list of all the streams stored in the database.
 */
router.get('/', async function (req, res, next) {
    res.status(200).json(await Stream.find({}));
});

/*
 * GET /streams/:id
 *
 * Get information related to a specific stream, looked up by its id.
 */
router.get('/:id', async function (req, res, next) {
    const {id} = req.params;
    res.status(200).json(await Stream.findOne({id: id}));
});

/*
 * POST /streams/:id/stopped
 *
 * Notify the server about a "stop" event on a specific stream from a client.
 */
router.post('/:id/stopped', function (req, res, next) {
    res.send('respond with a resource');
});

/*
 * POST /streams/:id/started
 *
 * Notify the server about a "start" event on a specific stream from a client.
 */
router.post('/:id/started', function (req, res, next) {
    res.send('respond with a resource');
});

/*
 * POST /streams/:id/views
 *
 * Notify the server about a "view" event on a specific stream from a client.
 * A "view" is counted on the client only when some specific conditions are observed.
 */
router.post('/:id/views', (req, res) => {
    // Extract stream ID and resolution from the request body
    const {screenSize, resolution} = req.body;
    const {id} = req.params;

    // Extract client IP address and user agent
    const {sessionId} = getClientInfo(req);

    req.session.views = (req.session.views || 0) + 1;

    const response = {
        sessionId,
        streamId: id,
        resolution,
        screenSize,
        views: req.session.views,
        timestamp: new Date().toISOString(),
    };

    View({
        ...response,
    }).save().then(
        (view) => {
            console.log("View saved to database");
            // Send a response back to the client
            res.status(200).json(view);
        }
    ).catch((err) => {
        console.log(err);
        res.status(500).json(err);
    });

});

/*
 * GET /streams/:id/views
 *
 * Get the list of all the views associated to a specific stream.
 */
router.get('/:id/views', async (req, res) => {
    const {id} = req.params;
    const views = await View.find({streamId: id});
    res.status(200).json(views);
});

/*
 * POST /streams/:id/metrics
 *
 * Send metrics associated to a stream while a client is consuming it.
 * Metrics are uniquely associated to a stream and a session (user/client)
 */
router.post('/:id/metrics', (req, res) => {
    const {id} = req.params;
    const metrics = req.body;
    metrics.mediaLevel = req.body.currentMediaLevel;

    // Extract client IP address and user agent
    const {clientIp, userAgent, sessionId} = getClientInfo(req);

    Metrics(
        { ...metrics, clientIp, userAgent, sessionId, streamId: id }
    ).save().then(
        (metrics) => {
            console.log("Metrics saved to database");
            // Send a response back to the client
            res.status(200).json(metrics);
        }
    ).catch((err) => {
        console.log(err);
        res.status(500).json(err);
    });
});


/*
 * GET /streams/:id/metrics
 *
 * Get all metrics associated to a stream and a session
 */
router.get('/:id/metrics', async (req, res) => {
    const {id} = req.params;
    const metrics = await Metrics.find({streamId: id})
    res.status(200).json(metrics);
});


function getClientInfo(req) {
    return {
        clientIp: req.clientIp,
        userAgent: req.headers['user-agent'],
        sessionId: req.session.id,
    }
}

module.exports = router;
