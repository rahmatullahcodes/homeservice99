import { useState } from "react";

export default function VendorBookings() {
  const [bookings, setBookings] = useState([
    { id: 1001, name: "Rahul Sharma", service: "AC Repair & Service", date: "Today 11:30 AM", status: "Scheduled", amount: 699, location: "Delhi" },
    { id: 1002, name: "Priya Verma", service: "Home Deep Cleaning", date: "Yesterday 4:00 PM", status: "Completed", amount: 1299, location: "Noida" },
    { id: 1003, name: "Amit Singh", service: "Electrical Installation", date: "15 Aug 2025", status: "Completed", amount: 1999, location: "Delhi" },
    { id: 1004, name: "Neha Patel", service: "Plumbing Repair", date: "16 Aug 2025", status: "Scheduled", amount: 499, location: "Ghaziabad" }
  ]);

  const [filter, setFilter] = useState("All");
  const [selectedBooking, setSelectedBooking] = useState(null);

  function updateStatus(id, newStatus) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
  }

  function cancelBooking(id) {
    if (!window.confirm("Cancel this booking? This action cannot be undone.")) return;
    updateStatus(id, "Cancelled");
  }

  const filteredBookings = filter === "All" ? bookings : bookings.filter(b => b.status === filter);
  const stats = {
    total: bookings.length,
    scheduled: bookings.filter(b => b.status === "Scheduled").length,
    completed: bookings.filter(b => b.status === "Completed").length,
    cancelled: bookings.filter(b => b.status === "Cancelled").length
  };

  return (
    <div>
      {/* PAGE HEADER */}
      <div className="vendor-page-head">
        <h2>Bookings</h2>
        <p>Manage and track all your service bookings</p>
      </div>

      {/* STATS CARDS */}
      <div className="vendor-grid-2" style={{ marginBottom: "24px" }}>
        <div className="vendor-grid-2" style={{ gridColumn: "1 / -1" }}>
          <div className="vendor-stat-card blue">
            <span>Total Bookings</span>
            <h3>{stats.total}</h3>
          </div>
          <div className="vendor-stat-card green">
            <span>Scheduled</span>
            <h3>{stats.scheduled}</h3>
          </div>
          <div className="vendor-stat-card yellow">
            <span>Completed</span>
            <h3>{stats.completed}</h3>
          </div>
          <div className="vendor-stat-card orange">
            <span>Cancelled</span>
            <h3>{stats.cancelled}</h3>
          </div>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="vendor-section" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["All", "Scheduled", "Completed", "Cancelled"].map(status => (
            <button
              key={status}
              className={`vendor-btn ${filter === status ? "primary" : "outline"} small`}
              onClick={() => setFilter(status)}
            >
              {status} ({stats[status.toLowerCase()] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* BOOKINGS TABLE */}
      <div className="vendor-section">
        {filteredBookings.length === 0 ? (
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
                  <th>Location</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: "600", color: "#2563eb" }}>#{b.id}</td>
                    <td>{b.name}</td>
                    <td className="muted">{b.service}</td>
                    <td className="muted">{b.location}</td>
                    <td className="muted">{b.date}</td>
                    <td style={{ fontWeight: "600" }}>₹{b.amount}</td>
                    <td>
                      <span className={`vendor-badge ${b.status.toLowerCase()}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="vendor-btn small outline"
                        onClick={() => setSelectedBooking(b)}
                      >
                        View
                      </button>
                      {b.status === "Scheduled" && (
                        <button
                          className="vendor-btn small success"
                          onClick={() => updateStatus(b.id, "Completed")}
                          style={{ marginLeft: "4px" }}
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                <p style={{ margin: "0", fontSize: "16px", fontWeight: "600" }}>#{selectedBooking.id}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Status</p>
                <span className={`vendor-badge ${selectedBooking.status.toLowerCase()}`}>
                  {selectedBooking.status}
                </span>
              </div>
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Customer Name</p>
                <p style={{ margin: "0", fontSize: "14px" }}>{selectedBooking.name}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Amount</p>
                <p style={{ margin: "0", fontSize: "16px", fontWeight: "600", color: "#16a34a" }}>₹{selectedBooking.amount}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Service</p>
                <p style={{ margin: "0", fontSize: "14px" }}>{selectedBooking.service}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Location</p>
                <p style={{ margin: "0", fontSize: "14px" }}>{selectedBooking.location}</p>
              </div>
            </div>

            <div style={{ borderTop: "1.5px solid #e5e7eb", paddingTop: "16px", marginTop: "16px" }}>
              {selectedBooking.status === "Scheduled" && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="vendor-btn success full"
                    onClick={() => {
                      updateStatus(selectedBooking.id, "Completed");
                      setSelectedBooking(null);
                    }}
                  >
                    Mark Completed
                  </button>
                  <button
                    className="vendor-btn danger full"
                    onClick={() => {
                      cancelBooking(selectedBooking.id);
                      setSelectedBooking(null);
                    }}
                  >
                    Cancel Booking
                  </button>
                </div>
              )}
              {selectedBooking.status !== "Scheduled" && (
                <button
                  className="vendor-btn outline full"
                  onClick={() => setSelectedBooking(null)}
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
