const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  submitDocument,
  approveDocument,
  getStudentDocuments,
  getPendingDocumentsForApprover,
} = require("../controllers/documentController");

// ✅ Student submits a document
router.post(
  "/submit",
  protect,
  authorizeRoles("Student"),
  submitDocument
);

// ✅ Approvers (Guide, Panel_Coordinator, Panel) update approval status
router.put(
  "/approve/:documentId",
  protect,
  authorizeRoles("Guide", "Panel Coordinator", "Panel"),
  approveDocument
);

// ✅ Student checks their submitted documents
router.get(
  "/my-documents",
  protect,
  authorizeRoles("Student"),
  getStudentDocuments
);

// ✅ For approvers to fetch pending documents for them
router.get(
  "/pending",
  protect,
  authorizeRoles("Guide", "Panel Coordinator", "Panel"),
  getPendingDocumentsForApprover
);

module.exports = router;
