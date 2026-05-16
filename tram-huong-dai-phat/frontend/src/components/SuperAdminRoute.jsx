import { Navigate } from "react-router-dom";

// Chỉ cho phép 'super_admin' truy cập
function SuperAdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "super_admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default SuperAdminRoute;
