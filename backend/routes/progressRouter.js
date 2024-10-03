const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/authMiddleware'); // Importer le middleware
const { markLessonComplete, getProgress, findProgressByUserAndLesson } = require('../controllers/progressController');

// Route pour marquer une leçon comme complétée (nécessite l'authentification)
router.post('/complete', authenticateJWT, markLessonComplete);

router.get('/:lessonId/user/:userId', getProgress);

router.get('/find/:userId/:lessonId', findProgressByUserAndLesson);
module.exports = router;
