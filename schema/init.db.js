/*
    * This script initializes the database with some sample data.
    * It is meant to be run only once, when the database is empty.
 */

const Stream = require("./stream");
const hash = require('object-hash');

const firstId = "7bc5358b02a150b834fa9aa44e928b9e6bf20848";
// should be hash(Date.now())

const streams = [
    new Stream({
        id: firstId,
        name: "Lago Storo",
        description: "Vista del lago di Storo",
        ref: `http://localhost:3000/videos/${firstId}/master.m3u8`,
        resolutions: [
            '640x360', '960x540', '1290x720'
        ],
        createdAt: new Date().toISOString(),
    }),
]

module.exports = () => {
    streams.forEach((stream) => {
        stream.save().then(
            () => {
                console.log(`Stream ${stream.id} saved to database`);
            }
        ).finally(
            () => {
                console.log("Database initialized");
                process.exit(0);
            }
        )
    });
}
