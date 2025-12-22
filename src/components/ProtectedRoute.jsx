import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const isUser = localStorage.getItem("auth") === "true";
  const isVendor = localStorage.getItem("vendor") === "true";

  if (!isUser) {
    return <Navigate to="/login" replace />;
  }

  if (role === "vendor" && !isVendor) {
    return <Navigate to="/" replace />;
  }

  return children;
}
