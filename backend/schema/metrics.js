const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const metricsSchema = new Schema({
    // id: String, // ID from MONGODB
    trigger: String,
    timestamp: String,
    screenSize: { width: Number, height: Number },
    mediaLevel: { resolution: String, bandwidth: Number, level: Number, media: String },
    streamedTime: Number,
    downloadedBytes: Number,
    bufferings: [{ timestamp: String, videoTimestamp: Number, duration: Number}],
    downloadRate: Number,
    bandwidth: Number,
    sessionId: String,
    clientIp: String,
    userAgent: String,
    streamId: String,
});

const Metrics = mongoose.model('Metrics', metricsSchema);
module.exports = Metrics;
