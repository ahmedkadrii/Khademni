// routes/user.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
// const { isUser } = require('../middleware/authMiddleware');

router.post('/signup', userController.signup);
router.post('/login', authController.login);
// router.get('/user-specific', userController.userSpecificFunction);

router.get('/all', userController.getAllUsers);

// Protected route for users
// router.get('/profile', isUser, userController.getUserProfile);


module.exports = router;
