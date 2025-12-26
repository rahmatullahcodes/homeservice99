import { useState } from "react";

export default function VendorEarnings() {
  const [period, setPeriod] = useState("month");

  const [paymentHistory] = useState([
    { id: 1, customer: "Rahul Sharma", service: "AC Repair", amount: 699, date: "15 Aug 2025", status: "Completed" },
    { id: 2, customer: "Priya Verma", service: "Home Cleaning", amount: 1299, date: "14 Aug 2025", status: "Completed" },
    { id: 3, customer: "Amit Singh", service: "Plumbing", amount: 499, date: "13 Aug 2025", status: "Completed" },
    { id: 4, customer: "Neha Patel", service: "Electrical", amount: 1999, date: "12 Aug 2025", status: "Pending" }
  ]);

  const stats = {
    month: 8200,
    lastMonth: 7400,
    lifetime: 45600,
    pending: 1200
  };

  return (
    <div>
      <div className="vendor-page-head">
        <h2>Earnings</h2>
        <p>Track your earnings and manage payouts</p>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        {["today", "week", "month", "lifetime"].map(p => (
          <button key={p} className={`vendor-btn ${period === p ? "primary" : "outline"} small`} onClick={() => setPeriod(p)}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <div className="vendor-stats-grid">
        <div className="vendor-stat-card blue">
          <span>This Month</span>
          <h3>₹{stats.month.toLocaleString()}</h3>
        </div>
        <div className="vendor-stat-card green">
          <span>Last Month</span>
          <h3>₹{stats.lastMonth.toLocaleString()}</h3>
        </div>
        <div className="vendor-stat-card yellow">
          <span>Lifetime Earnings</span>
          <h3>₹{stats.lifetime.toLocaleString()}</h3>
        </div>
        <div className="vendor-stat-card orange">
          <span>Pending Payout</span>
          <h3>₹{stats.pending.toLocaleString()}</h3>
        </div>
      </div>

      <div className="vendor-grid-2" style={{ marginBottom: "24px", gap: "16px" }}>
        <div className="vendor-section">
          <h3>Earnings Chart</h3>
          <div style={{ marginTop: "16px", height: "200px", background: "#f3f4f6", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
            Chart coming soon
          </div>
        </div>

        <div className="vendor-section">
          <h3>Next Payout</h3>
          <p style={{ margin: "12px 0", fontSize: "12px", color: "#6b7280" }}>Amount Ready</p>
          <p style={{ margin: "0 0 16px 0", fontSize: "28px", fontWeight: "700", color: "#16a34a" }}>₹{stats.pending.toLocaleString()}</p>
          <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#6b7280" }}>Expected: Aug 25, 2025</p>
          <button className="vendor-btn primary full">Request Payout</button>
        </div>
      </div>

      <div className="vendor-section">
        <h3>Payment History</h3>
        <div style={{ overflowX: "auto", marginTop: "16px" }}>
          <table className="vendor-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map(p => (
                <tr key={p.id}>
                  <td className="muted">{p.date}</td>
                  <td>{p.customer}</td>
                  <td className="muted">{p.service}</td>
                  <td style={{ fontWeight: "600", color: "#16a34a" }}>₹{p.amount}</td>
                  <td><span className={`vendor-badge ${p.status.toLowerCase()}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
