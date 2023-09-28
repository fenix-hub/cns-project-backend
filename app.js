const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes');
const usersRouter = require('./routes/users');
const streamRouter = require('./routes/stream');
const liveUsersRouter = require('./routes/live-users');
const cors = require("cors");
const session = require("express-session");
const expressWs = require("express-ws");
const stream = require("stream");

const http = express();
const ws = express();


// view engine setup
http.use(express.static(path.join(__dirname, 'public')));

http.use(logger('dev'));
http.use(cors({ credentials: true, origin: "*" }));
http.use(express.json());
http.use(express.urlencoded({ extended: false }));
http.use(cookieParser());
http.set('trust proxy', 1) // trust first proxy


ws.use(express.json());
ws.use(express.urlencoded({ extended: false }));
ws.use(cookieParser());
ws.set('trust proxy', 1) // trust first proxy
expressWs(ws);


const { SESSION_SECRET, SESSION_NAME } = require('./routes/session');

const sessionConfig = {
    secret: SESSION_SECRET,
    name: SESSION_NAME,
}

http.use(session(sessionConfig))
ws.use(session(sessionConfig))


http.use('/', indexRouter);
http.use('/users', usersRouter);
http.use('/stream', streamRouter);

// catch 404 and forward to error handler
http.use(function(req, res, next) {
  next(createError(404));
});


ws.ws('/live-users', liveUsersRouter);

// Start listening on different ports
const expressPort = 3000;
const wsPort = 3001;

http.listen(expressPort, () => {
  console.log(`Express app listening on port ${expressPort}`);
});

ws.listen(wsPort, () => {
  console.log(`WebSocket server listening on port ${wsPort}`);
});

module.exports = http;
