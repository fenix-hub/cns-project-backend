const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const streamSchema = new Schema({
    id: String, // ID should be uniquely generated, for example through the hash function (ex. hash(Date.now()))
    name: String,
    description: String,
    ref: String,
    resolutions: [String],
    createdAt: String,
});

const Stream = mongoose.model('Stream', streamSchema);
module.exports = Stream;
