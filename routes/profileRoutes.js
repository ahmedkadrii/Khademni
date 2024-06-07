// profileRoutes.js

const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const upload = require('../middleware/cvUploadMiddleware');
const imgUpload = require('../middleware/imageUploadMiddleware');
const { isAuth } = require('../middleware/authMiddleware');

// Route to handle CV upload
router.get('/is-following/:username', userController.isFollowingUser);
router.post('/follow/:username', userController.followUser);
router.post('/unfollow/:username', userController.unfollowUser);
router.post('/upload-cv', isAuth,upload, authController.uploadCV);
router.post('/:username/upload-logo', isAuth, imgUpload.single('logo'), authController.uploadLogo);


router.get('/:username', profileController.getProfile);

module.exports = router; // Exporting router only once at the end of the file
