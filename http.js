const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require("cors");
const session = require("express-session");

const app = express();


// view engine setup

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

const usersRouter = require('./routes/users');
const streamRouter = require('./routes/streams');

app.use('/users', usersRouter);
app.use('/streams', streamRouter);
app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;
