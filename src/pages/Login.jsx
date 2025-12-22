import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get('redirect') || '/';

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  // ✅ SAFE redirect after render
  useEffect(() => {
    if (localStorage.getItem("auth") === "true") {
      navigate("/");
    }
  }, [navigate]);

  function handleLogin() {
    if (!email || !pass) {
      setError("All fields are required");
      return;
    }

    // DEMO AUTH
    if (email === "demo@user.com" && pass === "123456") {
      localStorage.setItem("auth", "true");
      navigate(redirectTo);
    } else {
      setError("Invalid email or password");
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
                required
              />
            </div>

            <button type="submit" className="btn-primary auth-btn" aria-label="Login">
              Login
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
