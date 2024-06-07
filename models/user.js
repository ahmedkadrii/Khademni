// models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  contactEmail: {
    type: String,
    unique: true},
phone: {
  type:Number,
  unique:true
},
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user'],
    default: 'user'
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
  cv: {
    type: String,
    default: ''
  },
  confirmed: {
    type: Boolean,
    default: false
  },
  confirmationToken: {
    type: String
  },
  accountStatus: {
    type: String,
    enum: ['pending', 'active'],
    default: 'pending'
  },
  resetPasswordToken: 
  { type: String 

  },
  resetPasswordExpires: {
     type: Date 
    },

// NEWWWWWWWWWW
skills: [
  {
    type: String
  }
],

markedForDeletion: { type: Boolean, default: false },
deletionRequestedAt: { type: Date, default: null },


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
// NEWWWWWWWWWWWWWWWW

bookmarks: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Job'
}],
reports: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Report'
}],


  jobApplications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobApplication'
    }
  ]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
