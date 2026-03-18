import { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { fetchReferralData } from "../../utils/accountApi";
import "../../styles/account.css";

export default function AccountReferral() {
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState("");
  const [invites, setInvites] = useState([]);
  const [walletReward, setWalletReward] = useState(0);
  const [totalInvites, setTotalInvites] = useState(0);
  const [joinedCount, setJoinedCount] = useState(0);

  useEffect(() => {
    loadReferral();
  }, []);

  async function loadReferral() {
    try {
      setLoading(true);
      const data = await fetchReferralData();
      setReferralLink(data?.referralLink || "");
      setInvites(Array.isArray(data?.invites) ? data.invites : []);
      setWalletReward(Number(data?.walletReward || 0));
      setTotalInvites(Number(data?.totalInvites || 0));
      setJoinedCount(Number(data?.joinedCount || 0));
    } catch (err) {
      addToast(err.message || "Failed to load referral data", "error");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      addToast("Referral link copied", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast("Failed to copy link", "error");
    }
  }

  return (
    <div className="dashboard-wrapper">
      <h2 className="dashboard-title">Refer and Earn</h2>
      <p className="dashboard-subtitle">Invite friends and earn wallet rewards</p>

      <div className="dashboard-grid" style={{ marginBottom: "32px" }}>
        <div className="dash-card green">
          <div className="dash-icon">RW</div>
          <div>
            <p className="dash-label">Wallet Rewards</p>
            <h3>Rs {walletReward}</h3>
            <span className="dash-trend">Total earned</span>
          </div>
        </div>

        <div className="dash-card blue">
          <div className="dash-icon">IN</div>
          <div>
            <p className="dash-label">Total Invites</p>
            <h3>{totalInvites}</h3>
            <span className="dash-trend">Friends invited</span>
          </div>
        </div>

        <div className="dash-card purple">
          <div className="dash-icon">JN</div>
          <div>
            <p className="dash-label">Joined</p>
            <h3>{joinedCount}</h3>
            <span className="dash-trend">Completed signup</span>
          </div>
        </div>
      </div>

      <div className="account-card" style={{ marginBottom: "32px" }}>
        <h3 style={{ marginBottom: "16px" }}>Share Your Referral Link</h3>
        <p style={{ color: "#6b7280", marginBottom: "16px" }}>Share this link with your friends</p>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <input
            readOnly
            value={referralLink}
            className="account-form-input"
            style={{ flex: 1, minWidth: "200px", fontFamily: "monospace", fontSize: "12px" }}
          />
          <button 
            className="account-btn primary" 
            onClick={copyLink} 
            style={{ whiteSpace: "nowrap", minWidth: "110px", textAlign: "center", transition: "all 0.3s ease" }}
          >
            {copied ? "✓ Copied" : "Copy Link"}
          </button>
        </div>

        <div style={{ marginTop: "12px", padding: "12px", backgroundColor: "var(--account-light)", borderRadius: "6px", fontSize: "12px" }}>
          Send on WhatsApp, Email or social media.
        </div>
      </div>

      <div className="account-card">
        <h3 style={{ marginBottom: "16px" }}>Your Invites</h3>

        {loading ? (
          <p style={{ textAlign: "center", color: "#6b7280", padding: "20px" }}>Loading invites...</p>
        ) : invites.length === 0 ? (
          <p style={{ textAlign: "center", color: "#6b7280", padding: "20px" }}>You have not invited anyone yet</p>
        ) : (
          <table className="account-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Date</th>
                <th>Reward</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((invite) => (
                <tr key={invite._id}>
                  <td><strong>{invite.name || "Friend"}</strong></td>
                  <td>
                    <span className={`account-badge ${invite.status === "Joined" ? "green" : invite.status === "Installed App" ? "blue" : "yellow"}`}>
                      {invite.status}
                    </span>
                  </td>
                  <td>{new Date(invite.date).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 600, color: invite.reward > 0 ? "var(--account-success)" : "#6b7280" }}>
                    {invite.reward > 0 ? `+Rs ${invite.reward}` : "Pending"}
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
