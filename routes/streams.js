const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  res.status(200).json([
    {
        id: 1,
        name: "Stream 1",
        description: "Stream 1 description",
        src: "/videos/tmp/matteo_paiella.m3u8",
        resolutions: [
            '202x360', '304x540', '406x720'
        ]
    }
  ]);
});

router.post('/stopped', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/started', function(req, res, next) {
  res.send('respond with a resource');
});


router.post('/:streamId/view', (req, res) => {
  // Extract stream ID and resolution from the request body
  const { resolution } = req.body;
  const { streamId } = req.params;
  // Extract client IP address and user agent
  const clientIp = req.ip !== "::1" ? req.ip : req.headers['x-forwarded-for'];
  const userAgent = req.headers['user-agent'];

  // Extract session ID from cookies
  const sessionId = req.session.id;

  // TODO: Add logic to handle the stream start information (e.g., store in a database)

  req.session.views = (req.session.views || 0) + 1;

  const response = {
    clientIp,
    userAgent,
    sessionId,
    streamId,
    resolution,
    views: req.session.views,
    timestamp: new Date().toISOString(),
  };

  console.log(response)

  // Send a response back to the client
  res.status(200).json(response);

});

module.exports = router;
