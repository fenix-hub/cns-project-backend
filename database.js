/*
 * database.js
 *
 * This script creates a connection to a MongoDB database.
 */

const mongoose = require('mongoose');

module.exports = function connect(dbUrl) {
    mongoose.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true});

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    db.once('open', () => {
        console.log('Connected to MongoDB');
    });

    return db;
}
