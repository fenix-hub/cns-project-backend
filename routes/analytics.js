const express = require('express');
const router = express.Router();
const Stream = require("../schema/stream");
const Metrics = require("../schema/metrics");
const View = require("../schema/view");


router.get('/streams', async (req, res) => {
    const id = req.query.id;
    const views = await View.find({streamId: id});
    const metrics = await Metrics.aggregate(
        [
            { $match: { streamId: id } },
            { $sort: { timestamp: -1 } },
            { $group: { _id: "$sessionId", metrics: { $first: "$$ROOT" } } },
            { $group: {
                    _id: "$metrics.streamId",
                    totalStreamedBytes: { $sum: "$metrics.downloadedBytes" } ,
                    totalStreamedTime: { $sum: "$metrics.streamedTime" } ,
                } },
        ]
    );
    const aggregatedMetric = metrics[0];
    aggregatedMetric.totalViews = views.length;
    res.status(200).json(aggregatedMetric);
});

async function getMediaChanges(sessionId, streamId) {
    const metrics = await Metrics.aggregate(
        [
            { $match: { sessionId: sessionId, streamId: streamId, trigger: "mediaChange" } },
            { $project: { level: "$mediaLevel.level", resolution: "$mediaLevel.resolution", duration: "$mediaLevel.duration" } },
            { $group: { _id: "$level", duration: { $sum: "$duration" } } }
        ]
    );
    return metrics;
}

async function getScreenSizes(sessionId, streamId) {
    const metrics = await Metrics.aggregate(
        [
            { $match: { sessionId: sessionId, streamId: streamId } },
            { $group: { _id: "$screenSize" } },
        ]
    );
    return metrics;
}


router.get('/sessions', async (req, res) => {
    // Extract client IP address and user agent
    const clientIp = req.clientIp;
    const userAgent = req.headers['user-agent'];

    // Extract session ID from cookies
    const sessionId = req.query.id || req.session.id;


    const metrics = await Metrics.aggregate(
        [
            { $match: { sessionId: sessionId } },
            { $sort: { timestamp: -1 } },
            { $group: { _id: "$streamId", metrics: { $first: "$$ROOT" } } },
            { $group: {
                    _id: "$metrics.streamId",
                    totalStreamedBytes: { $sum: "$metrics.downloadedBytes" } ,
                    totalStreamedTime: { $sum: "$metrics.streamedTime" } ,
                    rebufferingEvents: { $sum: { $size: "$metrics.bufferings" } },
                    rebufferingTime: { $sum: { $sum: "$metrics.bufferings.duration" } }
                } }
        ]
    );

    let aggregatedMetrics = [];
    for (let metric of metrics) {
        metric.levels = await getMediaChanges(sessionId, metric._id);
        for (let level of metric.levels) {
            level.duration = level.duration / metric.totalStreamedTime * 100;
        }
        metric.screenSizes = await getScreenSizes(sessionId, metric._id);
        for (let i = 0; i < metric.screenSizes.length; i++) {
            metric.screenSizes[i] = metric.screenSizes[i]._id.width + "x" + metric.screenSizes[i]._id.height;
        }
    }

    res.status(200).json(metrics);
});

module.exports = router;
