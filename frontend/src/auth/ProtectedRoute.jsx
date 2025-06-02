import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const storedRole = localStorage.getItem("role");

  useEffect(() => {
    if (!token || storedRole !== role) {
      navigate("/");
    }
  }, [token, storedRole, role, navigate]);

  return <>{children}</>;
};

export default ProtectedRoute;