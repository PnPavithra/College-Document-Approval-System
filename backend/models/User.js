const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {type: String, required: true,},
  email: { type: String, reuired: true, unique: false,},
  password:{type: String, required: true,unique: true,},
  role: {
    type: String,
    enum: ["Student", "Guide", "Panel Coordinator", "Panel"],
    default: "Student",
  },
  guide:{
    type: mongoose.Schema.Types.ObjectId, ref: "User"}
  },
{
    timestamps: true,
});

module.exports = mongoose.model("User", userSchema);
