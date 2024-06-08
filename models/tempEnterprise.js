const mongoose = require('mongoose');

const tempEnterpriseSchema = new mongoose.Schema({
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
  role: {
    type: String,
    enum: ['enterprise'],
    default: 'enterprise'
  },
  name: {
    type: String,
    required: true
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
  businessDocument: {
    type: String,
    required: true // Path to the uploaded document
  },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enterprise'
    }
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enterprise'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to lowercase username before saving
tempEnterpriseSchema.pre('save', function(next) {
  if (this.isModified('username')) {
    this.username = this.username.toLowerCase();
  }
  next();
});

const TempEnterprise = mongoose.model('TempEnterprise', tempEnterpriseSchema);

module.exports = TempEnterprise;
