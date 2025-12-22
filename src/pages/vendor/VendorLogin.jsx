import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";   // ✅ FIXED

export default function VendorLogin() {

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  // Auto redirect if vendor already logged in
  useEffect(() => {
    if (localStorage.getItem("vendor") === "true") {
      navigate("/vendor");
    }
  }, [navigate]);

  function login() {

    if (!email || !pass) {
      setError("All fields required");
      return;
    }

    // DEMO vendor credentials
    if (email === "vendor@demo.com" && pass === "123456") {
      localStorage.setItem("vendor", "true");
      localStorage.setItem("auth", "true");   // ✅ Sync with user auth
      navigate("/vendor");
    } 
    else {
      setError("Invalid vendor credentials");
    }
  }

  return (
    <div className="container">
      <div className="form-card">

        <h1>Partner Login</h1>

        {error && <p className="form-error">{error}</p>}

        <input
          placeholder="Vendor email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={pass}
          onChange={e => setPass(e.target.value)}
        />

        <button className="btn-primary full" onClick={login}>
          Login as Partner
        </button>

        <p className="form-note">
          New Partner? <Link to="/vendor-signup">Register here</Link>
        </p>

        <div className="form-note">
          Demo: <strong>vendor@demo.com</strong> / <strong>123456</strong>
        </div>

      </div>
    </div>
  );
}
