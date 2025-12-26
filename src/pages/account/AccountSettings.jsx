import { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import "../../styles/account.css";

export default function AccountSettings() {

  const [tab, setTab] = useState("profile");

  // LOAD SAVED DATA
  const [name, setName] = useState(localStorage.getItem("name") || "Demo User");
  const [email, setEmail] = useState(localStorage.getItem("email") || "demo@user.com");
  const [phone, setPhone] = useState(localStorage.getItem("phone") || "");
  const [address, setAddress] = useState(localStorage.getItem("address") || "");

  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const [show, setShow] = useState(false);

  const { addToast } = useToast();
  const navigate = useNavigate();

  function saveProfile() {
    localStorage.setItem("name", name);
    localStorage.setItem("email", email);
    localStorage.setItem("phone", phone);
    addToast("Profile updated ✅", 'success');
  }

  function saveAddress() {
    localStorage.setItem("address", address);
    addToast("Address saved ✅", 'success');
  }

  function updatePassword() {
    if (!current || !newPass || !confirm) {
      setPassMsg("All fields required");
      return;
    }
    if (newPass.length < 6) {
      setPassMsg("Min 6 characters");
      return;
    }
    if (newPass !== confirm) {
      setPassMsg("Passwords do not match");
      return;
    }
    if (current !== "123456") {
      setPassMsg("Wrong current password");
      return;
    }

    setPassMsg("Password changed ✅");
    setCurrent("");
    setNewPass("");
    setConfirm("");
  }

  return (
    <div className="dashboard-wrapper">

      <h2 className="dashboard-title">Account Settings</h2>
      <p className="dashboard-subtitle">Manage your account preferences and security</p>

      {/* TABS */}
      <div className="account-tabs">
        <button className={`account-tab-button ${tab === "profile" ? "active" : ""}`} onClick={() => setTab("profile")}>👤 Profile</button>
        <button className={`account-tab-button ${tab === "address" ? "active" : ""}`} onClick={() => setTab("address")}>📍 Address</button>
        <button className={`account-tab-button ${tab === "password" ? "active" : ""}`} onClick={() => setTab("password")}>🔒 Password</button>
        <button className={`account-tab-button ${tab === "danger" ? "active" : ""}`} onClick={() => setTab("danger")}>⚠️ Danger Zone</button>
      </div>

      {/* PROFILE TAB */}
      {tab === "profile" && (
        <div className="account-card">
          <h3 style={{ marginBottom: "20px" }}>Profile Information</h3>
          
          <div className="account-form-group">
            <label htmlFor="name">Full Name</label>
            <input 
              id="name"
              type="text"
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Your full name"
              className="account-form-input"
            />
          </div>

          <div className="account-form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              id="email"
              type="email"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="your@email.com"
              className="account-form-input"
            />
          </div>

          <div className="account-form-group">
            <label htmlFor="phone">Phone Number</label>
            <input 
              id="phone"
              type="tel"
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              placeholder="Your phone number"
              className="account-form-input"
            />
          </div>

          <button className="account-btn primary" onClick={saveProfile}>💾 Save Profile Changes</button>
        </div>
      )}

      {/* ADDRESS TAB */}
      {tab === "address" && (
        <div className="account-card">
          <h3 style={{ marginBottom: "20px" }}>Saved Address</h3>
          
          <div className="account-form-group">
            <label htmlFor="address">Home Address</label>
            <textarea 
              id="address"
              rows="4"
              value={address} 
              onChange={e => setAddress(e.target.value)}
              placeholder="House no, street, city, state, pincode"
              className="account-form-input"
            />
          </div>

          <button className="account-btn primary" onClick={saveAddress}>💾 Save Address</button>
        </div>
      )}

      {/* PASSWORD TAB */}
      {tab === "password" && (
        <div className="account-card">
          <h3 style={{ marginBottom: "20px" }}>Change Password</h3>

          {passMsg && (
            <div className={`account-alert ${passMsg.includes("✅") ? "success" : "danger"}`} style={{ marginBottom: "16px" }}>
              {passMsg}
            </div>
          )}

          <div className="account-form-group">
            <label htmlFor="current">Current Password</label>
            <input 
              id="current"
              type={show ? "text" : "password"} 
              placeholder="Enter current password"
              value={current} 
              onChange={e => setCurrent(e.target.value)}
              className="account-form-input"
            />
          </div>

          <div className="account-form-group">
            <label htmlFor="new">New Password</label>
            <input 
              id="new"
              type={show ? "text" : "password"} 
              placeholder="Enter new password"
              value={newPass} 
              onChange={e => setNewPass(e.target.value)}
              className="account-form-input"
            />
          </div>

          <div className="account-form-group">
            <label htmlFor="confirm">Confirm Password</label>
            <input 
              id="confirm"
              type={show ? "text" : "password"} 
              placeholder="Confirm new password"
              value={confirm} 
              onChange={e => setConfirm(e.target.value)}
              className="account-form-input"
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <input 
              type="checkbox" 
              id="show-pass"
              onChange={() => setShow(!show)}
              checked={show}
            />
            <label htmlFor="show-pass" style={{ margin: 0 }}>Show Password</label>
          </div>

          <button className="account-btn primary" onClick={updatePassword}>🔒 Update Password</button>
        </div>
      )}

      {/* DANGER ZONE TAB */}
      {tab === "danger" && (
        <div className="account-card" style={{ borderColor: "var(--account-danger)", borderWidth: "2px" }}>
          <h3 style={{ marginBottom: "16px", color: "var(--account-danger)" }}>⚠️ Danger Zone</h3>

          <div className="account-alert danger" style={{ marginBottom: "20px" }}>
            This action is permanent and cannot be undone. All your account data, bookings, and settings will be deleted from this device.
          </div>

          <p style={{ color: "#6b7280", marginBottom: "20px" }}>
            Once you delete your account, there is no going back. Please be certain.
          </p>

          <button
            className="account-btn danger"
            onClick={() => {
              const confirm1 = window.confirm("Are you sure you want to delete your account?");
              if (!confirm1) return;

              const confirm2 = window.confirm("This cannot be undone. All your data will be deleted. Confirm?");
              if (!confirm2) return;

              // CLEAR ALL USER DATA
              localStorage.removeItem("auth");
              localStorage.removeItem("name");
              localStorage.removeItem("email");
              localStorage.removeItem("phone");
              localStorage.removeItem("address");
              localStorage.removeItem("userProfile");
              localStorage.removeItem("userAddresses");
              localStorage.removeItem("walletBalance");
              localStorage.removeItem("walletTransactions");

              addToast("Account deleted successfully", 'success');
              setTimeout(() => navigate('/signup'), 1500);
            }}
          >
            🗑️ Permanently Delete Account
          </button>
        </div>
      )}

    </div>
  );
}
