import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API_ENDPOINTS } from "../../config/api";

function getAmount(item) {
  const value = Number(item?.amount ?? 0);
  return Number.isFinite(value) ? value : 0;
}

export default function AdminWallet() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWalletData();
  }, []);

  async function fetchWalletData() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");
      if (!token) {
        setPayments([]);
        setError("Admin authentication required. Please login first.");
        return;
      }

      const response = await fetch(`${API_ENDPOINTS.ADMIN.GET_PAYMENTS}?limit=200&page=1`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || `Failed to load wallet data (${response.status})`);
      }

      setPayments(Array.isArray(payload?.payments) ? payload.payments : []);
    } catch (err) {
      setError(err.message || "Failed to load wallet data");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }

  const summary = useMemo(() => {
    const successful = payments.filter((p) => p.status === "Success");
    const pending = payments.filter((p) => p.status === "Pending");

    const creditSuccess = successful
      .filter((p) => p.type === "Credit")
      .reduce((sum, p) => sum + getAmount(p), 0);
    const debitSuccess = successful
      .filter((p) => p.type === "Debit")
      .reduce((sum, p) => sum + getAmount(p), 0);

    const vendorPayable = pending
      .filter((p) => p.type === "Credit")
      .reduce((sum, p) => sum + getAmount(p), 0);

    const refundsPending = pending
      .filter((p) => p.type === "Debit" || /refund/i.test(String(p.source || "")))
      .reduce((sum, p) => sum + getAmount(p), 0);

    return {
      platformBalance: creditSuccess - debitSuccess,
      vendorPayable,
      refundsPending
    };
  }, [payments]);

  return (
    <div className="admin-page">
      <h2>Wallet</h2>
      <p className="admin-subtitle">Platform-level wallet & settlement overview</p>

      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #fecaca", color: "#b91c1c", padding: "12px 14px", borderRadius: "8px", marginBottom: "20px" }}>
          {error}
          <button className="btn-sm outline" style={{ marginLeft: "12px" }} onClick={fetchWalletData}>
            Retry
          </button>
        </div>
      )}

      <div className="admin-kpi-grid">
        <div className="kpi-card">
          <span>Platform Balance</span>
          <h3>Rs {summary.platformBalance.toLocaleString()}</h3>
          <small className="positive">Success credits - debits</small>
        </div>
        <div className="kpi-card">
          <span>Vendor Payable</span>
          <h3>Rs {summary.vendorPayable.toLocaleString()}</h3>
          <small className="neutral">Pending credit payouts</small>
        </div>
        <div className="kpi-card">
          <span>Refunds on Hold</span>
          <h3>Rs {summary.refundsPending.toLocaleString()}</h3>
          <small className="danger">Pending debit/refund records</small>
        </div>
      </div>

      <div className="admin-section">
        <h3>Recent Wallet Transactions</h3>
        <div className="admin-table card-mobile">
          <div className="table-row head">
            <span>Type</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Reference</span>
          </div>

          {loading ? (
            <div style={{ padding: "16px", textAlign: "center", color: "#6b7280" }}>Loading transactions...</div>
          ) : payments.length === 0 ? (
            <div style={{ padding: "16px", textAlign: "center", color: "#6b7280" }}>No wallet transactions found</div>
          ) : (
            payments.slice(0, 12).map((txn) => (
              <div className="table-row" key={txn._id}>
                <span data-label="Type">{txn.type || "N/A"}</span>
                <span data-label="Amount" className={txn.type === "Credit" ? "positive" : "danger"}>
                  {txn.type === "Credit" ? "+" : "-"}Rs {Math.abs(getAmount(txn)).toLocaleString()}
                </span>
                <span data-label="Status">
                  <span className={`tag ${
                    txn.status === "Success" ? "success" : txn.status === "Pending" ? "pending" : "danger"
                  }`}>
                    {txn.status || "N/A"}
                  </span>
                </span>
                <span data-label="Reference">{txn.source || "System"}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="admin-section">
        <h3>Actions</h3>
        <div className="quick-actions">
          <Link className="btn-outline" to="/admin/payments">Review Payments</Link>
          <Link className="btn-outline" to="/admin/payments">Manual Vendor Credit</Link>
          <button className="btn-outline" onClick={fetchWalletData}>Refresh Ledger</button>
        </div>
      </div>
    </div>
  );
}
