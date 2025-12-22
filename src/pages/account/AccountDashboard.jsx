export default function AccountDashboard() {
  return (
    <div className="dashboard-wrapper">

      <h2 className="dashboard-title">Dashboard</h2>
      <p className="dashboard-subtitle">Quick overview of your account</p>

      {/* STATS CARDS */}
      <div className="dashboard-grid">

        <div className="dash-card">
          <div className="dash-icon">📅</div>
          <div>
            <p className="dash-label">Upcoming bookings</p>
            <h3>0</h3>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-icon">💰</div>
          <div>
            <p className="dash-label">Total spent</p>
            <h3>₹0</h3>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-icon">👛</div>
          <div>
            <p className="dash-label">Wallet balance</p>
            <h3>₹0</h3>
          </div>
        </div>

      </div>

      {/* QUICK ACTIONS */}
      <div className="dash-actions">

        <div className="dash-action">
          <span>📦</span>
          <p>My Bookings</p>
        </div>

        <div className="dash-action">
          <span>✏️</span>
          <p>Edit Profile</p>
        </div>

        <div className="dash-action">
          <span>🧾</span>
          <p>Payment Methods</p>
        </div>

        <div className="dash-action">
          <span>🎁</span>
          <p>Coupons</p>
        </div>

      </div>

      {/* Recent Bookings */}
      <div style={{ marginTop: 22 }}>
        <h3 style={{ marginBottom: 8 }}>Recent Bookings</h3>
        <div className="booking-list">
          <div className="detail-box">
            <strong>Home Deep Clean</strong>
            <p style={{ margin: 0, color: '#6b7280' }}>Scheduled 2025-12-10 • ₹1,999</p>
          </div>
          <div className="detail-box">
            <strong>AC Service</strong>
            <p style={{ margin: 0, color: '#6b7280' }}>Completed 2025-11-28 • ₹699</p>
          </div>
        </div>
      </div>

    </div>
  );
}
