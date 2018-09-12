var router = require('express').Router();
var authMiddleware = require('../../middleware/authentication.js');

// Login
router.post('/login', authMiddleware.authenticate);

// Register:
router.post('/register', authMiddleware.createUser);

// Verify
router.post('/verify', authMiddleware.verify);

module.exports = router;