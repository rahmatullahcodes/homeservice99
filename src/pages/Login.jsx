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
      <div className="form-card">
        <h1>Login</h1>

        {error && <p className="form-error">{error}</p>}

        <div className="form-field">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>

        <div className="form-field">
          <label htmlFor="login-pass">Password</label>
          <input id="login-pass" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" />
        </div>

        <button type="button" className="btn-primary full" onClick={handleLogin} aria-label="Login">Login</button>

        <div className="form-note">
          New here? <Link to="/signup">Create an account</Link>
        </div>

        <div className="form-note">
          Demo: <strong>demo@user.com</strong> / <strong>123456</strong>
        </div>
      </div>
    </div>
  );
}
