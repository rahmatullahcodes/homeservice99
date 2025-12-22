import { useState } from "react";

export default function AdminBookings() {

  const [bookings, setBookings] = useState([
    {
      id: 1,
      user: "Rahul",
      service: "AC Repair",
      vendor: "AC Experts",
      status: "Completed",
      amount: 699,
      date: "2025-02-18"
    },
    {
      id: 2,
      user: "Pooja",
      service: "Cleaning",
      vendor: "CleanPro",
      status: "Pending",
      amount: 1999,
      date: "2025-02-20"
    }
  ]);

  function updateStatus(id, newStatus) {
    setBookings(
      bookings.map(b =>
        b.id === id ? { ...b, status: newStatus } : b
      )
    );
  }

  return (
    <div className="admin-page">

      <h2>Bookings</h2>
      <p className="admin-subtitle">
        Monitor and manage all service bookings
      </p>

      {/* BOOKINGS TABLE */}
      <div className="admin-table">

        <div className="table-row head">
          <span>User</span>
          <span>Service</span>
          <span>Vendor</span>
          <span>Status</span>
          <span>Amount</span>
          <span>Action</span>
        </div>

        {bookings.map(b => (
          <div className="table-row" key={b.id}>

            <span>{b.user}</span>
            <span>{b.service}</span>
            <span>{b.vendor}</span>

            <span className={`tag ${
              b.status === "Completed" ? "success" :
              b.status === "Pending" ? "pending" : "active"
            }`}>
              {b.status}
            </span>

            <span>₹{b.amount}</span>

            <span>
              {b.status !== "Completed" && (
                <>
                  <button
                    className="btn-outline"
                    onClick={() => updateStatus(b.id, "In Progress")}
                  >
                    Start
                  </button>

                  <button
                    className="btn-outline"
                    style={{ marginLeft: 6 }}
                    onClick={() => updateStatus(b.id, "Completed")}
                  >
                    Complete
                  </button>
                </>
              )}
            </span>

          </div>
        ))}

      </div>

    </div>
  );
}
