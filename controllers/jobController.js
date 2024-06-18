// controllers/jobController.js

const Job = require('../models/job');
const Enterprise = require('../models/enterprise'); // Import the Enterprise model
const JobApplication = require('../models/jobApplication'); // Import the JobApplication model
const User = require('../models/user');
const mongoose = require('mongoose');


exports.createJob = async (req, res) => {
  const { title, description, minSalary, maxSalary, domains, cities, deadline, exp, types } = req.body;
  const userId = req.session.userId; // Assuming the user ID is stored in the session
  
  try {
    // Find the enterprise based on the user ID
    const enterprise = await Enterprise.findById(userId);
    if (!enterprise) {
      return res.status(404).json({ message: 'Enterprise not found' });
    }
  
    // Create the job using the enterprise's ID
    const job = await Job.create({
      title,
      description,
      salary: { minSalary, maxSalary }, // Salary range object
      domains,
      cities,
      exp,
      types,
      deadline,
      createdBy: enterprise._id // Assigning the enterprise's ID directly
    });
  
    res.status(201).json({ message: 'Job created successfully', job });
  } catch (err) {
    console.error('Error creating job:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};  

// Server-side route to get all jobs with pagination
exports.getJobs = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const currentDate = new Date();

    // Count documents excluding those with deadlines in the past
    const totalJobs = await Job.countDocuments({ deadline: { $gte: currentDate } });

    // Find jobs excluding those with deadlines in the past
    const jobs = await Job.find({ deadline: { $gte: currentDate } })
      .populate('createdBy') // Populate the createdBy field with user data
      .populate('applications') // Populate the applications field with job applications
      .skip(skip)
      .limit(limit);

    const userId = req.session.userId; // Get the ID of the currently logged-in user
    const userRole = req.session.role; // Assuming the user's role is stored in the session

    res.status(200).json({
      jobs,
      userId,
      userRole,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
      totalJobs
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};





// get total job count for home page
exports.getAllJobs = async (req, res) => {
  try {
    // Populate the 'createdBy' field with the 'companyName'
    const jobs = await Job.find().populate('createdBy');
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getLatestJobs = async (req, res) => {
  try {
    const currentDate = new Date();

    const latestJobs = await Job.find({ deadline: { $gte: currentDate } }) // Exclude expired job offers
      .sort({ datePosted: -1 })
      .limit(6)
      .populate('createdBy') // Populate the createdBy field with user data
      .populate('applications'); // Populate the applications field with job applications

    res.status(200).json({ jobs: latestJobs });
  } catch (error) {
    console.error('Error fetching latest jobs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



exports.getJobById = async (req, res) => {
  const jobId = req.params.id;

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json(job);
  } catch (error) {
    console.error('Error fetching job by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateJob = async (req, res) => {
  const jobId = req.params.id;
  const { title, description, cities, salary, exp, deadline, types,domains } = req.body;

  try {
    const job = await Job.findByIdAndUpdate(jobId, {
      title,
      exp,
      deadline,
      types,
      description,
      domains,
      cities,
      salary: {
        minSalary: salary.minSalary,
        maxSalary: salary.maxSalary
      }
    }, { new: true });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json({ message: 'Job updated successfully', job });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteJob = async (req, res) => {
  const jobId = req.params.id;

  try {
    // Find all job applications related to the job being deleted
    const jobApplications = await JobApplication.find({ jobId }).lean(false);

    // Delete all found job applications and remove their IDs from associated users
    await Promise.all(jobApplications.map(async (jobApp) => {
      // Find the user associated with the job application
      const user = await User.findById(jobApp.userId);
      if (user) {
        // Remove the job application ID from the user's jobApplications array
        user.jobApplications.pull(jobApp._id);
        await user.save();
      }
      // Delete the job application
      await JobApplication.deleteOne({ _id: jobApp._id });
    }));

    // Remove the job
    const result = await Job.deleteOne({ _id: jobId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json({ message: 'Job and associated job applications deleted successfully' });
  } catch (error) {
    console.error('Error deleting job and associated job applications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



exports.getJobsByEnterprise = async (req, res) => {
  const { enterpriseId } = req.params;

  // Validate the enterpriseId
  if (!mongoose.Types.ObjectId.isValid(enterpriseId)) {
    return res.status(400).json({ message: 'Invalid enterprise ID' });
  }

  try {
    // Convert enterpriseId to a valid ObjectId
    const objectId = new mongoose.Types.ObjectId(enterpriseId);
    const currentDate = new Date();

    // Fetch jobs by enterprise ID from the database
    const jobs = await Job.find({ createdBy: objectId }).lean();

    // Add a flag to indicate if the job is past its deadline
    jobs.forEach(job => {
      job.isPastDeadline = job.deadline < currentDate;
    });

    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching jobs by enterprise ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// jobController.js


exports.sortJobs = async (req, res) => {
  try {
    const { domain, city, minSalary, maxSalary, types, exp, title, sortBy } = req.query;

    let query = {};
    const currentDate = new Date();

    if (domain) {
      query.domains = domain;
    }
    if (types) {
      query.types = { $in: types.split(',') };
    }
    if (exp) {
      query.exp = { $in: exp.split(',') };
    }
    if (city) {
      query.cities = { $regex: city, $options: 'i' }; // Case-insensitive search for city
    }
    if (minSalary) {
      query['salary.minSalary'] = { $gte: minSalary };
    }
    if (maxSalary) {
      query['salary.maxSalary'] = { $lte: maxSalary };
    }
    if (title) {
      query.title = { $regex: title, $options: 'i' }; // Case-insensitive search
    }
    query.deadline = { $gte: currentDate }; // Exclude jobs past their deadline

    const jobsQuery = Job.find(query).populate('createdBy');

    // Sorting
    if (sortBy === 'newest') {
      jobsQuery.sort({ datePosted: -1 }); // Sort by newest first
    } else if (sortBy === 'oldest') {
      jobsQuery.sort({ datePosted: 1 }); // Sort by oldest first
    }

    const jobs = await jobsQuery.exec();

    res.status(200).json({ jobs });
  } catch (error) {
    console.error('Error sorting jobs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Job views
exports.incrementJobViews = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const userId = req.session.userId; // Assuming you have user sessions

    // Get user IP address
    const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const normalizedIp = userIp === '::1' ? '127.0.0.1' : userIp; // Normalize IPv6 loopback to IPv4

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if the job has already been viewed by this user or IP address
    if (userId && job.viewedBy.includes(userId)) {
      return res.status(200).json({ message: 'Job already viewed by user', views: job.views });
    } else if (!userId && job.viewedByIps.includes(normalizedIp)) {
      return res.status(200).json({ message: 'Job already viewed by IP', views: job.views });
    }

    // Increment views and update viewedBy or viewedByIps
    job.views += 1;
    if (userId) {
      job.viewedBy.push(userId);
    } else {
      job.viewedByIps.push(normalizedIp);
    }
    await job.save();

    res.status(200).json({ message: 'Job view incremented', views: job.views });
  } catch (error) {
    console.error('Error incrementing job views:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



// BOOKMARK
exports.bookmark = async (req, res) => {
  try {
    const { userId, jobId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.bookmarks.includes(jobId)) {
      user.bookmarks.push(jobId);
      await user.save();
    }

    res.status(200).json({ message: 'Job bookmarked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.removeBookmark = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.session.userId; // Retrieve the user ID from the session

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.bookmarks = user.bookmarks.filter(bookmark => bookmark.toString() !== jobId);
    await user.save();

    res.status(200).json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.fetchBookmarks = async (req, res) => {
  try {
    // Retrieve the user ID from the session
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId).populate('bookmarks');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ bookmarks: user.bookmarks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

