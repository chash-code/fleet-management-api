const pool = require('../config/database');

// Middleware to authenticate user based on user-id header
const authenticate = async (req, res, next) => {
  try {
    const userId = req.headers['user-id'];
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please provide user-id in request headers'
      });
    }

    // Find user in database
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'User not found',
        message: 'Invalid user-id provided'
      });
    }

    // Attach user to request object
    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed', message: error.message });
  }
};

// Middleware to check if user has required role(s)
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access forbidden',
        message: `This action requires one of these roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}`
      });
    }
    next();
  };
};

module.exports = { authenticate, authorizeRole };
