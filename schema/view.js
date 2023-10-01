const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const viewSchema = new Schema({
    streamId: String,
    sessionId: String,
    timestamp: String,
});

const View = mongoose.model('View', viewSchema);
module.exports = View;
