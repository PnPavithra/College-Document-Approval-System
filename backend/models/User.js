const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: false },
  password: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ["Student", "Guide", "Panel Coordinator", "Panel", "Admin"],
    default: "Student",
  },
  guide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function () {
      return this.role === "Student";
    }
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model("User", userSchema);
