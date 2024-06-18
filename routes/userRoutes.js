// routes/user.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

router.post('/signup', userController.signup);
router.post('/login', authController.login);

router.get('/all', userController.getAllUsers);



module.exports = router;
