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
    const streamId = req.query.id;
    const sessionId = req.session.id;

    const matchQ = {sessionId: sessionId};
    if (streamId) {
        matchQ.streamId = streamId;
    }

    const metrics = await Metrics.aggregate([
        {$match: matchQ},
        {$sort: {timestamp: -1}},
        {
            $group: {
                _id: {
                    streamId: '$streamId',
                    mediaLevel: '$mediaLevel.level',
                },
                sessionId: {$first: '$sessionId'},
                userAgent: {$first: '$userAgent'},
                clientIp: {$first: '$clientIp'},
                totalStreamedTime: {$sum: '$streamedTime'},
                totalStreamedBytes: {$sum: '$downloadedBytes'},
                bufferingEvents: {$sum: {$size: '$bufferings'}},
                bufferingTime: {$sum: {$sum: '$bufferings.duration'}},
                downloadRate: {$avg: '$downloadRate'},
                bandwidth: {$avg: '$bandwidth'},
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
                sessionId: {$first: '$sessionId'},
                userAgent: {$first: '$userAgent'},
                clientIp: {$first: '$clientIp'},
                totalStreamedTime: {$sum: '$totalStreamedTime'},
                totalStreamedBytes: {$sum: '$totalStreamedBytes'},
                bufferingEvents: {$sum: '$bufferingEvents'},
                bufferingTime: {$sum: '$bufferingTime'},
                downloadRate: {$avg: '$downloadRate'},
                bandwidth: {$avg: '$bandwidth'},
            },
        },
    ]);

    const screenSizesMetrics = await Metrics.aggregate([
        {$match: {sessionId: sessionId}},
        {$sort: {timestamp: -1}},
        {
            $group: {
                _id: {
                    streamId: '$streamId',
                    screenSize: '$screenSize',
                },
                totalStreamedTime: {$sum: '$streamedTime'},
            },
        },
        {
            $group: {
                _id: '$_id.streamId', // Group by streamId
                screenSizes: {
                    $push: {
                        size: '$_id.screenSize',
                        totalStreamedTime: '$totalStreamedTime',
                    },
                },
            },
        },
    ]);


    for (i = 0; i < metrics.length; i++) {
        metrics[i]['screenSizes'] = screenSizesMetrics[i]['screenSizes'];
    }

    for (const metric of metrics) {
        for (const mediaLevel of metric.mediaLevels) {
            mediaLevel['%totalStreamedTime'] = mediaLevel.totalStreamedTime / metric.totalStreamedTime * 100;
        }
        for (const screenSize of metric.screenSizes) {
            screenSize['%totalStreamedTime'] = screenSize.totalStreamedTime / metric.totalStreamedTime * 100;
        }
    }
    res.status(200).json(metrics);
});

module.exports = router;
