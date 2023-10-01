const express = require('express');
const router = express.Router();
const User = require('../schema/user');

router.get('/', async function (req, res, next) {
    const users = await User.find();
    res.status(200).json(users);
});

/* POST users listing. */
router.post('/', async function (req, res, next) {
    // Extract client IP address and user agent
    const clientIp = req.clientIp;
    const userAgent = req.headers['user-agent'];

    // Extract session ID from cookies
    const sessionId = req.session.id;

    await User.findOne({sessionId: sessionId, clientIp: clientIp, userAgent: userAgent})
        .then((user) => {
                if (!user) {
                    const response = {
                        sessionId,
                        clientIp,
                        userAgent,
                        timestamp: new Date().toISOString(),
                    };
                    const newUser = new User(response);
                    newUser.save().then(
                        (session) => {
                            console.log("User saved to database");
                            // Send a response back to the client
                            res.status(200).json(session);
                        }
                    );
                } else {
                    console.log("User already exists")
                    res.status(200).json(user);
                }
            }
        );
});

module.exports = router;
