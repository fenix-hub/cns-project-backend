const express = require('express');
const Stream = require("../schema/stream");
const Metrics = require("../schema/metrics");
const View = require("../schema/view");
const router = express.Router();

router.get('/', async function (req, res, next) {
    res.status(200).json(await Stream.find({}));
});

// router.get('/:streamId', async function (req, res, next) {
//     const { streamId } = req.params;
//     res.status(200).json(await Stream.findOne({id: streamId}));
// });

router.get('/:id', async function (req, res, next) {
    const {id} = req.params;
    res.status(200).json(await Stream.findOne({_id: id}));
});

router.post('/:id/stopped', function (req, res, next) {
    res.send('respond with a resource');
});

router.post('/:id/started', function (req, res, next) {
    res.send('respond with a resource');
});

router.post('/:id/views', (req, res) => {
    // Extract stream ID and resolution from the request body
    const {screenSize, resolution} = req.body;
    const {id} = req.params;

    // Extract client IP address and user agent
    const {sessionId} = getClientInfo(req);

    // TODO: Add logic to handle the stream start information (e.g., store in a database)

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

router.get('/:id/views', async (req, res) => {
    const {id} = req.params;
    const views = await View.find({streamId: id});
    res.status(200).json(views);
});

router.post('/:id/metrics', (req, res) => {
    const {id} = req.params;
    const {
        trigger,
        timestamp,
        screenSize,
        mediaLevel,
        streamedTime,
        downloadedBytes,
        bufferings,
        downloadRate,
        bandwidth
    } = req.body;

    // Extract client IP address and user agent
    const {clientIp, userAgent, sessionId} = getClientInfo(req);

    Metrics(
        { ...req.body, clientIp, userAgent, sessionId, streamId: id }
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

router.get('/:id/metrics', async (req, res) => {
    const {id} = req.params;
    const metrics = await Metrics.find({streamId: id});
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
