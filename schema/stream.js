const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const streamSchema = new Schema({
    // id: String, // ID from MONGODB
    name: String,
    description: String,
    ref: String,
    resolutions: [String],
});

const Stream = mongoose.model('Stream', streamSchema);
module.exports = Stream;
