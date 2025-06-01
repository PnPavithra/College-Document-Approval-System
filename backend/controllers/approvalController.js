const Approval = require('../models/Approval');
const Document = require('../models/Document');
const User = require('../models/User'); 

exports.approveDocument = async (req, res) => {
  const { documentId, remarks, status } = req.body;
  const userId = req.user._id;
  const userRole = req.user.role;

  const doc = await Document.findById(documentId).populate("submittedBy");

  if (!doc) {
    return res.status(404).json({ message: "Document not found" });
  }

  // Strict approval workflow logic
  if (userRole === "Guide") {
    const student = doc.submittedBy;
    if (!student.guide || student.guide.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not assigned as guide for this student" });
    }
  }

  if (userRole === "Panel Coordinator" && !doc.status.guide.approved) {
    return res.status(403).json({ message: "Guide has not approved yet" });
  }

  if (userRole === "Panel" && (!doc.status.guide.approved || !doc.status.panelCoordinator.approved)) {
    return res.status(403).json({ message: "Previous approvals are incomplete" });
  }

  // Save approval
  const approval = await Approval.create({
    document: documentId,
    approver: userId,
    remarks,
    status
  });

  doc.approvals.push(approval._id);

  // Optional: update document status field
  doc.status = status === 'Approved' ? 'Pending' : 'Rejected';

  await doc.save();

  res.json({ message: 'Approval submitted', approval });
};
