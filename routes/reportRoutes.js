// routes/reportRoutes.js

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { isAuth,isAdmin} = require('../middleware/authMiddleware');

router.post('/:id', isAuth, reportController.reportProfile);
router.get('/reports',isAuth, isAdmin , reportController.getReports);
router.post('/report/:id/update-status', isAuth, isAdmin,reportController.updateReportStatus);

module.exports = router;
