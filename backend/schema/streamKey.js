const mongoose = require("mongoose");
const hash = require("object-hash");

const Schema = mongoose.Schema;

const viewSchema = new Schema({
    key: String,
    sessionId: String,
    timestamp: String,
});

const StreamKey = mongoose.model('StreamKey', viewSchema);
StreamKey.generate = () => hash(Date.now());
module.exports = StreamKey;
