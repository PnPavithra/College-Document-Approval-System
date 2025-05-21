const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileUrl: { type: String }, // You can extend this to file uploads
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    guide: {
      approved: { type: Boolean, default: false },
      rejected: { type: Boolean, default: false },
      comment: { type: String, default: "" }
    },
    panelCoordinator: {
      approved: { type: Boolean, default: false },
      rejected: { type: Boolean, default: false },
      comment: { type: String, default: "" }
    },
    panel: {
      approved: { type: Boolean, default: false },
      rejected: { type: Boolean, default: false },
      comment: { type: String, default: "" }
    }
  },
  finalStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },

logs: [
    {
      role: { type: String },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      action: { type: String, enum: ["Approved", "Rejected"] },
      comment: { type: String },
      timestamp: { type: Date, default: Date.now }
    }
  ]
},
{
  timestamps: true
});

module.exports = mongoose.model("Document", documentSchema);
