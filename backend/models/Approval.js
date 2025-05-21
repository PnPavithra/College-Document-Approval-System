const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema({
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  remarks: String
}, { timestamps: true });

module.exports = mongoose.model('Approval', approvalSchema);
