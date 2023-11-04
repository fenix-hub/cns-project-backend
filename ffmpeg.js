require('dotenv').config()
const { spawn } = require('node:child_process');
const fs = require('fs');

let ffmpeg = process.env.FFMPEG_PATH;
let inPath = "rtmp://localhost:" + ( process.env.RTMP_PORT || 1935 );
let outPath = './public';

let debug = false;

if (!ffmpeg) {
    console.error("FFMPEG_PATH environment variable not set");
    process.exit(1);
}

module.exports = function run(id, streamPath) {
    let output = `${outPath}${streamPath}`;
    let streamUrl = `${inPath}${streamPath}`;

    fs.mkdirSync(output, { recursive: true })
    let argv = [];
    Array.prototype.push.apply(argv, [
        '-y', '-sn', '-dn', '-thread_queue_size', '64', '-i', streamUrl,
        '-filter_complex', '[0:v]format=yuv420p,split=3[v0][v1][v2];[v0]fps=15,scale=-2:360[v0e];[v1]fps=25,scale=-2:540[v1e];[v2]fps=30,scale=-2:720[v2e];[0:a]aresample=48000,asplit=3[a0e][a1e][a2e]',
        '-map', '[v0e]', '-c:v:0', 'libx264', '-profile:v:0', 'baseline', '-b:v:0', '500k', '-r:v:0', '15', '-bufsize:v:0', '1000k', '-x264opts:v:0', 'keyint=48:min-keyint=48:scenecut=-1:no-sliced-threads', '-thread_type:v:0', 'frame', '-bf:v:0', '0', '-preset:v:0', 'veryfast', '-tune:v:0', 'zerolatency',
        '-map', '[a0e]', '-c:a:0', 'aac', '-b:a:0', '96k', '-ar:a:0', '48000', '-ac:a:0', '2',
        '-map', '[v1e]', '-c:v:1', 'libx264', '-profile:v:1', 'main', '-b:v:1', '1000k', '-r:v:1', '25', '-bufsize:v:1', '2000k', '-x264opts:v:1', 'keyint=80:min-keyint=80:scenecut=-1:no-sliced-threads', '-thread_type:v:1', 'frame', '-bf:v:1', '0', '-preset:v:1', 'veryfast', '-tune:v:1', 'zerolatency',
        '-map', '[a1e]', '-c:a:1', 'aac', '-b:a:1', '192k', '-ar:a:1', '48000', '-ac:a:1', '2',
        '-map', '[v2e]', '-c:v:2', 'libx264', '-profile:v:2', 'high', '-b:v:2', '2000k', '-r:v:2', '30', '-bufsize:v:2', '4000k', '-x264opts:v:2', 'keyint=96:min-keyint=96:scenecut=-1:no-sliced-threads', '-thread_type:v:2', 'frame', '-bf:v:2', '0', '-preset:v:2', 'veryfast', '-tune:v:2', 'zerolatency',
        '-map', '[a2e]', '-c:a:2', 'aac', '-b:a:2', '192k', '-ar:a:2', '48000', '-ac:a:2', '2',
        '-init_seg_name', `init-$RepresentationID$-$Time$.m4s`, '-media_seg_name', "frag-$Number$-$RepresentationID$-$Time$.m4s",
        '-use_template', '1', '-use_timeline', '1', '-utc_timing_url', '"https://time.akamai.com/?iso"', '-seg_duration', '3.2', '-frag_duration', '3.2',
        '-window_size', '180', '-extra_window_size', '5', '-streaming', '1', '-hls_playlist', '1', '-hls_master_name', 'master.m3u8',
        '-adaptation_sets', 'id=0,streams=v id=1,streams=a', '-f', 'dash', `${output}/live.mpd`
    ]);
    if (debug) {
        Array.prototype.push.apply(argv, ['-loglevel', 'debug', '-v', 'info']);
    }
    let ffmpegExec = spawn(ffmpeg, argv);
    if (debug) {
        ffmpegExec.stdout.pipe(process.stdout)
        ffmpegExec.stderr.pipe(process.stderr)
    }
    return ffmpegExec
}
