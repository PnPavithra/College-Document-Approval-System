// src/components/RoleDropdown.jsx
const RoleDropdown = ({ role, setRole }) => {
  return (
    <div>
      <label>Role:</label>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="Student">Student</option>
        <option value="Guide">Guide</option>
        <option value="Panel Coordinator">Panel Coordinator</option>
        <option value="Panel">Panel</option>
      </select>
    </div>
  );
};

export default RoleDropdown;
