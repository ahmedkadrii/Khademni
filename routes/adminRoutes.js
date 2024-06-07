// routes/admin.js

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
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
router.delete('/:id', isAuth, isAdmin, adminController.deleteEnterpriseAccount);


module.exports = router;
