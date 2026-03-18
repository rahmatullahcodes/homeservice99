import { useEffect, useMemo, useState } from "react";
import { API_ENDPOINTS } from "../../config/api";

const FILTER_STATUSES = ["All", "Success", "Pending", "Failed"];

function parsePayments(payload) {
  if (Array.isArray(payload?.payments)) return payload.payments;
  if (Array.isArray(payload)) return payload;
  return [];
}

function parseVendors(payload) {
  if (Array.isArray(payload?.vendors)) return payload.vendors;
  if (Array.isArray(payload)) return payload;
  return [];
}

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [showManualModal, setShowManualModal] = useState(false);
  const [addingManualPayment, setAddingManualPayment] = useState(false);
  const [manualPaymentForm, setManualPaymentForm] = useState({
    vendorId: "",
    amount: "",
    note: ""
  });

  useEffect(() => {
    fetchPayments();
    fetchVendors();
  }, []);

  async function fetchPayments() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Admin authentication required. Please login first.");
      }

      const response = await fetch(API_ENDPOINTS.ADMIN.GET_PAYMENTS, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || `Failed to load payments (${response.status})`);
      }

      setPayments(parsePayments(payload));
    } catch (requestError) {
      setPayments([]);
      setError(requestError.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }

  async function fetchVendors() {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        return;
      }

      const response = await fetch(API_ENDPOINTS.ADMIN.GET_VENDORS, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        return;
      }

      const payload = await response.json().catch(() => ({}));
      setVendors(parseVendors(payload));
    } catch (requestError) {
      console.error("Vendor load error:", requestError);
    }
  }

  const filteredPayments = useMemo(() => {
    if (filterStatus === "All") {
      return payments;
    }
    return payments.filter((payment) => payment.status === filterStatus);
  }, [payments, filterStatus]);

  const stats = useMemo(() => {
    const successful = payments.filter((payment) => payment.status === "Success");
    const pending = payments.filter((payment) => payment.status === "Pending");
    const failed = payments.filter((payment) => payment.status === "Failed");

    return {
      total: payments.length,
      successful: successful.length,
      pending: pending.length,
      failed: failed.length,
      totalAmount: successful.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
    };
  }, [payments]);

  async function updateStatus(paymentId, newStatus) {
    try {
      setUpdatingId(paymentId);
      setError("");

      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Admin authentication required. Please login first.");
      }

      const response = await fetch(API_ENDPOINTS.ADMIN.UPDATE_PAYMENT_STATUS(paymentId), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to update payment status");
      }

      const nextPayment = payload?.payment || payload;
      setPayments((prev) => prev.map((payment) => (
        payment._id === paymentId ? nextPayment : payment
      )));
    } catch (requestError) {
      setError(requestError.message || "Failed to update payment status");
    } finally {
      setUpdatingId("");
    }
  }

  async function submitManualPayment() {
    const token = localStorage.getItem("adminToken");
    const amount = Number(manualPaymentForm.amount);

    if (!manualPaymentForm.vendorId) {
      setError("Please select a vendor");
      return;
    }
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setAddingManualPayment(true);
      setError("");

      const response = await fetch(API_ENDPOINTS.ADMIN.MANUAL_VENDOR_PAYMENT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          vendorId: manualPaymentForm.vendorId,
          amount,
          note: manualPaymentForm.note
        })
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to add manual payment");
      }

      setShowManualModal(false);
      setManualPaymentForm({ vendorId: "", amount: "", note: "" });
      await fetchPayments();
    } catch (requestError) {
      setError(requestError.message || "Failed to add manual payment");
    } finally {
      setAddingManualPayment(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div className="admin-page-toolbar">
          <div>
            <h2>Payments Management</h2>
            <p className="admin-subtitle">Track, verify and resolve payment transactions</p>
          </div>
          <button className="btn-sm" onClick={() => setShowManualModal(true)}>
            Add Vendor Payment
          </button>
        </div>
      </div>

      {error && <div className="admin-alert error">{error}</div>}

      <div className="admin-kpi-grid">
        <div className="kpi-card">
          <span>Total Transactions</span>
          <h3>{stats.total}</h3>
          <small className="neutral">All records</small>
        </div>
        <div className="kpi-card">
          <span>Successful</span>
          <h3>{stats.successful}</h3>
          <small className="positive">
            {stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0}% success rate
          </small>
        </div>
        <div className="kpi-card">
          <span>Total Revenue</span>
          <h3>Rs {stats.totalAmount.toLocaleString()}</h3>
          <small className="positive">Verified payments</small>
        </div>
        <div className="kpi-card">
          <span>Failed/Pending</span>
          <h3>{stats.pending + stats.failed}</h3>
          <small className="negative">Needs action</small>
        </div>
      </div>

      <div className="admin-section">
        <div className="quick-actions">
          {FILTER_STATUSES.map((status) => (
            <button
              key={status}
              className={`btn-sm ${filterStatus === status ? "" : "outline"}`}
              onClick={() => setFilterStatus(status)}
            >
              {status} ({payments.filter((payment) => status === "All" ? true : payment.status === status).length})
            </button>
          ))}
        </div>
      </div>

      <div className="admin-section">
        <div className="admin-table card-mobile">
          <div className="table-row head">
            <span>Transaction ID</span>
            <span>Vendor</span>
            <span>Type</span>
            <span>Amount</span>
            <span>Source</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {loading ? (
            <div className="admin-loading">Loading payments...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="admin-empty"><p>No payments found</p></div>
          ) : (
            filteredPayments.map((payment) => (
              <div className="table-row" key={payment._id}>
                <span data-label="Transaction ID" style={{ fontWeight: 600, color: "var(--admin-primary)" }}>
                  {payment._id?.slice(-6) || "N/A"}
                </span>
                <span data-label="Vendor">{payment.vendor?.businessName || "N/A"}</span>
                <span data-label="Type">
                  <span className={`tag ${payment.type === "Credit" ? "success" : "pending"}`}>
                    {payment.type}
                  </span>
                </span>
                <span data-label="Amount" style={{ fontWeight: 600 }}>
                  Rs {Number(payment.amount || 0).toLocaleString()}
                </span>
                <span data-label="Source" style={{ color: "var(--admin-muted)" }}>{payment.source || "System"}</span>
                <span data-label="Status">
                  <span className={`tag ${payment.status === "Success" ? "success" : payment.status === "Pending" ? "pending" : "danger"}`}>
                    {payment.status}
                  </span>
                </span>
                <span data-label="Action">
                  {payment.status === "Pending" && (
                    <>
                      <button
                        className="btn-sm"
                        onClick={() => updateStatus(payment._id, "Success")}
                        disabled={updatingId === payment._id}
                        style={{ marginRight: "6px" }}
                      >
                        {updatingId === payment._id ? "Verifying..." : "Verify"}
                      </button>
                      <button
                        className="btn-sm danger"
                        onClick={() => updateStatus(payment._id, "Failed")}
                        disabled={updatingId === payment._id}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {payment.status === "Failed" && (
                    <button
                      className="btn-sm"
                      onClick={() => updateStatus(payment._id, "Success")}
                      disabled={updatingId === payment._id}
                    >
                      {updatingId === payment._id ? "Retrying..." : "Retry"}
                    </button>
                  )}
                  {payment.status === "Success" && (
                    <span style={{ color: "var(--admin-muted)" }}>Verified</span>
                  )}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {showManualModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            if (!addingManualPayment) {
              setShowManualModal(false);
            }
          }}
        >
          <div className="modal-content" onClick={(event) => event.stopPropagation()} style={{ maxWidth: "520px" }}>
            <div className="modal-header">
              <h3>Add Manual Vendor Payment</h3>
              <button
                className="btn-close"
                onClick={() => setShowManualModal(false)}
                disabled={addingManualPayment}
              >
                x
              </button>
            </div>

            <div className="modal-body">
              <div className="filter-group">
                <label>Vendor</label>
                <select
                  value={manualPaymentForm.vendorId}
                  onChange={(event) => setManualPaymentForm((prev) => ({ ...prev, vendorId: event.target.value }))}
                  disabled={addingManualPayment}
                  className="filter-select"
                >
                  <option value="">Select vendor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.businessName || vendor.name} ({vendor.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group mt-12">
                <label>Amount</label>
                <input
                  type="number"
                  min="1"
                  value={manualPaymentForm.amount}
                  onChange={(event) => setManualPaymentForm((prev) => ({ ...prev, amount: event.target.value }))}
                  disabled={addingManualPayment}
                  placeholder="Enter amount"
                  className="filter-input"
                />
              </div>

              <div className="filter-group mt-12">
                <label>Note (optional)</label>
                <textarea
                  rows={3}
                  value={manualPaymentForm.note}
                  onChange={(event) => setManualPaymentForm((prev) => ({ ...prev, note: event.target.value }))}
                  disabled={addingManualPayment}
                  placeholder="Reason or reference"
                  className="response-textarea"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowManualModal(false)} disabled={addingManualPayment}>
                Cancel
              </button>
              <button className="btn-sm" onClick={submitManualPayment} disabled={addingManualPayment}>
                {addingManualPayment ? "Adding..." : "Add Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
