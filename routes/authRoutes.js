// routes/auth.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuth, isUser, isEnterprise, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/fileUploadMiddleware'); // Import the file upload middleware
const userController = require('../controllers/userController');

router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/dashboard', authController.dashboard);
router.get('/check-auth-status', authController.checkAuthStatus );
// Update settings route should come before the route with dynamic parameter
router.put('/settings', isAuth,authController.updateSettings);


// password reseting route 
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password/:resetToken', userController.resetPassword);

router.post('/request-deletion', isAuth, authController.requestDeletion);

// Email confirmation route
router.get('/confirm/:token', userController.confirmEmail);


router.put('/:username', isAuth,authController.updateProfile);
module.exports = router;
