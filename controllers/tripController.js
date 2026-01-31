const pool = require('../config/database');

// Create a new trip (customer only)
const createTrip = async (req, res) => {
  try {
    const { vehicle_id, start_date, end_date, location, distance_km, passengers } = req.body;
    const customer_id = req.user.id;

    // Validate required fields
    if (!vehicle_id || !start_date || !end_date || !location || !distance_km || !passengers) {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: 'All fields are required: vehicle_id, start_date, end_date, location, distance_km, passengers' 
      });
    }

    // Check if vehicle exists and is available
    const vehicle = await pool.query(
      'SELECT * FROM vehicles WHERE id = $1', 
      [vehicle_id]
    );
    
    if (vehicle.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Vehicle not found',
        message: `No vehicle found with id: ${vehicle_id}`
      });
    }

    if (!vehicle.rows[0].is_available) {
      return res.status(400).json({ 
        error: 'Vehicle not available',
        message: 'Selected vehicle is currently unavailable for trips'
      });
    }

    // Check passenger limit
    if (passengers > vehicle.rows[0].allowed_passengers) {
      return res.status(400).json({ 
        error: 'Passenger limit exceeded',
        message: `Number of passengers (${passengers}) exceeds vehicle capacity (${vehicle.rows[0].allowed_passengers})`
      });
    }

    // Create trip
    const result = await pool.query(
      'INSERT INTO trips (customer_id, vehicle_id, start_date, end_date, location, distance_km, passengers) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [customer_id, vehicle_id, start_date, end_date, location, distance_km, passengers]
    );

    // Mark vehicle as unavailable
    await pool.query(
      'UPDATE vehicles SET is_available = false WHERE id = $1', 
      [vehicle_id]
    );

    res.status(201).json({
      message: 'Trip created successfully. Vehicle is now unavailable.',
      trip: result.rows[0]
    });
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ error: 'Failed to create trip', message: error.message });
  }
};

// Get trip by ID
const getTripById = async (req, res) => {
  try {
    const { tripId } = req.params;
    
    const result = await pool.query('SELECT * FROM trips WHERE id = $1', [tripId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Trip not found',
        message: `No trip found with id: ${tripId}`
      });
    }

    res.json({
      message: 'Trip retrieved successfully',
      trip: result.rows[0]
    });
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({ error: 'Failed to retrieve trip', message: error.message });
  }
};

// Update trip (customer only)
const updateTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { start_date, end_date, location, distance_km, passengers } = req.body;

    // Check if trip exists and belongs to customer
    const trip = await pool.query(
      'SELECT * FROM trips WHERE id = $1 AND customer_id = $2', 
      [tripId, req.user.id]
    );
    
    if (trip.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Trip not found',
        message: 'Trip not found or you do not own this trip'
      });
    }

    // Update trip (only provided fields)
    const result = await pool.query(
      `UPDATE trips SET 
        start_date = COALESCE($1, start_date), 
        end_date = COALESCE($2, end_date), 
        location = COALESCE($3, location), 
        distance_km = COALESCE($4, distance_km), 
        passengers = COALESCE($5, passengers) 
      WHERE id = $6 RETURNING *`,
      [start_date, end_date, location, distance_km, passengers, tripId]
    );

    res.json({
      message: 'Trip updated successfully',
      trip: result.rows[0]
    });
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ error: 'Failed to update trip', message: error.message });
  }
};

// Delete trip (customer only)
const deleteTrip = async (req, res) => {
  try {
    const { tripId } = req.params;

    // Check if trip exists and belongs to customer
    const trip = await pool.query(
      'SELECT * FROM trips WHERE id = $1 AND customer_id = $2', 
      [tripId, req.user.id]
    );
    
    if (trip.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Trip not found',
        message: 'Trip not found or you do not own this trip'
      });
    }

    // Make vehicle available again
    await pool.query(
      'UPDATE vehicles SET is_available = true WHERE id = $1', 
      [trip.rows[0].vehicle_id]
    );

    // Delete trip
    await pool.query('DELETE FROM trips WHERE id = $1', [tripId]);

    res.json({ 
      message: 'Trip deleted successfully. Vehicle is now available.'
    });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ error: 'Failed to delete trip', message: error.message });
  }
};

// End trip - calculates cost and marks as complete
const endTrip = async (req, res) => {
  try {
    const { tripId } = req.params;

    // Get trip and vehicle data
    const trip = await pool.query(
      `SELECT t.*, v.rate_per_km 
       FROM trips t 
       JOIN vehicles v ON t.vehicle_id = v.id 
       WHERE t.id = $1`, 
      [tripId]
    );
    
    if (trip.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Trip not found',
        message: `No trip found with id: ${tripId}`
      });
    }

    const tripData = trip.rows[0];
    
    // Calculate trip cost: distance_km * rate_per_km
    const tripCost = parseFloat(tripData.distance_km) * parseFloat(tripData.rate_per_km);

    // Update trip: mark as completed and set cost
    const result = await pool.query(
      'UPDATE trips SET is_completed = true, trip_cost = $1 WHERE id = $2 RETURNING *',
      [tripCost, tripId]
    );

    // Make vehicle available again
    await pool.query(
      'UPDATE vehicles SET is_available = true WHERE id = $1', 
      [tripData.vehicle_id]
    );

    res.json({
      message: 'Trip ended successfully. Vehicle is now available.',
      trip: result.rows[0],
      calculation: {
        distance_km: tripData.distance_km,
        rate_per_km: tripData.rate_per_km,
        trip_cost: tripCost
      }
    });
  } catch (error) {
    console.error('End trip error:', error);
    res.status(500).json({ error: 'Failed to end trip', message: error.message });
  }
};

module.exports = { createTrip, getTripById, updateTrip, deleteTrip, endTrip };
