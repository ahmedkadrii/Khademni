// models/TempUser.js

const mongoose = require('mongoose');

const tempUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  address: {
    type: String
  },
  bio: {
    type: String
  },
  logo: {
    type: String
  },
  confirmationToken: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // 1 hour
  }
});

const TempUser = mongoose.model('TempUser', tempUserSchema);

module.exports = TempUser;
