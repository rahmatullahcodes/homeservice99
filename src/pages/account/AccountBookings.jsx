import { useState } from "react";
import "../../styles/account.css";

export default function AccountBookings() {

  const BOOKINGS = [
    { id: 1, service: "AC Service", date: "Tomorrow, 4 PM", price: 699, status: "Confirmed" },
    { id: 2, service: "Deep Cleaning", date: "12 Feb 2025", price: 1999, status: "Completed" },
    { id: 3, service: "Electrician Visit", date: "5 Feb 2025", price: 249, status: "Cancelled" }
  ];

  const [filter, setFilter] = useState("All");
  const [activeBooking, setActiveBooking] = useState(null);

  const filteredBookings =
    filter === "All"
      ? BOOKINGS
      : BOOKINGS.filter(b => b.status === filter);

  function cancelBooking(id) {
    alert(`Booking #${id} cancelled (demo)`);
  }

  function downloadInvoice(id) {
    alert(`Invoice for booking #${id} downloaded (demo)`);
  }

  return (
    <div className="dashboard-wrapper">

      {/* HEADER */}
      <h2 className="dashboard-title">My Bookings</h2>
      <p className="dashboard-subtitle">Manage and track your service history</p>

      {/* KPI CARDS */}
      <div className="dashboard-grid" style={{ marginBottom: "32px" }}>
        <div className="dash-card blue">
          <div className="dash-icon">📊</div>
          <div>
            <p className="dash-label">Total Bookings</p>
            <h3>{BOOKINGS.length}</h3>
            <span className="dash-trend">All time</span>
          </div>
        </div>
        <div className="dash-card green">
          <div className="dash-icon">✅</div>
          <div>
            <p className="dash-label">Confirmed</p>
            <h3>{BOOKINGS.filter(b => b.status === "Confirmed").length}</h3>
            <span className="dash-trend">Upcoming</span>
          </div>
        </div>
        <div className="dash-card purple">
          <div className="dash-icon">⭐</div>
          <div>
            <p className="dash-label">Completed</p>
            <h3>{BOOKINGS.filter(b => b.status === "Completed").length}</h3>
            <span className="dash-trend">Service finished</span>
          </div>
        </div>
        <div className="dash-card yellow">
          <div className="dash-icon">❌</div>
          <div>
            <p className="dash-label">Cancelled</p>
            <h3>{BOOKINGS.filter(b => b.status === "Cancelled").length}</h3>
            <span className="dash-trend">Not completed</span>
          </div>
        </div>
      </div>

      {/* FILTER SECTION */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {["All", "Confirmed", "Completed", "Cancelled"].map(tab => (
          <button
            key={tab}
            className={`account-btn ${filter === tab ? "primary" : "secondary"}`}
            onClick={() => setFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* BOOKINGS TABLE */}
      {filteredBookings.length === 0 ? (
        <div className="account-card" style={{ textAlign: "center", padding: "40px 20px" }}>
          <p style={{ color: "#6b7280", fontSize: "14px" }}>No bookings found</p>
        </div>
      ) : (
        <div className="account-card" style={{ overflow: "hidden" }}>
          <table className="account-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Date & Time</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(b => (
                <tr key={b.id}>
                  <td><strong>{b.service}</strong></td>
                  <td>{b.date}</td>
                  <td>₹{b.price}</td>
                  <td>
                    <span className={`account-badge ${b.status === "Confirmed" ? "blue" : b.status === "Completed" ? "green" : "red"}`}>
                      {b.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="account-btn primary"
                      style={{ fontSize: "12px", padding: "6px 12px" }}
                      onClick={() => setActiveBooking(b)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* BOOKING DETAILS MODAL */}
      {activeBooking && (
        <div className="account-modal-overlay" onClick={() => setActiveBooking(null)}>
          <div className="account-modal" onClick={e => e.stopPropagation()}>

            <div className="account-modal-header">
              <h2>{activeBooking.service}</h2>
              <button className="account-modal-close" onClick={() => setActiveBooking(null)}>✕</button>
            </div>

            <div className="account-modal-body">
              <div className="account-form-group">
                <label><strong>Booking Details</strong></label>
              </div>
              <p><strong>Date & Time:</strong> {activeBooking.date}</p>
              <p><strong>Amount:</strong> ₹{activeBooking.price}</p>
              <p>
                <strong>Status:</strong> <span className={`account-badge ${activeBooking.status === "Confirmed" ? "blue" : activeBooking.status === "Completed" ? "green" : "red"}`}>
                  {activeBooking.status}
                </span>
              </p>
            </div>

            <div className="account-modal-footer">
              {activeBooking.status === "Confirmed" && (
                <button
                  className="account-btn danger"
                  onClick={() => { cancelBooking(activeBooking.id); setActiveBooking(null); }}
                >
                  Cancel Booking
                </button>
              )}

              <button
                className="account-btn secondary"
                onClick={() => downloadInvoice(activeBooking.id)}
              >
                Download Invoice
              </button>

              <button className="account-btn primary" onClick={() => setActiveBooking(null)}>
                Rebook Service
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
