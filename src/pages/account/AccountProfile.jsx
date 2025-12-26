import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import "../../styles/account.css";

export default function AccountProfile() {
  const [name, setName] = useState(localStorage.getItem('user_name') || "Demo User");
  const [email, setEmail] = useState(localStorage.getItem('user_email') || "demo@user.com");
  const [phone, setPhone] = useState(localStorage.getItem('user_phone') || "");
  const [bio, setBio] = useState(localStorage.getItem('user_bio') || "");
  const [avatar, setAvatar] = useState(localStorage.getItem('user_avatar') || "https://ui-avatars.com/api/?name=Demo+User");
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  function handleAvatar(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast('File size must be less than 5MB', 'error');
        return;
      }
      if (!file.type.startsWith('image/')) {
        addToast('Please select an image file', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target.result);
        addToast('Avatar updated', 'success');
      };
      reader.readAsDataURL(file);
    }
  }

  const { addToast } = useToast();

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email address';
    if (phone && !/^[0-9\s\-\+\(\)]{10,}$/.test(phone)) newErrors.phone = 'Invalid phone number';
    if (bio.length > 500) newErrors.bio = 'Bio must be less than 500 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function save() {
    if (!validateForm()) {
      addToast('Please fix the errors', 'error');
      return;
    }
    
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('user_name', name);
      localStorage.setItem('user_email', email);
      localStorage.setItem('user_phone', phone);
      localStorage.setItem('user_bio', bio);
      localStorage.setItem('user_avatar', avatar);
      setIsSaving(false);
      addToast('Profile updated successfully ✅', 'success');
    }, 500);
  }

  return (
    <div className="dashboard-wrapper">
      <h2 className="dashboard-title">My Profile</h2>
      <p className="dashboard-subtitle">Manage your account information and preferences</p>

      {/* AVATAR SECTION */}
      <div className="account-card" style={{ marginBottom: "32px" }}>
        <div style={{ textAlign: "center" }}>
          <img src={avatar} alt="profile" style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", marginBottom: "16px" }} />
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

      {/* FORM */}
      <div className="account-card">
        <div className="account-form-group">
          <label htmlFor="name">Full Name <span style={{ color: "var(--account-danger)" }}>*</span></label>
          <input 
            id="name"
            type="text"
            value={name} 
            onChange={e => { setName(e.target.value); if (errors.name) setErrors({...errors, name: ''}) }}
            placeholder="Enter your full name"
            className={`account-form-input ${errors.name ? 'error' : ''}`}
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="account-form-group">
          <label htmlFor="email">Email <span style={{ color: "var(--account-danger)" }}>*</span></label>
          <input 
            id="email"
            type="email" 
            value={email} 
            onChange={e => { setEmail(e.target.value); if (errors.email) setErrors({...errors, email: ''}) }}
            placeholder="Enter your email"
            className={`account-form-input ${errors.email ? 'error' : ''}`}
          />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        <div className="account-form-group">
          <label htmlFor="phone">Phone Number</label>
          <input 
            id="phone"
            type="tel" 
            value={phone} 
            onChange={e => { setPhone(e.target.value); if (errors.phone) setErrors({...errors, phone: ''}) }}
            placeholder="Enter your phone number"
            className={`account-form-input ${errors.phone ? 'error' : ''}`}
          />
          {errors.phone && <span className="form-error">{errors.phone}</span>}
        </div>

        <div className="account-form-group">
          <label htmlFor="bio">Bio ({bio.length}/500)</label>
          <textarea 
            id="bio"
            value={bio} 
            onChange={e => { setBio(e.target.value); if (errors.bio) setErrors({...errors, bio: ''}) }}
            placeholder="Tell us about yourself..."
            rows="4"
            className={`account-form-input ${errors.bio ? 'error' : ''}`}
          />
          {errors.bio && <span className="form-error">{errors.bio}</span>}
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
          <button 
            className="account-btn primary" 
            onClick={save}
            disabled={isSaving}
          >
            {isSaving ? '⏳ Saving...' : '💾 Save Changes'}
          </button>
          <button 
            className="account-btn secondary" 
            onClick={() => {
              setName(localStorage.getItem('user_name') || "Demo User");
              setEmail(localStorage.getItem('user_email') || "demo@user.com");
              setPhone(localStorage.getItem('user_phone') || "");
              setBio(localStorage.getItem('user_bio') || "");
              setErrors({});
            }}
          >
            ↻ Reset
          </button>
        </div>
      </div>
    </div>
  );
}
