import { useState } from "react";

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
    <div className="bookings-wrapper">

      {/* HEADER */}
      <div className="dashboard-head">
        <h2>My Bookings</h2>
        <p>Manage and track your service history</p>
      </div>

      {/* MINI DASHBOARD */}
      <div className="booking-stats">
        <div className="stat-box">
          <strong>{BOOKINGS.length}</strong>
          <span>Total</span>
        </div>
        <div className="stat-box">
          <strong>{BOOKINGS.filter(b => b.status === "Confirmed").length}</strong>
          <span>Upcoming</span>
        </div>
        <div className="stat-box">
          <strong>{BOOKINGS.filter(b => b.status === "Completed").length}</strong>
          <span>Completed</span>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="booking-filters">
        {["All", "Confirmed", "Completed", "Cancelled"].map(tab => (
          <button
            key={tab}
            className={`filter-btn ${filter === tab ? "active" : ""}`}
            onClick={() => setFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* BOOKINGS LIST */}
      {filteredBookings.length === 0 ? (
        <div className="detail-box">No bookings found.</div>
      ) : (
        <div className="booking-list">
          {filteredBookings.map(b => (
            <div
              key={b.id}
              className="booking-card"
              onClick={() => setActiveBooking(b)}
            >

              <div className="booking-left">
                <strong>{b.service}</strong>
                <span className="booking-date">{b.date}</span>
              </div>

              <div className="booking-right">
                <span className={`badge ${b.status.toLowerCase()}`}>
                  {b.status}
                </span>
                <strong>₹{b.price}</strong>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* BOOKING DETAILS MODAL */}
      {activeBooking && (
        <div className="modal-backdrop" onClick={() => setActiveBooking(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>

            <h3>{activeBooking.service}</h3>
            <p><strong>Date:</strong> {activeBooking.date}</p>
            <p><strong>Amount:</strong> ₹{activeBooking.price}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={`badge ${activeBooking.status.toLowerCase()}`}>
                {activeBooking.status}
              </span>
            </p>

            <div className="modal-actions">
              {activeBooking.status === "Confirmed" && (
                <button
                  className="btn-danger"
                  onClick={() => cancelBooking(activeBooking.id)}
                >
                  Cancel Booking
                </button>
              )}

              <button
                className="btn-outline"
                onClick={() => downloadInvoice(activeBooking.id)}
              >
                Download Invoice
              </button>

              <button className="btn-primary">
                Rebook Service
              </button>
            </div>

            <button
              className="modal-close"
              onClick={() => setActiveBooking(null)}
            >
              ✕
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
