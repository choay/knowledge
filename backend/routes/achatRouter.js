// routes/achatRoutes.js
const express = require('express');
const router = express.Router();
const achatController = require('../controllers/achatController');
const authenticateJWT = require('../middleware/authMiddleware');

// Apply authentication middleware
router.post('/create-payment-intent', authenticateJWT, achatController.createPaymentIntent);
router.post('/confirm-payment', authenticateJWT, achatController.confirmPayment);
router.get('/:id', authenticateJWT, achatController.getAchatById);
router.get('/', achatController.getAllAchats);
router.get('/user/:userId/lesson/:lessonId', achatController.getAchatByLessonAndUser);
router.get('/user/:userId', achatController.getAchatsByUserId);  

module.exports = router;
