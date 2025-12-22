import { useState } from "react";
import { useToast } from "../../context/ToastContext";

export default function AdminNotifications() {

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("users");
  const [city, setCity] = useState("");
  const [type, setType] = useState("push");

  const [history, setHistory] = useState([
    {
      id: 1,
      title: "New Year Offer",
      audience: "Users",
      type: "Push",
      city: "All",
      date: "2025-01-05"
    }
  ]);
  const { addToast } = useToast();

  function sendNotification() {
    if (!title || !message) {
      addToast("Title and message required", 'warning');
      return;
    }

    const newNotification = {
      id: Date.now(),
      title,
      audience: audience === "users" ? "Users" : "Vendors",
      type,
      city: city || "All",
      date: new Date().toISOString().split("T")[0]
    };

    setHistory([newNotification, ...history]);

    // reset
    setTitle("");
    setMessage("");
    setCity("");

    addToast("Notification sent ✅ (demo)", 'success');
  }

  return (
    <div className="admin-notifications">

      {/* PAGE HEADER */}
      <div className="admin-page-head">
        <h2>Notifications</h2>
        <p className="admin-subtitle">
          Send push / email / in-app notifications
        </p>
      </div>

      {/* CREATE NOTIFICATION */}
      <div className="detail-box">
        <h3>Create Notification</h3>

        <input
          placeholder="Notification title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <textarea
          rows="3"
          placeholder="Notification message"
          value={message}
          onChange={e => setMessage(e.target.value)}
        />

        <div className="form-row">
          <select value={audience} onChange={e => setAudience(e.target.value)}>
            <option value="users">All Users</option>
            <option value="vendors">All Vendors</option>
          </select>

          <select value={type} onChange={e => setType(e.target.value)}>
            <option value="push">Push</option>
            <option value="email">Email</option>
            <option value="inapp">In-App</option>
          </select>

          <input
            placeholder="City (optional)"
            value={city}
            onChange={e => setCity(e.target.value)}
          />
        </div>

        <button className="btn-primary" onClick={sendNotification}>
          Send Notification
        </button>
      </div>

      {/* SENT HISTORY */}
      <div className="admin-section">
        <h3>Notification History</h3>

        <div className="admin-table">
          <div className="admin-table-header">
            <span>Title</span>
            <span>Audience</span>
            <span>Type</span>
            <span>City</span>
            <span>Date</span>
          </div>

          {history.map(n => (
            <div className="admin-table-row" key={n.id}>
              <span>{n.title}</span>
              <span>{n.audience}</span>
              <span>{n.type}</span>
              <span>{n.city}</span>
              <span>{n.date}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
