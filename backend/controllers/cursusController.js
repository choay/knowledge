const { Cursus, Lesson } = require('../models'); // Ensure Lesson is imported

// Get all Cursus by themeId
exports.getCursusByThemeId = async (req, res) => {
  const { themeId } = req.params; // Use params to get themeId

  try {
    const cursus = await Cursus.findAll({
      where: { themeId },
      include: [{ model: Lesson, as: 'lessons' }] // Include associated lessons
    });
    
    if (!cursus.length) {
      return res.status(404).json({ message: 'Aucun cursus trouvé pour ce themeId' });
    }
    
    res.json(cursus);
  } catch (error) {
    console.error('Erreur lors de la récupération des cursus:', error.message);
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Get Cursus by ID
exports.getCursusById = async (req, res) => {
  const { id } = req.params;

  try {
    const cursus = await Cursus.findByPk(id, {
      include: [{ model: Lesson, as: 'lessons' }] // Include associated lessons
    });
    
    if (!cursus) {
      return res.status(404).json({ message: 'Cursus non trouvé' });
    }

    res.json(cursus);
  } catch (error) {
    console.error('Erreur lors de la récupération du cursus:', error.message);
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};
