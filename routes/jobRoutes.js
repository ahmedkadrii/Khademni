// routes/jobRoutes.js

const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const jobApplicationController = require('../controllers/jobApplicationController');

const { isAuth, isUser, isEnterprise, isJobOwner, isAppOwner, isAllowed, appEnterprise  } = require('../middleware/authMiddleware');
const upload = require('../middleware/fileUploadMiddleware');

// Create a new job
router.post('/', isAuth, isEnterprise, jobController.createJob);


// Route to fetch all jobs and display them in the stat section in the frontend
router.get('/all', jobController.getAllJobs);

// Get all jobs
router.get('/', jobController.getJobs);

// Increment view count for a job listing
router.get('/:jobId/increment-views', jobController.incrementJobViews);

router.get('/latest', jobController.getLatestJobs); // New endpoint for latest jobs
// Bookmark a job

router.post('/bookmark', jobController.bookmark);

// Fetch bookmarked jobs
router.get('/bookmarks', jobController.fetchBookmarks);
// Remove a bookmark
router.post('/removeBookmark', jobController.removeBookmark);

// Route for getting applied jobs by the current user
router.get('/applied-jobs', isAuth, isUser, jobApplicationController.getAppliedJobs);


router.get('/applications', isAuth, appEnterprise, jobApplicationController.getApplicationsForEnterprise);


// Define a route to handle GET requests to fetch jobs
router.get('/sort-jobs', jobController.sortJobs);


// Route to get jobs by enterprise ID
router.get('/:enterpriseId', jobController.getJobsByEnterprise);



// Get a specific job by ID
router.get('/:id', jobController.getJobById);

// Update a job by ID
router.put('/:id', isAuth, isEnterprise, isJobOwner, jobController.updateJob);

// Delete a job by ID
router.delete('/:id', isAuth, isEnterprise, isJobOwner, jobController.deleteJob);

// Apply for a job
router.post('/:jobId/apply', isAuth, isUser, upload, jobApplicationController.applyForJob);

// Route to get all applicants for a specific job
router.get('/:jobId/applicants', isAuth, isEnterprise, isAppOwner, jobApplicationController.getApplicantsForJob );



// Accept or reject a job application
router.patch('/:applicationId', isAuth, isEnterprise, isAllowed, jobApplicationController.acceptOrRejectApplication);



module.exports = router;
