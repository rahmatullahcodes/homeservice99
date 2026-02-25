import { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { useVendor } from "../../context/VendorContext";

export default function VendorProfile() {
  const { addToast } = useToast();
  const { vendor, loading, updateProfile, fetchVendorProfile } = useVendor();
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (vendor) {
      setProfile({
        businessName: vendor.businessName || "",
        name: vendor.name || "",
        email: vendor.email || "",
        phone: vendor.phone || "",
        city: vendor.city || "",
        category: vendor.category || "",
        address: vendor.address || "",
        pan: vendor.kyc?.pan || "",
        kycPan: vendor.kyc?.panVerified || false,
        kycAadhaar: vendor.kyc?.aadhaarVerified || false,
        verified: vendor.verified || false
      });
      setErrors({});
    }
  }, [vendor]);

  function update(e) {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  }

  function validateForm() {
    const newErrors = {};
    
    if (!profile.businessName?.trim()) {
      newErrors.businessName = "Business name is required";
    }
    if (!profile.name?.trim()) {
      newErrors.name = "Contact person name is required";
    }
    if (!profile.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(profile.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Invalid phone number (10 digits required)";
    }
    if (!profile.city?.trim()) {
      newErrors.city = "City is required";
    }
    if (!profile.category?.trim()) {
      newErrors.category = "Service category is required";
    }
    if (!profile.address?.trim()) {
      newErrors.address = "Office address is required";
    }
    if (profile.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(profile.pan)) {
      newErrors.pan = "Invalid PAN format (e.g., ABCDE1234F)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function save() {
    if (!validateForm()) {
      addToast("Please fix the errors in the form", "error");
      return;
    }

    setSaving(true);
    try {
      const result = await updateProfile({
        businessName: profile.businessName,
        name: profile.name,
        phone: profile.phone,
        city: profile.city,
        category: profile.category,
        address: profile.address,
        kyc: {
          pan: profile.pan
        }
      });

      if (result.success) {
        setEditMode(false);
        addToast("Profile updated successfully", "success");
        await fetchVendorProfile();
      } else {
        addToast(result.error || "Failed to update profile", "error");
      }
    } catch (err) {
      addToast("An error occurred while updating profile", "error");
    } finally {
      setSaving(false);
    }
  }

  const fieldsFilled = profile ? Object.values({
    businessName: profile.businessName,
    phone: profile.phone,
    city: profile.city,
    category: profile.category,
    address: profile.address,
    pan: profile.pan
  }).filter(Boolean).length : 0;

  const completion = profile ? Math.round((fieldsFilled / 6) * 100) : 0;

  if (loading || !profile) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <div className="vendor-loading-spinner" />
        <p style={{ marginTop: "16px", color: "#6b7280" }}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="vendor-page-head">
        <h2>Business Profile</h2>
        <button 
          className={`vendor-btn ${editMode ? "outline" : "primary"}`}
          onClick={() => {
            if (editMode) {
              setErrors({});
              setProfile({
                businessName: vendor.businessName || "",
                name: vendor.name || "",
                email: vendor.email || "",
                phone: vendor.phone || "",
                city: vendor.city || "",
                category: vendor.category || "",
                address: vendor.address || "",
                pan: vendor.kyc?.pan || "",
                kycPan: vendor.kyc?.panVerified || false,
                kycAadhaar: vendor.kyc?.aadhaarVerified || false,
                verified: vendor.verified || false
              });
            }
            setEditMode(!editMode);
          }}
        >
          {editMode ? "❌ Cancel" : "✎ Edit Profile"}
        </button>
      </div>

      <div className="vendor-grid-2" style={{ marginBottom: "24px", gap: "16px" }}>
        <div className="vendor-section" style={{ background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)", color: "white", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ fontSize: "48px", background: "white", borderRadius: "12px", padding: "12px", color: "#2563eb" }}>🏢</div>
            <div>
              <p style={{ margin: "0", fontSize: "14px", opacity: "0.9" }}>Business Name</p>
              <h3 style={{ margin: "4px 0 8px 0", fontSize: "18px", fontWeight: "700" }}>{profile.businessName || profile.name}</h3>
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
            <label>Business Name *</label>
            <input 
              name="businessName" 
              value={profile.businessName} 
              onChange={update} 
              disabled={!editMode}
              style={errors.businessName ? { borderColor: "#ef4444", background: "#fee2e2" } : {}}
            />
            {errors.businessName && <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{errors.businessName}</span>}
          </div>

          <div className="vendor-form-group">
            <label>Contact Person Name *</label>
            <input 
              name="name" 
              value={profile.name} 
              onChange={update} 
              disabled={!editMode}
              style={errors.name ? { borderColor: "#ef4444", background: "#fee2e2" } : {}}
            />
            {errors.name && <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{errors.name}</span>}
          </div>

          <div className="vendor-form-group">
            <label>Email Address</label>
            <input 
              name="email" 
              value={profile.email} 
              disabled={true}
              style={{ background: "#f3f4f6", cursor: "not-allowed" }}
              title="Email cannot be changed"
            />
            <span style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px", display: "block" }}>Contact support to change email</span>
          </div>

          <div className="vendor-form-group">
            <label>Phone Number *</label>
            <input 
              name="phone" 
              value={profile.phone} 
              onChange={update} 
              disabled={!editMode}
              placeholder="10-digit phone number"
              style={errors.phone ? { borderColor: "#ef4444", background: "#fee2e2" } : {}}
            />
            {errors.phone && <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{errors.phone}</span>}
          </div>

          <div className="vendor-form-group">
            <label>City *</label>
            <input 
              name="city" 
              value={profile.city} 
              onChange={update} 
              disabled={!editMode}
              style={errors.city ? { borderColor: "#ef4444", background: "#fee2e2" } : {}}
            />
            {errors.city && <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{errors.city}</span>}
          </div>

          <div className="vendor-form-group">
            <label>Service Category *</label>
            <select 
              name="category" 
              value={profile.category} 
              onChange={update} 
              disabled={!editMode}
              style={errors.category ? { borderColor: "#ef4444", background: "#fee2e2" } : {}}
            >
              <option value="">Select a category</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Carpentry">Carpentry</option>
              <option value="Pest Control">Pest Control</option>
              <option value="AC Repair">AC Repair</option>
              <option value="Home Appliances">Home Appliances</option>
              <option value="Painting">Painting</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{errors.category}</span>}
          </div>
        </div>

        <div className="vendor-form-group" style={{ marginBottom: "16px" }}>
          <label>Office Address *</label>
          <textarea 
            rows="3" 
            name="address" 
            value={profile.address} 
            onChange={update} 
            disabled={!editMode}
            placeholder="Enter your office address"
            style={errors.address ? { borderColor: "#ef4444", background: "#fee2e2" } : {}}
          />
          {errors.address && <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{errors.address}</span>}
        </div>

        <div className="vendor-form-group" style={{ marginBottom: "16px" }}>
          <label>PAN Number</label>
          <input 
            name="pan" 
            value={profile.pan} 
            onChange={update} 
            disabled={profile.verified || !editMode}
            placeholder="e.g., ABCDE1234F"
            style={errors.pan ? { borderColor: "#ef4444", background: "#fee2e2" } : profile.verified ? { background: "#f3f4f6", cursor: "not-allowed" } : {}}
          />
          {errors.pan && <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{errors.pan}</span>}
          {profile.verified && <span style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px", display: "block" }}>Cannot change verified PAN</span>}
        </div>

        {editMode && (
          <button 
            className="vendor-btn primary full" 
            onClick={save}
            disabled={saving}
            style={{ opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer" }}
          >
            {saving ? "💾 Saving..." : "💾 Save Changes"}
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
            <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#6b21a8" }}>
              📄 Upload your KYC documents to complete your verification. Our team will review and verify your documents within 24-48 hours.
            </p>
            <button className="vendor-btn outline small" style={{ marginTop: "8px" }}>
              📤 Upload KYC Documents
            </button>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="vendor-section">
        <h3 style={{ margin: "0 0 12px 0" }}>Profile Status</h3>
        <div style={{ padding: "12px", background: "#e0f2fe", borderRadius: "8px", borderLeft: "3px solid #0284c7" }}>
          <p style={{ margin: "0", fontSize: "13px", color: "#0c4a6e" }}>
            <strong>Status:</strong> {profile.verified ? "✅ Verified" : "⏳ Pending Verification"}
          </p>
          {!profile.verified && (
            <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#0c4a6e", opacity: 0.8 }}>
              Complete your profile to improve your chances of verification. Fill in all required fields and upload KYC documents.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
