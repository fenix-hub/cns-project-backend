/*
 * http.js
 *
 * This script instantiates an HTTP server.
 * "request-ip" middleware is used in order to find the client's ip (it is a complex procedure that requires reading differnet sources)
 * "session" middleware is used in order to create a new session and persist it in memory for further requests from a client.
 * The session is handled through session cookies.
 * "cors" middleware is used in order to manage Cross Origin Requests from clients
 * "cookie-parser" middleware is used in order to read cookies from a request Object
 *
 * The HTTP Server currently servers several paths following a RESTful approach,
 * and also servers an internal directory on the filesystem to expose HLS/DASH videos.
 */
 
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require("cors");
const session = require("express-session");
const requestIp = require("request-ip");

const app = express();


app.use(requestIp.mw())
app.use(logger('dev'));
app.use(cors({
    credentials: true,
    origin: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set('trust proxy', 1) // trust first proxy

const { SESSION_SECRET, SESSION_NAME } = require('./session');

const sessionConfig = {
    secret: SESSION_SECRET,
    name: SESSION_NAME,
}

app.use(session(sessionConfig))

// The "session" router, handling requests associated to "SESSIONS"
const sessionRouter = require('./routes/sessions');
// The "stream" router, handling requests regarding Videos and Streams
const streamRouter = require('./routes/streams');

app.use('/sessions', sessionRouter);
app.use('/streams', streamRouter);
app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;
