const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/session', function(req, res, next) {
  // Extract client IP address and user agent
  const clientIp = req.ip !== "::1" ? req.ip : req.headers['x-forwarded-for'];
  const userAgent = req.headers['user-agent'];

  // Extract session ID from cookies
  const sessionId = req.session.id;

  const response = {
    sessionId,
    clientIp,
    userAgent,
    timestamp: new Date().toISOString(),
  };

  console.log(response)

  // Send a response back to the client
  res.status(200).json(response);
});

module.exports = router;
