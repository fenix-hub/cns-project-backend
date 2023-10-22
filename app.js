/*
 * app.js
 *
 * This script serves up the whole project.
 * The purpose of this script is to embed all the connections and servers in a single place,
 * in order to make the whole project more readable.
 */

// Start listening on different ports
const httpPort = process.env.HTTP_PORT || 3000;
const wsPort = process.env.WS_PORT || 3001;
// Database URL configuration varaible, either environment variable or local variable
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/cns'; // Replace with your MongoDB connection URL and database name

const db = require('./database')(dbUrl);

if (process.argv[2] && process.argv[2] === '--init-db') {
    require('./schema/init.db')();
}

const http = require('./http');
const ws = require('./websocket');
const nms = require('./nms');

http.listen(httpPort, () => {
  console.log(`Express app listening on port ${httpPort}`);
});

ws.listen(wsPort, () => {
  console.log(`WebSocket server listening on port ${wsPort}`);
});

nms.run();
