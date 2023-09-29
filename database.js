const mongoose = require('mongoose');
const dbUrl = 'mongodb://localhost:27017'; // Replace with your MongoDB connection URL and database name

module.exports = function connect() {
    mongoose.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true});

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    db.once('open', () => {
        console.log('Connected to MongoDB');
    });

    return db;
}
