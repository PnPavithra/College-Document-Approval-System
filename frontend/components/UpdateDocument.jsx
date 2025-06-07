import React, { useState } from "react";
import axios from "axios";
import API from "../api/api"; // Add at the top

function UpdateDocument({ documentId, token, onUpdateSuccess }) {
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true)


    try {
      const response = await API.patch(`/documents/update/${documentId}`, {
        title,
        fileUrl
       },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setLoading(false);
      onUpdateSuccess(response.data.document); // call parent callback if needed
      alert("Document updated successfully!");
    } catch (err) {
      setLoading(false);
      if (err.response) {
        setError(err.response.data.msg || "Failed to update document");
      } else {
        setError("Network error");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Update Document</h3>

      <label>
        Title:
        <input
          type="text"
          value={title}
          placeholder="New title"
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      <label>
        File URL:
        <input
          type="text"
          value={fileUrl}
          placeholder="New file URL"
          onChange={(e) => setFileUrl(e.target.value)}
        />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Updating..." : "Update Document"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}

export default UpdateDocument;
