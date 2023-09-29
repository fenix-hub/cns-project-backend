const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    sessionId: String,
    clientIp: String,
    userAgent: String,
    timestamp: String,
});

const User = mongoose.model('User', userSchema);
module.exports = User;
