// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddlewareJWT = require('../middleware/authMiddleware');

router.get('/:id', authMiddlewareJWT, userController.getUser);
router.put('/:id', authMiddlewareJWT, userController.updateUser);
router.delete('/:id', authMiddlewareJWT, userController.deleteUser);

module.exports = router;
