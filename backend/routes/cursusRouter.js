// routes/cursus.js
const express = require('express');
const router = express.Router();
const cursusController = require('../controllers/cursusController');

// Endpoint to get cursus by theme ID (protected route)
router.get('/themes/:themeId', cursusController.getCursusByThemeId);

// Endpoint to get cursus by ID (protected route)
router.get('/:id', cursusController.getCursusById);

module.exports = router;
