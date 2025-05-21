const express = require("express");
const authenticateUser = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/protected", authenticateUser, (req, res) => {
  res.json({ msg: `Hello ${req.user.role}, you're authorized!` });
});

module.exports = router;