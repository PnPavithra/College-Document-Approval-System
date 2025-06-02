// src/api/auth.js
import API from './api.js';

// Register new user
export const registerUser = (formData) => API.post('/auth/register', formData);

// Login user
export const loginUser = (formData) => API.post('/auth/login', formData);

// Optional: Logout helper
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("name");
};
