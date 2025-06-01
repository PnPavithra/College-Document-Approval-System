const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Register Route
router.post("/register", async (req, res) => {
  const { name, email, password, role, guide } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // If role is Student, ensure guide is provided
    const newUserData = {
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role,
    };

    if (role === "Student") {
      if (!guide) {
        return res.status(400).json({ msg: "Guide is required for students" });
      }

      // Verify guide exists and has role Guide
      const guideUser = await User.findById(guide);
      if (!guideUser || guideUser.role !== "Guide") {
        return res.status(400).json({ msg: "Invalid guide ID" });
      }

      newUserData.guide = guide;
    }

    // Create and save the new user
    const newUser = new User(newUserData);
    await newUser.save();

    res.status(201).json({ msg: "User registered successfully" });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Login Route - Now includes role verification
router.post("/login", async (req, res) => {
  const { role, name, password } = req.body;

  try {
    const user = await User.findOne({ name });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    if (user.role !== role) {
      return res.status(400).json({ msg: "Role does not match" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
