import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function VendorSignup() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    service: "",
    password: ""
  });

  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function register() {

    const { name, email, phone, city, service, password } = form;

    // BASIC VALIDATION
    if (!name || !email || !phone || !city || !service || !password) {
      setError("All fields are required");
      return;
    }

    if (!email.includes("@")) {
      setError("Invalid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // SAVE DEMO DATA (frontend only)
    localStorage.setItem("vendorData", JSON.stringify(form));
    localStorage.setItem("vendor", "true");
    localStorage.setItem("auth", "true"); // ✅ IMPORTANT
    localStorage.setItem("vendorProfileCompleted", "false");

    navigate("/vendor");
  }

  return (
    <div className="container">
      <div className="form-card">

        <h2>Become a Partner</h2>

        {error && <p className="form-error">{error}</p>}

        <input name="name" placeholder="Full Name / Business Name" onChange={handleChange} />
        <input name="email" placeholder="Email address" onChange={handleChange} />
        <input name="phone" placeholder="Phone number" onChange={handleChange} />
        <input name="city" placeholder="City" onChange={handleChange} />

        <select name="service" onChange={handleChange}>
          <option value="">Select service category</option>
          <option>AC Repair</option>
          <option>Cleaning</option>
          <option>Plumbing</option>
          <option>Electrician</option>
          <option>Beauty</option>
        </select>

        <input
          type="password"
          name="password"
          placeholder="Create password"
          onChange={handleChange}
        />

        <button className="btn-primary full" onClick={register}>
          Register as Partner
        </button>

        <div className="form-note">
          Already a partner? <Link to="/vendor-login">Login</Link>
        </div>

      </div>
    </div>
  );
}
