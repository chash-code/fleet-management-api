const fs = require('fs');
const path = require('path');

// Middleware to log all incoming requests to logs.txt file
const logger = (req, res, next) => {
  const logEntry = `${req.method} ${req.url} ${new Date().toISOString()}\n`;
  const logPath = path.join(__dirname, '../logs.txt');
  
  // Append log entry to file
  fs.appendFileSync(logPath, logEntry);
  
  console.log(`📝 Logged: ${logEntry.trim()}`);
  next();
};

module.exports = logger;
