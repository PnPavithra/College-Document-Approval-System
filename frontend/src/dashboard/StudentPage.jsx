import { useEffect, useState } from "react";
import { submitDocument, getMyDocuments } from "../api/documents";
import { FaPlus } from "react-icons/fa";

const StudentPage = () => {
  const [docs, setDocs] = useState([]);
  const [formFields, setFormFields] = useState([{ title: "", fileUrl: "" }]);

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

    const filteredDocs = formFields.filter(doc => doc.title && doc.fileUrl);
    if (filteredDocs.length === 0) {
      alert("Please fill in at least one document.");
      return;
    }

    try {
      await submitDocument(filteredDocs); // ✅ Send as array
      fetchDocs();
      setFormFields([{ title: "", fileUrl: "" }]); // reset form
    } catch (err) {
      alert(err.response?.data?.msg || "Submission failed");
    }
  };

  const getStatusText = (status) => {
    if (status.approved) return "✅ Approved";
    if (status.rejected) return "❌ Rejected";
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
              onChange={(e) => handleChange(index, "title", e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Document Link"
              value={field.fileUrl}
              onChange={(e) => handleChange(index, "fileUrl", e.target.value)}
              required
            />
          </div>
        ))}

        <div className="button-row">
          <button type="button" onClick={handleAddField} className="add-btn">
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
        docs.map((doc) => (
          <div key={doc._id} className="card">
            <h4>{doc.title}</h4>
            <a href={doc.fileUrl} target="_blank" rel="noreferrer">
              View Document
            </a>
            <ul>
              <li>Guide: {getStatusText(doc.status.guide)}</li>
              <li>Panel Coordinator: {getStatusText(doc.status.panelCoordinator)}</li>
              <li>Panel: {getStatusText(doc.status.panel)}</li>
            </ul>
            
            {doc.finalStatus === "Approved" && (
              <>
                {doc.marks !== undefined && (
                  <p><strong>Total Marks:</strong> {doc.marks}</p>
                )}
                {doc.status.panel.marks !== undefined && (
                  <p><strong>Panel Marks:</strong> {doc.status.panel.marks}</p>
                )}
              </>
            )}

            <p>
              <strong>Final Status:</strong> {doc.finalStatus}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default StudentPage;
