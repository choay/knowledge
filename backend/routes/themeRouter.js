const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');
const authenticateJWT = require('../middleware/authMiddleware'); // Importer le middleware d'authentification

// Endpoint to get all themes (protected route)
router.get('/', themeController.getAllThemes); // Protéger cette route avec le middleware

// Endpoint to get a specific theme by ID (protected route)
router.get('/:id', themeController.getThemeById); // Protéger cette route avec le middleware

module.exports = router;
