import { useState, useEffect } from "react";
import { useVendor } from "../../context/VendorContext";
import { API_ENDPOINTS } from "../../config/api";

export default function VendorBookings() {
  const { vendor, loading: vendorLoading } = useVendor();
  const token = localStorage.getItem('vendorToken');
  
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("All");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Fetch bookings from backend
  useEffect(() => {
    fetchBookings();
  }, [filter, page, token, vendorLoading]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = new URL(API_ENDPOINTS.VENDOR.GET_ALL_BOOKINGS);
      url.searchParams.append('page', page);
      url.searchParams.append('limit', 10);
      if (filter !== 'All') {
        url.searchParams.append('status', filter);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.bookings || []);
      setPagination(data.pagination || { total: 0, pages: 1 });
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      setUpdating(bookingId);
      setError(null);

      const response = await fetch(API_ENDPOINTS.VENDOR.UPDATE_BOOKING_STATUS(bookingId), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update booking');
      }

      // Update selected booking in modal if open
      if (selectedBooking?._id === bookingId) {
        setSelectedBooking(data.booking);
      }

      // Refetch list so accepted bookings disappear for other filters immediately
      await fetchBookings();
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) {
      return;
    }
    await updateBookingStatus(bookingId, "Cancelled");
    setSelectedBooking(null);
  };

  const handleCompleteBooking = async (bookingId) => {
    await updateBookingStatus(bookingId, "Completed");
  };

  const handleAcceptBooking = async (bookingId) => {
    await updateBookingStatus(bookingId, "Scheduled");
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredBookings = bookings;
  const stats = {
    all: pagination.total,
    pending: bookings.filter(b => b.status === "Pending").length,
    scheduled: bookings.filter(b => b.status === "Scheduled").length,
    completed: bookings.filter(b => b.status === "Completed").length,
    cancelled: bookings.filter(b => b.status === "Cancelled").length
  };

  if (vendorLoading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <p>Loading vendor information...</p>
      </div>
    );
  }

  return (
    <div>
      {/* PAGE HEADER */}
      <div className="vendor-page-head">
        <h2>Bookings</h2>
        <p>Manage and track all your service bookings</p>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div style={{
          background: "#fee2e2",
          color: "#991b1b",
          padding: "12px 16px",
          borderRadius: "8px",
          borderLeft: "3px solid #dc2626",
          marginBottom: "16px"
        }}>
          <p style={{ margin: "0" }}><strong>Error:</strong> {error}</p>
        </div>
      )}

      {/* STATS CARDS */}
      <div className="vendor-grid-2" style={{ marginBottom: "24px" }}>
        <div className="vendor-grid-2" style={{ gridColumn: "1 / -1" }}>
          <div className="vendor-stat-card blue">
            <span>Total Bookings</span>
            <h3>{pagination.total}</h3>
          </div>
          <div className="vendor-stat-card green">
            <span>Open Leads</span>
            <h3>{stats.pending}</h3>
          </div>
          <div className="vendor-stat-card yellow">
            <span>Scheduled</span>
            <h3>{stats.scheduled}</h3>
          </div>
          <div className="vendor-stat-card orange">
            <span>Completed</span>
            <h3>{stats.completed}</h3>
          </div>
          <div className="vendor-stat-card purple">
            <span>Cancelled</span>
            <h3>{stats.cancelled}</h3>
          </div>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="vendor-section" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            key="All"
            className={`vendor-btn ${filter === "All" ? "primary" : "outline"} small`}
            onClick={() => {
              setFilter("All");
              setPage(1);
            }}
          >
            All ({pagination.total})
          </button>
          {["Pending", "Scheduled", "Completed", "Cancelled"].map(status => (
            <button
              key={status}
              className={`vendor-btn ${filter === status ? "primary" : "outline"} small`}
              onClick={() => {
                setFilter(status);
                setPage(1);
              }}
            >
              {status} ({stats[status.toLowerCase()]})
            </button>
          ))}
        </div>
      </div>

      {/* BOOKINGS TABLE */}
      <div className="vendor-section">
        {loading ? (
          <div style={{ padding: "24px", textAlign: "center" }}>
            <p style={{ color: "#6b7280" }}>Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="vendor-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <p>No {filter.toLowerCase()} bookings found</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="vendor-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(b => (
                  <tr key={b._id}>
                    <td style={{ fontWeight: "600", color: "#2563eb" }}>#{b._id?.slice(-6) || b._id}</td>
                    <td>{b.user?.name || "Unknown"}</td>
                    <td className="muted" title={b.service}>{b.service}</td>
                    <td className="muted">{formatDate(b.scheduledAt || b.createdAt)}</td>
                    <td style={{ fontWeight: "600" }}>₹{b.price?.toLocaleString() || 0}</td>
                    <td>
                      <span className={`vendor-badge ${b.status?.toLowerCase()}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="vendor-btn small outline"
                        onClick={() => setSelectedBooking(b)}
                        disabled={updating === b._id}
                      >
                        View
                      </button>
                      {b.status === "Pending" && (
                        <button
                          className="vendor-btn small primary"
                          onClick={() => handleAcceptBooking(b._id)}
                          disabled={updating === b._id}
                          style={{ marginLeft: "4px" }}
                        >
                          {updating === b._id ? "..." : "Accept"}
                        </button>
                      )}
                      {b.status === "Scheduled" && (
                        <button
                          className="vendor-btn small success"
                          onClick={() => handleCompleteBooking(b._id)}
                          disabled={updating === b._id}
                          style={{ marginLeft: "4px" }}
                        >
                          {updating === b._id ? "..." : "Complete"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {pagination.pages > 1 && (
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            gap: "8px", 
            marginTop: "24px",
            paddingTop: "16px",
            borderTop: "1px solid #e5e7eb"
          }}>
            <button
              className="vendor-btn small outline"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              ← Previous
            </button>
            <span style={{ fontSize: "14px", fontWeight: "600" }}>
              Page {page} of {pagination.pages}
            </span>
            <button
              className="vendor-btn small outline"
              onClick={() => setPage(Math.min(pagination.pages, page + 1))}
              disabled={page === pagination.pages}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* BOOKING DETAILS MODAL */}
      {selectedBooking && (
        <div className="vendor-modal-backdrop" onClick={() => setSelectedBooking(null)}>
          <div className="vendor-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: "0" }}>Booking Details</h3>
              <button
                className="vendor-modal-close"
                onClick={() => setSelectedBooking(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Booking ID</p>
                <p style={{ margin: "0", fontSize: "16px", fontWeight: "600" }}>#{selectedBooking._id?.slice(-6) || selectedBooking._id}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Status</p>
                <span className={`vendor-badge ${selectedBooking.status?.toLowerCase()}`}>
                  {selectedBooking.status}
                </span>
              </div>
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Customer Name</p>
                <p style={{ margin: "0", fontSize: "14px" }}>{selectedBooking.user?.name || "Unknown"}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Amount</p>
                <p style={{ margin: "0", fontSize: "16px", fontWeight: "600", color: "#16a34a" }}>₹{(selectedBooking.price || 0).toLocaleString()}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Service</p>
                <p style={{ margin: "0", fontSize: "14px" }}>{selectedBooking.service}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Scheduled Date</p>
                <p style={{ margin: "0", fontSize: "14px" }}>{formatDate(selectedBooking.scheduledAt || selectedBooking.createdAt)}</p>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Customer Phone</p>
                <p style={{ margin: "0", fontSize: "14px" }}>{selectedBooking.user?.phone || "N/A"}</p>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Service Address</p>
                <p style={{ margin: "0", fontSize: "14px", wordBreak: "break-word" }}>
                  {selectedBooking.customerAddress || selectedBooking.address || selectedBooking.user?.address || "N/A"}
                </p>
              </div>
            </div>

            <div style={{ borderTop: "1.5px solid #e5e7eb", paddingTop: "16px", marginTop: "16px" }}>
              {selectedBooking.status === "Pending" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                    Accept this booking to assign it to yourself. Coins will be deducted from your wallet.
                  </p>
                  <button
                    className="vendor-btn primary full"
                    onClick={() => handleAcceptBooking(selectedBooking._id)}
                    disabled={updating === selectedBooking._id}
                  >
                    {updating === selectedBooking._id ? "Accepting..." : "Accept Booking"}
                  </button>
                </div>
              )}
              {selectedBooking.status === "Scheduled" && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="vendor-btn success full"
                    onClick={() => handleCompleteBooking(selectedBooking._id)}
                    disabled={updating === selectedBooking._id}
                  >
                    {updating === selectedBooking._id ? "Updating..." : "✓ Mark Completed"}
                  </button>
                  <button
                    className="vendor-btn danger full"
                    onClick={() => handleCancelBooking(selectedBooking._id)}
                    disabled={updating === selectedBooking._id}
                  >
                    {updating === selectedBooking._id ? "Updating..." : "✕ Cancel Booking"}
                  </button>
                </div>
              )}
              {selectedBooking.status === "Completed" && (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px" }}>
                  <p style={{ margin: "0", color: "#166534" }}>✓ This booking has been completed</p>
                </div>
              )}
              {selectedBooking.status === "Cancelled" && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px" }}>
                  <p style={{ margin: "0", color: "#991b1b" }}>✕ This booking has been cancelled</p>
                </div>
              )}
              {(!["Scheduled", "Pending"].includes(selectedBooking.status) || !selectedBooking.status) && (
                <button
                  className="vendor-btn outline full"
                  onClick={() => setSelectedBooking(null)}
                  disabled={updating === selectedBooking._id}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
