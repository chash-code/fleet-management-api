const express = require('express');
const router = express.Router();
const { addVehicle, assignDriver, getVehicleById } = require('../controllers/vehicleController');
const { authenticate, authorizeRole } = require('../middlewares/auth');
const rateLimiter = require('../middlewares/rateLimiter');

// POST /vehicles/add - Add new vehicle (owner only, rate limited)
router.post('/add', authenticate, authorizeRole('owner'), rateLimiter, addVehicle);

// PATCH /vehicles/assign-driver/:vehicleId - Assign driver to vehicle (owner only)
router.patch('/assign-driver/:vehicleId', authenticate, authorizeRole('owner'), assignDriver);

// GET /vehicles/:vehicleId - Get vehicle by ID
router.get('/:vehicleId', getVehicleById);

module.exports = router;
