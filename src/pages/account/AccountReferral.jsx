import { useState } from "react";
import "../../styles/account.css";

const REF_LINK = "https://homeservice99.com/ref/demo123";

export default function AccountReferral() {

  const [copied, setCopied] = useState(false);

  const invites = [
    { id: 1, name: "Rohan Sharma", status: "Joined", reward: 100, date: "5 Jan 2025" },
    { id: 2, name: "Aditi Kumar", status: "Installed App", reward: 50, date: "12 Jan 2025" },
    { id: 3, name: "Rahul Singh", status: "Pending", reward: 0, date: "18 Jan 2025" },
    { id: 4, name: "Priya Verma", status: "Joined", reward: 100, date: "22 Jan 2025" }
  ];

  const walletReward = invites.reduce((sum, i) => sum + i.reward, 0);
  const totalInvites = invites.length;
  const joinedCount = invites.filter(i => i.status === "Joined").length;

  function copyLink() {
    navigator.clipboard.writeText(REF_LINK);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="dashboard-wrapper">

      <h2 className="dashboard-title">Refer & Earn</h2>
      <p className="dashboard-subtitle">Invite friends and earn wallet rewards</p>

      {/* KPI CARDS */}
      <div className="dashboard-grid" style={{ marginBottom: "32px" }}>
        <div className="dash-card green">
          <div className="dash-icon">💰</div>
          <div>
            <p className="dash-label">Wallet Rewards</p>
            <h3>₹{walletReward}</h3>
            <span className="dash-trend">Total earned</span>
          </div>
        </div>
        <div className="dash-card blue">
          <div className="dash-icon">👥</div>
          <div>
            <p className="dash-label">Total Invites</p>
            <h3>{totalInvites}</h3>
            <span className="dash-trend">Friends invited</span>
          </div>
        </div>
        <div className="dash-card purple">
          <div className="dash-icon">✅</div>
          <div>
            <p className="dash-label">Joined</p>
            <h3>{joinedCount}</h3>
            <span className="dash-trend">Completed signup</span>
          </div>
        </div>
      </div>

      {/* REFERRAL LINK */}
      <div className="account-card" style={{ marginBottom: "32px" }}>
        <h3 style={{ marginBottom: "16px" }}>Share Your Referral Link</h3>
        <p style={{ color: "#6b7280", marginBottom: "16px" }}>Invite your friends and both of you get wallet rewards!</p>
        
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <input 
            readOnly 
            value={REF_LINK}
            className="account-form-input"
            style={{ flex: 1, minWidth: "200px", fontFamily: "monospace", fontSize: "12px" }}
          />
          <button className="account-btn primary" onClick={copyLink} style={{ whiteSpace: "nowrap" }}>
            {copied ? "✓ Copied!" : "📋 Copy Link"}
          </button>
        </div>

        <div style={{ marginTop: "12px", padding: "12px", backgroundColor: "var(--account-light)", borderRadius: "6px", fontSize: "12px" }}>
          💡 Share this link with friends via WhatsApp, Email, or Social Media
        </div>
      </div>

      {/* INVITE LIST */}
      <div className="account-card">
        <h3 style={{ marginBottom: "16px" }}>Your Invites</h3>

        {invites.length === 0 ? (
          <p style={{ textAlign: "center", color: "#6b7280", padding: "20px" }}>You haven't invited anyone yet</p>
        ) : (
          <table className="account-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Invited Date</th>
                <th>Reward</th>
              </tr>
            </thead>
            <tbody>
              {invites.map(i => (
                <tr key={i.id}>
                  <td><strong>{i.name}</strong></td>
                  <td>
                    <span className={`account-badge ${i.status === "Joined" ? "green" : i.status === "Installed App" ? "blue" : "yellow"}`}>
                      {i.status}
                    </span>
                  </td>
                  <td>{i.date}</td>
                  <td style={{ fontWeight: 600, color: i.reward > 0 ? "var(--account-success)" : "#6b7280" }}>
                    {i.reward > 0 ? `+₹${i.reward}` : "Pending"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
