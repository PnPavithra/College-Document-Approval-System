import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./auth/Login.jsx";
import Register from "./auth/Register.jsx";
import StudentPage from "./dashboard/StudentPage.jsx";
import GuidePage from "./dashboard/GuidePage.jsx";
import CoordinatorPage from "./dashboard/PanelCoordinatorPage.jsx";
import PanelPage from "./dashboard/PanelPage.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/student"
          element={
            <ProtectedRoute role="Student">
              <StudentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guide"
          element={
            <ProtectedRoute role="Guide">
              <GuidePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coordinator"
          element={
            <ProtectedRoute role="Panel Coordinator">
              <CoordinatorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/panel"
          element={
            <ProtectedRoute role="Panel">
              <PanelPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
