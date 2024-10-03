// routes/lesson.js
const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const authenticateJWT = require('../middleware/authMiddleware'); // Importer le middleware

// Endpoint to get a lesson by ID (protected route)
router.get('/:id', authenticateJWT, lessonController.getLessonById);


module.exports = router;
