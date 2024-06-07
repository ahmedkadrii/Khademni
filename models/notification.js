const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, refPath: 'recipientModel', required: true },
  recipientModel: { type: String, required: true, enum: ['User', 'Enterprise'] },
  sender: { type: mongoose.Schema.Types.ObjectId, refPath: 'senderModel' },
  senderModel: { type: String, required: true, enum: ['User', 'Enterprise'] },
  type: { type: String, enum: ['follow', 'acceptance', 'rejection'], required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
