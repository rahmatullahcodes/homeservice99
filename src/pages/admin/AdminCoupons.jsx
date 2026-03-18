import { useEffect, useMemo, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { API_ENDPOINTS } from "../../config/api";

function parseCoupons(payload) {
  if (Array.isArray(payload?.coupons)) return payload.coupons;
  if (Array.isArray(payload)) return payload;
  return [];
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    code: "",
    type: "Flat",
    value: "",
    expiryDate: "",
    maxUsage: ""
  });

  const { addToast } = useToast();

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        throw new Error("Admin authentication required. Please login first.");
      }

      const response = await fetch(API_ENDPOINTS.ADMIN.GET_COUPONS, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || `Failed to load coupons (${response.status})`);
      }

      setCoupons(parseCoupons(payload));
    } catch (requestError) {
      setCoupons([]);
      setError(requestError.message || "Failed to load coupons");
      addToast(requestError.message || "Failed to load coupons", "error");
    } finally {
      setLoading(false);
    }
  }

  async function createCoupon() {
    if (!form.code.trim() || !form.value) {
      addToast("Code and value are required", "warning");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        throw new Error("Admin authentication required. Please login first.");
      }

      const payload = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value)
      };

      if (form.expiryDate) {
        payload.expiryDate = form.expiryDate;
      }
      if (form.maxUsage) {
        payload.maxUsage = Number(form.maxUsage);
      }

      const response = await fetch(API_ENDPOINTS.ADMIN.CREATE_COUPON, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Failed to create coupon");
      }

      setCoupons((prev) => [data, ...prev]);
      setForm({ code: "", type: "Flat", value: "", expiryDate: "", maxUsage: "" });
      addToast("Coupon created successfully", "success");
    } catch (requestError) {
      setError(requestError.message || "Failed to create coupon");
      addToast(requestError.message || "Failed to create coupon", "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(id) {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        throw new Error("Admin authentication required. Please login first.");
      }

      const response = await fetch(API_ENDPOINTS.ADMIN.TOGGLE_COUPON(id), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update coupon");
      }

      setCoupons((prev) => prev.map((coupon) => (coupon._id === id ? data : coupon)));
    } catch (requestError) {
      setError(requestError.message || "Failed to update coupon");
      addToast(requestError.message || "Failed to update coupon", "error");
    }
  }

  async function deleteCoupon(couponId, code) {
    if (!window.confirm(`Delete coupon ${code}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        throw new Error("Admin authentication required. Please login first.");
      }

      const response = await fetch(API_ENDPOINTS.ADMIN.DELETE_COUPON(couponId), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to delete coupon");
      }

      setCoupons((prev) => prev.filter((coupon) => coupon._id !== couponId));
      addToast("Coupon deleted", "success");
    } catch (requestError) {
      setError(requestError.message || "Failed to delete coupon");
      addToast(requestError.message || "Failed to delete coupon", "error");
    }
  }

  const stats = useMemo(() => ({
    total: coupons.length,
    active: coupons.filter((coupon) => coupon.active).length,
    expired: coupons.filter((coupon) => coupon.expiryDate && new Date(coupon.expiryDate) < new Date()).length
  }), [coupons]);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h2>Coupons</h2>
        <p className="admin-subtitle">Create and manage discount coupons</p>
      </div>

      {error && <div className="admin-alert error">{error}</div>}

      <div className="admin-kpi-grid">
        <div className="kpi-card">
          <span>Total Coupons</span>
          <h3>{stats.total}</h3>
          <small className="neutral">All coupon records</small>
        </div>
        <div className="kpi-card">
          <span>Active</span>
          <h3>{stats.active}</h3>
          <small className="positive">Currently available</small>
        </div>
        <div className="kpi-card">
          <span>Expired</span>
          <h3>{stats.expired}</h3>
          <small className="negative">Past expiry date</small>
        </div>
      </div>

      <div className="admin-section detail-box">
        <h3>Create Coupon</h3>
        <div className="form-row">
          <input
            placeholder="Coupon Code"
            value={form.code}
            onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
            disabled={saving}
          />
          <select
            value={form.type}
            onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
            disabled={saving}
          >
            <option value="Flat">Flat (Rs)</option>
            <option value="Percent">Percent (%)</option>
          </select>
          <input
            type="number"
            placeholder="Value"
            value={form.value}
            onChange={(event) => setForm((prev) => ({ ...prev, value: event.target.value }))}
            disabled={saving}
          />
          <input
            type="date"
            value={form.expiryDate}
            onChange={(event) => setForm((prev) => ({ ...prev, expiryDate: event.target.value }))}
            disabled={saving}
          />
          <input
            type="number"
            placeholder="Max Usage (Optional)"
            value={form.maxUsage}
            onChange={(event) => setForm((prev) => ({ ...prev, maxUsage: event.target.value }))}
            disabled={saving}
          />
          <button className="btn-primary" onClick={createCoupon} disabled={saving}>
            {saving ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      <div className="admin-section">
        <h3>All Coupons ({coupons.length})</h3>
        {loading ? (
          <div className="admin-loading">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="admin-empty"><p>No coupons created yet</p></div>
        ) : (
          <div className="admin-table card-mobile">
            <div className="table-row head">
              <span>Code</span>
              <span>Type</span>
              <span>Value</span>
              <span>Usage</span>
              <span>Max Usage</span>
              <span>Expiry</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            {coupons.map((coupon) => (
              <div className="table-row" key={coupon._id}>
                <span data-label="Code"><strong>{coupon.code}</strong></span>
                <span data-label="Type">{coupon.type}</span>
                <span data-label="Value">
                  {coupon.type === "Flat" ? `Rs ${coupon.value}` : `${coupon.value}%`}
                </span>
                <span data-label="Usage">{coupon.usage}</span>
                <span data-label="Max Usage">{coupon.maxUsage || "Unlimited"}</span>
                <span data-label="Expiry">
                  {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : "No expiry"}
                </span>
                <span data-label="Status">
                  <span className={`tag ${coupon.active ? "success" : "pending"}`}>
                    {coupon.active ? "Active" : "Inactive"}
                  </span>
                </span>
                <span data-label="Action" style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <button className="btn-outline" onClick={() => toggleStatus(coupon._id)}>
                    {coupon.active ? "Disable" : "Enable"}
                  </button>
                  <button className="btn-outline" onClick={() => deleteCoupon(coupon._id, coupon.code)} style={{ color: "red" }}>
                    Delete
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
