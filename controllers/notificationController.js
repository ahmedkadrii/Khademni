const Notification = require('../models/notification');

exports.createNotification = async (req, res) => {
  try {
    const { recipient, recipientModel, sender, senderModel, type, content } = req.body;

    const notification = new Notification({ recipient, recipientModel, sender, senderModel, type, content });
    await notification.save();

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getNotifications = async (req, res) => {
    try {
      const userId = req.session.userId; // Assuming the logged-in user's ID is stored in req.session.userId
  
      // Define the duration after which notifications should expire (e.g., 1 minute)
      const EXPIRATION_DURATION_MS = 60 * 1000; // 1 minute in milliseconds
  
      // Calculate the expiration date by subtracting the duration from the current time
      const expirationDate = new Date(Date.now() - EXPIRATION_DURATION_MS);
  
      // Remove expired notifications before fetching
      await Notification.deleteMany({ recipient: userId, createdAt: { $lt: expirationDate } });
  
      // Fetch non-expired notifications for the user
      const notifications = await Notification.find({ recipient: userId }).sort({ createdAt: -1 });
  
      res.status(200).json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  