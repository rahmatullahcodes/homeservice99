import { useState } from "react";

export default function VendorBookings() {

  const INITIAL_BOOKINGS = [
    { id: 1, name: "Rahul Sharma", service: "AC Repair", date: "Today 11:30 AM", status: "Scheduled", amount: 699 },
    { id: 2, name: "Priya Verma", service: "Home Cleaning", date: "Yesterday 4:00 PM", status: "Completed", amount: 1299 },
    { id: 3, name: "Amit Singh", service: "Electrician", date: "15 Aug 2025 2:00 PM", status: "Cancelled", amount: 0 }
  ];

  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [filter, setFilter] = useState("All");

  function updateStatus(id, newStatus) {
    setBookings(prev =>
      prev.map(b => b.id === id ? { ...b, status: newStatus } : b)
    );
  }

  function cancelBooking(id) {
    if (!window.confirm("Cancel this booking?")) return;
    updateStatus(id, "Cancelled");
  }

  const filteredBookings =
    filter === "All"
      ? bookings
      : bookings.filter(b => b.status === filter);

  return (
    <div className="vendor-bookings">

      <h2 className="vendor-page-title">My Bookings</h2>

      {/* FILTER */}
      <div className="vendor-filter">
        {["All", "Scheduled", "Completed", "Cancelled"].map(f => (
          <button
            key={f}
            className={filter === f ? "active" : ""}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* EMPTY */}
      {filteredBookings.length === 0 && (
        <div className="empty-box">
          No bookings found for <strong>{filter}</strong>
        </div>
      )}

      {/* LIST */}
      <div className="vendor-booking-list">
        {filteredBookings.map(b => (
          <div key={b.id} className="vendor-booking-card">

            <div className="vendor-booking-top">
              <strong>{b.name}</strong>
              <span className={`status ${b.status.toLowerCase()}`}>
                {b.status}
              </span>
            </div>

            <p className="service-name">{b.service}</p>
            <p className="booking-time">🕒 {b.date}</p>

            <div className="vendor-booking-bottom">
              <span className="amount">₹{b.amount}</span>

              {b.status === "Scheduled" && (
                <div className="booking-actions">
                  <button
                    className="vendor-btn small"
                    onClick={() => updateStatus(b.id, "Completed")}
                  >
                    Mark Completed
                  </button>
                  <button
                    className="vendor-btn small outline"
                    onClick={() => cancelBooking(b.id)}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {b.status === "Completed" && (
                <span className="completed-label">✅ Completed</span>
              )}

              {b.status === "Cancelled" && (
                <span className="cancelled-label">❌ Cancelled</span>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
