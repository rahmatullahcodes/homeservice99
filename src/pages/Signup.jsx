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
      <div className="form-card">

        <h1>Create Account</h1>

        {error && <p className="form-error">{error}</p>}

        <div className="form-field">
          <label htmlFor="signup-name">Full Name</label>
          <input id="signup-name" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
        </div>

 <div className="form-field">
          <label htmlFor="signup-number">Number</label>
          <input id="signup-number" placeholder="Your number" value={number} onChange={e => setNumber(e.target.value)} />
        </div>

        <div className="form-field">
          <label htmlFor="signup-email">Email</label>
          <input id="signup-email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <div className="form-field">
          <label htmlFor="signup-pass">Password</label>
          <input id="signup-pass" type="password" placeholder="Min 6 characters" value={pass} onChange={e => setPass(e.target.value)} />
        </div>

        <button type="button" className="btn-primary full" onClick={handleSignup} aria-label="Create account">
          Create Account
        </button>

        <div className="form-note">
          Already have an account? <Link to="/login">Login</Link>
        </div>

      </div>
    </div>
  );
}
