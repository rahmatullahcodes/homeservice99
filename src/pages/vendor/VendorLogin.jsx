import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useVendor } from "../../context/VendorContext";

export default function VendorLogin() {

  const navigate = useNavigate();
  const { login: vendorLogin, isLoggedIn, loading, error: contextError } = useVendor();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  // Auto redirect if vendor already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/vendor");
    }
  }, [isLoggedIn, navigate]);

  async function login() {

    if (!email || !pass) {
      setError("All fields required");
      return;
    }

    setError("");
    const result = await vendorLogin(email, pass);
    
    if (result.success) {
      navigate("/vendor");
    } else {
      setError(result.error || "Login failed");
    }
  }

  return (
    <div className="container">
      <div className="form-card">

        <h1>Partner Login</h1>

        {error && <p className="form-error">{error}</p>}
        {contextError && <p className="form-error">{contextError}</p>}

        <input
          placeholder="Vendor email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          value={pass}
          onChange={e => setPass(e.target.value)}
          disabled={loading}
        />

        <button 
          className="btn-primary full" 
          onClick={login}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login as Partner"}
        </button>

        <p className="form-note">
          New Partner? <Link to="/vendor-signup">Register here</Link>
        </p>

      </div>
    </div>
  );
}
