import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../config/api";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    revenue: 0
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookingsByStatus();
    calculateStats();
  }, [bookings, filterStatus]);

  async function fetchBookings() {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      
      if (!token) {
        console.warn("No admin token found. Using mock data.");
        setBookings(getMockBookings());
        setError("Not authenticated - using demo data");
        setLoading(false);
        return;
      }

      console.log("Fetching bookings from:", API_ENDPOINTS.ADMIN.GET_BOOKINGS);
      const response = await fetch(API_ENDPOINTS.ADMIN.GET_BOOKINGS, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Bookings response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setBookings(data.bookings || data);
      setError(null);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setBookings(getMockBookings());
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function getMockBookings() {
    return [
      { _id: "1", user: { name: "Rahul Kumar" }, service: "AC Repair", vendor: { businessName: "AC Experts" }, status: "Completed", price: 699 },
      { _id: "2", user: { name: "Pooja Singh" }, service: "Home Cleaning", vendor: { businessName: "CleanPro" }, status: "Pending", price: 1999 },
      { _id: "3", user: { name: "Ankit Patel" }, service: "Plumbing", vendor: { businessName: "Plumb Masters" }, status: "InProgress", price: 2299 },
      { _id: "4", user: { name: "Nisha Sharma" }, service: "Salon", vendor: { businessName: "Beauty Pro" }, status: "Completed", price: 899 }
    ];
  }

  function filterBookingsByStatus() {
    if (filterStatus === "All") {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(
        bookings.filter(b => b.status === filterStatus)
      );
    }
  }

  function calculateStats() {
    setStats({
      total: bookings.length,
      completed: bookings.filter(b => b.status === "Completed").length,
      pending: bookings.filter(b => b.status === "Pending").length,
      inProgress: bookings.filter(b => b.status === "InProgress").length,
      revenue: bookings.reduce((sum, b) => sum + (b.price || 0), 0)
    });
  }

  async function updateStatus(id, newStatus) {
    try {
      setUpdating(id);
      const token = localStorage.getItem("adminToken");
      
      const response = await fetch(
        API_ENDPOINTS.ADMIN.UPDATE_BOOKING_STATUS(id),
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update booking status");
      }

      const result = await response.json();
      
      // Update local state
      setBookings(
        bookings.map(b =>
          b._id === id ? result.booking : b
        )
      );
      
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error updating booking status:", err);
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div style={{ padding: "40px", textAlign: "center" }}>
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">

      {/* PAGE HEADER */}
      <div className="admin-page-head">
        <h2>Bookings Management</h2>
        <p className="admin-subtitle">
          Monitor and manage all service bookings
        </p>
      </div>

      {error && (
        <div style={{
          background: "#fee",
          color: "#c33",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
          border: "1px solid #fcc"
        }}>
          <strong>⚠️ {error}</strong>
          <p style={{ margin: "8px 0 0 0", fontSize: "12px" }}>
            {!localStorage.getItem("adminToken") ? "Please login to see live data" : "Using demo data - check backend connection"}
          </p>
        </div>
      )}

      {/* STATS */}
      <div className="admin-kpi-grid">
        <div className="kpi-card">
          <span>Total Bookings</span>
          <h3>{stats.total}</h3>
          <small className="positive">All bookings</small>
        </div>
        <div className="kpi-card">
          <span>Completed</span>
          <h3>{stats.completed}</h3>
          <small className="positive">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% success rate</small>
        </div>
        <div className="kpi-card">
          <span>Pending</span>
          <h3>{stats.pending}</h3>
          <small className="neutral">Awaiting approval</small>
        </div>
        <div className="kpi-card">
          <span>Total Revenue</span>
          <h3>₹{stats.revenue.toLocaleString()}</h3>
          <small className="positive">From all bookings</small>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="admin-section">
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['All', 'Pending', 'InProgress', 'Completed', 'Cancelled'].map(status => (
            <button
              key={status}
              className={`btn-sm ${filterStatus === status ? '' : 'outline'}`}
              onClick={() => setFilterStatus(status)}
              style={{ cursor: 'pointer' }}
            >
              {status} ({bookings.filter(b => status === 'All' ? true : b.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* BOOKINGS TABLE */}
      <div className="admin-section">
        <div className="admin-table">

          <div className="table-row head">
            <span>Booking ID</span>
            <span>User</span>
            <span>Service</span>
            <span>Vendor</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {filteredBookings.length > 0 ? filteredBookings.map(b => (
            <div className="table-row" key={b._id}>

              <span style={{ fontWeight: '600', color: 'var(--admin-primary)' }}>#{b._id?.slice(-6) || 'N/A'}</span>
              <span>{b.user?.name || 'N/A'}</span>
              <span>{b.service || 'N/A'}</span>
              <span style={{ fontSize: '13px', color: 'var(--admin-muted)' }}>{b.vendor?.businessName || 'N/A'}</span>
              <span style={{ fontWeight: '600' }}>₹{b.price?.toLocaleString() || '0'}</span>

              <span>
                <span className={`tag ${
                  b.status === "Completed" ? "success" :
                    b.status === "Pending" ? "pending" :
                      b.status === "InProgress" ? "active" : "danger"
                }`}>
                  {b.status}
                </span>
              </span>

              <span>
                {b.status === "Pending" && (
                  <>
                    <button
                      className="btn-sm"
                      onClick={() => updateStatus(b._id, "InProgress")}
                      disabled={updating === b._id}
                      style={{ marginRight: '6px' }}
                    >
                      {updating === b._id ? 'Starting...' : 'Start'}
                    </button>
                    <button
                      className="btn-sm danger"
                      onClick={() => updateStatus(b._id, "Cancelled")}
                      disabled={updating === b._id}
                    >
                      Cancel
                    </button>
                  </>
                )}
                {b.status === "InProgress" && (
                  <button
                    className="btn-sm"
                    onClick={() => updateStatus(b._id, "Completed")}
                    disabled={updating === b._id}
                  >
                    {updating === b._id ? 'Completing...' : 'Complete'}
                  </button>
                )}
                {b.status === "Completed" && (
                  <span style={{ fontSize: '13px', color: 'var(--admin-muted)' }}>✓ Done</span>
                )}
                {b.status === "Cancelled" && (
                  <span style={{ fontSize: '13px', color: 'var(--admin-muted)' }}>✗ Cancelled</span>
                )}
              </span>

            </div>
          )) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--admin-muted)' }}>
              No bookings found
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
