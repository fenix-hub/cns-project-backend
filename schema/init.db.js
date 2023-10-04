/*
    * This script initializes the database with some sample data.
    * It is meant to be run only once, when the database is empty.
 */

const Stream = require("./stream");
const mongoose = require("mongoose");
const dbUrl = 'mongodb://localhost:27017'; // Replace with your MongoDB connection URL and database name
const hash = require('object-hash');

const firstId = "7bc5358b02a150b834fa9aa44e928b9e6bf20848";
// should be hash(Date.now())

const streams = [
    new Stream({
        id: firstId,
        name: "Matteo Paiella",
        description: "Matteo Paiella fa il panino",
        ref: "http://localhost:3000/videos/tmp/master.m3u8",
        resolutions: [
            '202x360', '304x540', '406x720'
        ],
        createdAt: new Date().toISOString(),
    }),
]

mongoose.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});
streams.forEach((stream) => {
    stream.save().then(
        () => {
            console.log(`Stream ${ stream.id } saved to database`);
        }
    )
});
