/// Simple in-memory rate limiter
////// Limits requests to 3 per minute per IP address

const requestCounts = {};

const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const currentMinute = Math.floor(Date.now() / 60000); // Current minute timestamp
  const key = `${ip}-${currentMinute}`;

  // Initialize counter for this IP in current minute
  if (!requestCounts[key]) {
    requestCounts[key] = 0;
  }

  requestCounts[key]++;

  // Check if limit exceeded
  if (requestCounts[key] > 3) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded',
      message: 'Maximum 3 requests per minute allowed per IP address'
    });
  }

  // Cleanup old entries (from previous minutes)
  Object.keys(requestCounts).forEach(k => {
    const [, minute] = k.split('-');
    if (parseInt(minute) < currentMinute - 1) {
      delete requestCounts[k];
    }
  });

  next();
};

module.exports = rateLimiter;
