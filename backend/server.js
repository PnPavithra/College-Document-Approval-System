require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const protectedRoutes = require("./routes/protectedRoutes");
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const guideRoutes = require('./routes/guideRoutes');

// Import Prometheus middleware and metrics endpoint handler
const { metricsMiddleware, metricsEndpoint } = require('./middleware/prometheusMetrics');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

//to check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});


// Use the custom Prometheus middleware to track metrics on all routes
app.use(metricsMiddleware);

// /metrics endpoint for Prometheus to scrap
app.get('/metrics', metricsEndpoint);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/documents", documentRoutes);
app.use('/api', guideRoutes);  

// Connect DB and start server
mongoose.connect(process.env.MONGO_URI)
   .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(process.env.PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
  
const allowedOrigins = [
  "http://localhost:5173", // dev
  "https://college-document-approval-system.netlify.app/" // replace this with your actual frontend Netlify URL
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
