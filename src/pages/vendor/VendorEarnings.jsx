import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useVendor } from "../../context/VendorContext";
import { useToast } from "../../context/ToastContext";
import { API_ENDPOINTS } from "../../config/api";

export default function VendorEarnings() {
  const navigate = useNavigate();
  const { loading: vendorLoading } = useVendor();
  const { addToast } = useToast();
  const token = localStorage.getItem("vendorToken");

  const [period, setPeriod] = useState("month");
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("latest");
  const [processingPayout, setProcessingPayout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    month: 0,
    lastMonth: 0,
    lifetime: 0,
    pending: 0,
    periodEarnings: 0,
    completedJobs: 0,
    pendingJobs: 0,
    totalWithdrawn: 0
  });

  useEffect(() => {
    if (!token) return;
    fetchEarnings();
  }, [token, period]);

  useEffect(() => {
    if (!token) return;
    fetchTransactions();
  }, [token]);

  async function fetchEarnings() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_ENDPOINTS.VENDOR.GET_EARNINGS_REPORT}?period=${period}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to load earnings");
      }

      setStats({
        month: Number(data.thisMonthEarnings || 0),
        lastMonth: Number(data.lastMonthEarnings || 0),
        lifetime: Number(data.lifetimeEarnings || data.totalEarnings || 0),
        pending: Number(data.walletBalance || 0),
        periodEarnings: Number(data.earnings || 0),
        completedJobs: Number(data.completedJobs || 0),
        pendingJobs: Number(data.pendingJobs || 0),
        totalWithdrawn: Number(data.totalWithdrawn || 0)
      });
    } catch (err) {
      setError(err.message || "Failed to load earnings");
      addToast(err.message || "Failed to load earnings", "error");
    } finally {
      setLoading(false);
    }
  }

  async function fetchTransactions() {
    try {
      const url = new URL(API_ENDPOINTS.VENDOR.GET_TRANSACTIONS);
      url.searchParams.append("page", "1");
      url.searchParams.append("limit", "100");
      url.searchParams.append("sort", "latest");

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to load transactions");
      }

      const transactions = Array.isArray(data.transactions) ? data.transactions : [];
      setPaymentHistory(transactions);
    } catch (err) {
      addToast(err.message || "Failed to load transactions", "error");
    }
  }

  async function requestPayout() {
    if (stats.pending <= 0) {
      addToast("No wallet balance available for payout", "warning");
      return;
    }

    if (!window.confirm(`Request payout of Rs ${stats.pending.toLocaleString()}?`)) {
      return;
    }

    try {
      setProcessingPayout(true);
      setError("");

      const response = await fetch(API_ENDPOINTS.VENDOR.REQUEST_WITHDRAWAL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ amount: stats.pending })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to request payout");
      }

      addToast("Payout request submitted successfully", "success");
      await Promise.all([fetchEarnings(), fetchTransactions()]);
    } catch (err) {
      setError(err.message || "Failed to request payout");
      addToast(err.message || "Failed to request payout", "error");
    } finally {
      setProcessingPayout(false);
    }
  }

  const formatDate = (dateValue) => (
    new Date(dateValue).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  );

  let filteredPayments = filter === "All" ? paymentHistory : paymentHistory.filter((item) => item.type === filter);

  if (sort === "latest") {
    filteredPayments = [...filteredPayments].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  } else if (sort === "oldest") {
    filteredPayments = [...filteredPayments].sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
  } else if (sort === "high-low") {
    filteredPayments = [...filteredPayments].sort((a, b) => (b.amount || 0) - (a.amount || 0));
  } else if (sort === "low-high") {
    filteredPayments = [...filteredPayments].sort((a, b) => (a.amount || 0) - (b.amount || 0));
  }

  const completedCount = paymentHistory.filter((item) => item.status === "Success").length;
  const pendingCount = paymentHistory.filter((item) => item.status === "Pending").length;
  const monthlyAverage = Math.round(stats.lifetime / 12);
  const nextPayoutDate = new Date();
  nextPayoutDate.setDate(nextPayoutDate.getDate() + 7);

  if (vendorLoading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <div className="vendor-loading-spinner" />
        <p style={{ marginTop: "16px", color: "#6b7280" }}>Loading earnings...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="vendor-page-head">
        <h2>Earnings Management</h2>
        <p>Track your earnings, payments, and manage payouts</p>
      </div>

      {error && (
        <div style={{ marginBottom: "16px", color: "#dc2626", background: "#fee2e2", padding: "12px 16px", borderRadius: "8px" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        {[
          { id: "today", label: "Today" },
          { id: "week", label: "Week" },
          { id: "month", label: "Month" },
          { id: "year", label: "Year" },
          { id: "lifetime", label: "Lifetime" }
        ].map((option) => (
          <button
            key={option.id}
            className={`vendor-btn ${period === option.id ? "primary" : "outline"} small`}
            onClick={() => setPeriod(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px"
        }}
      >
        <div className="vendor-section" style={{ background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)", color: "white", padding: "20px" }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "13px", opacity: "0.9", fontWeight: "600" }}>This Month</p>
          <h3 style={{ margin: "0", fontSize: "28px", fontWeight: "700" }}>Rs {loading ? "-" : stats.month.toLocaleString()}</h3>
          <p style={{ margin: "8px 0 0 0", fontSize: "12px", opacity: "0.85" }}>Last 30 days</p>
        </div>

        <div className="vendor-section" style={{ background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)", color: "white", padding: "20px" }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "13px", opacity: "0.9", fontWeight: "600" }}>Last Month</p>
          <h3 style={{ margin: "0", fontSize: "28px", fontWeight: "700" }}>Rs {loading ? "-" : stats.lastMonth.toLocaleString()}</h3>
          <p style={{ margin: "8px 0 0 0", fontSize: "12px", opacity: "0.85" }}>Previous 30 days</p>
        </div>

        <div className="vendor-section" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", color: "white", padding: "20px" }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "13px", opacity: "0.9", fontWeight: "600" }}>Lifetime Earnings</p>
          <h3 style={{ margin: "0", fontSize: "28px", fontWeight: "700" }}>Rs {loading ? "-" : stats.lifetime.toLocaleString()}</h3>
          <p style={{ margin: "8px 0 0 0", fontSize: "12px", opacity: "0.85" }}>All-time earnings</p>
        </div>

        <div className="vendor-section" style={{ background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)", color: "white", padding: "20px" }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "13px", opacity: "0.9", fontWeight: "600" }}>Wallet Balance</p>
          <h3 style={{ margin: "0", fontSize: "28px", fontWeight: "700" }}>Rs {loading ? "-" : stats.pending.toLocaleString()}</h3>
          <p style={{ margin: "8px 0 0 0", fontSize: "12px", opacity: "0.85" }}>Ready for payout</p>
        </div>
      </div>

      <div className="vendor-grid-2" style={{ marginBottom: "24px", gap: "16px" }}>
        <div className="vendor-section">
          <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "700" }}>Next Payout</h3>

          <div style={{ background: "#f0fdf4", padding: "16px", borderRadius: "8px", marginBottom: "16px", borderLeft: "3px solid #16a34a" }}>
            <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>Amount Ready</p>
            <h2 style={{ margin: "0 0 8px 0", fontSize: "32px", fontWeight: "700", color: "#16a34a" }}>Rs {stats.pending.toLocaleString()}</h2>
            <p style={{ margin: "0", fontSize: "12px", color: "#6b7280" }}>
              Expected: {formatDate(nextPayoutDate)}
            </p>
          </div>

          <button
            className="vendor-btn primary full"
            onClick={requestPayout}
            disabled={processingPayout || stats.pending <= 0}
            style={{ opacity: processingPayout || stats.pending <= 0 ? 0.6 : 1 }}
          >
            {processingPayout ? "Processing..." : "Request Full Payout"}
          </button>
        </div>

        <div className="vendor-section">
          <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "700" }}>Performance Overview</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ padding: "12px", background: "#eff6ff", borderRadius: "8px", borderLeft: "3px solid #2563eb" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Selected Period Earnings</p>
              <p style={{ margin: "0", fontSize: "20px", fontWeight: "700", color: "#2563eb" }}>Rs {stats.periodEarnings.toLocaleString()}</p>
            </div>

            <div style={{ padding: "12px", background: "#f0fdf4", borderRadius: "8px", borderLeft: "3px solid #16a34a" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Completed Jobs</p>
              <p style={{ margin: "0", fontSize: "20px", fontWeight: "700", color: "#16a34a" }}>{stats.completedJobs}</p>
            </div>

            <div style={{ padding: "12px", background: "#fef3c7", borderRadius: "8px", borderLeft: "3px solid #f59e0b" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Average Monthly</p>
              <p style={{ margin: "0", fontSize: "20px", fontWeight: "700", color: "#f59e0b" }}>Rs {monthlyAverage.toLocaleString()}</p>
            </div>

            <div style={{ padding: "12px", background: "#fef2f2", borderRadius: "8px", borderLeft: "3px solid #dc2626" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Pending Jobs</p>
              <p style={{ margin: "0", fontSize: "20px", fontWeight: "700", color: "#dc2626" }}>{stats.pendingJobs}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="vendor-section">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <h3 style={{ margin: "0", fontSize: "18px", fontWeight: "700" }}>Payment History</h3>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {["All", "Credit", "Debit"].map((value) => (
              <button
                key={value}
                className={`vendor-btn ${filter === value ? "primary" : "outline"} small`}
                onClick={() => setFilter(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: "600", marginRight: "8px" }}>Sort by:</label>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "13px",
              fontFamily: "inherit",
              cursor: "pointer",
              background: "white"
            }}
          >
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
            <option value="high-low">Amount (High to Low)</option>
            <option value="low-high">Amount (Low to High)</option>
          </select>
        </div>

        {filteredPayments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", background: "#f9fafb", borderRadius: "8px" }}>
            <p style={{ fontSize: "16px", fontWeight: "600", color: "#374151", margin: "0 0 8px 0" }}>
              No payments found
            </p>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: "0" }}>
              {filter === "All" ? "No payment history yet" : `No ${filter.toLowerCase()} payments`}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredPayments.map((payment) => (
              <div
                key={payment.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px",
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  borderLeft: `4px solid ${payment.type === "Credit" ? "#16a34a" : "#dc2626"}`
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "700", color: "#111827" }}>
                    {payment.description || payment.source || "Transaction"}
                  </p>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <p style={{ margin: "0", fontSize: "12px", color: "#6b7280" }}>
                      {formatDate(payment.date)}
                    </p>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: "600",
                        backgroundColor: payment.status === "Success" ? "#dcfce7" : "#fef3c7",
                        color: payment.status === "Success" ? "#15803d" : "#92400e"
                      }}
                    >
                      {payment.status || "Pending"}
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: payment.type === "Credit" ? "#16a34a" : "#dc2626",
                    whiteSpace: "nowrap"
                  }}
                >
                  {payment.type === "Credit" ? "+" : "-"}Rs {Number(payment.amount || 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          className="vendor-btn outline full"
          onClick={() => navigate("/vendor/transactions")}
          style={{ marginTop: "16px" }}
        >
          View All Transactions
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginTop: "24px" }}>
        <button className="vendor-btn outline" onClick={() => navigate("/vendor/wallet")}>
          Wallet
        </button>
        <button className="vendor-btn outline" onClick={() => navigate("/vendor/transactions")}>
          Transactions
        </button>
        <button className="vendor-btn outline" onClick={() => navigate("/vendor/dashboard")}>
          Dashboard
        </button>
      </div>

      {paymentHistory.length > 0 && (
        <div className="vendor-section" style={{ marginTop: "24px", background: "#f9fafb", padding: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: "0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Total Transactions</p>
              <p style={{ margin: "4px 0 0 0", fontSize: "24px", fontWeight: "700", color: "#1f2937" }}>
                {paymentHistory.length}
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: "0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Successful</p>
              <p style={{ margin: "4px 0 0 0", fontSize: "24px", fontWeight: "700", color: "#16a34a" }}>
                {completedCount}
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: "0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Pending</p>
              <p style={{ margin: "4px 0 0 0", fontSize: "24px", fontWeight: "700", color: "#f59e0b" }}>
                {pendingCount}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
