// src/api/api.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Automatically attach token from localStorage
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token"); // Guide token must be set here
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
