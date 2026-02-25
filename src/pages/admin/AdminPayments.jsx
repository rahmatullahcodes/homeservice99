import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../config/api";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPaymentsByStatus();
    calculateStats();
  }, [payments, filterStatus]);

  async function fetchPayments() {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      
      if (!token) {
        console.warn("No admin token found. Using mock data.");
        setPayments(getMockPayments());
        setError("Not authenticated - using demo data");
        setLoading(false);
        return;
      }

      console.log("Fetching payments from:", API_ENDPOINTS.ADMIN.GET_PAYMENTS);
      const response = await fetch(API_ENDPOINTS.ADMIN.GET_PAYMENTS, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Payments response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setPayments(data.payments || data);
      setError(null);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setPayments(getMockPayments());
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function getMockPayments() {
    return [
      { _id: "1", vendor: { businessName: "AC Experts" }, type: "Credit", amount: 699, source: "Booking TXN001", status: "Success" },
      { _id: "2", vendor: { businessName: "CleanPro" }, type: "Credit", amount: 1999, source: "Booking TXN002", status: "Success" },
      { _id: "3", vendor: { businessName: "Plumb Masters" }, type: "Credit", amount: 2299, source: "Booking TXN003", status: "Pending" },
      { _id: "4", vendor: { businessName: "Beauty Pro" }, type: "Debit", amount: 899, source: "Refund", status: "Failed" },
      { _id: "5", vendor: { businessName: "ElectroTech" }, type: "Credit", amount: 3499, source: "Booking TXN005", status: "Success" }
    ];
  }

  function filterPaymentsByStatus() {
    if (filterStatus === "All") {
      setFilteredPayments(payments);
    } else {
      setFilteredPayments(
        payments.filter(p => p.status === filterStatus)
      );
    }
  }

  function calculateStats() {
    setStats({
      total: payments.length,
      successful: payments.filter(p => p.status === "Success").length,
      pending: payments.filter(p => p.status === "Pending").length,
      failed: payments.filter(p => p.status === "Failed").length,
      totalAmount: payments
        .filter(p => p.status === "Success")
        .reduce((sum, p) => sum + (p.amount || 0), 0)
    });
  }

  async function updateStatus(id, newStatus) {
    try {
      setUpdating(id);
      const token = localStorage.getItem("adminToken");
      
      const response = await fetch(
        API_ENDPOINTS.ADMIN.UPDATE_PAYMENT_STATUS(id),
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
        throw new Error("Failed to update payment status");
      }

      const result = await response.json();
      
      // Update local state
      setPayments(
        payments.map(p =>
          p._id === id ? result.payment : p
        )
      );
      
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error updating payment status:", err);
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div style={{ padding: "40px", textAlign: "center" }}>
          <p>Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">

      {/* PAGE HEADER */}
      <div className="admin-page-head">
        <h2>Payments Management</h2>
        <p className="admin-subtitle">
          Track and manage all user payments
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
          <span>Total Transactions</span>
          <h3>{stats.total}</h3>
          <small className="neutral">All time</small>
        </div>
        <div className="kpi-card">
          <span>Successful</span>
          <h3>{stats.successful}</h3>
          <small className="positive">{stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0}% success rate</small>
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
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['All', 'Success', 'Pending', 'Failed'].map(status => (
            <button
              key={status}
              className={`btn-sm ${filterStatus === status ? '' : 'outline'}`}
              onClick={() => setFilterStatus(status)}
              style={{ cursor: 'pointer' }}
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
            <span>Vendor</span>
            <span>Type</span>
            <span>Amount</span>
            <span>Source</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {filteredPayments.length > 0 ? filteredPayments.map(p => (
            <div className="table-row" key={p._id}>

              <span style={{ fontWeight: '600', color: 'var(--admin-primary)' }}>{p._id?.slice(-6) || 'N/A'}</span>
              <span>{p.vendor?.businessName || 'N/A'}</span>
              <span>
                <span className={`tag ${p.type === "Credit" ? "success" : "pending"}`}>
                  {p.type}
                </span>
              </span>
              <span style={{ fontWeight: '600' }}>₹{p.amount?.toLocaleString() || '0'}</span>
              <span style={{ fontSize: '13px', color: 'var(--admin-muted)' }}>{p.source || 'System'}</span>

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
                      onClick={() => updateStatus(p._id, "Success")}
                      disabled={updating === p._id}
                      style={{ marginRight: '6px' }}
                    >
                      {updating === p._id ? 'Verifying...' : 'Verify'}
                    </button>
                    <button
                      className="btn-sm danger"
                      onClick={() => updateStatus(p._id, "Failed")}
                      disabled={updating === p._id}
                    >
                      Reject
                    </button>
                  </>
                )}
                {p.status === "Failed" && (
                  <button
                    className="btn-sm"
                    onClick={() => updateStatus(p._id, "Success")}
                    disabled={updating === p._id}
                  >
                    {updating === p._id ? 'Retrying...' : 'Retry'}
                  </button>
                )}
                {p.status === "Success" && (
                  <span style={{ fontSize: '13px', color: 'var(--admin-muted)' }}>✓ Verified</span>
                )}
              </span>

            </div>
          )) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--admin-muted)' }}>
              No payments found
            </div>
          )}

        </div>
      </div>

    </div>
  );
}