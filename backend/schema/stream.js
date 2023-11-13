const mongoose = require("mongoose");
const hash = require('object-hash');


const Schema = mongoose.Schema;

const streamSchema = new Schema({
    id: String, // ID should be uniquely generated, for example through the hash function (ex. hash(Date.now()))
    streamKey: String,
    name: String,
    description: String,
    ref: String,
    resolutions: [String],
    createdAt: String,
    isLive: Boolean,
});

const Stream = mongoose.model('Stream', streamSchema);
module.exports = Stream;
