// controllers/lessonController.js
const { Lesson, Progress } = require('../models'); // Ensure only import models once

// Get a lesson by ID
exports.getLessonById = async (req, res) => {
  const { id } = req.params;

  try {
    const lesson = await Lesson.findByPk(id);
    if (!lesson) {
      return res.status(404).json({ message: 'Leçon non trouvée' });
    }

    res.json(lesson);
  } catch (error) {
    console.error('Erreur lors de la récupération de la leçon:', error.message);
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

