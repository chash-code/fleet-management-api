const express = require('express');
const router = express.Router();
const { signupUser, getUserById } = require('../controllers/userController');

// POST /users/signup - Create new user
router.post('/signup', signupUser);

// GET /users/:id - Get user by ID
router.get('/:id', getUserById);

module.exports = router;
