import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useVendor } from "../../context/VendorContext";
import { useToast } from "../../context/ToastContext";
import { API_ENDPOINTS } from "../../config/api";

export default function VendorWallet() {
  const navigate = useNavigate();
  const { vendor, loading: vendorLoading } = useVendor();
  const { addToast } = useToast();
  const token = localStorage.getItem('vendorToken');

  const [balance, setBalance] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [withdrawing, setWithdrawing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bankAccount, setBankAccount] = useState({
    holderName: vendor?.businessName || "Vendor",
    bank: "Bank Account",
    lastFour: "****",
    ifsc: "****0001"
  });

  // Fetch wallet data on mount
  useEffect(() => {
    if (token) {
      fetchWalletData();
      fetchTransactions();
    }
  }, [token]);

  async function fetchWalletData() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_ENDPOINTS.VENDOR.GET_WALLET_BALANCE, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wallet data');
      }

      const data = await response.json();
      setBalance(data.balance || 0);
      setTotalEarnings(data.totalEarnings || 0);
      setTotalWithdrawn(data.totalWithdrawn || 0);
    } catch (err) {
      console.error('Error fetching wallet:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTransactions() {
    try {
      const response = await fetch(API_ENDPOINTS.VENDOR.GET_TRANSACTIONS, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      setTransactions(Array.isArray(data) ? data : data.transactions || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      // Don't set error for transactions, it's not critical
    }
  }

  function validateWithdrawal() {
    const value = Number(amount);
    if (!amount || !value) {
      setError("Please enter an amount");
      return false;
    }
    if (value <= 0) {
      setError("Amount must be greater than zero");
      return false;
    }
    if (value > balance) {
      setError(`Insufficient balance. Available: ₹${balance.toLocaleString()}`);
      return false;
    }
    if (value < 100) {
      setError("Minimum withdrawal amount is ₹100");
      return false;
    }
    setError("");
    return true;
  }

  async function confirmWithdraw() {
    if (!validateWithdrawal()) return;

    setWithdrawing(true);
    
    try {
      const value = Number(amount);
      const response = await fetch(API_ENDPOINTS.VENDOR.REQUEST_WITHDRAWAL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: value })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Withdrawal request failed');
      }

      const data = await response.json();
      setBalance(data.newBalance);
      setAmount("");
      setError("");
      setShowWithdraw(false);
      
      await fetchTransactions();
      addToast("Withdrawal request submitted successfully! Funds will be credited in 1-2 business days.", "success");
    } catch (err) {
      console.error('Error processing withdrawal:', err);
      setError(err.message);
      addToast(err.message, "error");
    } finally {
      setWithdrawing(false);
    }
  }

  const filteredTxns = filter === "All" ? transactions : transactions.filter(t => t.type === filter);
  const recentTransactions = filteredTxns.slice(0, 5);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div>
      <div className="vendor-page-head">
        <h2>Wallet Management</h2>
        <p>Manage your balance, withdrawals, and bank account</p>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          Error: {error}
        </div>
      )}

      {/* Main Balance Card */}
      <div className="vendor-section" style={{
        background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
        color: "white",
        padding: "28px",
        marginBottom: "24px",
        borderRadius: "12px"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          gap: "20px",
          flexWrap: "wrap"
        }}>
          <div>
            <p style={{ margin: "0 0 8px 0", fontSize: "13px", opacity: "0.9", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Available Balance
            </p>
            <h1 style={{ margin: "0 0 8px 0", fontSize: "48px", fontWeight: "800" }}>
              ₹{loading ? "-" : balance.toLocaleString()}
            </h1>
            <p style={{ margin: "0", fontSize: "13px", opacity: "0.8" }}>
              Ready to withdraw
            </p>
          </div>
          <button
            className="vendor-btn"
            onClick={() => setShowWithdraw(true)}
            disabled={loading || balance === 0}
            style={{
              background: "white",
              color: "#2563eb",
              padding: "12px 28px",
              fontWeight: "700",
              fontSize: "15px",
              border: "none",
              borderRadius: "8px",
              cursor: loading || balance === 0 ? "not-allowed" : "pointer",
              opacity: loading || balance === 0 ? 0.6 : 1
            }}
          >
            💰 Withdraw Money
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="vendor-grid-2" style={{ marginBottom: "24px", gap: "16px" }}>
        <div className="vendor-section" style={{ background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)", color: "white", padding: "20px" }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "13px", opacity: "0.9", fontWeight: "600" }}>Total Earnings</p>
          <h3 style={{ margin: "0", fontSize: "28px", fontWeight: "700" }}>₹{loading ? "-" : totalEarnings.toLocaleString()}</h3>
        </div>

        <div className="vendor-section" style={{ background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)", color: "white", padding: "20px" }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "13px", opacity: "0.9", fontWeight: "600" }}>Total Withdrawn</p>
          <h3 style={{ margin: "0", fontSize: "28px", fontWeight: "700" }}>₹{loading ? "-" : totalWithdrawn.toLocaleString()}</h3>
        </div>
      </div>

      {/* Bank Account & Features Grid */}
      <div className="vendor-grid-2" style={{ marginBottom: "24px", gap: "16px" }}>
        {/* Bank Account Card */}
        <div className="vendor-section">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <span style={{ fontSize: "28px" }}>🏦</span>
            <h3 style={{ margin: "0", fontSize: "18px", fontWeight: "700" }}>Linked Bank Account</h3>
          </div>

          <div style={{ background: "#f9fafb", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
            <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>Account Holder</p>
            <p style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "700", color: "#111827" }}>{bankAccount.holderName}</p>

            <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>Bank Details</p>
            <p style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#374151" }}>
              {bankAccount.bank}
            </p>
            <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#374151", fontFamily: "monospace", letterSpacing: "2px" }}>
              ••••••••••••{bankAccount.lastFour}
            </p>

            <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>IFSC Code</p>
            <p style={{ margin: "0", fontSize: "14px", color: "#374151", fontFamily: "monospace" }}>{bankAccount.ifsc}</p>
          </div>

          <button
            className="vendor-btn outline full"
            style={{ cursor: "pointer" }}
          >
            🔄 Change Bank Account
          </button>
        </div>

        {/* Quick Stats */}
        <div className="vendor-section">
          <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "700" }}>Quick Stats</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{
              padding: "12px",
              background: "#f0fdf4",
              borderRadius: "8px",
              borderLeft: "3px solid #16a34a"
            }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Total Transactions</p>
              <p style={{ margin: "0", fontSize: "20px", fontWeight: "700", color: "#16a34a" }}>{transactions.length}</p>
            </div>

            <div style={{
              padding: "12px",
              background: "#fef2f2",
              borderRadius: "8px",
              borderLeft: "3px solid #dc2626"
            }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Pending Withdrawals</p>
              <p style={{ margin: "0", fontSize: "20px", fontWeight: "700", color: "#dc2626" }}>
                {transactions.filter(t => t.type === "Debit" && t.status === "Processing").length}
              </p>
            </div>

            <div style={{
              padding: "12px",
              background: "#eff6ff",
              borderRadius: "8px",
              borderLeft: "3px solid #2563eb"
            }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>This Month Earned</p>
              <p style={{ margin: "0", fontSize: "20px", fontWeight: "700", color: "#2563eb" }}>
                ₹{transactions.filter(t => t.type === "Credit").slice(0, 3).reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="vendor-section">
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "12px"
        }}>
          <h3 style={{ margin: "0", fontSize: "18px", fontWeight: "700" }}>Recent Transactions</h3>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {["All", "Credit", "Debit"].map(f => (
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

        {filteredTxns.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "40px 20px",
            background: "#f9fafb",
            borderRadius: "8px"
          }}>
            <p style={{ fontSize: "16px", fontWeight: "600", color: "#374151", margin: "0 0 8px 0" }}>
              📭 No {filter.toLowerCase()} transactions
            </p>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: "0" }}>
              {filter === "All" 
                ? "No transactions yet" 
                : `No ${filter.toLowerCase()} transactions found`}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentTransactions.map(t => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px",
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  borderLeft: `4px solid ${t.type === "Credit" ? "#16a34a" : "#dc2626"}`,
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "700", color: "#111827" }}>
                    {t.note}
                  </p>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <p style={{ margin: "0", fontSize: "12px", color: "#6b7280" }}>
                      {formatDate(t.date)}
                    </p>
                    <span style={{
                      display: "inline-block",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: "600",
                      backgroundColor: t.status === "Success" ? "#dcfce7" : "#fef3c7",
                      color: t.status === "Success" ? "#15803d" : "#92400e"
                    }}>
                      {t.status}
                    </span>
                  </div>
                </div>
                <span style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: t.type === "Credit" ? "#16a34a" : "#dc2626",
                  whiteSpace: "nowrap"
                }}>
                  {t.type === "Credit" ? "+" : "-"}₹{t.amount.toLocaleString()}
                </span>
              </div>
            ))}

            {filteredTxns.length > 5 && (
              <button
                className="vendor-btn outline full"
                onClick={() => navigate("/vendor/transactions")}
                style={{ marginTop: "12px", cursor: "pointer" }}
              >
                📊 View All Transactions →
              </button>
            )}
          </div>
        )}
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
          onClick={() => navigate("/vendor/earnings")}
          style={{ cursor: "pointer" }}
        >
          💰 Earnings
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

      {/* Withdrawal Modal */}
      {showWithdraw && (
        <div
          className="vendor-modal-backdrop"
          onClick={() => {
            setShowWithdraw(false);
            setError("");
            setAmount("");
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100
          }}
        >
          <div
            className="vendor-modal"
            onClick={e => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "28px",
              maxWidth: "420px",
              width: "90%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: "700", color: "#111827" }}>
              Withdraw Money
            </h3>
            <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "#6b7280" }}>
              Transfer funds from your wallet to your bank account
            </p>

            <div style={{ background: "#f0fdf4", padding: "12px", borderRadius: "8px", marginBottom: "16px", borderLeft: "3px solid #16a34a" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Available Balance</p>
              <p style={{ margin: "0", fontSize: "18px", fontWeight: "700", color: "#16a34a" }}>
                ₹{balance.toLocaleString()}
              </p>
            </div>

            <div className="vendor-form-group" style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#111827" }}>
                Withdrawal Amount
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontWeight: "700", color: "#6b7280" }}>₹</span>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={e => {
                    setAmount(e.target.value);
                    setError("");
                  }}
                  disabled={withdrawing}
                  style={{
                    width: "100%",
                    padding: "12px 12px 12px 32px",
                    border: error ? "2px solid #dc2626" : "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    background: error ? "#fee2e2" : "white"
                  }}
                />
              </div>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6b7280" }}>
                Minimum: ₹100 | Maximum: ₹{balance.toLocaleString()}
              </p>
            </div>

            {error && (
              <div style={{
                padding: "12px",
                background: "#fee2e2",
                borderRadius: "8px",
                marginBottom: "16px",
                borderLeft: "3px solid #dc2626"
              }}>
                <p style={{ margin: "0", fontSize: "13px", color: "#991b1b", fontWeight: "600" }}>
                  ⚠️ {error}
                </p>
              </div>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                className="vendor-btn outline full"
                onClick={() => {
                  setShowWithdraw(false);
                  setError("");
                  setAmount("");
                }}
                disabled={withdrawing}
                style={{ cursor: "pointer", opacity: withdrawing ? 0.6 : 1 }}
              >
                Cancel
              </button>
              <button
                className="vendor-btn primary full"
                onClick={confirmWithdraw}
                disabled={withdrawing}
                style={{ cursor: "pointer", opacity: withdrawing ? 0.6 : 1 }}
              >
                {withdrawing ? "Processing..." : "Confirm Withdrawal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
