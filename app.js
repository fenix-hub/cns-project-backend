/*
 * app.js
 *
 * This script serves up the whole project.
 * The purpose of this script is to embed all the connections and servers in a single place,
 * in order to make the whole project more readable.
 */

require('dotenv').config()
// Start listening on different ports
const httpPort = process.env.HTTP_PORT || 3000;
const wsPort = process.env.WS_PORT || 3001;
// Database URL configuration varaible, either environment variable or local variable
const dbUrl = `mongodb://${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '27017'}/${process.env.DB_NAME || 'cns'}`;
const log4js = require('log4js');
const logger = log4js.getLogger();
logger.level = 'info';

const db = require('./database')(dbUrl);

if (process.argv[2] && process.argv[2] === '--init-db') {
    require('./schema/init.db')();
}

const http = require('./http');
const ws = require('./websocket');
const nms = require('./nms');

http.listen(httpPort, () => {
  logger.info(`Express app listening on port: ${httpPort}`);
});

ws.listen(wsPort, () => {
  logger.info(`WebSocket server listening on port: ${wsPort}`);
});

nms.run();
