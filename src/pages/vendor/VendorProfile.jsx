import { useState } from "react";
import { useToast } from "../../context/ToastContext";

export default function VendorProfile() {

  const [profile, setProfile] = useState({
    name: "Demo Services Pvt Ltd",
    phone: "9876543210",
    city: "Delhi",
    category: "AC Repair",
    experience: "5 Years",
    address: "123, Green Street, Delhi",
    pan: "ABCDE1234F",
    verified: true
  });

  function update(e) {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  }

  const { addToast } = useToast();

  function save() {
    localStorage.setItem("vendorProfile", JSON.stringify(profile));
    addToast("Profile updated ✅ (demo)", 'success');
  }

  return (
    <div>

      <h2 className="vendor-page-title">Business Profile</h2>

      {/* PROFILE CARD */}
      <div className="vendor-profile-card">

        <div className="vendor-profile-header">

          <div className="vendor-avatar">🏢</div>

          <div>
            <strong>{profile.name}</strong>
            <p>{profile.city} • {profile.category}</p>

            {profile.verified ? (
              <span className="verified-badge">✅ Verified Partner</span>
            ) : (
              <span className="pending-badge">⏳ Verification Pending</span>
            )}

          </div>

        </div>


        {/* FORM */}
        <div className="vendor-profile-form">

          <label>Business Name</label>
          <input name="name" value={profile.name} onChange={update} />

          <label>Phone Number</label>
          <input name="phone" value={profile.phone} onChange={update} />

          <label>City</label>
          <input name="city" value={profile.city} onChange={update} />

          <label>Service Category</label>
          <input name="category" value={profile.category} onChange={update} />

          <label>Experience</label>
          <input name="experience" value={profile.experience} onChange={update} />

          <label>Office Address</label>
          <textarea name="address" rows="3" value={profile.address} onChange={update}></textarea>

          <label>PAN Number</label>
          <input name="pan" value={profile.pan} onChange={update} />

          <button className="vendor-btn primary full" onClick={save}>
            Save Profile
          </button>

        </div>

      </div>

    </div>
  );
}
