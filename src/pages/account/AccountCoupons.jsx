import { useEffect, useMemo, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { fetchUserCoupons } from "../../utils/accountApi";
import "../../styles/account.css";

export default function AccountCoupons() {
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState([]);
  const [copiedId, setCopiedId] = useState("");
  const [filter, setFilter] = useState("Active");

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    try {
      setLoading(true);
      const data = await fetchUserCoupons();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err) {
      addToast(err.message || "Failed to load coupons", "error");
    } finally {
      setLoading(false);
    }
  }

  const filteredCoupons = useMemo(
    () => coupons.filter((coupon) => (filter === "Active" ? coupon.isUsable : !coupon.isUsable)),
    [coupons, filter]
  );

  const activeCoupons = useMemo(
    () => coupons.filter((coupon) => coupon.isUsable),
    [coupons]
  );

  const totalValue = useMemo(
    () => activeCoupons.reduce((sum, coupon) => sum + Number(coupon.value || 0), 0),
    [activeCoupons]
  );

  async function copyCode(code, id) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      addToast("Coupon code copied", "success");
      setTimeout(() => setCopiedId(""), 2000);
    } catch {
      addToast("Failed to copy", "error");
    }
  }

  function formatExpiry(dateValue) {
    if (!dateValue) return "No expiry";
    return new Date(dateValue).toLocaleDateString();
  }

  return (
    <div className="dashboard-wrapper">
      <h2 className="dashboard-title">My Coupons</h2>
      <p className="dashboard-subtitle">Use promo codes to get discounts</p>

      <div className="dashboard-grid" style={{ marginBottom: "32px" }}>
        <div className="dash-card blue">
          <div className="dash-icon">AC</div>
          <div>
            <p className="dash-label">Active Coupons</p>
            <h3>{activeCoupons.length}</h3>
            <span className="dash-trend">Available to use</span>
          </div>
        </div>

        <div className="dash-card green">
          <div className="dash-icon">TV</div>
          <div>
            <p className="dash-label">Total Value</p>
            <h3>Rs {totalValue}</h3>
            <span className="dash-trend">Combined discount</span>
          </div>
        </div>

        <div className="dash-card purple">
          <div className="dash-icon">EX</div>
          <div>
            <p className="dash-label">Expired</p>
            <h3>{coupons.length - activeCoupons.length}</h3>
            <span className="dash-trend">No longer valid</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "20px", display: "flex", gap: "8px" }}>
        {["Active", "Expired"].map((status) => (
          <button
            key={status}
            className={`account-btn ${filter === status ? "primary" : "secondary"}`}
            onClick={() => setFilter(status)}
          >
            {status} ({status === "Active" ? activeCoupons.length : coupons.length - activeCoupons.length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="account-alert info">Loading coupons...</div>
      ) : (
        <div className="account-grid-2">
          {filteredCoupons.map((coupon) => (
            <div key={coupon._id} className="account-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280" }}>Promo Code</p>
                  <h3 style={{ margin: 0, fontFamily: "monospace", fontSize: "18px" }}>{coupon.code}</h3>
                </div>
                <span className={`account-badge ${coupon.isUsable ? "green" : "red"}`}>
                  {coupon.isUsable ? "Active" : "Expired"}
                </span>
              </div>

              <p style={{ margin: "8px 0", color: "#6b7280", fontSize: "14px" }}>
                {coupon.description || "Discount coupon"}
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "12px 0", padding: "12px 0", borderTop: "1px solid var(--account-border)", borderBottom: "1px solid var(--account-border)" }}>
                <span style={{ fontWeight: 600, color: "var(--account-success)", fontSize: "16px" }}>
                  {coupon.type === "Percent" ? `${coupon.value}% Off` : `Rs ${coupon.value} Off`}
                </span>
                <small style={{ color: "#6b7280" }}>Expires: {formatExpiry(coupon.expiryDate)}</small>
              </div>

              {coupon.isUsable ? (
                <button
                  className="account-btn primary"
                  style={{ width: "100%", transition: "all 0.3s ease" }}
                  onClick={() => copyCode(coupon.code, coupon._id)}
                >
                  {copiedId === coupon._id ? "✓ Copied" : "Copy Code"}
                </button>
              ) : (
                <button className="account-btn secondary" style={{ width: "100%" }} disabled>
                  Expired
                </button>
              )}
            </div>
          ))}

          {filteredCoupons.length === 0 && (
            <div className="account-alert info" style={{ textAlign: "center", marginTop: "8px" }}>
              No {filter.toLowerCase()} coupons available
            </div>
          )}
        </div>
      )}
    </div>
  );
}
