import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { fetchUserDashboard } from "../../utils/accountApi";
import "../../styles/account.css";

export default function AccountDashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalSpent: 0,
    walletBalance: 0,
    completedBookings: 0,
    reviews: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");
      const data = await fetchUserDashboard();
      setStats(data?.stats || {});
      setRecentBookings(Array.isArray(data?.recentBookings) ? data.recentBookings : []);
    } catch (err) {
      const message = err.message || "Failed to load dashboard";
      setError(message);
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-wrapper">
      <h2 className="dashboard-title">Dashboard</h2>
      <p className="dashboard-subtitle">Welcome! Here is your account overview</p>

      {error && <div className="account-alert danger">{error}</div>}

      <div className="dashboard-grid">
        <div className="dash-card blue">
          <div className="dash-icon">BK</div>
          <div>
            <p className="dash-label">Total Bookings</p>
            <h3>{loading ? "-" : stats.totalBookings || 0}</h3>
            <span className="dash-trend">All time</span>
          </div>
        </div>

        <div className="dash-card green">
          <div className="dash-icon">RS</div>
          <div>
            <p className="dash-label">Total Spent</p>
            <h3>Rs {(stats.totalSpent || 0).toLocaleString()}</h3>
            <span className="dash-trend">Paid bookings</span>
          </div>
        </div>

        <div className="dash-card yellow">
          <div className="dash-icon">WL</div>
          <div>
            <p className="dash-label">Wallet Balance</p>
            <h3>Rs {(stats.walletBalance || 0).toLocaleString()}</h3>
            <span className="dash-trend">Ready to use</span>
          </div>
        </div>

        <div className="dash-card purple">
          <div className="dash-icon">RV</div>
          <div>
            <p className="dash-label">Total Reviews</p>
            <h3>{stats.reviews || 0}</h3>
            <span className="dash-trend">Submitted by you</span>
          </div>
        </div>
      </div>

      <div className="dash-actions-header"><h3 style={{ margin: 0 }}>Quick Actions</h3></div>
      <div className="dash-actions">
        <button className="dash-action" onClick={() => navigate("/account/bookings")}>
          <span>1</span>
          <p>My Bookings</p>
        </button>

        <button className="dash-action" onClick={() => navigate("/account/profile")}>
          <span>2</span>
          <p>Edit Profile</p>
        </button>

        <button className="dash-action" onClick={() => navigate("/account/payments")}>
          <span>3</span>
          <p>Payment Methods</p>
        </button>

        <button className="dash-action" onClick={() => navigate("/account/coupons")}>
          <span>4</span>
          <p>Coupons</p>
        </button>

        <button className="dash-action" onClick={() => navigate("/account/wallet")}>
          <span>5</span>
          <p>My Wallet</p>
        </button>

        <button className="dash-action" onClick={() => navigate("/account/reviews")}>
          <span>6</span>
          <p>My Reviews</p>
        </button>
      </div>

      <div style={{ marginTop: 32 }}>
        <h3 className="section-title">Recent Bookings</h3>

        {loading ? (
          <div className="account-alert info">Loading recent bookings...</div>
        ) : recentBookings.length === 0 ? (
          <div className="account-alert info">No bookings yet.</div>
        ) : (
          <div className="booking-list">
            {recentBookings.map((booking) => (
              <div key={booking._id} className="detail-box">
                <strong>{booking.service || "Service"}</strong>
                <p style={{ margin: 0, color: "#6b7280" }}>
                  {booking.scheduledAt
                    ? new Date(booking.scheduledAt).toLocaleString()
                    : new Date(booking.createdAt).toLocaleString()} {" "}
                  | Rs {Number(booking.price || 0).toLocaleString()}
                </p>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px" }}>
                  <span className="account-badge blue">{booking.status || "Pending"}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
