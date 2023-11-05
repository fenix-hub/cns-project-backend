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
        streamKey: firstId,
        name: "Lago Storo",
        description: "Vista del lago di Storo",
        ref: `http://localhost:3000/streams/${firstId}/master.m3u8`,
        resolutions: [
            '640x360', '960x540', '1290x720'
        ],
        createdAt: new Date().toISOString(),
        isLive: false
    }),
]

module.exports = () => {
    let ctr = 0;
    streams.forEach((stream) => {
        stream.save().then(
            () => {
                console.log(`Stream ${stream.id} saved to database`);
            }
        ).finally(
            () => {
                ctr ++;
                if (ctr === streams.length) {
                    console.log("Database initialized");
                    process.exit(0);
                }
            }
        )
    });
}
