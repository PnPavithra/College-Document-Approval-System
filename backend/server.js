const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const protectedRoutes = require("./routes/protectedRoutes");
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const guideRoutes = require('./routes/guideRoutes');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/documents", documentRoutes);
app.use('/api', guideRoutes);  

// Connect DB and start server
mongoose.connect(process.env.MONGO_URI)
   .then(() => {
    console.log("✅ MongoDB Connected"); // <--- Add this
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));