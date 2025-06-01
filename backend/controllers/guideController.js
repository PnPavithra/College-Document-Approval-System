const User = require("../models/User");

const getGuides = async (req, res) => {
  try {
    const guides = await User.find({ role: "Guide" }).select("name _id email");
    res.json(guides);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching guides" });
  }
};

module.exports = { getGuides };
