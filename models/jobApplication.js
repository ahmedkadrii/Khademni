// models/jobApplication.js

const mongoose = require('mongoose');
const User = require('./user');


const jobApplicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
  },

  cv: {
    type: String, // Assuming the CV file path will be stored as a string
    required: true
  },

  applicationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
});

// Middleware to remove the job application ID from the user's jobApplications array when the job application is deleted
jobApplicationSchema.pre('remove', async function(next) {
  try {
    // Find the user associated with the job application
    const user = await User.findById(this.userId);
    if (!user) {
      return next(new Error('User not found'));
    }

    // Remove the job application ID from the user's jobApplications array
    user.jobApplications.pull(this._id);
    await user.save();

    next();
  } catch (error) {
    next(error);
  }
});


// Method to update application status
jobApplicationSchema.methods.updateStatus = async function(status) {
    this.status = status;
    await this.save();
  };
  
const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

module.exports = JobApplication;
