export default function VendorDashboard() {
  return (
    <div>

      <h2 className="vendor-page-title">Dashboard</h2>

      {/* STATS GRID */}
      <div className="vendor-stats-grid">

        <div className="vendor-stat-card blue">
          <span>📋 Today’s Bookings</span>
          <h3>2</h3>
        </div>

        <div className="vendor-stat-card green">
          <span>💰 Total Earnings</span>
          <h3>₹12,450</h3>
        </div>

        <div className="vendor-stat-card yellow">
          <span>⭐ Rating</span>
          <h3>4.7</h3>
        </div>

        <div className="vendor-stat-card purple">
          <span>👛 Wallet Balance</span>
          <h3>₹2,100</h3>
        </div>

      </div>


      {/* QUICK ACTIONS */}
      <div className="vendor-actions">

        <button className="vendor-btn primary">View Bookings</button>
        <button className="vendor-btn outline">Withdraw Wallet</button>
        <button className="vendor-btn outline">Update Profile</button>

      </div>


      {/* RECENT ACTIVITY */}
      <div className="vendor-activity">

        <h3>Recent Activity</h3>

        <div className="vendor-activity-item">
          ✅ Job completed — AC Repair (₹699)
        </div>

        <div className="vendor-activity-item">
          ✅ Payment credited to wallet (₹699)
        </div>

        <div className="vendor-activity-item">
          ⭐ New review received (5★)
        </div>

      </div>


      {/* PAYOUT INFO */}
      <div className="vendor-payout">

        <h3>Next Payout</h3>
        <p><strong>Amount:</strong> ₹1,200</p>
        <p><strong>Date:</strong> 15 Aug 2025</p>

      </div>

    </div>
  );
}
