const express = require('express');
const router = express.Router();
const { createTrip, getTripById, updateTrip, deleteTrip, endTrip } = require('../controllers/tripController');
const { authenticate, authorizeRole } = require('../middlewares/auth');

// POST /trips/create - Create new trip (customer only)
router.post('/create', authenticate, authorizeRole('customer'), createTrip);

// GET /trips/:tripId - Get trip by ID
router.get('/:tripId', getTripById);

// PATCH /trips/update/:tripId - Update trip (customer only)
router.patch('/update/:tripId', authenticate, authorizeRole('customer'), updateTrip);

// DELETE /trips/delete/:tripId - Delete trip (customer only)
router.delete('/delete/:tripId', authenticate, authorizeRole('customer'), deleteTrip);

// PATCH /trips/end/:tripId - End trip and calculate cost
router.patch('/end/:tripId', endTrip);

module.exports = router;
