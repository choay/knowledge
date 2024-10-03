// controllers/themeController.js
const { Theme, Cursus } = require('../models'); // Import Cursus

// Fetch all themes
const getAllThemes = async (req, res) => {
  try {
    const themes = await Theme.findAll({
      include: Cursus // Include Cursus in the query
    });
    res.json(themes);
  } catch (error) {
    console.error('Error fetching themes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des thèmes' });
  }
};

// Fetch a specific theme by ID, including associated cursus
const getThemeById = async (req, res) => {
  console.log('Requested ID:', req.params.id);  // This will log the ID to help debug
  try {
    const theme = await Theme.findByPk(req.params.id, {
      include: Cursus
    });
    if (!theme) {
      return res.status(404).json({ error: 'Theme not found' });
    }
    res.json(theme);
  } catch (error) {
    console.error('Error fetching theme:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du thème' });
  }
};


// Export the controller functions
module.exports = {
  getAllThemes,
  getThemeById,
};
