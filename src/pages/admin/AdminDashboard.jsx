export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">

      {/* PAGE TITLE */}
      <div className="admin-page-head">
        <h2>Dashboard</h2>
        <p className="admin-subtitle">
          Real-time platform overview & key metrics
        </p>
      </div>

      {/* KPI CARDS - MAIN METRICS */}
      <div className="admin-kpi-grid">
        <div className="kpi-card">
          <span>Total Users</span>
          <h3>2,847</h3>
          <small className="positive">+142 this month</small>
        </div>

        <div className="kpi-card">
          <span>Total Vendors</span>
          <h3>156</h3>
          <small className="positive">+18 approved</small>
        </div>

        <div className="kpi-card">
          <span>Total Bookings</span>
          <h3>5,428</h3>
          <small className="neutral">↗ 12% from last month</small>
        </div>

        <div className="kpi-card">
          <span>Total Revenue</span>
          <h3>₹24,50,000</h3>
          <small className="positive">+₹1,82,000 this month</small>
        </div>
      </div>

      {/* STATUS BREAKDOWN */}
      <div className="admin-section">
        <h3>Booking Status Overview</h3>

        <div className="status-grid">
          <div className="status-card pending">
            <strong>Pending</strong>
            <p>124</p>
          </div>
          <div className="status-card active">
            <strong>In Progress</strong>
            <p>89</p>
          </div>
          <div className="status-card success">
            <strong>Completed</strong>
            <p>4,892</p>
          </div>
          <div className="status-card danger">
            <strong>Cancelled</strong>
            <p>323</p>
          </div>
        </div>
      </div>

      {/* RECENT BOOKINGS TABLE */}
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
            <span>Rahul Kumar</span>
            <span>AC Repair & Service</span>
            <span className="tag success">Completed</span>
            <span>₹699</span>
          </div>

          <div className="table-row">
            <span>Pooja Singh</span>
            <span>Home Deep Cleaning</span>
            <span className="tag pending">Pending</span>
            <span>₹1,999</span>
          </div>

          <div className="table-row">
            <span>Ankit Patel</span>
            <span>Plumbing Installation</span>
            <span className="tag active">In Progress</span>
            <span>₹2,299</span>
          </div>

          <div className="table-row">
            <span>Nisha Sharma</span>
            <span>Salon Services</span>
            <span className="tag success">Completed</span>
            <span>₹899</span>
          </div>

          <div className="table-row">
            <span>Vikram Rao</span>
            <span>Electrical Installation</span>
            <span className="tag active">In Progress</span>
            <span>₹3,499</span>
          </div>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="admin-section">
        <h3>Platform Health</h3>

        <div className="status-grid">
          <div className="status-card success">
            <strong>System Uptime</strong>
            <p>99.9%</p>
          </div>
          <div className="status-card active">
            <strong>Avg Response</strong>
            <p>245ms</p>
          </div>
          <div className="status-card pending">
            <strong>Support Tickets</strong>
            <p>34</p>
          </div>
          <div className="status-card active">
            <strong>Active Users</strong>
            <p>1,234</p>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="admin-section mt-24">
        <h3>Quick Actions</h3>
        <div className="quick-actions">
          <button className="btn-sm">+ Approve Vendor</button>
          <button className="btn-sm">+ Create Coupon</button>
          <button className="btn-sm">+ Send Notification</button>
          <button className="btn-sm outline">View Reports</button>
        </div>
      </div>

    </div>
  );
}
