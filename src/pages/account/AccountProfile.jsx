import { useState } from "react";
import { useToast } from "../../context/ToastContext";

export default function AccountProfile() {
  const [name, setName] = useState("Demo User");
  const [email, setEmail] = useState("demo@user.com");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState(
    "https://ui-avatars.com/api/?name=Demo+User"
  );

  function handleAvatar(e) {
    const file = e.target.files[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
    }
  }

  const { addToast } = useToast();

  function save() {
    addToast("Profile updated successfully ✅ (demo)", 'success');
  }

  return (
    <div className="profile-wrapper">
      <h2>Profile</h2>

      {/* AVATAR */}
      <div className="profile-avatar">
        <img src={avatar} alt="profile" />
        <label>
          Change photo
          <input type="file" hidden onChange={handleAvatar} />
        </label>
      </div>

      {/* FORM */}
      <div className="profile-form">
        <div>
          <label>Full Name</label>
          <input value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div>
          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <div>
          <label>Phone</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} />
        </div>

        <button className="btn-primary" onClick={save}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
