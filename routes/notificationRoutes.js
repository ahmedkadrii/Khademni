const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Define notification-related routes
router.post('/not', notificationController.createNotification);
router.get('/:userId', notificationController.getNotifications);

module.exports = router;
