const Document = require("../models/Document");
const User = require("../models/User");

// 📄 Submit or Resubmit Documents
const submitDocument = async (req, res) => {
  const submittedBy = req.user.userId;
  const newDocs = req.body;

  if (!Array.isArray(newDocs) || newDocs.length === 0) {
    return res.status(400).json({ msg: "Provide an array of documents to submit" });
  }

  // Get latest version submitted by student
  const latestDoc = await Document.findOne({ submittedBy }).sort({ createdAt: -1 });
  const lastVersion = latestDoc?.version || 0;
  const version = lastVersion + 1;

  // Get all docs from previous version to compare
  const previousDocs = await Document.find({ submittedBy, version: lastVersion });

  const docsToSave = [];

  for (const { title, fileUrl } of newDocs) {
    const matchingOldDoc = previousDocs.find(doc => doc.title === title);

    if (!matchingOldDoc) {
      // New document for this version
      docsToSave.push(new Document({
        title,
        fileUrl,
        submittedBy,
        version,
        active: "true",
        status: {
          guide: { approved: false, rejected: false, comment: "" },
          panelCoordinator: { approved: false, rejected: false, comment: "" },
          panel: { approved: false, rejected: false, comment: "" }
        },
        finalStatus: "Pending",
        logs: []
      }));
      continue;
    }

    if (matchingOldDoc.finalStatus === "Approved") {
      // Carry forward approved doc unchanged
      docsToSave.push(new Document({
        title: matchingOldDoc.title,
        fileUrl: matchingOldDoc.fileUrl,
        submittedBy,
        version,
        active: "true",
        status: matchingOldDoc.status,
        finalStatus: "Approved",
        logs: matchingOldDoc.logs
      }));
      continue;
    }

    // Resubmission of rejected doc
    const { status } = matchingOldDoc;

    let resetStatus = {
      guide: { approved: false, rejected: false, comment: "" },
      panelCoordinator: { approved: false, rejected: false, comment: "" },
      panel: { approved: false, rejected: false, comment: "" }
    };

    if (status.panel.rejected) {
      // Panel rejected → reset all roles
    } else if (status.panelCoordinator.rejected) {
      // Panel Coordinator rejected → reset Panel only
      resetStatus.guide = { approved: false, rejected: false, comment: "" }; // Do NOT copy old guide status
    } else if (status.guide.rejected) {
      // Guide rejected → reset all
    } else {
      // Not rejected in last version, ignore this doc resubmission (skip)
      continue;
    }

    // Push the new resubmitted doc with reset status and active = true
    docsToSave.push(new Document({
      title,
      fileUrl,
      submittedBy,
      version,
      active: "true",
      status: resetStatus,
      finalStatus: "Pending",
      logs: []
    }));

    // Mark old rejected doc as inactive
    await Document.findByIdAndUpdate(matchingOldDoc._id, { active: false });
  }

  if (docsToSave.length === 0) {
    return res.status(400).json({ msg: "No documents eligible for submission." });
  }

  await Document.insertMany(docsToSave);
  return res.status(201).json({ msg: `Submitted docs as version ${version}`, documents: docsToSave });
};



// Approval function
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

  if (!roleKey) return res.status(403).json({ msg: "Unauthorized role" });

  try {
    const doc = await Document.findById(documentId).populate("submittedBy");

    if (!doc || doc.active !== "true") {
      return res.status(404).json({ msg: "Document not found or not eligible for review" });
    }

    const submittedBy = doc.submittedBy._id;

    // Get all active docs for the student's current batch (active = "true" or "temp")
    const batchDocs = await Document.find({ submittedBy, active: { $in: ["true", "temp"] } });

    // *** NEW: Block approval flow if any temp docs exist in batch ***
    const hasTempDoc = batchDocs.some(d => d.active === "temp");
    if (hasTempDoc) {
      return res.status(403).json({
        msg: "Approval flow is paused until all rejected documents are resubmitted and batch contains no 'temp' docs."
      });
    }

    // Filter batchDocs only active = "true" for further logic
    const trueBatchDocs = batchDocs.filter(d => d.active === "true");

    // Check for last rejected docs (descending by version)
    const lastRejectedDocs = await Document.find({
      submittedBy,
      finalStatus: "Rejected"
    }).sort({ version: -1 });

    if (lastRejectedDocs.length > 0) {
      const lastRejectedVersion = lastRejectedDocs[0].version;
      const { status } = lastRejectedDocs[0];

      // Determine who rejected last time
      let rejectingRole = null;
      if (status.panel.rejected) rejectingRole = "panel";
      else if (status.panelCoordinator.rejected) rejectingRole = "panelCoordinator";
      else if (status.guide.rejected) rejectingRole = "guide";

      const roleOrder = ["guide", "panelCoordinator", "panel"];
      const currentRoleIndex = roleOrder.indexOf(roleKey);
      const rejectRoleIndex = roleOrder.indexOf(rejectingRole);

      // Rule 1: Current role cannot review if previous rejection role has not approved all docs
      if (rejectingRole && currentRoleIndex > rejectRoleIndex) {
        const allApprovedByRejectRole = trueBatchDocs.every(doc => doc.status[rejectingRole].approved);
        if (!allApprovedByRejectRole) {
          return res.status(403).json({
            msg: `Cannot review yet. Waiting for ${rejectingRole} to approve all documents first.`
          });
        }
      }

      // Rule 2: Prevent role from going beyond previous max approval until batch catches up
      const previousApprovedDocs = await Document.find({
        submittedBy,
        version: lastRejectedVersion,
        finalStatus: "Approved"
      });

      let maxRoleReached = -1;
      for (const d of previousApprovedDocs) {
        const st = d.status;
        if (st.panel.approved) maxRoleReached = Math.max(maxRoleReached, 2);
        else if (st.panelCoordinator.approved) maxRoleReached = Math.max(maxRoleReached, 1);
        else if (st.guide.approved) maxRoleReached = Math.max(maxRoleReached, 0);
      }

      if (currentRoleIndex > maxRoleReached && maxRoleReached !== -1) {
        const allCaughtUp = trueBatchDocs.every(d => {
          if (maxRoleReached === 2) return d.status.panel.approved;
          if (maxRoleReached === 1) return d.status.panelCoordinator.approved;
          if (maxRoleReached === 0) return d.status.guide.approved;
        });

        if (!allCaughtUp) {
          return res.status(403).json({
            msg: `Documents haven't reached the previous approval level (${roleOrder[maxRoleReached]}). Wait for batch to catch up.`
          });
        }
      }
    }

    // Block if any other doc in batch is rejected (can't approve current until all rejected docs resolved)
    const otherRejected = trueBatchDocs.some(d => d._id.toString() !== doc._id.toString() && d.finalStatus === "Rejected");
    if (otherRejected) {
      return res.status(403).json({ msg: "Another document in this batch was rejected. Await resubmission." });
    }

    // Role-specific checks
    if (role === "Guide") {
      const assignedGuide = doc.submittedBy.guide?.toString();
      if (assignedGuide !== userId) {
        return res.status(403).json({ msg: "You are not the assigned guide for this student" });
      }
    }

    if (role === "Panel Coordinator") {
      const guidePending = trueBatchDocs.some(d => d.finalStatus === "Pending" && !d.status.guide.approved);
      if (guidePending) {
        return res.status(403).json({ msg: "Guide must approve all pending documents first" });
      }
    }

    if (role === "Panel") {
      const previousPending = trueBatchDocs.some(d =>
        d.finalStatus === "Pending" &&
        (!d.status.guide.approved || !d.status.panelCoordinator.approved)
      );
      if (previousPending) {
        return res.status(403).json({ msg: "Previous approvals incomplete for pending documents" });
      }
    }

    // Update status for current doc
    const statusUpdate = {
      approved: approved === true,
      rejected: rejected === true,
      comment: comment || ""
    };

    doc.status[roleKey] = statusUpdate;
    doc.logs.push({
      actionBy: userId,
      role,
      action: statusUpdate.approved ? "Approved" : "Rejected",
      comment: statusUpdate.comment,
      timestamp: new Date()
    });

    // Update finalStatus based on role approvals
    if (doc.status.guide.approved && doc.status.panelCoordinator.approved && doc.status.panel.approved) {
      doc.finalStatus = "Approved";
    } else if (approved) {
      doc.finalStatus = "Pending"; // partially approved but pending further approvals
    } else if (rejected) {
      doc.finalStatus = "Rejected";
      doc.active = "temp"; // reject blocks batch approval until resubmission
    }

    await doc.save();

    // After saving, check if all batch docs are approved or if any rejected remain
    const updatedBatchDocs = await Document.find({ submittedBy, active: "true" });
    const anyRejected = updatedBatchDocs.some(d => d.finalStatus === "Rejected");
    const allApproved = updatedBatchDocs.every(d => d.finalStatus === "Approved");

    if (anyRejected) {
      return res.status(200).json({ msg: "Document rejected. Batch approval blocked until resubmission.", doc });
    }

    if (allApproved) {
      // Mark all batch docs active = false to close batch
      await Document.updateMany({ submittedBy, active: "true" }, { active: false });
      return res.status(200).json({ msg: "All documents approved! Batch closed.", doc });
    }

    return res.status(200).json({ msg: "Document status updated.", doc });
  } catch (error) {
    console.error("Approve doc error:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};



// Student's Own Docs
const getStudentDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ submittedBy: req.user.userId }).populate("submittedBy", "name");
    res.json(documents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching documents" });
  }
};

//  Get Pending Documents per Role
const getPendingDocumentsForApprover = async (req, res) => {
  const roleKeyMap = {
    "Guide": "guide",
    "Panel Coordinator": "panelCoordinator",
    "Panel": "panel"
  };

  const role = req.user.role;
  const statusKey = roleKeyMap[role];
  if (!statusKey) return res.status(403).json({ msg: "Unauthorized role" });

  try {
    const userId = req.user.userId;

    const filter = {
      [`status.${statusKey}.approved`]: false,
      [`status.${statusKey}.rejected`]: false,
      finalStatus: "Pending"
    };

    if (role === "Guide") {
      const students = await User.find({ guide: userId }, "_id");
      const studentIds = students.map((s) => s._id);
      filter.submittedBy = { $in: studentIds };
    }

    if (role === "Panel Coordinator") {
      filter["status.guide.approved"] = true;
    }

    if (role === "Panel") {
      filter["status.guide.approved"] = true;
      filter["status.panelCoordinator.approved"] = true;
    }

    const docs = await Document.find(filter).populate("submittedBy", "name");

    // Group docs by version and student
    const grouped = {};
    docs.forEach(doc => {
      const key = `${doc.submittedBy._id}-${doc.version}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(doc);
    });

    const result = Object.values(grouped).flatMap(group => {
      const allApprovedPrev = group.every(doc => {
        if (role === "Panel Coordinator") return doc.status.guide.approved;
        if (role === "Panel") return doc.status.guide.approved && doc.status.panelCoordinator.approved;
        return true;
      });
      return allApprovedPrev ? group : [];
    });

    res.json({ documents: result });
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


