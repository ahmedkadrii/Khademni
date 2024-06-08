// routes/admin.js

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const jobController = require('../controllers/jobController');

const { isAuth,isAdmin} = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');
const Enterprise = require('../models/enterprise');
const enterpriseController = require('../controllers/enterpriseController');



// Admin signup route (for testing purposes)
router.post('/signup', adminController.signupAdmin);
router.post('/login', authController.login);
router.get('/pending-enterprises',isAuth ,isAdmin , adminController.getPendingEnterprises);

router.post('/approve-enterprise',isAuth ,isAdmin, adminController.approveEnterprise);
router.post('/reject-enterprise',isAuth ,isAdmin , adminController.rejectEnterprise);
router.delete('/ent/:id', isAuth, isAdmin, adminController.deleteEnterpriseAccount);
router.delete('/user/:id', isAuth, isAdmin, adminController.deleteUserAccount);
// Route to get all contact messages
router.get('/contact/messages', adminController.getAllContactMessages);

// Route to handle contact form submissions
router.post('/contact', adminController.createContactMessage);
router.post('/reply', adminController.sendReplyEmail);
// Delete a job by ID
router.delete('/job/:id', isAuth, isAdmin ,jobController.deleteJob);


module.exports = router;
