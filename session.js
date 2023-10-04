/*
 * session.js
 * 
 * This script contains all the configuration parameters required for the "session" middleware
 */
const SESSION_SECRET = process.env.SESSION_SECRET || 'secret';
const SESSION_NAME = process.env.SESSION_NAME || 'cns.connect.sid';
module.exports = {
    SESSION_SECRET,
    SESSION_NAME,
}
