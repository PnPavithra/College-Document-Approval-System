import { useEffect, useState } from "react";
import API from "../api/api.js";

const PanelPage = () => {
const [documents, setDocuments] = useState([]);
const [comments, setComments] = useState({});
const [marks, setMarks] = useState({});

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

const handleMarksChange = (id, value) => {
setMarks({ ...marks, [id]: value });
};

const handleAction = async (id, approved) => {
const comment = comments[id] || "";
const markValue = marks[id] !== undefined ? parseFloat(marks[id]) : undefined;

if (approved && (markValue === undefined || isNaN(markValue))) {
  alert("Marks are required and must be a number between 0 and 100.");
  return;
}

if (approved && (markValue < 0 || markValue > 100)) {
  alert("Marks must be between 0 and 100.");
  return;
}

try {
  await API.put(`/documents/approve/${id}`, {
    approved,
    rejected: !approved,
    comment,
    marks: approved ? markValue : undefined,
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
<h2>Panel Dashboard</h2>

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
        <input
          placeholder="Add a comment"
          value={comments[doc._id] || ""}
          onChange={(e) => handleCommentChange(doc._id, e.target.value)}
        />
        <br />
        <input
          type="number"
          placeholder="Marks (0-100)"
          value={marks[doc._id] || ""}
          onChange={(e) => handleMarksChange(doc._id, e.target.value)}
          min="0"
          max="100"
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

export default PanelPage;