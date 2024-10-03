// routes/certificate.js
const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const authenticateJWT = require('../middleware/authMiddleware'); // Importer le middleware

// Endpoint to get a certificate by ID (protected route)
router.get('/:id', authenticateJWT, certificateController.getCertificatById);

// Endpoint to create a certificate (protected route)
router.post('/', authenticateJWT, certificateController.createCertificat);

// Endpoint to update a certificate (protected route)
router.put('/:id', authenticateJWT, certificateController.updateCertificat);

// Endpoint to delete a certificate (protected route)
router.delete('/:id', authenticateJWT, certificateController.deleteCertificat);

module.exports = router;
