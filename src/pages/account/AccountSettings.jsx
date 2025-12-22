import { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";

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
    <div className="settings-wrapper">

      <h2>Account Settings</h2>

      {/* TABS */}
      <div className="settings-tabs">
        <button onClick={()=>setTab("profile")} className={tab==="profile" ? "active" : ""}>Profile</button>
        <button onClick={()=>setTab("address")} className={tab==="address" ? "active" : ""}>Address</button>
        <button onClick={()=>setTab("password")} className={tab==="password" ? "active" : ""}>Password</button>
      </div>

      {/* PROFILE */}
      {tab === "profile" && (
        <div className="settings-box">
          <h3>Profile Info</h3>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full Name" />
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone" />
          <button className="btn-primary" onClick={saveProfile}>Save</button>
        </div>
      )}

      {/* ADDRESS */}
      {tab === "address" && (
        <div className="settings-box">
          <h3>Saved Address</h3>
          <textarea rows="3" value={address} onChange={e=>setAddress(e.target.value)} />
          <button className="btn-primary" onClick={saveAddress}>Save</button>
        </div>
      )}

      {/* PASSWORD */}
      {tab === "password" && (
        <div className="settings-box">
          <h3>Change Password</h3>

          {passMsg && <p className="settings-msg">{passMsg}</p>}

          <input type={show?"text":"password"} placeholder="Current password" value={current} onChange={e=>setCurrent(e.target.value)} />
          <input type={show?"text":"password"} placeholder="New password" value={newPass} onChange={e=>setNewPass(e.target.value)} />
          <input type={show?"text":"password"} placeholder="Confirm password" value={confirm} onChange={e=>setConfirm(e.target.value)} />

          <label className="show-toggle">
            <input type="checkbox" onChange={()=>setShow(!show)} /> Show Password
          </label>

          <button className="btn-primary" onClick={updatePassword}>Update</button>
        </div>
      )}
      {/* DELETE ACCOUNT */}
      <section className="settings-box danger-zone">
        <h3>Delete Account</h3>

        <p className="danger-text">
          This action is permanent. All data will be removed from this device.
        </p>

        <button
          className="btn-danger"
          onClick={() => {
            const confirm1 = window.confirm("Are you sure you want to delete your account?");
            if (!confirm1) return;

            const confirm2 = window.confirm("This cannot be undone. Confirm delete?");
            if (!confirm2) return;

            // CLEAR ALL USER DATA
            localStorage.removeItem("auth");
            localStorage.removeItem("name");
            localStorage.removeItem("email");
            localStorage.removeItem("phone");
            localStorage.removeItem("address");

            addToast("Account deleted successfully ❌", 'success');
            navigate('/signup');
          }}
        >
          Delete My Account
        </button>
      </section>

    </div>
  );
}
