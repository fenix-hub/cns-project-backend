/*
 * session.js
 * 
 * This script contains all the configuration parameters required for the "session" middleware
 */

require('dotenv').config()
const SESSION_SECRET = process.env.SESSION_SECRET || 'secret';
const SESSION_NAME = process.env.SESSION_NAME || 'cns.connect.sid';
const RESAVE = false;
const SAVE_UNINITIALIZED = false;
const MAX_AGE = 24 * 60 * 60 * 1000 * 30; // 30 days
module.exports = {
    secret: SESSION_SECRET,
    name: SESSION_NAME,
    resave: RESAVE,
    saveUninitialized: SAVE_UNINITIALIZED,
    maxAge: MAX_AGE,
}
