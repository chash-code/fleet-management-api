require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Logger Middleware
app.use((req, res, next) => {
  const logEntry = `${req.method} ${req.url} ${new Date().toISOString()}\n`;
  fs.appendFileSync(path.join(__dirname, 'logs.txt'), logEntry);
  next();
});

// Import routes
const userRoutes = require('./routes/userRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const tripRoutes = require('./routes/tripRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Use routes
app.use('/users', userRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/trips', tripRoutes);
app.use('/analytics', analyticsRoutes);

// Handling Undefined Routes (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
