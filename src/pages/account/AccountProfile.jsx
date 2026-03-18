import { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { fetchUserMe, setStoredUser, updateUserProfile } from "../../utils/accountApi";
import "../../styles/account.css";

const EMPTY_PROFILE = {
  name: "",
  email: "",
  phone: "",
  bio: "",
  avatar: ""
};

export default function AccountProfile() {
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [initialProfile, setInitialProfile] = useState(EMPTY_PROFILE);
  const [form, setForm] = useState(EMPTY_PROFILE);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      const user = await fetchUserMe();
      const profile = {
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        bio: user?.bio || "",
        avatar: user?.avatar || ""
      };
      setForm(profile);
      setInitialProfile(profile);
      setStoredUser(user);
    } catch (err) {
      addToast(err.message || "Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleAvatar(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast("File size must be less than 5MB", "warning");
      return;
    }

    if (!file.type.startsWith("image/")) {
      addToast("Please select an image file", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (fileEvent) => {
      setForm((prev) => ({ ...prev, avatar: String(fileEvent.target?.result || "") }));
      addToast("Avatar selected", "success");
    };
    reader.readAsDataURL(file);
  }

  function validateForm() {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Name is required";
    } else if (form.name.trim().length < 2) {
      nextErrors.name = "Name must be at least 2 characters";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Invalid email address";
    }

    if (form.phone && !/^[0-9\s\-+()]{10,}$/.test(form.phone)) {
      nextErrors.phone = "Invalid phone number";
    }

    if (form.bio.length > 500) {
      nextErrors.bio = "Bio must be less than 500 characters";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function saveProfile() {
    if (!validateForm()) {
      addToast("Please fix form errors", "warning");
      return;
    }

    try {
      setIsSaving(true);
      const response = await updateUserProfile(form);
      const updatedUser = response?.user;
      if (updatedUser) {
        setStoredUser(updatedUser);
        setInitialProfile({
          name: updatedUser.name || "",
          email: updatedUser.email || "",
          phone: updatedUser.phone || "",
          bio: updatedUser.bio || "",
          avatar: updatedUser.avatar || ""
        });
      }
      addToast("Profile updated", "success");
    } catch (err) {
      addToast(err.message || "Failed to update profile", "error");
    } finally {
      setIsSaving(false);
    }
  }

  function resetForm() {
    setForm(initialProfile);
    setErrors({});
  }

  return (
    <div className="dashboard-wrapper">
      <h2 className="dashboard-title">My Profile</h2>
      <p className="dashboard-subtitle">Manage your account information and preferences</p>

      {loading ? (
        <div className="account-alert info">Loading profile...</div>
      ) : (
        <>
          <div className="account-card" style={{ marginBottom: "32px" }}>
            <div style={{ textAlign: "center" }}>
              <img
                src={form.avatar || "https://ui-avatars.com/api/?name=User"}
                alt="profile"
                style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", marginBottom: "16px" }}
              />
              <div className="account-form-group">
                <label>Profile Picture</label>
                <input
                  type="file"
                  onChange={handleAvatar}
                  accept="image/*"
                  className="account-form-input"
                  style={{ cursor: "pointer" }}
                />
                <small style={{ color: "#6b7280", display: "block", marginTop: "4px" }}>JPG, PNG up to 5MB</small>
              </div>
            </div>
          </div>

          <div className="account-card">
            <div className="account-form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Enter your full name"
                className={`account-form-input ${errors.name ? "error" : ""}`}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="account-form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="Enter your email"
                className={`account-form-input ${errors.email ? "error" : ""}`}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="account-form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="Enter your phone number"
                className={`account-form-input ${errors.phone ? "error" : ""}`}
              />
              {errors.phone && <span className="form-error">{errors.phone}</span>}
            </div>

            <div className="account-form-group">
              <label htmlFor="bio">Bio ({form.bio.length}/500)</label>
              <textarea
                id="bio"
                value={form.bio}
                onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
                placeholder="Tell us about yourself"
                rows="4"
                className={`account-form-input ${errors.bio ? "error" : ""}`}
              />
              {errors.bio && <span className="form-error">{errors.bio}</span>}
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button className="account-btn primary" onClick={saveProfile} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              <button className="account-btn secondary" onClick={resetForm} disabled={isSaving}>
                Reset
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
