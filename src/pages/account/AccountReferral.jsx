import { useState } from "react";

const REF_LINK = "https://homeservice99.com/ref/demo123";

export default function AccountReferral() {

  const [copied, setCopied] = useState(false);

  const invites = [
    { name: "Rohan", status: "Joined", reward: 100 },
    { name: "Aditi", status: "Installed app", reward: 50 },
    { name: "Rahul", status: "Pending", reward: 0 }
  ];

  function copyLink() {
    navigator.clipboard.writeText(REF_LINK);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="referral-wrapper">

      <h2 className="dashboard-title">Refer & Earn</h2>
      <p className="dashboard-subtitle">Invite friends and earn wallet rewards</p>

      {/* LINK PANEL */}
      <div className="referral-box">
        <input readOnly value={REF_LINK} />
        <button className="btn-primary" onClick={copyLink}>
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>

      {/* BALANCE */}
      <div className="referral-balance">
        <strong>Wallet reward balance:</strong> ₹150
      </div>

      {/* INVITE LIST */}
      <h3 className="mt-12">Your Invites</h3>

      <div className="referral-list">
        {invites.map((r,i)=>(
          <div key={i} className="referral-row">
            <div>
              <strong>{r.name}</strong>
              <p className="referral-status">{r.status}</p>
            </div>
            <span className="referral-reward">₹{r.reward}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
