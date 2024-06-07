// routes/enterprise.js

const express = require('express');
const router = express.Router();
const enterpriseController = require('../controllers/enterpriseController');
const authController = require('../controllers/authController');
const { uploadSingle } = require('../middleware/bdocMiddleware');

router.post('/signup', uploadSingle, enterpriseController.signupEnterprise);
router.post('/login', authController.login);
router.get('/all', enterpriseController.getAllEnterprises);

module.exports = router;
