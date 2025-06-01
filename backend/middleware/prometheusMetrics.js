// middleware/prometheusMetrics.js
const client = require('prom-client');

// Create a Registry and collect default metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Add custom login attempts counter
const loginCounter = new client.Counter({
  name: 'app_login_attempts_total',
  help: 'Total number of login attempts',
  labelNames: ['status'], // labels: success or failure
});
register.registerMetric(loginCounter);

// Create HTTP request duration Histogram
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  // Buckets for response time from 5ms to 1.5s
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.3, 0.5, 1, 1.5]
});
register.registerMetric(httpRequestDurationMicroseconds);

// Middleware to track all incoming requests
const metricsMiddleware = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const durationInMilliseconds = getDurationInMilliseconds(start) / 1000;
    httpRequestDurationMicroseconds
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(durationInMilliseconds);
  });

  next();
};

function getDurationInMilliseconds(start) {
  const NS_PER_SEC = 1e9;
  const diff = process.hrtime(start);
  return (diff[0] * NS_PER_SEC + diff[1]) / 1e6;
}

// Handler for /metrics endpoint
const metricsEndpoint = async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.end(await register.metrics());
};

// Add custom gauge for active users
const activeUsersGauge = new client.Gauge({
  name: 'app_active_users',
  help: 'Current number of active logged-in users',
});

register.registerMetric(activeUsersGauge);

module.exports = {
  metricsMiddleware,
  metricsEndpoint,
  loginCounter, // Export the custom login counter
  activeUsersGauge, // Export activeUsersGauge

};
