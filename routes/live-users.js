/*
 * routes/live-users.js
 *
 * This scripts contains the logic associated to the Live Users websocket path.
 * A client can notify the server about a "session" consuming a stream by connecting to the websocket
 * with an active session. A session must be obtained through the Stream Router (see routes/streams.js)
 * A client must send the ID associated to the Stream it is consuming, and eventually a Client ID to identify itself (if a session is not created).
 * Each connected client will receive a message about the total amount of connected users consuming the same stream,
 * each time a client joins or leaves the stream. (i.e. { "liveUsersCount" : 3 })
 * Clients are also able to send messages in broadcast to "sessions" consuming the same stream.
 */

const express = require('express');
const router = express.Router();
const cookieParser = require("cookie-parser");
const {name} = require("../session");


// Variables
const streams = new Map(); // Map to keep track of client IDs and WebSocket connections

router.ws("/", (ws, req) => {
    const streamId = req.query.streamId
        || req.query['stream-id']
    ; // Extract the client ID from the query parameters
    const clientId = req.cookies[name]
        || req.query.clientId
        || req.query['client-id']
    ; // Extract the client ID from the query parameters
    req.session.connections++;

    let missingParams = [];

    if (!streamId) missingParams.push('streamId');
    if (!clientId) missingParams.push('clientId');

    if (missingParams.length !== 0) {
        ws.send(JSON.stringify({ error: `Params ${ missingParams } required`, code: 400 }));
        ws.close();
        return;
    }

    // Associate the WebSocket connection with the client ID
    if (!streams.has(streamId)) {
        streams.set(streamId, new Map());
    }
    streams.get(streamId).set(clientId, ws);

    console.log(`Client ${ clientId } connected to stream ${ streamId }`);

    // Send the live users count to this client
    broadcastUsersCount(streamId);

    ws.on('message', (message) => {
        // Broadcast the message to all connected clients
        console.log(`Client ${ clientId } sent message to stream ${ streamId }`)
        broadcastMessage(message, streamId, clientId);
    });

    ws.on('close', () => {
        // Remove the client from the map when they disconnect
        streams.get(streamId).delete(clientId);
        if (streams.get(streamId).size === 0) {
            streams.delete(streamId);
        } else {
            // Update all connected clients with the new live users count
            broadcastUsersCount(streamId);
        }

        console.log(`Client ${ clientId } disconnected from stream ${ streamId }`);
    });
});

function broadcastUsersCount(streamId) {
    // Send the updated count to all connected clients
    streams?.get(streamId).forEach((ws) => {
        ws.send(JSON.stringify({ liveUsersCount: streams.get(streamId).size }));
    });
}

function broadcastMessage(message, streamId, senderClientId) {
    streams.get(streamId).forEach((ws, clientId) => {
        // Skip sending the message to the sender
        if (clientId !== senderClientId) {
            const responseMessage = JSON.stringify({
                senderClientId,
                message
            });
            ws.send(responseMessage);
        }
    });
}

module.exports = router;
