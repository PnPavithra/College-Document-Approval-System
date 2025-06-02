// src/components/DocumentCard.jsx
import { useState } from "react";

const DocumentCard = ({
  document,
  showActions = false,
  onApprove,
  onReject,
  allowMarks = false,
}) => {
  const [comment, setComment] = useState("");
  const [marks, setMarks] = useState("");

  const handleApprove = () => {
    if (allowMarks && !marks) return alert("Please enter marks before approving.");
    onApprove(document._id, comment, marks);
    setComment("");
    setMarks("");
  };

  const handleReject = () => {
    onReject(document._id, comment);
    setComment("");
  };

  return (
    <div className="card">
      <h4>{document.title}</h4>
      <p>
        <a href={document.fileUrl} target="_blank" rel="noopener noreferrer">
          View Document
        </a>
      </p>

      <ul>
        <li>Guide: {document.status.guide.approved ? "✅" : document.status.guide.rejected ? "❌" : "⏳"}</li>
        <li>Coordinator: {document.status.panelCoordinator.approved ? "✅" : document.status.panelCoordinator.rejected ? "❌" : "⏳"}</li>
        <li>Panel: {document.status.panel.approved ? "✅" : document.status.panel.rejected ? "❌" : "⏳"}</li>
      </ul>

      <p><strong>Final Status:</strong> {document.finalStatus}</p>
      {document.finalStatus === "Approved" && document.marks && (
        <p><strong>Marks:</strong> {document.marks}</p>
      )}

      {showActions && (
        <>
          <input
            type="text"
            placeholder="Enter comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {allowMarks && (
            <input
              type="number"
              placeholder="Enter marks"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
            />
          )}
          <button onClick={handleApprove}>✅ Approve</button>
          <button onClick={handleReject}>❌ Reject</button>
        </>
      )}
    </div>
  );
};

export default DocumentCard;
