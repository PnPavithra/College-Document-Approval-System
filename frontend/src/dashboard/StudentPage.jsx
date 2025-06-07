import { useEffect, useState } from "react";
import {
  submitDocument,
  getMyDocuments,
  deleteDocument,
} from "../api/documents";
import { FaPlus, FaTrash } from "react-icons/fa";
import API from "../api/api";

const StudentPage = () => {
  const [docs, setDocs] = useState([]);
  const [formFields, setFormFields] = useState([{ title: "", fileUrl: "" }]);
  const [editDocId, setEditDocId] = useState(null);
  const [editFields, setEditFields] = useState({ title: "", fileUrl: "" });

  const fetchDocs = async () => {
    try {
      const res = await getMyDocuments();
      setDocs(res.data);
    } catch (err) {
      console.error("Failed to fetch documents", err);
    }
  };

  const handleChange = (index, field, value) => {
    const updatedFields = [...formFields];
    updatedFields[index][field] = value;
    setFormFields(updatedFields);
  };

  const handleAddField = () => {
    setFormFields([...formFields, { title: "", fileUrl: "" }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const filteredDocs = formFields.filter(
      (doc) => doc.title && doc.fileUrl
    );
    if (filteredDocs.length === 0) {
      alert("Please fill in at least one document.");
      return;
    }

    try {
      await submitDocument(filteredDocs);
      fetchDocs();
      setFormFields([{ title: "", fileUrl: "" }]);
    } catch (err) {
      alert(err.response?.data?.msg || "Submission failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await deleteDocument(id);
      fetchDocs();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete document");
    }
  };

  const startEditing = (doc) => {
    setEditDocId(doc._id);
    setEditFields({ title: doc.title, fileUrl: doc.fileUrl });
  };

  const handleEditChange = (field, value) => {
    setEditFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await API.patch(`/documents/update/${id}`, editFields);

      setEditDocId(null);
      setEditFields({ title: "", fileUrl: "" });
      fetchDocs();
      alert("Document updated successfully!");
    } catch (err) {
      alert(err.message || "Update failed");
    }
  };

  const getStatusText = (status) => {
    if (status?.approved) return "✅ Approved";
    if (status?.rejected) return "❌ Rejected";
    return "⏳ Pending";
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  return (
    <div className="container">
      <h2>Student Dashboard</h2>

      <form onSubmit={handleSubmit}>
        <h3>Submit Documents</h3>

        {formFields.map((field, index) => (
          <div key={index} className="form-row">
            <input
              type="text"
              placeholder="Document Title"
              value={field.title}
              onChange={(e) =>
                handleChange(index, "title", e.target.value)
              }
              required
            />
            <input
              type="text"
              placeholder="Document Link"
              value={field.fileUrl}
              onChange={(e) =>
                handleChange(index, "fileUrl", e.target.value)
              }
              required
            />
          </div>
        ))}

        <div className="button-row">
          <button
            type="button"
            onClick={handleAddField}
            className="add-btn"
          >
            <FaPlus /> Add Another
          </button>

          <button type="submit">Submit All</button>
        </div>
      </form>

      <hr />

      <h3>My Submitted Documents</h3>
      {docs.length === 0 ? (
        <p>No documents submitted yet.</p>
      ) : (
        docs.map((doc) => {
          const guideStatus = doc.status?.guide;
          const guideHasReviewed =
            guideStatus?.approved || guideStatus?.rejected;

          return (
            <div key={doc._id} className="card">
              <h4>{doc.title}</h4>
              <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                View Document
              </a>
              <ul>
                <li>
                  Guide: {getStatusText(doc.status.guide)}
                  {doc.status?.guide?.comment && (
                    <div style={{ marginLeft: "1rem" }}>
                      <strong>Guide's Comment:</strong> {doc.status.guide.comment}
                    </div>
                  )}
                </li>
                <li>
                  Panel Coordinator: {getStatusText(doc.status.panelCoordinator)}
                  {doc.status?.panelCoordinator?.comment && (
                    <div style={{ marginLeft: "1rem" }}>
                      <strong>Panel Coordinator's Comment:</strong> {doc.status.panelCoordinator.comment}
                    </div>
                  )}
                </li>
                <li>
                  Panel: {getStatusText(doc.status.panel)}
                  {doc.status?.panel?.comment && (
                    <div style={{ marginLeft: "1rem" }}>
                      <strong>Panel's Comment:</strong> {doc.status.panel.comment}
                    </div>
                  )}
                </li>
              </ul>

              {doc.finalStatus === "Approved" && (
                <>
                  {doc.marks !== undefined && (
                    <p>
                      <strong>Total Marks:</strong> {doc.marks}
                    </p>
                  )}
                  {doc.status.panel.marks !== undefined && (
                    <p>
                      <strong>Panel Marks:</strong> {doc.status.panel.marks}
                    </p>
                  )}
                </>
              )}

              <p>
                <strong>Final Status:</strong> {doc.finalStatus}
              </p>

              {!guideHasReviewed && (
                <>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="delete-btn"
                  >
                    <FaTrash /> Delete
                  </button>

                  <button
                    onClick={() => startEditing(doc)}
                    className="edit-btn"
                    style={{ marginLeft: "0.5rem" }}
                  >
                    ✏️ Update
                  </button>
                </>
              )}

              {editDocId === doc._id && (
                <div className="edit-form" style={{ marginTop: "1rem" }}>
                  <input
                    type="text"
                    placeholder="Updated Title"
                    value={editFields.title}
                    onChange={(e) =>
                      handleEditChange("title", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="Updated File URL"
                    value={editFields.fileUrl}
                    onChange={(e) =>
                      handleEditChange("fileUrl", e.target.value)
                    }
                  />
                  <button onClick={() => handleUpdate(doc._id)}>
                    Save Changes
                  </button>
                  <button onClick={() => setEditDocId(null)}>Cancel</button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default StudentPage;