const NodeMediaServer = require('node-media-server');
const Stream = require("./schema/stream");
const ffmpeg = require('./ffmpeg');
const ffmpegSessions = {};

const config = {
    rtmp: {
        port: 1935, // Porta RTMP
        chunk_size: 60000,
        gop_cache: true,
        ping: 60,
        ping_timeout: 30,
    }
};

const nms = new NodeMediaServer(config);
nms.on('prePublish', (id, StreamPath, args) => {
    console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    ffmpegSessions[id] = ffmpeg(id, StreamPath);
    const stream = new Stream({
        id: id,
        createdAt: new Date().toISOString(),
        name: `OBS Live #${id}`,
        ref: `http://localhost:3000${StreamPath}/master.m3u8`,
        isLive: true
    })
    stream.save().then(() => {
        console.log(`Stream ${stream.id} saved to database`);
    })
});
nms.on('donePublish', (id, args) => {
    console.log('[NodeEvent on doneConnect]', `id=${id} args=${JSON.stringify(args)}`);

    ffmpegSessions[id].kill();
    delete ffmpegSessions[id];

    Stream.findOneAndUpdate({id: id}, {isLive: false}).then(() => {
        console.log(`Stream ${id} updated from database`);
    })
});
module.exports = nms;
