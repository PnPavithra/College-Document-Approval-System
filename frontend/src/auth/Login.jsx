import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GuideDocument from "../../components/GuideDocument.jsx";

const Login = () => {
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
    try {
      const body = {
        name: form.name,
        password: form.password,
        role: form.role,
      };

      const response = await fetch("https://college-document-approval-system.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", form.role);
      localStorage.setItem("name", form.name);

      switch (form.role) {
        case "Student":
          navigate("/student");
          break;
        case "Guide":
          navigate("/guide");
          break;
        case "Panel Coordinator":
          navigate("/coordinator");
          break;
        case "Panel":
          navigate("/panel");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      alert(err.message || "Login failed");
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input name="name" value={form.name} onChange={handleChange} required />

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
            <label>Guide Name (for your reference):</label>
            <input name="guideName" value={form.guideName} onChange={handleChange} />
          </div>
        )}

        <button type="submit">Login</button>
        <p>
          Not registered? <a href="/register">Register here</a>
        </p>

        <GuideDocument />
      </form>
    </div>
  );
};

export default Login;
