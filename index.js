require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Logger Middleware - logs every request
app.use((req, res, next) => {
  const logEntry = `${req.method} ${req.url} ${new Date().toISOString()}\n`;
  fs.appendFileSync(path.join(__dirname, 'logs.txt'), logEntry);
  console.log(logEntry.trim());
  next();
});

// Import all route files
const userRoutes = require('./routes/userRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const tripRoutes = require('./routes/tripRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Use routes with their base paths
app.use('/users', userRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/trips', tripRoutes);
app.use('/analytics', analyticsRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Fleet Management API is running!',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

// Handle 404 - Route not found
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`📝 Logs are being saved to logs.txt`);
});
