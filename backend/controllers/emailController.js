const sendEmail = require("../utils/sendEmail");
const User = require("../models/User");

const notifyNextRole = async (doc, role, statusUpdate) => {
  const student = await User.findById(doc.submittedBy);
  if (!student) return;

  const guide = await User.findById(student.guide);
  const recipients = [];

  // Email to Student
  if (student?.email) {
    let subject = `Your document has been ${statusUpdate.approved ? "approved" : "rejected"} by ${role}`;
    let text = `Hello ${student.name},\n\nYour document "${doc.title}" (v${doc.version}) was ${statusUpdate.approved ? "approved" : "rejected"} by the ${role}.`;

    if (!statusUpdate.approved) {
      text += `\n\nPlease revise and resubmit the document.`;
    }

    if (statusUpdate.comment) {
      text += `\n\nComment: ${statusUpdate.comment}`;
    }

    text += `\n\nThank you.`;
    recipients.push({ to: student.email, subject, text });
  }

  // Email to Guide (when higher roles approve/reject)
  if (guide?.email && (role === "Panel Coordinator" || role === "Panel")) {
    let subject = `Document reviewed by ${role}`;
    let text = `Hello ${guide.name},\n\nThe document "${doc.title}" (v${doc.version}) submitted by ${student.name} has been reviewed by the ${role}.`;
    recipients.push({ to: guide.email, subject, text });
  }

  // Email to Panel Coordinators (all)
  if (role === "Guide" && statusUpdate.approved) {
    const coordinators = await User.find({ role: "Panel Coordinator" });
    for (const coordinator of coordinators) {
      recipients.push({
        to: coordinator.email,
        subject: `Document approved by Guide — Ready for Your Review`,
        text: `Hello ${coordinator.name},\n\nThe Guide has approved the document "${doc.title}" (v${doc.version}) submitted by ${student.name}. It is now ready for your review.\n\nPlease check the pending documents section to review.\n\nThank you.`,
      });
    }
  }

  // Email to Panel (all)
  if (role === "Panel Coordinator" && statusUpdate.approved) {
    const panelMembers = await User.find({ role: "Panel" });
    for (const panel of panelMembers) {
      recipients.push({
        to: panel.email,
        subject: `Document approved by Panel Coordinator — Ready for Your Review`,
        text: `Hello ${panel.name},\n\nThe Panel Coordinator has approved the document "${doc.title}" (v${doc.version}) submitted by ${student.name}. It is now ready for your review.\n\nPlease check the pending documents section to review.\n\nThank you.`,
      });
    }
  }

  // Notify Panel Coordinator when Panel finishes review
  if (role === "Panel") {
    const coordinators = await User.find({ role: "Panel Coordinator" });
    for (const coordinator of coordinators) {
      recipients.push({
        to: coordinator.email,
        subject: `Panel has reviewed the document`,
        text: `Hello ${coordinator.name},\n\nThe Panel has reviewed the document "${doc.title}" (v${doc.version}) submitted by ${student.name}.\n\nThank you.`,
      });
    }
  }

  // Send all emails
  for (const mail of recipients) {
    await sendEmail(mail.to, mail.subject, mail.text);
  }
};

module.exports = { notifyNextRole };