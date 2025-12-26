import { useState } from "react";
import "../../styles/account.css";

export default function AccountCoupons() {

  const [copiedId, setCopiedId] = useState(null);
  const [filter, setFilter] = useState("Active");

  const COUPONS = [
    { id: 1, code: "SAVE50", desc: "Flat ₹50 off on all services", expiry: "31 Mar 2025", status: "Active", value: 50 },
    { id: 2, code: "FIRST100", desc: "₹100 for first booking", expiry: "30 Apr 2025", status: "Active", value: 100 },
    { id: 3, code: "CLEAN200", desc: "₹200 off on cleaning services", expiry: "15 Jan 2025", status: "Active", value: 200 },
    { id: 4, code: "REPAIR75", desc: "₹75 off on repair services", expiry: "28 Feb 2025", status: "Active", value: 75 },
    { id: 5, code: "OLD20", desc: "Expired coupon", expiry: "31 Dec 2024", status: "Expired", value: 20 }
  ];

  const filteredCoupons = COUPONS.filter(c => c.status === filter);

  function copy(code, id) {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const activeCoupons = COUPONS.filter(c => c.status === "Active");
  const totalValue = activeCoupons.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="dashboard-wrapper">

      <h2 className="dashboard-title">My Coupons</h2>
      <p className="dashboard-subtitle">Use promo codes to get discounts</p>

      {/* KPI CARDS */}
      <div className="dashboard-grid" style={{ marginBottom: "32px" }}>
        <div className="dash-card blue">
          <div className="dash-icon">🎟️</div>
          <div>
            <p className="dash-label">Active Coupons</p>
            <h3>{activeCoupons.length}</h3>
            <span className="dash-trend">Available to use</span>
          </div>
        </div>
        <div className="dash-card green">
          <div className="dash-icon">💰</div>
          <div>
            <p className="dash-label">Total Value</p>
            <h3>₹{totalValue}</h3>
            <span className="dash-trend">Combined discount</span>
          </div>
        </div>
        <div className="dash-card purple">
          <div className="dash-icon">⏰</div>
          <div>
            <p className="dash-label">Expired</p>
            <h3>{COUPONS.filter(c => c.status === "Expired").length}</h3>
            <span className="dash-trend">No longer valid</span>
          </div>
        </div>
      </div>

      {/* FILTER */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "8px" }}>
        {["Active", "Expired"].map(f => (
          <button
            key={f}
            className={`account-btn ${filter === f ? "primary" : "secondary"}`}
            onClick={() => setFilter(f)}
          >
            {f} ({COUPONS.filter(c => c.status === f).length})
          </button>
        ))}
      </div>

      {/* COUPON CARDS */}
      <div className="account-grid-2">
        {filteredCoupons.map(c => (
          <div key={c.id} className="account-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280" }}>Promo Code</p>
                <h3 style={{ margin: 0, fontFamily: "monospace", fontSize: "18px" }}>{c.code}</h3>
              </div>
              <span className={`account-badge ${c.status === "Active" ? "green" : "red"}`}>{c.status}</span>
            </div>
            
            <p style={{ margin: "8px 0", color: "#6b7280", fontSize: "14px" }}>{c.desc}</p>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "12px 0", padding: "12px 0", borderTop: "1px solid var(--account-border)", borderBottom: "1px solid var(--account-border)" }}>
              <span style={{ fontWeight: 600, color: "var(--account-success)", fontSize: "16px" }}>Save ₹{c.value}</span>
              <small style={{ color: "#6b7280" }}>Expires: {c.expiry}</small>
            </div>

            {c.status === "Active" ? (
              <button 
                className="account-btn primary" 
                style={{ width: "100%" }}
                onClick={() => copy(c.code, c.id)}
              >
                {copiedId === c.id ? "✓ Copied!" : "📋 Copy Code"}
              </button>
            ) : (
              <button className="account-btn secondary" style={{ width: "100%" }} disabled>
                ❌ Expired
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredCoupons.length === 0 && (
        <div className="account-alert info" style={{ textAlign: "center", marginTop: "32px" }}>
          No {filter.toLowerCase()} coupons available
        </div>
      )}

    </div>
  );
}
