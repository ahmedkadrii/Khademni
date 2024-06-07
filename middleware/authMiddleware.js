// middleware/authMiddleware.js
const Job = require('../models/job');
const JobApplication = require('../models/jobApplication');

exports.isAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
      // User is authenticated
      next();
  } else {
      // User is not authenticated, send 401 Unauthorized response
      res.status(401).json({ message: 'Unauthorized' });
  }
};

  // Middleware to check if user is a regular user
  exports.isUser = (req, res, next) => {
    if (req.session.userRole === 'user') {
      // User is authenticated as a user
      next();
    } else {
      // User does not have the required role, send 403 Forbidden response
      res.status(403).json({ message: 'Forbidden' });
    }
  };
  
  // Middleware to check if user is an enterprise
  exports.isEnterprise = (req, res, next) => {
    if (req.session.userRole === 'enterprise') {
      // User is authenticated as an enterprise
      next();
    } else {
      // User does not have the required role, send 403 Forbidden response
      res.status(403).json({ message: 'Forbidden' });
    }
  };
        
  // Middleware to check if user is an admin
  exports.isAdmin = (req, res, next) => {
    if (req.session.userRole === 'admin') {
      // User is authenticated as an admin
      next();
    } else {
      // User does not have the required role, send 403 Forbidden response
      res.status(403).json({ message: 'Forbidden' });
    }
  };
  
  exports.isJobOwner = async (req, res, next) => {
    if (req.session.userRole === 'enterprise') {
      try {
        const jobId = req.params.id; // Assuming the job ID is in the request parameters
        const userId = req.session.userId; // Assuming the user ID is stored in the session
  
        // Find the job based on the job ID
        const job = await Job.findById(jobId);
        if (!job) {
          return res.status(404).json({ message: 'Job not found' });
        }
  
        // Check if the logged-in enterprise is the creator of the job
        if (userId === String(job.createdBy)) {
          // User is authenticated as the creator of the job
          next();
        } else {
          // User is not the creator of the job, send 403 Forbidden response
          res.status(403).json({ message: 'Forbidden' });
        }
      } catch (err) {
        console.error('Error in isJobOwner middleware:', err);
        res.status(500).json({ message: 'Internal server error' });
      }
    } else {
      // User is not authenticated as an enterprise, send 403 Forbidden response
      res.status(403).json({ message: 'Forbidden' });
    }
  };
    
    


  exports.isAppOwner = async (req, res, next) => {
    if (req.session.userRole === 'enterprise') {
        try {
            const jobId = req.params.jobId;
            const userId = req.session.userId; // Assuming the username is stored in the session

            // Find the job based on the job ID
            const job = await Job.findById(jobId);
            if (!job) {
                return res.status(404).json({ message: 'Job not found' });
            }

            // Check if the logged-in enterprise is the creator of the job
            if (userId === String(job.createdBy)) {
                // User is authenticated as the creator of the job
                next();
            } else {
                // User is not the creator of the job, send 403 Forbidden response
                res.status(403).json({ message: 'Forbidden' });
            }
        } catch (err) {
            console.error('Error in isJobOwner middleware:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        // User is not authenticated as an enterprise, send 403 Forbidden response
        res.status(403).json({ message: 'Forbidden' });
    }
};
    

exports.isAllowed = async (req, res, next) => {
  if (req.session.userRole === 'enterprise') {
      try {
          const jobApplicationId = req.params.applicationId; // Corrected parameter name
          const userId = req.session.userId; // Assuming the username is stored in the session

          // Find the job application based on the jobApplicationId
          const jobApplication = await JobApplication.findById(jobApplicationId);
          if (!jobApplication) {
              return res.status(404).json({ message: 'Job application not found' });
          }

          // Find the job associated with the job application
          const job = await Job.findById(jobApplication.jobId);
          if (!job) {
              return res.status(404).json({ message: 'Job not found' });
          }

          // Check if the logged-in enterprise is the creator of the job and the owner of the job application
          if (userId === String(job.createdBy)) {
              // User is authenticated as the creator of the job and the owner of the job application
              next();
          } else {
              // User is not the creator of the job or the owner of the job application, send 403 Forbidden response
              res.status(403).json({ message: 'Forbidden' });
          }
      } catch (err) {
          console.error('Error in isAppEnterpriseOwner middleware:', err);
          res.status(500).json({ message: 'Internal server error' });
      }
  } else {
      // User is not authenticated as an enterprise, send 403 Forbidden response
      res.status(403).json({ message: 'Forbidden' });
  }
};
// middleware/isEnterprise.js

exports.appEnterprise = (req, res, next) => {
  if (req.session.userRole === 'enterprise') {
    req.enterpriseId = req.session.userId;
    next();
  } else {
    res.status(403).json({ message: 'Forbidden' });
  }
};
