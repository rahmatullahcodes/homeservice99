import { Navigate } from "react-router-dom";
import { useVendor } from "../context/VendorContext";

export default function VendorProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useVendor();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Loading...</p>
    </div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/vendor-login" replace />;
  }

  return children;
}
