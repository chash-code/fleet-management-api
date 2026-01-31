const pool = require('../config/database');

// Sign up a new user
const signupUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: 'All fields are required: name, email, password, role' 
      });
    }

    // Validate role
    const validRoles = ['customer', 'owner', 'driver'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role',
        message: `Role must be one of: ${validRoles.join(', ')}` 
      });
    }

    // Check if email already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1', 
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Email already exists',
        message: 'This email is already registered. Please use a different email.'
      });
    }

    // Insert new user into database
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
      [name, email, password, role]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user', message: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1', 
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'User not found',
        message: `No user found with id: ${id}`
      });
    }

    res.json({
      message: 'User retrieved successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to retrieve user', message: error.message });
  }
};

module.exports = { signupUser, getUserById };
