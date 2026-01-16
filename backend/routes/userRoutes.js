const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// User Profile
router.post('/update-profile', userController.updateProfile);
router.post('/change-password', userController.changePassword);

// Admin User Management
router.get('/users', userController.getAllUsers);
router.post('/users/create', userController.createUser);
router.post('/users/reset-password', userController.adminResetPassword);

module.exports = router;
