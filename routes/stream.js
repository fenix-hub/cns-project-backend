const express = require('express');
const router = express.Router();

router.post('/stopped', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/view', (req, res) => {
  // Extract stream ID and resolution from the request body
  const { streamId, resolution } = req.body;

  // Extract session ID from cookies
  const sessionId = req.session.id;

  // Extract client IP address and user agent
  const clientIp = req.ip !== "::1" ? req.ip : req.headers['x-forwarded-for'];
  const userAgent = req.headers['user-agent'];

  // TODO: Add logic to handle the stream start information (e.g., store in a database)

  req.session.views = (req.session.views || 0) + 1;

  const response = {
    message: 'Stream start information received successfully',
    streamId,
    resolution,
    sessionId,
    clientIp,
    userAgent,
    views: req.session.views,
    timestamp: new Date().toISOString(),
  };

  console.log(response)

  // Send a response back to the client
  res.status(200).json(response);
});

router.get('/started', (req, res) => {
  // Extract stream ID and resolution from the request body
  const { streamId, resolution } = req.body;

  // Extract session ID from cookies
  const sessionId = req.session.id;

  // Extract client IP address and user agent
  const clientIp = req.ip !== "::1" ? req.ip : req.headers['x-forwarded-for'];
  const userAgent = req.headers['user-agent'];

  // TODO: Add logic to handle the stream start information (e.g., store in a database)

  req.session.views = (req.session.views || 0) + 1;

  const response = {
    message: 'Stream start information received successfully',
    streamId,
    resolution,
    sessionId,
    clientIp,
    userAgent,
    views: req.session.views,
    timestamp: new Date().toISOString(),
  };

  console.log(response)

  // Send a response back to the client
  res.status(200).json(response);
});

module.exports = router;
