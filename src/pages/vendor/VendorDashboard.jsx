import { useState } from "react";

export default function VendorDashboard() {
  const [stats] = useState({
    todayBookings: 2,
    monthlyEarnings: 8200,
    rating: 4.7,
    walletBalance: 2100,
    totalBookings: 156,
    completionRate: 98
  });

  const [activities] = useState([
    { id: 1, icon: "✅", title: "Job completed", desc: "AC Repair Service", amount: "₹699", time: "2 hours ago" },
    { id: 2, icon: "💰", title: "Payment credited", desc: "To wallet", amount: "₹699", time: "2 hours ago" },
    { id: 3, icon: "⭐", title: "New review", desc: "5-star rating", amount: "", time: "5 hours ago" },
    { id: 4, icon: "📅", title: "New booking", desc: "Plumbing Service", amount: "₹2,299", time: "1 day ago" }
  ]);

  return (
    <div>
      <div className="vendor-page-head">
        <h2>Dashboard</h2>
        <p>Welcome back! Here's your business overview</p>
      </div>

      <div className="vendor-stats-grid">
        <div className="vendor-stat-card blue">
          <span>Today's Bookings</span>
          <h3>{stats.todayBookings}</h3>
          <small>+1 from yesterday</small>
        </div>
        <div className="vendor-stat-card green">
          <span>Monthly Earnings</span>
          <h3>₹{stats.monthlyEarnings.toLocaleString()}</h3>
          <small>+₹800 from last month</small>
        </div>
        <div className="vendor-stat-card yellow">
          <span>Rating</span>
          <h3>⭐ {stats.rating}</h3>
          <small>From {stats.totalBookings} reviews</small>
        </div>
        <div className="vendor-stat-card purple">
          <span>Wallet Balance</span>
          <h3>₹{stats.walletBalance.toLocaleString()}</h3>
          <small>Ready to withdraw</small>
        </div>
      </div>

      <div className="vendor-grid-2" style={{ marginBottom: "24px", gap: "16px" }}>
        <div className="vendor-section">
          <h3>Completion Rate</h3>
          <div style={{ marginTop: "12px" }}>
            <div style={{ width: "100%", height: "24px", background: "#f3f4f6", borderRadius: "12px", overflow: "hidden" }}>
              <div style={{ width: `${stats.completionRate}%`, height: "100%", background: "linear-gradient(90deg, #16a34a, #22c55e)" }} />
            </div>
            <p style={{ marginTop: "8px", fontSize: "14px", color: "#6b7280" }}>
              {stats.completionRate}% completed on time
            </p>
          </div>
        </div>

        <div className="vendor-section">
          <h3>Next Payout</h3>
          <p style={{ margin: "12px 0 0 0", fontSize: "14px" }}>
            <strong style={{ fontSize: "18px", color: "#16a34a" }}>₹1,200</strong>
          </p>
          <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#6b7280" }}>Expected on Aug 15, 2025</p>
        </div>
      </div>

      <div className="vendor-grid-3" style={{ marginBottom: "24px", gap: "12px" }}>
        <button className="vendor-btn primary" style={{ justifyContent: "center" }}>
          📋 View Bookings
        </button>
        <button className="vendor-btn outline" style={{ justifyContent: "center" }}>
          💰 Withdraw Wallet
        </button>
        <button className="vendor-btn outline" style={{ justifyContent: "center" }}>
          ⚙ Edit Profile
        </button>
      </div>

      <div className="vendor-section">
        <h3>Recent Activity</h3>

        <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {activities.map(activity => (
            <div key={activity.id} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px",
              background: "#f9fafb",
              borderRadius: "8px",
              borderLeft: "3px solid #2563eb"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "20px" }}>{activity.icon}</span>
                <div>
                  <p style={{ margin: "0 0 2px 0", fontSize: "14px", fontWeight: "600" }}>
                    {activity.title}
                  </p>
                  <p style={{ margin: "0", fontSize: "12px", color: "#6b7280" }}>
                    {activity.desc}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                {activity.amount && (
                  <p style={{ margin: "0", fontWeight: "600", color: "#16a34a" }}>
                    {activity.amount}
                  </p>
                )}
                <p style={{ margin: "0", fontSize: "12px", color: "#6b7280" }}>
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
