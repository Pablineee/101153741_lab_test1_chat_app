// Chat Routes
const express = require('express');
const router = express.Router();

const GroupMessage = require('../models/groupMessage');
const PrivateMessage = require('../models/privateMessage');

// Get group messages for room
router.get('/group/:room', async (req, res) => {
    try {
        const messages = await GroupMessage.find({ room: req.params.room }).sort({ date_sent: 1 });
        res.json(messages);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get private messages between two users
router.get('/private', async (req, res) => {
    const { from_user, to_user, message } = req.body;
    try {
        const messages = await PrivateMessage.find({
            // Find all messages to and from between both users
            $or: [
                { from_user, to_user },
                { from_user: to_user, to_user: from_user }
            ]
        }).sort({ date_sent: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Send a private message
router.post('/private', async (req, res) => {
    const { from_user, to_user, message } = req.body;
    try {
        // Create new private message
        const privateMessage = new PrivateMessage({ from_user, to_user, message });
        // Save newly created private message to database
        await privateMessage.save();
        res.json({ message: 'Private message sent' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;