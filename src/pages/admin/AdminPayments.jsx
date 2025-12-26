import { useState } from "react";

export default function AdminPayments() {

  const [payments, setPayments] = useState([
    {
      id: "TXN001",
      user: "Rahul Kumar",
      amount: 699,
      method: "UPI",
      status: "Success",
      date: "2025-02-18",
      service: "AC Repair"
    },
    {
      id: "TXN002",
      user: "Neha Sharma",
      amount: 1999,
      method: "Card",
      status: "Success",
      date: "2025-02-19",
      service: "Cleaning"
    },
    {
      id: "TXN003",
      user: "Ankit Patel",
      amount: 2299,
      method: "UPI",
      status: "Pending",
      date: "2025-02-20",
      service: "Plumbing"
    },
    {
      id: "TXN004",
      user: "Pooja Singh",
      amount: 899,
      method: "Wallet",
      status: "Failed",
      date: "2025-02-21",
      service: "Salon"
    },
    {
      id: "TXN005",
      user: "Vikram Rao",
      amount: 3499,
      method: "Card",
      status: "Success",
      date: "2025-02-22",
      service: "Electrical"
    }
  ]);

  const [filterStatus, setFilterStatus] = useState("All");

  function updateStatus(id, status) {
    setPayments(
      payments.map(p =>
        p.id === id ? { ...p, status } : p
      )
    );
  }

  const filteredPayments = filterStatus === "All" 
    ? payments 
    : payments.filter(p => p.status === filterStatus);

  const stats = {
    total: payments.length,
    successful: payments.filter(p => p.status === "Success").length,
    pending: payments.filter(p => p.status === "Pending").length,
    failed: payments.filter(p => p.status === "Failed").length,
    totalAmount: payments.filter(p => p.status === "Success").reduce((sum, p) => sum + p.amount, 0)
  };

  return (
    <div className="admin-page">

      {/* PAGE HEADER */}
      <div className="admin-page-head">
        <h2>Payments Management</h2>
        <p className="admin-subtitle">
          Track and manage all user payments
        </p>
      </div>

      {/* STATS */}
      <div className="admin-kpi-grid">
        <div className="kpi-card">
          <span>Total Transactions</span>
          <h3>{stats.total}</h3>
          <small className="neutral">This month</small>
        </div>
        <div className="kpi-card">
          <span>Successful</span>
          <h3>{stats.successful}</h3>
          <small className="positive">{Math.round((stats.successful/stats.total)*100)}% success rate</small>
        </div>
        <div className="kpi-card">
          <span>Total Revenue</span>
          <h3>₹{stats.totalAmount.toLocaleString()}</h3>
          <small className="positive">Verified payments</small>
        </div>
        <div className="kpi-card">
          <span>Failed/Pending</span>
          <h3>{stats.pending + stats.failed}</h3>
          <small className="negative">Requires attention</small>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="admin-section">
        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
          {['All', 'Success', 'Pending', 'Failed'].map(status => (
            <button
              key={status}
              className={`btn-sm ${filterStatus === status ? '' : 'outline'}`}
              onClick={() => setFilterStatus(status)}
              style={{cursor: 'pointer'}}
            >
              {status} ({payments.filter(p => status === 'All' ? true : p.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* PAYMENTS TABLE */}
      <div className="admin-section">
        <div className="admin-table">

          {/* TABLE HEADER */}
          <div className="table-row head">
            <span>Transaction ID</span>
            <span>User</span>
            <span>Service</span>
            <span>Amount</span>
            <span>Method</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {filteredPayments.length > 0 ? filteredPayments.map(p => (
            <div className="table-row" key={p.id}>

              <span style={{fontWeight: '600', color: 'var(--admin-primary)'}}>{p.id}</span>
              <span>{p.user}</span>
              <span style={{fontSize: '13px', color: 'var(--admin-muted)'}}>{p.service}</span>
              <span style={{fontWeight: '600'}}>₹{p.amount}</span>
              <span>
                <span className="tag active" style={{background: 'var(--admin-bg)', color: 'var(--admin-text)'}}>
                  {p.method}
                </span>
              </span>

              <span>
                <span className={`tag ${
                  p.status === "Success" ? "success" :
                  p.status === "Pending" ? "pending" : "danger"
                }`}>
                  {p.status}
                </span>
              </span>

              <span>
                {p.status === "Pending" && (
                  <>
                    <button
                      className="btn-sm"
                      onClick={() => updateStatus(p.id, "Success")}
                      style={{marginRight: '6px'}}
                    >
                      Verify
                    </button>
                    <button
                      className="btn-sm danger"
                      onClick={() => updateStatus(p.id, "Failed")}
                    >
                      Reject
                    </button>
                  </>
                )}
                {p.status === "Failed" && (
                  <button
                    className="btn-sm"
                    onClick={() => updateStatus(p.id, "Success")}
                  >
                    Retry
                  </button>
                )}
                {p.status === "Success" && (
                  <span style={{fontSize: '13px', color: 'var(--admin-muted)'}}>✓ Verified</span>
                )}
              </span>

            </div>
          )) : (
            <div style={{padding: '20px', textAlign: 'center', color: 'var(--admin-muted)'}}>
              No payments found
            </div>
          )}

        </div>
      </div>

    </div>
  );
}