const express = require('express');
const { register, login, activateAccount, getCurrentUser, logout } = require('../controllers/authController');
const { body } = require('express-validator');
const authenticateJWT = require('../middleware/authMiddleware'); 

const router = express.Router();

// Route for registration
router.post('/register', [
    body('email').isEmail().withMessage('Please enter a valid email.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.')
], register);

// Route for login
router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.')
], login);



// Route for account activation
router.get('/activate/:token', activateAccount);

router.post('/logout', logout); 

// Route to get current user (protected by JWT)
router.get('/me', authenticateJWT, getCurrentUser);

module.exports = router;
