const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Register Route
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();
    res.status(201).json({ msg: "User registered successfully" });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Login Route - Now includes role verification
router.post("/login", async (req, res) => {
  const { role, name, password } = req.body; // include role

  try {
    // 1. Find user by name
    const user = await User.findOne({ name });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // 2. Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // 3. Check if role matches
    if (user.role !== role) {
      return res.status(400).json({ msg: "Role does not match" });
    }

    // 4. Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token }); // Send the JWT token as response

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;