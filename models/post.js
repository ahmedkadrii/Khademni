// models/Post.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Post schema
const PostSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  enterpriseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enterprise',
    required: false
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

// Pre-save middleware to set the updatedAt field
PostSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create and export the Post model
module.exports = mongoose.model('Post', PostSchema);
