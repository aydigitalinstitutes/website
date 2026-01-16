const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');

router.post('/enroll', enrollmentController.createEnrollment);

module.exports = router;
