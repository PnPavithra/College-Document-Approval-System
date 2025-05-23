const Document = require("../models/Document");
const User = require("../models/User");

// Student submission
const submitDocument = async (req, res) => {
  const { title, fileUrl } = req.body;
  const submittedBy = req.user.userId; // ← Extracted from JWT

  const document = new Document({
    title,
    fileUrl,
    submittedBy,
    status: {
      guide: { approved: false, rejected: false, comment: "" },
      panelCoordinator: { approved: false, rejected: false, comment: "" },
      panel: { approved: false, rejected: false, comment: "" }
    },
    finalStatus: "Pending"
  });

  await document.save();
  res.status(201).json({ msg: "Document submitted", document });
};

// Approval flow
const approveDocument = async (req, res) => {
  const roleKeyMap = {
    "Guide": "guide",
    "Panel Coordinator": "panelCoordinator",
    "Panel": "panel"
  };

  const { documentId } = req.params;
  const { approved, rejected, comment } = req.body;
  const role = req.user.role;
  const roleKey = roleKeyMap[role];
  const userId = req.user.userId;

  if (!roleKey) {
    return res.status(403).json({ msg: "Unauthorized role" });
  }

  try {
    const doc = await Document.findById(documentId).populate("submittedBy");
    if (!doc) return res.status(404).json({ msg: "Document not found" });

    // Authorization checks
    if (role === "Guide") {
      const assignedGuide = doc.submittedBy.guide?.toString();
      if (assignedGuide !== userId) {
        return res.status(403).json({ msg: "You are not the assigned guide for this student" });
      }
    }

    if (role === "Panel Coordinator") {
      if (!doc.status.guide.approved) {
        return res.status(403).json({ msg: "Guide must approve before Panel Coordinator" });
      }
    }

    if (role === "Panel") {
      if (!doc.status.guide.approved || !doc.status.panelCoordinator.approved) {
        return res.status(403).json({ msg: "Panel Coordinator must approve before Panel" });
      }
    }

    // Update role-specific status
    const statusUpdate = {
      approved: approved === true,
      rejected: rejected === true,
      comment: comment || "",
    };

    doc.status[roleKey] = statusUpdate;

    // Add to logs
    doc.logs.push({
      role: role,
      userId: req.user.userId,
      action: approved ? "Approved" : "Rejected",
      comment: comment || ""
    });

    // Final status logic
    const { guide, panelCoordinator, panel } = doc.status;

    if (guide.rejected || panelCoordinator.rejected || panel.rejected) {
      doc.finalStatus = "Rejected";
    } else if (guide.approved && panelCoordinator.approved && panel.approved) {
      doc.finalStatus = "Approved";
    } else {
      doc.finalStatus = "Pending";
    }

    const updatedDoc = await doc.save();
    res.json({ msg: "Document updated", document: updatedDoc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Student's own docs
const getStudentDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ submittedBy: req.user.userId }).populate("submittedBy", "name");
    res.json(documents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching documents" });
  }
};

const getPendingDocumentsForApprover = async (req, res) => {
  const roleKeyMap = {
    "Guide": "guide",
    "Panel Coordinator": "panelCoordinator",
    "Panel": "panel"
  };

  const role = req.user.role;
  const statusKey = roleKeyMap[role];

  if (!statusKey) {
    return res.status(403).json({ msg: "Unauthorized role" });
  }

  try {
    const userId = req.user.userId;
    const filter = {
      [`status.${statusKey}.approved`]: false,
      [`status.${statusKey}.rejected`]: false
    };

    // Restrict access based on role
    if (role === "Guide") {
      // Get students assigned to this guide
      const students = await User.find({ guide: userId }, "_id");
      const studentIds = students.map((s) => s._id);
      filter.submittedBy = { $in: studentIds };
    }

    if (role === "Panel Coordinator") {
      // Only if guide has approved
      filter["status.guide.approved"] = true;
    }

    if (role === "Panel") {
      // Only if guide and panel coordinator have approved
      filter["status.guide.approved"] = true;
      filter["status.panelCoordinator.approved"] = true;
    }

    const pendingDocs = await Document.find(filter).populate("submittedBy", "name");

    res.json({ documents: pendingDocs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching documents" });
  }
};

module.exports = {
  submitDocument,
  approveDocument,
  getStudentDocuments,
  getPendingDocumentsForApprover
};
