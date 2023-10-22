const express = require('express');
const router = express.Router();
const Stream = require("../schema/stream");
const Metrics = require("../schema/metrics");
const View = require("../schema/view");
const User = require("../schema/user");

// Metriche per singolo stream
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
    aggregatedMetric.viewList = views;

    // aggregatedMetric.totalViews = views.length;
    res.status(200).json(aggregatedMetric);
});

router.get('/sessions', async (req, res) => {
    // Extract client IP address and user agent
    const clientIp = req.clientIp;
    const userAgent = req.headers['user-agent'];

    // Extract session ID from cookies
    const sessionId = req.query.id || req.session.id;

    const metrics = await Metrics.aggregate([
            { $match: { sessionId: sessionId } },
            { $sort: { timestamp: -1 } },
            {
                $group: {
                    _id: {
                        streamId: '$streamId',
                        mediaLevel: '$mediaLevel.level',
                    },
                    totalStreamedTime: { $sum: '$streamedTime' },
                    totalStreamedBytes: { $sum: '$downloadedBytes' },
                    bufferingEvents: { $sum: { $size: '$bufferings' } },
                    bufferingTime: { $sum: { $sum: '$bufferings.duration' } },
                    screenSizes: { $addToSet: '$screenSize' },
                    downloadRate: { $avg: '$downloadRate' },
                    bandwidth: { $avg: '$bandwidth' },
                },
            },
            {
                $group: {
                    _id: '$_id.streamId', // Group by streamId
                    mediaLevels: {
                        $push: {
                            level: '$_id.mediaLevel',
                            totalStreamedTime: '$totalStreamedTime',
                        },
                    },
                    totalStreamedTime: { $sum: '$totalStreamedTime' },
                    totalStreamedBytes: { $sum: '$totalStreamedBytes' },
                    bufferingEvents: { $sum: '$bufferingEvents' },
                    bufferingTime: { $sum: '$bufferingTime' },
                    screenSizes: { $addToSet: '$screenSizes' },
                    downloadRate: { $avg: '$downloadRate' },
                    bandwidth: { $avg: '$bandwidth' },
                },

            },
    ]);

    for (const metric of metrics) {
        metric.screenSizes = metric.screenSizes.flat();
        let total
        for (const mediaLevel of metric.mediaLevels) {
            mediaLevel['%totalStreamedTime'] = mediaLevel.totalStreamedTime / metric.totalStreamedTime * 100;
        }
    }
    res.status(200).json(metrics);
});

module.exports = router;
