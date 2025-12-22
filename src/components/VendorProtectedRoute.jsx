import { Navigate } from "react-router-dom";

export default function VendorProtectedRoute({ children }) {
  const isVendor = localStorage.getItem("vendor") === "true";

  if (!isVendor) {
    return <Navigate to="/vendor-login" replace />;
  }

  return children;
}
