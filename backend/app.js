// backend/app.js
const express = require('express');
const app = express();

// Import test routes
const testRoutes = require('./routes/test');

app.use(express.json());
app.use('/', testRoutes); // Mount your test route

module.exports = app;