import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API_ENDPOINTS } from "../../config/api";
import { getAdminUser, hasAdminPermission } from "../../utils/adminAccess";
import { ADMIN_DASHBOARD_STATUS_KEYS } from "../../data/adminDashboardData";

function toStatusMap(items) {
  const map = {};
  for (const key of ADMIN_DASHBOARD_STATUS_KEYS) {
    map[key] = 0;
  }
  if (!Array.isArray(items)) {
    return map;
  }

  for (const item of items) {
    const key = item?._id;
    if (key && Object.prototype.hasOwnProperty.call(map, key)) {
      map[key] = Number(item.count || 0);
    }
  }
  return map;
}

export default function AdminDashboard() {
  const adminUser = getAdminUser();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");
      if (!token) {
        setError("Admin authentication required. Please login first.");
        setDashboard(null);
        return;
      }

      const response = await fetch(API_ENDPOINTS.ADMIN.GET_DASHBOARD, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || `Failed to load dashboard (${response.status})`);
      }

      setDashboard(payload);
    } catch (err) {
      setError(err.message || "Failed to load dashboard");
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }

  const bookingStatus = useMemo(() => toStatusMap(dashboard?.bookingStats), [dashboard?.bookingStats]);

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-page-head">
          <h2>Dashboard</h2>
          <p className="admin-subtitle">Real-time platform overview & key metrics</p>
        </div>
        <div style={{ padding: "32px", textAlign: "center", color: "#6b7280" }}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-page-head">
        <h2>Dashboard</h2>
        <p className="admin-subtitle">Real-time platform overview & key metrics</p>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #fecaca", color: "#b91c1c", padding: "12px 14px", borderRadius: "8px", marginBottom: "20px" }}>
          {error}
          <button
            className="btn-sm outline"
            style={{ marginLeft: "12px" }}
            onClick={fetchDashboard}
          >
            Retry
          </button>
        </div>
      )}

      <div className="admin-kpi-grid">
        <div className="kpi-card">
          <span>Total Users</span>
          <h3>{Number(dashboard?.totalUsers || 0).toLocaleString()}</h3>
          <small className="neutral">Registered users</small>
        </div>
        <div className="kpi-card">
          <span>Total Vendors</span>
          <h3>{Number(dashboard?.totalVendors || 0).toLocaleString()}</h3>
          <small className="neutral">Partner vendors</small>
        </div>
        <div className="kpi-card">
          <span>Total Bookings</span>
          <h3>{Number(dashboard?.totalBookings || 0).toLocaleString()}</h3>
          <small className="neutral">Across all services</small>
        </div>
        <div className="kpi-card">
          <span>Total Revenue</span>
          <h3>Rs {Number(dashboard?.totalRevenue || 0).toLocaleString()}</h3>
          <small className="positive">Completed bookings</small>
        </div>
      </div>

      <div className="admin-section">
        <h3>Booking Status Overview</h3>
        <div className="status-grid">
          <div className="status-card pending">
            <strong>Pending</strong>
            <p>{bookingStatus.Pending + bookingStatus.Scheduled}</p>
          </div>
          <div className="status-card active">
            <strong>In Progress</strong>
            <p>{bookingStatus.InProgress}</p>
          </div>
          <div className="status-card success">
            <strong>Completed</strong>
            <p>{bookingStatus.Completed}</p>
          </div>
          <div className="status-card danger">
            <strong>Cancelled</strong>
            <p>{bookingStatus.Cancelled}</p>
          </div>
        </div>
      </div>

      <div className="admin-section">
        <h3>Recent Bookings</h3>
        <div className="admin-table card-mobile">
          <div className="table-row head">
            <span>User</span>
            <span>Service</span>
            <span>Status</span>
            <span>Amount</span>
          </div>

          {(dashboard?.recentBookings || []).length === 0 ? (
            <div style={{ padding: "16px", textAlign: "center", color: "#6b7280" }}>No recent bookings</div>
          ) : (
            dashboard.recentBookings.slice(0, 8).map((booking) => (
              <div className="table-row" key={booking._id}>
                <span data-label="User">{booking.user?.name || "N/A"}</span>
                <span data-label="Service">{booking.service || "N/A"}</span>
                <span data-label="Status" className={`tag ${
                  booking.status === "Completed"
                    ? "success"
                    : booking.status === "Cancelled"
                    ? "danger"
                    : booking.status === "InProgress"
                    ? "active"
                    : "pending"
                }`}>
                  {booking.status}
                </span>
                <span data-label="Amount">Rs {Number(booking.price || 0).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="admin-section">
        <h3>Quick Actions</h3>
        <div className="quick-actions">
          {hasAdminPermission(adminUser, "vendors") && (
            <Link to="/admin/vendors" className="btn-sm">Manage Vendors</Link>
          )}
          {hasAdminPermission(adminUser, "coupons") && (
            <Link to="/admin/coupons" className="btn-sm">Create Coupon</Link>
          )}
          {hasAdminPermission(adminUser, "notifications") && (
            <Link to="/admin/notifications" className="btn-sm">Send Notification</Link>
          )}
          {hasAdminPermission(adminUser, "reports") && (
            <Link to="/admin/reports" className="btn-sm outline">View Reports</Link>
          )}
        </div>
      </div>
    </div>
  );
}
