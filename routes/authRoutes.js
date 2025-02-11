const express = require('express');
const authController = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

// Public routes
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);

// Protected routes
router.get('/profile', requireAuth, (req, res) => {
    res.render('profile', { user: req.session.user });
});

module.exports = router;