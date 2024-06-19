// controllers/jobApplicationController.js

const JobApplication = require('../models/jobApplication');
const Job = require('../models/job');
const User = require('../models/user'); // Import the User model
const nodemailer = require('nodemailer');

  




exports.applyForJob = async (req, res) => {
    const { jobId } = req.params;
    const userId = req.session.userId; // Assuming the user ID is stored in the session
    try {
        // Check if the user has already applied for this job
        const existingApplication = await JobApplication.findOne({ jobId, userId });
        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }
        
        // Check if the job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        
        // Fetch user details including the CV
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user has uploaded a CV
        if (!user.cv) {
            return res.status(400).json({ message: 'CV upload is required to apply for this job!' });
        }
        
        // Create a job application
        const newJobApplication = new JobApplication({
            jobId,
            userId,
            cv: user.cv, // Use the CV from the user schema
            applicationDate: new Date(), // Adding the current date
            status: 'pending' // Default status is 'pending'
        });
        await newJobApplication.save();
        
        // Add the job application ID to the user's jobApplications array
        await User.findByIdAndUpdate(userId, { $push: { jobApplications: newJobApplication._id } });
        
        res.status(201).json({ message: 'Job application submitted successfully', jobApplication: newJobApplication });
    } catch (err) {
        console.error('Error applying for job:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};



exports.acceptOrRejectApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status, customMessage } = req.body;

        // Find the job application using applicationId
        const jobApplication = await JobApplication.findById(applicationId);

        if (!jobApplication) {
            return res.status(404).json({ error: 'Job application not found' });
        }

        // Check if the status of the job application is still pending
        if (jobApplication.status !== 'pending') {
            return res.status(400).json({ error: 'Cannot update status, application has already been processed' });
        }

        // Extract the user ID associated with the job application
        const userId = jobApplication.userId;

        // Update the status of the job application
        jobApplication.status = status;
        await jobApplication.save();

        // Fetch user's email address
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userEmail = user.email;

        // Send email notification
        const transporter = nodemailer.createTransport({
            host: 'smtp.mailersend.net',
            port: 587,
            auth: {
                user: 'MS_qZIZ1U@trial-z3m5jgrq61zldpyo.mlsender.net',
                pass: 'rehVWZxathTjFAl5'
            }
        });

        const mailOptions = {
            from: 'MS_qZIZ1U@trial-z3m5jgrq61zldpyo.mlsender.net',
            to: userEmail,
            subject: 'Your job application status has been updated',
            text: `Dear ${user.username}, your job application status has been updated to ${status}. ${customMessage}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        res.status(200).json({ message: `Job application ${status} successfully` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




exports.getApplicantsForJob = async (req, res) => {
    const { jobId } = req.params;

    try {
        // Find all job applications for the specified job
        const jobApplications = await JobApplication.find({ jobId }).populate('userId');

        // Extract user details from job applications
        const applicants = jobApplications
            .filter(application => application.userId !== null) // Filter out null userId
            .map(application => ({
                userId: application.userId._id,
                username: application.userId.username,
                jobApp: application.id,
                name: application.userId.name,
                applicationDate: application.applicationDate,
                status: application.status,
                cv: application.userId.cv,
                skills: application.userId.skills

            }));

        // Respond with the list of applicants
        res.status(200).json({ applicants });
    } catch (error) {
        console.error('Error getting applicants for job:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
    


exports.getAppliedJobs = async (req, res) => {
    const userId = req.session.userId; // Assuming the user ID is stored in the session

    try {
        // Find all job applications for the current user
        const jobApplications = await JobApplication.find({ userId }).populate({
            path: 'jobId',
            populate: {
                path: 'createdBy',
                model: 'Enterprise',
                select: 'username'
            }
        });

        // Check if there are no job applications
        if (jobApplications.length === 0) {
            return res.status(200).json({ appliedJobs: [], message: 'No job applications found.' });
        }

        // Extract job details from job applications, checking for valid jobId
        const appliedJobs = jobApplications
            .filter(application => application.jobId && application.jobId.createdBy)
            .map(application => ({
                jobId: application.jobId._id,
                title: application.jobId.title,
                description: application.jobId.description,
                location: application.jobId.location,
                salary: application.jobId.salary,
                enterprise: application.jobId.createdBy.username, // Access enterprise username
                datePosted: application.jobId.datePosted,
                cities: application.jobId.cities,
                applicationDate: application.applicationDate,
                status: application.status
            }));

        // Respond with the list of applied jobs
        res.status(200).json({ appliedJobs });
    } catch (error) {
        console.error('Error getting applied jobs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




exports.getApplicationsForEnterprise = async (req, res) => {
    const enterpriseId = req.session.userId; // Get the enterprise ID from the session

    try {
        // Find all jobs posted by the logged-in enterprise
        const jobs = await Job.find({ createdBy: enterpriseId });

        // Array to store job applications
        let applications = [];

        // For each job, find the job applications associated with it
        for (const job of jobs) {
            const jobApplications = await JobApplication.find({ jobId: job._id }).populate('userId');
            // Extract necessary details from job applications and add them to the applications array
            applications = applications.concat(jobApplications.map(application => ({
                userId: application.userId._id,
                username: application.userId.username,
                name: application.userId.name,
                jobId: job._id,
                jobTitle: job.title,
                applicationDate: application.applicationDate,
                status: application.status
            })));
        }

        // Respond with the list of applications
        res.status(200).json({ applications });
    } catch (error) {
        console.error('Error getting applications for enterprise:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
    