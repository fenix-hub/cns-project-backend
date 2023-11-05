/*
 * database.js
 *
 * This script creates a connection to a MongoDB database.
 */

require('dotenv').config()
const mongoose = require('mongoose');
const log4js = require('log4js');
const logger = log4js.getLogger();
logger.level = 'info';

module.exports = function connect(dbUrl) {
    mongoose.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true});

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    db.once('open', () => {
        logger.info('Connected to database on: ' + dbUrl);
    });

    return db;
}
