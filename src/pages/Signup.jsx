import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const { addToast } = useToast();

  function handleSignup() {
    if (!name || !number|| !email || !pass) {
      setError("All fields are required");
      return;
    }

    addToast("Account created ✅ (Demo mode)", 'success');
    navigate("/login");
  }

  return (
    <div className="container">
      <div className="auth-wrapper">
        <div className="auth-form-card fade-in">
          <div className="auth-header">
            <h1>Create Account</h1>
            <p>Join HomeService99 and book services instantly</p>
          </div>

          {error && <div className="auth-error">❌ {error}</div>}

          <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleSignup(); }}>
            <div className="form-field">
              <label htmlFor="signup-name">Full Name</label>
              <input 
                id="signup-name" 
                type="text"
                placeholder="John Doe" 
                value={name} 
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="signup-number">Phone Number</label>
              <input 
                id="signup-number"
                type="tel"
                placeholder="+91 9876543210" 
                value={number} 
                onChange={e => setNumber(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="signup-email">Email Address</label>
              <input 
                id="signup-email" 
                type="email" 
                placeholder="you@example.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="signup-pass">Password</label>
              <input 
                id="signup-pass" 
                type="password" 
                placeholder="Min 6 characters" 
                value={pass} 
                onChange={e => setPass(e.target.value)}
                minLength="6"
                required
              />
            </div>

            <button type="submit" className="btn-primary auth-btn" aria-label="Create account">
              Create Account
            </button>
          </form>

          <div className="auth-divider">or</div>

          <button type="button" className="btn-outline auth-btn">
            🔐 Continue with Google
          </button>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Login here</Link></p>
            <div className="signup-benefits">
              <p>✓ Book trusted services instantly</p>
              <p>✓ Verified professionals</p>
              <p>✓ 100% transparent pricing</p>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="auth-trust">
          <div className="trust-item">✓ 100% Secure</div>
          <div className="trust-item">✓ Fast Registration</div>
          <div className="trust-item">✓ No Hidden Fees</div>
        </div>
      </div>
    </div>
  );
}
