import { useState } from "react";
import "../../styles/account.css";

export default function AccountDashboard() {
  const [stats] = useState({
    upcomingBookings: 2,
    totalSpent: 5499,
    walletBalance: 1250,
    completedBookings: 8,
    reviews: 7
  });

  const [recentBookings] = useState([
    { id: 1, service: "AC Repair", date: "20 Dec 2025", time: "10:00 AM", vendor: "Demo Services", price: 699, status: "Confirmed" },
    { id: 2, service: "Plumbing", date: "22 Dec 2025", time: "2:00 PM", vendor: "Expert Plumber", price: 499, status: "Pending" },
    { id: 3, service: "Home Cleaning", date: "18 Dec 2025", time: "11:30 AM", vendor: "Clean Homes", price: 1299, status: "Completed" }
  ]);

  return (
    <div className="dashboard-wrapper">

      <h2 className="dashboard-title">Dashboard</h2>
      <p className="dashboard-subtitle">Welcome! Here's your account overview</p>

      {/* STATS CARDS */}
      <div className="dashboard-grid">

        <div className="dash-card blue">
          <div className="dash-icon">📅</div>
          <div>
            <p className="dash-label">Upcoming Bookings</p>
            <h3>{stats.upcomingBookings}</h3>
            <span className="dash-trend">Next booking in 2 days</span>
          </div>
        </div>

        <div className="dash-card green">
          <div className="dash-icon">💰</div>
          <div>
            <p className="dash-label">Total Spent</p>
            <h3>₹{stats.totalSpent.toLocaleString()}</h3>
            <span className="dash-trend">This month</span>
          </div>
        </div>

        <div className="dash-card yellow">
          <div className="dash-icon">👛</div>
          <div>
            <p className="dash-label">Wallet Balance</p>
            <h3>₹{stats.walletBalance.toLocaleString()}</h3>
            <span className="dash-trend">Ready to use</span>
          </div>
        </div>

        <div className="dash-card purple">
          <div className="dash-icon">⭐</div>
          <div>
            <p className="dash-label">Total Reviews</p>
            <h3>{stats.reviews}</h3>
            <span className="dash-trend">4.8 average rating</span>
          </div>
        </div>

      </div>

      {/* QUICK ACTIONS */}
      <div className="dash-actions-header"><h3 style={{ margin: 0 }}>Quick Actions</h3></div>
      <div className="dash-actions">

        <button className="dash-action">
          <span>📦</span>
          <p>My Bookings</p>
        </button>

        <button className="dash-action">
          <span>✏️</span>
          <p>Edit Profile</p>
        </button>

        <button className="dash-action">
          <span>🧾</span>
          <p>Payment Methods</p>
        </button>

        <button className="dash-action">
          <span>🎁</span>
          <p>Coupons</p>
        </button>

        <button className="dash-action">
          <span>💳</span>
          <p>My Wallet</p>
        </button>

        <button className="dash-action">
          <span>⭐</span>
          <p>My Reviews</p>
        </button>

      </div>

      {/* Recent Bookings */}
      <div style={{ marginTop: 32 }}>
        <h3 className="section-title">Recent Bookings</h3>
        <div className="booking-list">
          {recentBookings.map(booking => (
            <div key={booking.id} className="detail-box">
              <strong>{booking.service}</strong>
              <p style={{ margin: 0, color: '#6b7280' }}>
                {booking.date} • {booking.time} • ₹{booking.price}
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                <span className="account-badge blue">{booking.status}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
