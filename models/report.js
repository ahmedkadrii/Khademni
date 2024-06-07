const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'reportedByType',
    required: true
  },
  reportedByType: {
    type: String,
    required: true,
    enum: ['User', 'Enterprise']
  },
  reported: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'reportedType',
    required: true
  },
  reportedType: {
    type: String,
    required: true,
    enum: ['User', 'Enterprise']
  },
  reason: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending'
  }
});

module.exports = mongoose.model('Report', reportSchema);
