import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useVendor } from "../../context/VendorContext";
import { useToast } from "../../context/ToastContext";

export default function VendorEarnings() {
  const navigate = useNavigate();
  const { vendor, loading: vendorLoading } = useVendor();
  const { addToast } = useToast();
  
  const [period, setPeriod] = useState("month");
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("latest");
  const [processingPayout, setProcessingPayout] = useState(false);
  const [stats, setStats] = useState({
    month: 8200,
    lastMonth: 7400,
    lifetime: 45600,
    pending: 1200
  });

  useEffect(() => {
    const storedHistory = localStorage.getItem("vendorPaymentHistory");
    if (storedHistory) {
      setPaymentHistory(JSON.parse(storedHistory));
    } else {
      const demoPayments = [
        {
          id: 1,
          customer: "Rahul Sharma",
          service: "AC Repair",
          amount: 699,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          status: "Completed",
          orderId: "ORD-001"
        },
        {
          id: 2,
          customer: "Priya Verma",
          service: "Home Cleaning",
          amount: 1299,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: "Completed",
          orderId: "ORD-002"
        },
        {
          id: 3,
          customer: "Amit Singh",
          service: "Plumbing",
          amount: 499,
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          status: "Completed",
          orderId: "ORD-003"
        },
        {
          id: 4,
          customer: "Neha Patel",
          service: "Electrical",
          amount: 1999,
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          status: "Pending",
          orderId: "ORD-004"
        },
        {
          id: 5,
          customer: "Vikram Das",
          service: "Car Wash",
          amount: 299,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          status: "Completed",
          orderId: "ORD-005"
        },
        {
          id: 6,
          customer: "Sneha Roy",
          service: "Gardening",
          amount: 899,
          date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          status: "Pending",
          orderId: "ORD-006"
        }
      ];
      setPaymentHistory(demoPayments);
      localStorage.setItem("vendorPaymentHistory", JSON.stringify(demoPayments));
    }
  }, []);

  async function requestPayout() {
    setProcessingPayout(true);
    
    // Simulate API call
    setTimeout(() => {
      setProcessingPayout(false);
      addToast("Payout request submitted! Amount will be credited in 2-3 business days.", "success");
    }, 1500);
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter and sort logic
  let filteredPayments = filter === "All" ? paymentHistory : paymentHistory.filter(p => p.status === filter);
  
  if (sort === "latest") {
    filteredPayments = [...filteredPayments].sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sort === "oldest") {
    filteredPayments = [...filteredPayments].sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (sort === "high-low") {
    filteredPayments = [...filteredPayments].sort((a, b) => b.amount - a.amount);
  } else if (sort === "low-high") {
    filteredPayments = [...filteredPayments].sort((a, b) => a.amount - b.amount);
  }

  const completedCount = paymentHistory.filter(p => p.status === "Completed").length;
  const pendingCount = paymentHistory.filter(p => p.status === "Pending").length;
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

      {/* Period Selector */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        {["today", "week", "month", "lifetime"].map(p => (
          <button 
            key={p} 
            className={`vendor-btn ${period === p ? "primary" : "outline"} small`} 
            onClick={() => setPeriod(p)}
            style={{ cursor: "pointer" }}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Professional Gradient Stat Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "24px"
      }}>
        <div className="vendor-section" style={{ background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)", color: "white", padding: "20px" }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "13px", opacity: "0.9", fontWeight: "600" }}>This Month</p>
          <h3 style={{ margin: "0", fontSize: "28px", fontWeight: "700" }}>₹{stats.month.toLocaleString()}</h3>
          <p style={{ margin: "8px 0 0 0", fontSize: "12px", opacity: "0.85" }}>+5% from last month</p>
        </div>

        <div className="vendor-section" style={{ background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)", color: "white", padding: "20px" }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "13px", opacity: "0.9", fontWeight: "600" }}>Last Month</p>
          <h3 style={{ margin: "0", fontSize: "28px", fontWeight: "700" }}>₹{stats.lastMonth.toLocaleString()}</h3>
          <p style={{ margin: "8px 0 0 0", fontSize: "12px", opacity: "0.85" }}>Previous period earnings</p>
        </div>

        <div className="vendor-section" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", color: "white", padding: "20px" }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "13px", opacity: "0.9", fontWeight: "600" }}>Lifetime Earnings</p>
          <h3 style={{ margin: "0", fontSize: "28px", fontWeight: "700" }}>₹{stats.lifetime.toLocaleString()}</h3>
          <p style={{ margin: "8px 0 0 0", fontSize: "12px", opacity: "0.85" }}>All-time total earnings</p>
        </div>

        <div className="vendor-section" style={{ background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)", color: "white", padding: "20px" }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "13px", opacity: "0.9", fontWeight: "600" }}>Pending Payout</p>
          <h3 style={{ margin: "0", fontSize: "28px", fontWeight: "700" }}>₹{stats.pending.toLocaleString()}</h3>
          <p style={{ margin: "8px 0 0 0", fontSize: "12px", opacity: "0.85" }}>Ready for withdrawal</p>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="vendor-grid-2" style={{ marginBottom: "24px", gap: "16px" }}>
        {/* Payout Card */}
        <div className="vendor-section">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <span style={{ fontSize: "28px" }}>💰</span>
            <h3 style={{ margin: "0", fontSize: "18px", fontWeight: "700" }}>Next Payout</h3>
          </div>

          <div style={{ background: "#f0fdf4", padding: "16px", borderRadius: "8px", marginBottom: "16px", borderLeft: "3px solid #16a34a" }}>
            <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>Amount Ready</p>
            <h2 style={{ margin: "0 0 8px 0", fontSize: "32px", fontWeight: "700", color: "#16a34a" }}>₹{stats.pending.toLocaleString()}</h2>
            <p style={{ margin: "0", fontSize: "12px", color: "#6b7280" }}>
              Expected: {formatDate(nextPayoutDate)}
            </p>
          </div>

          <button
            className="vendor-btn primary full"
            onClick={requestPayout}
            disabled={processingPayout}
            style={{ cursor: "pointer", opacity: processingPayout ? 0.6 : 1 }}
          >
            {processingPayout ? "Processing..." : "💳 Request Payout"}
          </button>
        </div>

        {/* Stats Overview */}
        <div className="vendor-section">
          <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "700" }}>Performance Overview</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{
              padding: "12px",
              background: "#eff6ff",
              borderRadius: "8px",
              borderLeft: "3px solid #2563eb"
            }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Total Transactions</p>
              <p style={{ margin: "0", fontSize: "20px", fontWeight: "700", color: "#2563eb" }}>{paymentHistory.length}</p>
            </div>

            <div style={{
              padding: "12px",
              background: "#f0fdf4",
              borderRadius: "8px",
              borderLeft: "3px solid #16a34a"
            }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Completed Jobs</p>
              <p style={{ margin: "0", fontSize: "20px", fontWeight: "700", color: "#16a34a" }}>{completedCount}</p>
            </div>

            <div style={{
              padding: "12px",
              background: "#fef3c7",
              borderRadius: "8px",
              borderLeft: "3px solid #f59e0b"
            }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Average Monthly</p>
              <p style={{ margin: "0", fontSize: "20px", fontWeight: "700", color: "#f59e0b" }}>₹{monthlyAverage.toLocaleString()}</p>
            </div>

            <div style={{
              padding: "12px",
              background: "#fef2f2",
              borderRadius: "8px",
              borderLeft: "3px solid #dc2626"
            }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Pending Jobs</p>
              <p style={{ margin: "0", fontSize: "20px", fontWeight: "700", color: "#dc2626" }}>{pendingCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="vendor-section">
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "12px"
        }}>
          <h3 style={{ margin: "0", fontSize: "18px", fontWeight: "700" }}>Payment History</h3>
          
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {["All", "Completed", "Pending"].map(f => (
              <button
                key={f}
                className={`vendor-btn ${filter === f ? "primary" : "outline"} small`}
                onClick={() => setFilter(f)}
                style={{ cursor: "pointer" }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: "600", marginRight: "8px" }}>Sort by:</label>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
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

        {/* Payment Cards/Table */}
        {filteredPayments.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "40px 20px",
            background: "#f9fafb",
            borderRadius: "8px"
          }}>
            <p style={{ fontSize: "16px", fontWeight: "600", color: "#374151", margin: "0 0 8px 0" }}>
              📭 No payments found
            </p>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: "0" }}>
              {filter === "All" ? "No payment history yet" : `No ${filter.toLowerCase()} payments`}
            </p>
          </div>
        ) : (
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}>
            {filteredPayments.map(p => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px",
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  borderLeft: `4px solid ${p.status === "Completed" ? "#16a34a" : "#f59e0b"}`,
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "700", color: "#111827" }}>
                    {p.customer}
                  </p>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <p style={{ margin: "0", fontSize: "12px", color: "#6b7280" }}>
                      {p.service}
                    </p>
                    <span style={{
                      display: "inline-block",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: "600",
                      backgroundColor: p.status === "Completed" ? "#dcfce7" : "#fef3c7",
                      color: p.status === "Completed" ? "#15803d" : "#92400e"
                    }}>
                      {p.status}
                    </span>
                    <p style={{ margin: "0", fontSize: "11px", color: "#9ca3af" }}>
                      {formatDate(p.date)}
                    </p>
                  </div>
                </div>
                <span style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#16a34a",
                  whiteSpace: "nowrap"
                }}>
                  ₹{p.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          className="vendor-btn outline full"
          onClick={() => navigate("/vendor/transactions")}
          style={{ marginTop: "16px", cursor: "pointer" }}
        >
          📊 View All Transactions →
        </button>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "12px",
        marginTop: "24px"
      }}>
        <button
          className="vendor-btn outline"
          onClick={() => navigate("/vendor/wallet")}
          style={{ cursor: "pointer" }}
        >
          💳 Wallet
        </button>
        <button
          className="vendor-btn outline"
          onClick={() => navigate("/vendor/transactions")}
          style={{ cursor: "pointer" }}
        >
          📊 Transactions
        </button>
        <button
          className="vendor-btn outline"
          onClick={() => navigate("/vendor/dashboard")}
          style={{ cursor: "pointer" }}
        >
          📈 Dashboard
        </button>
      </div>
    </div>
  );
}
