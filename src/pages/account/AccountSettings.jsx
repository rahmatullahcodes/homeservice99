import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import {
  deleteUserAccount,
  fetchUserMe,
  setStoredUser,
  updateUserPassword,
  updateUserProfile
} from "../../utils/accountApi";
import "../../styles/account.css";

export default function AccountSettings() {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("profile");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      setLoading(true);
      const user = await fetchUserMe();
      setName(user?.name || "");
      setEmail(user?.email || "");
      setPhone(user?.phone || "");
      setAddress(user?.address || "");
      setStoredUser(user);
    } catch (err) {
      addToast(err.message || "Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    try {
      setSaving(true);
      const response = await updateUserProfile({ name, email, phone });
      if (response?.user) setStoredUser(response.user);
      addToast("Profile updated", "success");
    } catch (err) {
      addToast(err.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  }

  async function saveAddress() {
    try {
      setSaving(true);
      const response = await updateUserProfile({ address });
      if (response?.user) setStoredUser(response.user);
      addToast("Address saved", "success");
    } catch (err) {
      addToast(err.message || "Failed to save address", "error");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (!current || !newPass || !confirm) {
      setPassMsg("All fields required");
      return;
    }
    if (newPass.length < 6) {
      setPassMsg("Minimum 6 characters required");
      return;
    }
    if (newPass !== confirm) {
      setPassMsg("New password and confirm password do not match");
      return;
    }

    try {
      setSaving(true);
      await updateUserPassword({ currentPassword: current, newPassword: newPass });
      setPassMsg("Password changed successfully");
      setCurrent("");
      setNewPass("");
      setConfirm("");
      addToast("Password updated", "success");
    } catch (err) {
      setPassMsg(err.message || "Failed to update password");
      addToast(err.message || "Failed to update password", "error");
    } finally {
      setSaving(false);
    }
  }

  async function removeAccount() {
    const confirm1 = window.confirm("Are you sure you want to delete your account?");
    if (!confirm1) return;

    const confirm2 = window.confirm("This action is permanent. Continue?");
    if (!confirm2) return;

    try {
      setSaving(true);
      await deleteUserAccount();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("cart");
      addToast("Account deleted", "success");
      navigate("/signup");
    } catch (err) {
      addToast(err.message || "Failed to delete account", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dashboard-wrapper">
      <h2 className="dashboard-title">Account Settings</h2>
      <p className="dashboard-subtitle">Manage account preferences and security</p>

      {loading && <div className="account-alert info">Loading settings...</div>}

      <div className="account-tabs">
        <button className={`account-tab-button ${tab === "profile" ? "active" : ""}`} onClick={() => setTab("profile")}>Profile</button>
        <button className={`account-tab-button ${tab === "address" ? "active" : ""}`} onClick={() => setTab("address")}>Address</button>
        <button className={`account-tab-button ${tab === "password" ? "active" : ""}`} onClick={() => setTab("password")}>Password</button>
        <button className={`account-tab-button ${tab === "danger" ? "active" : ""}`} onClick={() => setTab("danger")}>Danger Zone</button>
      </div>

      {tab === "profile" && (
        <div className="account-card">
          <h3 style={{ marginBottom: "20px" }}>Profile Information</h3>

          <div className="account-form-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" type="text" value={name} onChange={(event) => setName(event.target.value)} className="account-form-input" />
          </div>

          <div className="account-form-group">
            <label htmlFor="email">Email Address</label>
            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="account-form-input" />
          </div>

          <div className="account-form-group">
            <label htmlFor="phone">Phone Number</label>
            <input id="phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="account-form-input" />
          </div>

          <button className="account-btn primary" onClick={saveProfile} disabled={saving}>
            {saving ? "Saving..." : "Save Profile Changes"}
          </button>
        </div>
      )}

      {tab === "address" && (
        <div className="account-card">
          <h3 style={{ marginBottom: "20px" }}>Primary Address</h3>

          <div className="account-form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              rows="4"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="House no, street, city, state, pincode"
              className="account-form-input"
            />
          </div>

          <button className="account-btn primary" onClick={saveAddress} disabled={saving}>
            {saving ? "Saving..." : "Save Address"}
          </button>
        </div>
      )}

      {tab === "password" && (
        <div className="account-card">
          <h3 style={{ marginBottom: "20px" }}>Change Password</h3>

          {passMsg && (
            <div className={`account-alert ${passMsg.toLowerCase().includes("success") ? "success" : "danger"}`} style={{ marginBottom: "16px" }}>
              {passMsg}
            </div>
          )}

          <div className="account-form-group">
            <label htmlFor="current">Current Password</label>
            <input
              id="current"
              type={show ? "text" : "password"}
              value={current}
              onChange={(event) => setCurrent(event.target.value)}
              className="account-form-input"
            />
          </div>

          <div className="account-form-group">
            <label htmlFor="new">New Password</label>
            <input
              id="new"
              type={show ? "text" : "password"}
              value={newPass}
              onChange={(event) => setNewPass(event.target.value)}
              className="account-form-input"
            />
          </div>

          <div className="account-form-group">
            <label htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm"
              type={show ? "text" : "password"}
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className="account-form-input"
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <input type="checkbox" id="show-pass" onChange={() => setShow((prev) => !prev)} checked={show} />
            <label htmlFor="show-pass" style={{ margin: 0 }}>Show Password</label>
          </div>

          <button className="account-btn primary" onClick={changePassword} disabled={saving}>
            {saving ? "Updating..." : "Update Password"}
          </button>
        </div>
      )}

      {tab === "danger" && (
        <div className="account-card" style={{ borderColor: "var(--account-danger)", borderWidth: "2px" }}>
          <h3 style={{ marginBottom: "16px", color: "var(--account-danger)" }}>Danger Zone</h3>

          <div className="account-alert danger" style={{ marginBottom: "20px" }}>
            This action is permanent and cannot be undone.
          </div>

          <p style={{ color: "#6b7280", marginBottom: "20px" }}>
            Deleting your account will remove your profile, bookings and reviews.
          </p>

          <button className="account-btn danger" onClick={removeAccount} disabled={saving}>
            {saving ? "Deleting..." : "Permanently Delete Account"}
          </button>
        </div>
      )}
    </div>
  );
}
