import { useEffect, useMemo, useState } from "react";
import { API_ENDPOINTS } from "../../config/api";

function getBookingPaymentLabel(booking) {
  return booking.paymentGateway || (booking.paymentMethod === "cod" ? "Cash on Delivery" : "Online");
}

function getStatusClass(status) {
  if (status === "Completed") return "success";
  if (status === "Pending") return "pending";
  if (status === "InProgress" || status === "Scheduled") return "active";
  return "danger";
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Admin authentication required. Please login first.");
      }

      const response = await fetch(API_ENDPOINTS.ADMIN.GET_BOOKINGS, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || `HTTP ${response.status}`);
      }

      setBookings(Array.isArray(data?.bookings) ? data.bookings : Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setBookings([]);
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  const filteredBookings = useMemo(() => {
    if (filterStatus === "All") return bookings;
    return bookings.filter((booking) => booking.status === filterStatus);
  }, [bookings, filterStatus]);

  const stats = useMemo(() => ({
    total: bookings.length,
    completed: bookings.filter((booking) => booking.status === "Completed").length,
    pending: bookings.filter((booking) => booking.status === "Pending").length,
    inProgress: bookings.filter((booking) => booking.status === "InProgress").length,
    revenue: bookings.reduce((sum, booking) => sum + Number(booking.price || 0), 0)
  }), [bookings]);

  async function updateStatus(id, newStatus) {
    try {
      setUpdating(id);
      setError("");

      const token = localStorage.getItem("adminToken");
      const response = await fetch(API_ENDPOINTS.ADMIN.UPDATE_BOOKING_STATUS(id), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.message || "Failed to update booking status");
      }

      const nextBooking = result?.booking || result;
      setBookings((prev) => prev.map((booking) => (
        booking._id === id ? nextBooking : booking
      )));
    } catch (err) {
      setError(err.message || "Failed to update booking status");
      console.error("Error updating booking status:", err);
    } finally {
      setUpdating("");
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page-head">
          <h2>Bookings Management</h2>
          <p className="admin-subtitle">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h2>Bookings Management</h2>
        <p className="admin-subtitle">Monitor bookings with payment gateway and payment status details</p>
      </div>

      {error && (
        <div style={{
          background: "#fee2e2",
          color: "#b91c1c",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "20px",
          border: "1px solid #fecaca"
        }}>
          <strong>{error}</strong>
        </div>
      )}

      <div className="admin-kpi-grid">
        <div className="kpi-card">
          <span>Total Bookings</span>
          <h3>{stats.total}</h3>
          <small className="positive">All bookings</small>
        </div>
        <div className="kpi-card">
          <span>Completed</span>
          <h3>{stats.completed}</h3>
          <small className="positive">
            {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% completion rate
          </small>
        </div>
        <div className="kpi-card">
          <span>Pending</span>
          <h3>{stats.pending}</h3>
          <small className="neutral">Awaiting vendor or payment progress</small>
        </div>
        <div className="kpi-card">
          <span>Total Revenue</span>
          <h3>Rs {stats.revenue.toLocaleString()}</h3>
          <small className="positive">From all bookings</small>
        </div>
      </div>

      <div className="admin-section">
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {["All", "Pending", "Scheduled", "InProgress", "Completed", "Cancelled"].map((status) => (
            <button
              key={status}
              className={`btn-sm ${filterStatus === status ? "" : "outline"}`}
              onClick={() => setFilterStatus(status)}
            >
              {status} ({bookings.filter((booking) => status === "All" ? true : booking.status === status).length})
            </button>
          ))}
        </div>
      </div>

      <div className="admin-section">
        <div className="admin-table card-mobile">
          <div className="table-row head">
            <span>Booking ID</span>
            <span>User</span>
            <span>Service</span>
            <span>Vendor</span>
            <span>Amount</span>
            <span>Payment</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
            <div className="table-row" key={booking._id}>
              <span data-label="Booking ID" style={{ fontWeight: 600, color: "var(--admin-primary)" }}>
                #{booking._id?.slice(-6) || "N/A"}
              </span>
              <span data-label="User">{booking.user?.name || "N/A"}</span>
              <span data-label="Service">
                {booking.service || "N/A"}
                {(booking.customerAddress || booking.address || booking.user?.address) && (
                  <span style={{ display: "block", fontSize: "12px", color: "#6b7280", wordBreak: "break-word" }}>
                    Address: {booking.customerAddress || booking.address || booking.user?.address}
                  </span>
                )}
              </span>
              <span data-label="Vendor" style={{ fontSize: "13px", color: "var(--admin-muted)" }}>
                {booking.vendor?.businessName || (booking.status === "Pending" ? "Open for vendors" : "N/A")}
              </span>
              <span data-label="Amount" style={{ fontWeight: 600 }}>Rs {Number(booking.price || 0).toLocaleString()}</span>
              <span data-label="Payment" style={{ fontSize: "13px", color: "var(--admin-muted)" }}>
                {getBookingPaymentLabel(booking)}
                <br />
                <strong>{booking.paymentStatus || "Pending"}</strong>
                {booking.paymentId && (
                  <>
                    <br />
                    Ref: {booking.paymentId}
                  </>
                )}
              </span>
              <span data-label="Status">
                <span className={`tag ${getStatusClass(booking.status)}`}>
                  {booking.status}
                </span>
              </span>
              <span data-label="Action">
                {booking.status === "Pending" && (
                  <>
                    <button
                      className="btn-sm"
                      onClick={() => updateStatus(booking._id, "InProgress")}
                      disabled={updating === booking._id}
                      style={{ marginRight: "6px" }}
                    >
                      {updating === booking._id ? "Starting..." : "Start"}
                    </button>
                    <button
                      className="btn-sm danger"
                      onClick={() => updateStatus(booking._id, "Cancelled")}
                      disabled={updating === booking._id}
                    >
                      Cancel
                    </button>
                  </>
                )}
                {booking.status === "InProgress" && (
                  <button
                    className="btn-sm"
                    onClick={() => updateStatus(booking._id, "Completed")}
                    disabled={updating === booking._id}
                  >
                    {updating === booking._id ? "Completing..." : "Complete"}
                  </button>
                )}
                {booking.status === "Completed" && (
                  <span style={{ fontSize: "13px", color: "var(--admin-muted)" }}>Done</span>
                )}
                {booking.status === "Cancelled" && (
                  <span style={{ fontSize: "13px", color: "var(--admin-muted)" }}>Cancelled</span>
                )}
              </span>
            </div>
          )) : (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--admin-muted)" }}>
              No bookings found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
