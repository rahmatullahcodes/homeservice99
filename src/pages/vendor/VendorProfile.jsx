import { useState } from "react";
import { useToast } from "../../context/ToastContext";

export default function VendorProfile() {
  const { addToast } = useToast();
  const [editMode, setEditMode] = useState(false);

  const [profile, setProfile] = useState({
    name: "Demo Services Pvt Ltd",
    phone: "9876543210",
    city: "Delhi",
    category: "AC Repair",
    experience: "5 Years",
    address: "123, Green Street, Delhi",
    pan: "ABCDE1234F",
    kycPan: true,
    kycAadhaar: false,
    verified: true
  });

  function update(e) {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  }

  function save() {
    localStorage.setItem("vendorProfile", JSON.stringify(profile));
    setEditMode(false);
    addToast("Profile updated successfully", "success");
  }

  const fieldsFilled = Object.values({
    name: profile.name,
    phone: profile.phone,
    city: profile.city,
    category: profile.category,
    experience: profile.experience,
    address: profile.address,
    pan: profile.pan
  }).filter(Boolean).length;

  const completion = Math.round((fieldsFilled / 7) * 100);

  return (
    <div>
      <div className="vendor-page-head">
        <h2>Business Profile</h2>
        <button className="vendor-btn outline" onClick={() => setEditMode(!editMode)}>
          {editMode ? "Cancel" : "✎ Edit Profile"}
        </button>
      </div>

      <div className="vendor-grid-2" style={{ marginBottom: "24px", gap: "16px" }}>
        <div className="vendor-section" style={{ background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)", color: "white", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ fontSize: "48px", background: "white", borderRadius: "12px", padding: "12px", color: "#2563eb" }}>🏢</div>
            <div>
              <p style={{ margin: "0", fontSize: "14px", opacity: "0.9" }}>Business Name</p>
              <h3 style={{ margin: "4px 0 8px 0", fontSize: "18px", fontWeight: "700" }}>{profile.name}</h3>
              <p style={{ margin: "0", fontSize: "13px", opacity: "0.8" }}>{profile.city} • {profile.category}</p>
            </div>
          </div>
          {profile.verified && (
            <span className="vendor-badge" style={{ marginTop: "12px", background: "#22c55e", color: "white", display: "inline-block" }}>✅ Verified Partner</span>
          )}
        </div>

        <div className="vendor-section">
          <h3 style={{ margin: "0 0 12px 0" }}>Profile Completion</h3>
          <div style={{ marginBottom: "12px" }}>
            <div style={{ width: "100%", height: "12px", background: "#e5e7eb", borderRadius: "6px", overflow: "hidden" }}>
              <div style={{ width: `${completion}%`, height: "100%", background: "linear-gradient(90deg, #3b82f6, #2563eb)", transition: "width 0.3s ease" }} />
            </div>
          </div>
          <p style={{ margin: "0", fontSize: "14px", fontWeight: "600" }}>{completion}% Complete</p>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6b7280" }}>Fill all required fields to increase verification chances</p>
        </div>
      </div>

      <div className="vendor-section">
        <h3 style={{ margin: "0 0 16px 0" }}>Business Information</h3>

        <div className="vendor-grid-2" style={{ gap: "16px", marginBottom: "16px" }}>
          <div className="vendor-form-group">
            <label>Business Name</label>
            <input name="name" value={profile.name} onChange={update} disabled={!editMode} />
          </div>

          <div className="vendor-form-group">
            <label>Phone Number</label>
            <input name="phone" value={profile.phone} onChange={update} disabled={!editMode} />
          </div>

          <div className="vendor-form-group">
            <label>City</label>
            <input name="city" value={profile.city} onChange={update} disabled={!editMode} />
          </div>

          <div className="vendor-form-group">
            <label>Service Category</label>
            <input name="category" value={profile.category} onChange={update} disabled={!editMode} />
          </div>

          <div className="vendor-form-group">
            <label>Experience</label>
            <input name="experience" value={profile.experience} onChange={update} disabled={!editMode} />
          </div>

          <div className="vendor-form-group">
            <label>PAN Number</label>
            <input name="pan" value={profile.pan} onChange={update} disabled={profile.verified || !editMode} />
          </div>
        </div>

        <div className="vendor-form-group" style={{ marginBottom: "16px" }}>
          <label>Office Address</label>
          <textarea rows="3" name="address" value={profile.address} onChange={update} disabled={!editMode} />
        </div>

        {editMode && (
          <button className="vendor-btn primary full" onClick={save}>
            💾 Save Changes
          </button>
        )}
      </div>

      <div className="vendor-section">
        <h3 style={{ margin: "0 0 16px 0" }}>KYC Verification Status</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ padding: "16px", background: profile.kycPan ? "#d1fae5" : "#fef3c7", borderRadius: "8px", borderLeft: `3px solid ${profile.kycPan ? "#16a34a" : "#f59e0b"}` }}>
            <p style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>PAN Card</p>
            <p style={{ margin: "0", fontSize: "16px", fontWeight: "700", color: profile.kycPan ? "#16a34a" : "#f59e0b" }}>
              {profile.kycPan ? "✅ Verified" : "⏳ Pending"}
            </p>
          </div>

          <div style={{ padding: "16px", background: profile.kycAadhaar ? "#d1fae5" : "#fef3c7", borderRadius: "8px", borderLeft: `3px solid ${profile.kycAadhaar ? "#16a34a" : "#f59e0b"}` }}>
            <p style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Aadhaar Card</p>
            <p style={{ margin: "0", fontSize: "16px", fontWeight: "700", color: profile.kycAadhaar ? "#16a34a" : "#f59e0b" }}>
              {profile.kycAadhaar ? "✅ Verified" : "⏳ Pending"}
            </p>
          </div>
        </div>

        {!profile.verified && (
          <div style={{ marginTop: "16px", padding: "12px", background: "#f3e8ff", borderRadius: "8px", borderLeft: "3px solid #a78bfa" }}>
            <p style={{ margin: "0", fontSize: "13px", color: "#6b21a8" }}>
              Upload your KYC documents to complete your verification
            </p>
            <button className="vendor-btn outline small" style={{ marginTop: "8px" }}>
              📤 Upload KYC Documents
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
