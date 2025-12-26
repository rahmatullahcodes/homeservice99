import { useState } from "react";

export default function AdminBookings() {

  const [bookings, setBookings] = useState([
    {
      id: 1001,
      user: "Rahul Kumar",
      service: "AC Repair & Service",
      vendor: "AC Experts",
      status: "Completed",
      amount: 699,
      date: "2025-02-18",
      rating: 4.8
    },
    {
      id: 1002,
      user: "Pooja Singh",
      service: "Home Deep Cleaning",
      vendor: "CleanPro",
      status: "Pending",
      amount: 1999,
      date: "2025-02-20",
      rating: 0
    },
    {
      id: 1003,
      user: "Ankit Patel",
      service: "Plumbing Installation",
      vendor: "Plumb Masters",
      status: "In Progress",
      amount: 2299,
      date: "2025-02-21",
      rating: 0
    },
    {
      id: 1004,
      user: "Nisha Sharma",
      service: "Salon Services",
      vendor: "Beauty Pro",
      status: "Completed",
      amount: 899,
      date: "2025-02-19",
      rating: 4.9
    },
    {
      id: 1005,
      user: "Vikram Rao",
      service: "Electrical Installation",
      vendor: "ElectroTech",
      status: "In Progress",
      amount: 3499,
      date: "2025-02-22",
      rating: 0
    }
  ]);

  const [filterStatus, setFilterStatus] = useState("All");

  function updateStatus(id, newStatus) {
    setBookings(
      bookings.map(b =>
        b.id === id ? { ...b, status: newStatus } : b
      )
    );
  }

  const filteredBookings = filterStatus === "All" 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus);

  const stats = {
    total: bookings.length,
    completed: bookings.filter(b => b.status === "Completed").length,
    pending: bookings.filter(b => b.status === "Pending").length,
    inProgress: bookings.filter(b => b.status === "In Progress").length,
    revenue: bookings.reduce((sum, b) => sum + b.amount, 0)
  };

  return (
    <div className="admin-page">

      {/* PAGE HEADER */}
      <div className="admin-page-head">
        <h2>Bookings Management</h2>
        <p className="admin-subtitle">
          Monitor and manage all service bookings
        </p>
      </div>

      {/* STATS */}
      <div className="admin-kpi-grid">
        <div className="kpi-card">
          <span>Total Bookings</span>
          <h3>{stats.total}</h3>
          <small className="positive">+42 this month</small>
        </div>
        <div className="kpi-card">
          <span>Completed</span>
          <h3>{stats.completed}</h3>
          <small className="positive">{Math.round((stats.completed/stats.total)*100)}% success rate</small>
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
        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
          {['All', 'Pending', 'In Progress', 'Completed'].map(status => (
            <button
              key={status}
              className={`btn-sm ${filterStatus === status ? '' : 'outline'}`}
              onClick={() => setFilterStatus(status)}
              style={{cursor: 'pointer'}}
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
            <div className="table-row" key={b.id}>

              <span style={{fontWeight: '600', color: 'var(--admin-primary)'}}>#{b.id}</span>
              <span>{b.user}</span>
              <span>{b.service}</span>
              <span style={{fontSize: '13px', color: 'var(--admin-muted)'}}>{b.vendor}</span>
              <span style={{fontWeight: '600'}}>₹{b.amount}</span>

              <span>
                <span className={`tag ${
                  b.status === "Completed" ? "success" :
                  b.status === "Pending" ? "pending" : "active"
                }`}>
                  {b.status}
                </span>
              </span>

              <span>
                {b.status === "Pending" && (
                  <>
                    <button
                      className="btn-sm"
                      onClick={() => updateStatus(b.id, "In Progress")}
                      style={{marginRight: '6px'}}
                    >
                      Start
                    </button>
                    <button
                      className="btn-sm danger"
                      onClick={() => updateStatus(b.id, "Cancelled")}
                    >
                      Cancel
                    </button>
                  </>
                )}
                {b.status === "In Progress" && (
                  <button
                    className="btn-sm"
                    onClick={() => updateStatus(b.id, "Completed")}
                  >
                    Complete
                  </button>
                )}
                {b.status === "Completed" && (
                  <span style={{fontSize: '13px', color: 'var(--admin-muted)'}}>✓ Done</span>
                )}
              </span>

            </div>
          )) : (
            <div style={{padding: '20px', textAlign: 'center', color: 'var(--admin-muted)'}}>
              No bookings found
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
