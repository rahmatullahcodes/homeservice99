export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">

      {/* PAGE TITLE */}
      <div className="admin-page-head">
        <h2>Dashboard</h2>
        <p className="admin-subtitle">
          Platform overview & real-time insights
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="admin-kpi-grid">
        <div className="kpi-card">
          <span>Total Users</span>
          <h3>142</h3>
          <small className="positive">+12 this week</small>
        </div>

        <div className="kpi-card">
          <span>Total Vendors</span>
          <h3>38</h3>
          <small className="positive">+3 approved</small>
        </div>

        <div className="kpi-card">
          <span>Total Bookings</span>
          <h3>512</h3>
          <small className="neutral">Today: 14</small>
        </div>

        <div className="kpi-card">
          <span>Total Revenue</span>
          <h3>₹2,45,000</h3>
          <small className="positive">+₹18,200 this month</small>
        </div>
      </div>

      {/* STATUS BREAKDOWN */}
      <div className="admin-section">
        <h3>Booking Status</h3>

        <div className="status-grid">
          <div className="status-card pending">
            <strong>Pending</strong>
            <p>21</p>
          </div>
          <div className="status-card active">
            <strong>In Progress</strong>
            <p>9</p>
          </div>
          <div className="status-card success">
            <strong>Completed</strong>
            <p>460</p>
          </div>
          <div className="status-card danger">
            <strong>Cancelled</strong>
            <p>22</p>
          </div>
        </div>
      </div>

      {/* RECENT BOOKINGS */}
      <div className="admin-section">
        <h3>Recent Bookings</h3>

        <div className="admin-table">
          <div className="table-row head">
            <span>User</span>
            <span>Service</span>
            <span>Status</span>
            <span>Amount</span>
          </div>

          <div className="table-row">
            <span>Rahul</span>
            <span>AC Repair</span>
            <span className="tag success">Completed</span>
            <span>₹699</span>
          </div>

          <div className="table-row">
            <span>Pooja</span>
            <span>Cleaning</span>
            <span className="tag pending">Pending</span>
            <span>₹1,999</span>
          </div>

          <div className="table-row">
            <span>Ankit</span>
            <span>Plumbing</span>
            <span className="tag active">In Progress</span>
            <span>₹299</span>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="admin-section">
        <h3>Quick Actions</h3>

        <div className="quick-actions">
          <button className="btn-outline">Approve Vendors</button>
          <button className="btn-outline">Create Coupon</button>
          <button className="btn-outline">Send Notification</button>
          <button className="btn-outline">View Reports</button>
        </div>
      </div>

    </div>
  );
}
