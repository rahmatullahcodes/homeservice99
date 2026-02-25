import { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AdminCoupons() {

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    code: "",
    type: "Flat",
    value: "",
    expiryDate: "",
    maxUsage: ""
  });
  const { addToast } = useToast();

  // Fetch coupons on component mount
  useEffect(() => {
    fetchCoupons();
  }, []);

  // Fetch all coupons from backend
  async function fetchCoupons() {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      console.log("Token:", token ? "Found" : "Not found");
      console.log("API Base URL:", API_BASE_URL);
      
      if (!token) {
        setError("Admin authentication required. Please login first.");
        setLoading(false);
        return;
      }
      
      console.log("Fetching coupons from:", `${API_BASE_URL}/admin/coupons`);
      
      const response = await fetch(`${API_BASE_URL}/admin/coupons`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("token");
        localStorage.removeItem("adminUser");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response:", errorData);
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Coupons received:", data);
      setCoupons(data);
    } catch (err) {
      const message = err.message || "Failed to load coupons";
      setError(message);
      addToast(message, "error");
      console.error("Fetch error details:", {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
    } finally {
      setLoading(false);
    }
  }

  // Toggle coupon status
  async function toggleStatus(id) {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        addToast("Authentication required", "error");
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/admin/coupons/${id}/toggle`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update coupon status");
      }

      const updatedCoupon = await response.json();
      
      setCoupons(prev =>
        prev.map(c =>
          c._id === id ? updatedCoupon : c
        )
      );

      addToast(updatedCoupon.active ? "Coupon enabled" : "Coupon disabled", "success");
    } catch (err) {
      addToast(err.message, "error");
      console.error("Toggle error:", err);
    }
  }

  // Delete coupon
  async function deleteCoupon(id, code) {
    if (!window.confirm(`Delete coupon ${code}?`)) return;

    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        addToast("Authentication required", "error");
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/admin/coupons/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete coupon");
      }

      setCoupons(prev => prev.filter(c => c._id !== id));
      addToast("Coupon deleted", "success");
    } catch (err) {
      addToast(err.message, "error");
      console.error("Delete error:", err);
    }
  }

  // Create coupon
  async function createCoupon() {
    if (!form.code || !form.value) {
      addToast("Code and value are required", "warning");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        addToast("Authentication required", "error");
        setLoading(false);
        return;
      }
      
      const payload = {
        code: form.code,
        type: form.type,
        value: Number(form.value)
      };

      if (form.expiryDate) {
        payload.expiryDate = form.expiryDate;
      }

      if (form.maxUsage) {
        payload.maxUsage = Number(form.maxUsage);
      }

      const response = await fetch(`${API_BASE_URL}/admin/coupons`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create coupon");
      }

      const newCoupon = await response.json();
      setCoupons(prev => [newCoupon, ...prev]);

      setForm({ code: "", type: "Flat", value: "", expiryDate: "", maxUsage: "" });
      addToast("Coupon created successfully", "success");
    } catch (err) {
      addToast(err.message, "error");
      console.error("Create error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-page">

      <h2>Coupons</h2>
      <p className="admin-subtitle">
        Create and manage discount coupons
      </p>

      {/* DEBUG INFO */}
      <div style={{ 
        backgroundColor: "#f8f9fa", 
        padding: "10px", 
        borderRadius: "4px", 
        marginBottom: "15px", 
        fontSize: "0.85em",
        border: "1px solid #dee2e6"
      }}>
        <strong>Debug Info:</strong>
        <div>API URL: {API_BASE_URL}</div>
        <div>Token: {localStorage.getItem("adminToken") ? "✓ Found" : "✗ Not found"}</div>
        <div>Loading: {loading ? "Yes" : "No"}</div>
      </div>

      {error && <div className="error-message" style={{ color: "red", marginBottom: "15px", padding: "10px", backgroundColor: "#ffe6e6", borderRadius: "4px" }}>{error}</div>}

      {/* CREATE COUPON */}
      <div className="detail-box">
        <h3>Create Coupon</h3>

        <div className="form-row">
          <input
            placeholder="Coupon Code"
            value={form.code}
            onChange={e => setForm({ ...form, code: e.target.value })}
            disabled={loading}
          />

          <select
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
            disabled={loading}
          >
            <option value="Flat">Flat (₹)</option>
            <option value="Percent">Percent (%)</option>
          </select>

          <input
            type="number"
            placeholder="Value"
            value={form.value}
            onChange={e => setForm({ ...form, value: e.target.value })}
            disabled={loading}
          />

          <input
            type="date"
            placeholder="Expiry Date (Optional)"
            value={form.expiryDate}
            onChange={e => setForm({ ...form, expiryDate: e.target.value })}
            disabled={loading}
          />

          <input
            type="number"
            placeholder="Max Usage (Optional)"
            value={form.maxUsage}
            onChange={e => setForm({ ...form, maxUsage: e.target.value })}
            disabled={loading}
          />

          <button className="btn-primary" onClick={createCoupon} disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      {/* COUPON LIST */}
      <div className="admin-section">
        <h3>All Coupons ({coupons.length})</h3>

        {loading && !coupons.length ? (
          <p>Loading coupons...</p>
        ) : coupons.length === 0 ? (
          <p>No coupons created yet</p>
        ) : (
          <div className="admin-table">

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

            {coupons.map(c => (
              <div className="table-row" key={c._id}>
                <span><strong>{c.code}</strong></span>
                <span>{c.type}</span>
                <span>{c.type === "Flat" ? `₹${c.value}` : `${c.value}%`}</span>
                <span>{c.usage}</span>
                <span>{c.maxUsage ? c.maxUsage : "Unlimited"}</span>
                <span>
                  {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : "No expiry"}
                </span>
                <span className={c.active ? "status-success" : "status-pending"}>
                  {c.active ? "Active" : "Inactive"}
                </span>
                <span style={{ display: "flex", gap: "5px" }}>
                  <button
                    className="btn-outline"
                    onClick={() => toggleStatus(c._id)}
                  >
                    {c.active ? "Disable" : "Enable"}
                  </button>
                  <button
                    className="btn-outline"
                    onClick={() => deleteCoupon(c._id, c.code)}
                    style={{ color: "red" }}
                  >
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
