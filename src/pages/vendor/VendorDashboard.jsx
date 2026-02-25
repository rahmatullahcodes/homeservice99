import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useVendor } from "../../context/VendorContext";
import { API_ENDPOINTS } from "../../config/api";

export default function VendorDashboard() {
  const navigate = useNavigate();
  const { vendor, loading: vendorLoading } = useVendor();
  const token = localStorage.getItem('vendorToken');
  
  const [stats, setStats] = useState({
    todayBookings: 0,
    monthlyEarnings: 0,
    rating: 0,
    walletBalance: 0,
    totalBookings: 0,
    completionRate: 0
  });
  
  const [services, setServices] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard stats and services on mount
  useEffect(() => {
    if (token) {
      fetchDashboardStats();
      fetchServices();
      fetchActivity();
    }
  }, [token]);

  async function fetchDashboardStats() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_ENDPOINTS.VENDOR.DASHBOARD_STATS, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchServices() {
    try {
      const response = await fetch(API_ENDPOINTS.VENDOR.GET_SERVICES, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data = await response.json();
      const servicesList = Array.isArray(data) ? data : data.services || data.data || [];
      setServices(servicesList);
    } catch (err) {
      console.error('Error fetching services:', err);
      // Don't set error for services, it's not critical
    }
  }

  async function fetchActivity() {
    try {
      const response = await fetch(API_ENDPOINTS.VENDOR.GET_ACTIVITY, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch activity');
      }

      const data = await response.json();
      setActivities(Array.isArray(data) ? data : data.activities || []);
    } catch (err) {
      console.error('Error fetching activity:', err);
      // Don't set error for activity, it's not critical
    }
  }

  return (
    <div>
      <div className="vendor-page-head">
        <h2>Dashboard</h2>
        <p>Welcome back! Here's your business overview</p>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          Error: {error}
        </div>
      )}

      <div className="vendor-stats-grid">
        <div className="vendor-stat-card blue">
          <span>Today's Bookings</span>
          <h3>{loading ? "-" : stats.todayBookings}</h3>
          <small>Active bookings today</small>
        </div>
        <div className="vendor-stat-card green">
          <span>Monthly Earnings</span>
          <h3>{loading ? "-" : `₹${stats.monthlyEarnings.toLocaleString()}`}</h3>
          <small>Last 30 days</small>
        </div>
        <button
          className="vendor-stat-card yellow"
          onClick={() => navigate("/vendor/reviews")}
          style={{ cursor: "pointer", border: "none", background: "inherit", padding: "inherit" }}
        >
          <span>Rating</span>
          <h3>{loading ? "-" : `⭐ ${(stats.rating || 0).toFixed(1)}`}</h3>
          <small>From {stats.totalBookings} bookings</small>
        </button>
        <div className="vendor-stat-card purple">
          <span>Wallet Balance</span>
          <h3>{loading ? "-" : `₹${stats.walletBalance.toLocaleString()}`}</h3>
          <small>Ready to withdraw</small>
        </div>
      </div>

      <div className="vendor-grid-2" style={{ marginBottom: "24px", gap: "16px" }}>
        <div className="vendor-section">
          <h3>Completion Rate</h3>
          <div style={{ marginTop: "12px" }}>
            <div style={{ width: "100%", height: "24px", background: "#f3f4f6", borderRadius: "12px", overflow: "hidden" }}>
              <div style={{ width: `${loading ? 0 : stats.completionRate}%`, height: "100%", background: "linear-gradient(90deg, #16a34a, #22c55e)" }} />
            </div>
            <p style={{ marginTop: "8px", fontSize: "14px", color: "#6b7280" }}>
              {loading ? "-" : stats.completionRate}% completed successfully
            </p>
          </div>
        </div>

        <div className="vendor-section">
          <h3>Booking Stats</h3>
          <div style={{ marginTop: "12px", fontSize: "14px" }}>
            <p style={{ margin: "6px 0" }}>
              <strong>Total Bookings:</strong> {loading ? "-" : stats.totalBookings}
            </p>
            <p style={{ margin: "6px 0" }}>
              <strong>Scheduled:</strong> {loading ? "-" : stats.scheduledBookings}
            </p>
            <p style={{ margin: "6px 0" }}>
              <strong>Completed:</strong> {loading ? "-" : stats.completedBookings}
            </p>
          </div>
        </div>
      </div>

      <div className="vendor-grid-3" style={{ marginBottom: "24px", gap: "12px" }}>
        <button className="vendor-btn primary" style={{ justifyContent: "center" }} onClick={() => navigate("/vendor/bookings")}>
          📋 View Bookings
        </button>
        <button className="vendor-btn outline" style={{ justifyContent: "center" }} onClick={() => navigate("/vendor/wallet")}>
          💰 Withdraw Wallet
        </button>
        <button className="vendor-btn outline" style={{ justifyContent: "center" }} onClick={() => navigate("/vendor/profile")}>
          ⚙ Edit Profile
        </button>
      </div>

      <div className="vendor-grid-2" style={{ marginBottom: "24px", gap: "16px" }}>
        <div className="vendor-section">
          <h3>Your Services</h3>
          <div style={{ marginTop: "12px" }}>
            <p style={{ margin: "8px 0", fontSize: "14px" }}>
              <strong>Total Services:</strong> {services.length}
            </p>
            <p style={{ margin: "8px 0", fontSize: "14px" }}>
              <strong>Active Services:</strong> {services.filter(s => s.active).length}
            </p>
            <button 
              className="vendor-btn primary" 
              style={{ marginTop: "12px", width: "100%", justifyContent: "center" }}
              onClick={() => navigate("/vendor/services")}
            >
              → Manage Services
            </button>
          </div>
        </div>

        <div className="vendor-section">
          <h3>Quick Actions</h3>
          <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <button 
              className="vendor-btn outline small full" 
              onClick={() => navigate("/vendor/earnings")}
            >
              📊 View Earnings
            </button>
            <button 
              className="vendor-btn outline small full" 
              onClick={() => navigate("/vendor/reviews")}
            >
              ⭐ View Reviews
            </button>
            <button 
              className="vendor-btn outline small full" 
              onClick={() => navigate("/vendor/transactions")}
            >
              💳 Transactions
            </button>
          </div>
        </div>
      </div>

      <div className="vendor-section">
        <h3>Recent Activity</h3>

        <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {activities.length === 0 ? (
            <p style={{ color: "#6b7280", fontSize: "14px" }}>No recent activity yet.</p>
          ) : (
            activities.slice(0, 10).map(activity => (
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
                      {activity.description}
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
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
