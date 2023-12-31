/*
 * websocket.js
 * 
 * This script instantiates a websocket server opening a route on "/live-users" path.
 * The "cookie-parser" and "session" middlewares are used in order to handle the same session
 * managed by the HTTP Server (see http.js)
*/

require('dotenv').config()
const express = require("express");
const session = require("express-session");
const cookieParser = require('cookie-parser');
const expressWs = require("express-ws");
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set('trust proxy', 1) // trust first proxy, in order to pass cookies if there's a proxy
expressWs(app);

const sessionConfig = require('./session');
app.use(session(sessionConfig));


const liveUsersRouter = require('./routes/live-users');
app.use('/live-users', liveUsersRouter);

module.exports = app;
