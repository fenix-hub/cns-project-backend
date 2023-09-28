const streams = new Map(); // Map to keep track of client IDs and WebSocket connections
const { SESSION_SECRET, SESSION_NAME } = require('./session');
const cookieParser = require('cookie-parser');

liveUsersFunc = (ws, req) => {
    const streamId = req.query.streamId
        || req.query['stream-id']
    ; // Extract the client ID from the query parameters
    const clientId = cookieParser.signedCookie(req.cookies[SESSION_NAME], SESSION_SECRET)
        || req.query.clientId
        || req.query['client-id']
    ; // Extract the client ID from the query parameters

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
    ws.send(JSON.stringify({ liveUsersCount: streams.get(streamId).size }));

    ws.on('message', (message) => {
        // Broadcast the message to all connected clients
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
};

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

module.exports = liveUsersFunc;
