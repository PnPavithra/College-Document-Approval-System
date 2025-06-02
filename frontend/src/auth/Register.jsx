import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api.js";
import GuideDocument from "../../components/GuideDocument.jsx";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Student",
    guideName: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
    };

    // Optional: attach guideName later if needed for backend
    if (form.role === "Student" && form.guideName) {
      body.guide = form.guideName;
    }

    try {
      const res = await API.post("/auth/register", body);
      alert("Registered successfully. Please login.");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <div className="container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <label>Email:</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required />

        <label>Password:</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} required />

        <label>Role:</label>
        <select name="role" value={form.role} onChange={handleChange}>
          <option>Student</option>
          <option>Guide</option>
          <option>Panel Coordinator</option>
          <option>Panel</option>
        </select>

        {form.role === "Student" && (
          <div>
            <label>Guide Name:</label>
            <input name="guideName" value={form.guideName} onChange={handleChange} />
          </div>
        )}

        <button type="submit">Register</button>
        <p>
          Already registered? <a href="/">Login here</a>
        </p>
      </form>

        {/* Always show the guide link */}
            <GuideDocument />
      
    </div>
  );
};

export default Register;
