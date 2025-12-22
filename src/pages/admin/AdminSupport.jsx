import { useState } from "react";

export default function AdminSupport() {

  const [tickets, setTickets] = useState([
    {
      id: 1,
      from: "User",
      name: "Rahul",
      issue: "Payment not updated",
      priority: "High",
      status: "Open"
    },
    {
      id: 2,
      from: "Vendor",
      name: "CleanPro",
      issue: "Wallet balance incorrect",
      priority: "Medium",
      status: "In Progress"
    },
    {
      id: 3,
      from: "User",
      name: "Neha",
      issue: "Booking cancelled automatically",
      priority: "Low",
      status: "Closed"
    }
  ]);

  function updateStatus(id, status) {
    setTickets(tickets.map(t =>
      t.id === id ? { ...t, status } : t
    ));
  }

  return (
    <div className="admin-support">

      {/* HEADER */}
      <div className="admin-page-head">
        <h2>Support Tickets</h2>
        <p className="admin-subtitle">
          Manage user & vendor issues
        </p>
      </div>

      {/* TABLE */}
      <div className="admin-table">

        <div className="admin-table-header">
          <span>ID</span>
          <span>From</span>
          <span>Name</span>
          <span>Issue</span>
          <span>Priority</span>
          <span>Status</span>
          <span>Action</span>
        </div>

        {tickets.map(t => (
          <div className="admin-table-row" key={t.id}>

            <span>#{t.id}</span>
            <span>{t.from}</span>
            <span>{t.name}</span>
            <span>{t.issue}</span>

            <span className={`priority ${t.priority.toLowerCase()}`}>
              {t.priority}
            </span>

            <span className={`status-${t.status.replace(" ", "").toLowerCase()}`}>
              {t.status}
            </span>

            <span>
              {t.status !== "Closed" ? (
                <>
                  <button
                    className="btn-outline"
                    onClick={() => updateStatus(t.id, "In Progress")}
                  >
                    Assign
                  </button>

                  <button
                    className="btn-danger"
                    style={{ marginLeft: 6 }}
                    onClick={() => updateStatus(t.id, "Closed")}
                  >
                    Close
                  </button>
                </>
              ) : (
                <span>—</span>
              )}
            </span>

          </div>
        ))}

      </div>

    </div>
  );
}
