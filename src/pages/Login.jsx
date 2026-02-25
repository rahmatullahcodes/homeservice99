import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api.js";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get('redirect') || '/';

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ SAFE redirect after render
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/");
    }
  }, [navigate]);

  async function handleLogin() {
    if (!email || !pass) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: pass,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed. Please try again.");
        return;
      }

      // Store token and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      navigate(redirectTo);
    } catch (err) {
      setError("Connection error. Please check if backend is running on port 5000.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="auth-wrapper">
        <div className="auth-form-card fade-in">
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Login to your HomeService99 account</p>
          </div>

          {error && <div className="auth-error">❌ {error}</div>}

          <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <div className="form-field">
              <label htmlFor="login-email">Email Address</label>
              <input 
                id="login-email" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="you@example.com"
                disabled={loading}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="login-pass">Password</label>
              <input 
                id="login-pass" 
                type="password" 
                value={pass} 
                onChange={e => setPass(e.target.value)} 
                placeholder="••••••••"
                disabled={loading}
                required
              />
            </div>

            <button type="submit" className="btn-primary auth-btn" aria-label="Login" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <button type="button" className="btn-outline auth-btn">
            🔐 Continue with Google
          </button>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/signup">Sign up here</Link></p>
            <details className="demo-credentials">
              <summary>Demo Credentials</summary>
              <div className="demo-box">
                <p><strong>Email:</strong> demo@user.com</p>
                <p><strong>Password:</strong> 123456</p>
              </div>
            </details>
          </div>
        </div>

        {/* Trust badges - Hidden on very small screens */}
        <div className="auth-trust">
          <div className="trust-item">✓ 100% Secure</div>
          <div className="trust-item">✓ Fast & Easy</div>
          <div className="trust-item">✓ No Spam</div>
        </div>
      </div>
    </div>
  );
}
