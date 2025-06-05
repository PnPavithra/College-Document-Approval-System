import { useEffect, useState } from "react";
import API from "../api/api.js";

const PanelCoordinatorPage = () => {
const [documents, setDocuments] = useState([]);
const [comments, setComments] = useState({}); // Store comment per doc

const fetchPending = async () => {
try {
const res = await API.get("/documents/pending");
setDocuments(res.data.documents || []);
} catch (err) {
console.error("Error fetching pending docs:", err);
}
};

const handleCommentChange = (id, value) => {
setComments({ ...comments, [id]: value });
};

const handleAction = async (id, approved) => {
const comment = comments[id] || "";

try {
  await API.put(`/documents/approve/${id}`, {
    approved,
    rejected: !approved,
    comment,
  });
  fetchPending();
} catch (err) {
  console.error("❌ Approve failed:", err.response?.data || err);
  alert(err.response?.data?.msg || "Failed to update document");
}
};

useEffect(() => {
fetchPending();
}, []);

return (
<div className="container">
<h2>Panel Coordinator Dashboard</h2>

  {documents.length === 0 ? (
    <p>No pending documents.</p>
  ) : (
    documents.map((doc) => (
      <div key={doc._id} className="card">
        <h4>{doc.title}</h4>
        <a href={doc.fileUrl} target="_blank" rel="noreferrer">
          View File
        </a>
        <br />
        {doc.status?.guide?.comment && (
            <p><strong>Guide Comment:</strong> {doc.status.guide.comment}</p>
        )}
        <input
          placeholder="Add a comment"
          value={comments[doc._id] || ""}
          onChange={(e) => handleCommentChange(doc._id, e.target.value)}
        />
        <br />
        <button onClick={() => handleAction(doc._id, true)}>✅ Approve</button>
        <button onClick={() => handleAction(doc._id, false)}>❌ Reject</button>
      </div>
    ))
  )}
</div>
);
};

export default PanelCoordinatorPage;