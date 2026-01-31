const pool = require('../config/database');

// Get system analytics (counts from database)
const getAnalytics = async (req, res) => {
  try {
    // Count total users using database query
    const totalUsers = await pool.query('SELECT COUNT(*) as count FROM users');
    
    // Count total vehicles using database query
    const totalVehicles = await pool.query('SELECT COUNT(*) as count FROM vehicles');
    
    // Count total trips using database query
    const totalTrips = await pool.query('SELECT COUNT(*) as count FROM trips');

    res.json({
      message: 'Analytics retrieved successfully',
      analytics: {
        totalUsers: parseInt(totalUsers.rows[0].count),
        totalVehicles: parseInt(totalVehicles.rows[0].count),
        totalTrips: parseInt(totalTrips.rows[0].count)
      },
      note: 'All counts are calculated using database queries, not JavaScript'
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to retrieve analytics', message: error.message });
  }
};

module.exports = { getAnalytics };
