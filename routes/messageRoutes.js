// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

router.post('/send', messageController.sendMessage);
// Route to get conversations for logged-in user
router.get('/conversations', messageController.getConversations);

// Route to get messages between the logged-in user and another user
router.get('/messages/:userId2', messageController.getMessages);

module.exports = router;
