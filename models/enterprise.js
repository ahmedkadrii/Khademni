const mongoose = require('mongoose');
const Job = require('./job'); // Import the Job model

const enterpriseSchema = new mongoose.Schema({
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
  phone: {
    type:Number,
    unique:true
  },
  contactEmail: {
    type: String,
    unique: true},

  markedForDeletion: {
    type: Boolean,
    default: false
  },
  deletionRequestedAt: {
    type: Date,
    default: null
  },
  reports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  }],
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
  approved: {
    type: Boolean,
    default: false
  }
});

// Middleware to delete jobs associated with the enterprise when the enterprise is deleted
enterpriseSchema.pre('remove', async function(next) {
  try {
    console.log('Pre-hook middleware: Deleting jobs associated with the enterprise...');
    await Job.deleteMany({ createdBy: this._id });
    console.log('Jobs deleted.');

    next();
  } catch (error) {
    next(error);
  }
});

const Enterprise = mongoose.model('Enterprise', enterpriseSchema);

module.exports = Enterprise;
