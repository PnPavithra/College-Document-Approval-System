// src/api/documents.js
import API from './api.js';

// Submit new document (Student)
export const submitDocument = (data) => API.post('/documents/submit', data);

// Get documents submitted by student
export const getMyDocuments = () => API.get('/documents/my-documents');

// Get documents pending approval for Guide/Panel/Coordinator
export const getPendingDocuments = () => API.get('/documents/pending');

// Approve or reject a document (Guide, Panel Coordinator, Panel)
export const approveDocument = (id, data) =>
  API.put(`/auth/approve/${id}`, data);