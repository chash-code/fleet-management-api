const pool = require('../config/database');

// Add a new vehicle (owner only)
const addVehicle = async (req, res) => {
  try {
    const { name, registration_number, allowed_passengers, rate_per_km } = req.body;
    const owner_id = req.user.id; // From auth middleware

    // Validate required fields
    if (!name || !registration_number || !allowed_passengers || !rate_per_km) {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: 'All fields are required: name, registration_number, allowed_passengers, rate_per_km' 
      });
    }

    // Check if registration number already exists
    const existing = await pool.query(
      'SELECT * FROM vehicles WHERE registration_number = $1', 
      [registration_number]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Registration number already exists',
        message: 'A vehicle with this registration number is already registered'
      });
    }

    // Insert vehicle
    const result = await pool.query(
      'INSERT INTO vehicles (name, registration_number, allowed_passengers, rate_per_km, owner_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, registration_number, allowed_passengers, rate_per_km, owner_id]
    );

    res.status(201).json({
      message: 'Vehicle added successfully',
      vehicle: result.rows[0]
    });
  } catch (error) {
    console.error('Add vehicle error:', error);
    res.status(500).json({ error: 'Failed to add vehicle', message: error.message });
  }
};

// Assign driver to vehicle (owner only)
const assignDriver = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { driver_id } = req.body;

    if (!driver_id) {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: 'driver_id is required in request body'
      });
    }

    // Check if driver exists and has driver role
    const driver = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND role = $2', 
      [driver_id, 'driver']
    );
    
    if (driver.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Driver not found',
        message: 'No user found with driver role for the provided driver_id'
      });
    }

    // Check if vehicle exists and belongs to owner
    const vehicle = await pool.query(
      'SELECT * FROM vehicles WHERE id = $1 AND owner_id = $2', 
      [vehicleId, req.user.id]
    );
    
    if (vehicle.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Vehicle not found',
        message: 'Vehicle not found or you do not own this vehicle'
      });
    }

    // Assign driver
    const result = await pool.query(
      'UPDATE vehicles SET driver_id = $1 WHERE id = $2 RETURNING *',
      [driver_id, vehicleId]
    );

    res.json({
      message: 'Driver assigned successfully',
      vehicle: result.rows[0]
    });
  } catch (error) {
    console.error('Assign driver error:', error);
    res.status(500).json({ error: 'Failed to assign driver', message: error.message });
  }
};

// Get vehicle by ID
const getVehicleById = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    
    const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicleId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Vehicle not found',
        message: `No vehicle found with id: ${vehicleId}`
      });
    }

    res.json({
      message: 'Vehicle retrieved successfully',
      vehicle: result.rows[0]
    });
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({ error: 'Failed to retrieve vehicle', message: error.message });
  }
};

module.exports = { addVehicle, assignDriver, getVehicleById };
