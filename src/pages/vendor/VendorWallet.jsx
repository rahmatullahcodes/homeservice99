import { useState, useEffect } from "react";

export default function VendorWallet() {
  const [balance, setBalance] = useState(2100);
  const [transactions, setTransactions] = useState([]);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const b = localStorage.getItem("vendorBalance");
    const t = localStorage.getItem("vendorTransactions");
    setBalance(b ? Number(b) : 2100);
    setTransactions(t ? JSON.parse(t) : [
      { id: 1, type: "Credit", note: "Job payment received", amount: 699, date: "15 Aug 2025" },
      { id: 2, type: "Credit", note: "Job payment received", amount: 1299, date: "14 Aug 2025" },
      { id: 3, type: "Debit", note: "Withdrawal to bank", amount: 500, date: "10 Aug 2025" }
    ]);
  }, []);

  function confirmWithdraw() {
    const value = Number(amount);
    if (!value || value <= 0) { setError("Enter valid amount"); return; }
    if (value > balance) { setError("Insufficient balance"); return; }

    const newTxn = { id: Date.now(), type: "Debit", note: "Withdrawal to bank", amount: value, date: new Date().toLocaleDateString() };
    const updatedBalance = balance - value;
    const updatedTxns = [newTxn, ...transactions];

    setBalance(updatedBalance);
    setTransactions(updatedTxns);
    localStorage.setItem("vendorBalance", updatedBalance);
    localStorage.setItem("vendorTransactions", JSON.stringify(updatedTxns));

    setAmount("");
    setError("");
    setShowWithdraw(false);
  }

  const filteredTxns = filter === "All" ? transactions : transactions.filter(t => t.type === filter);

  return (
    <div>
      <div className="vendor-page-head">
        <h2>Wallet</h2>
        <p>Manage your balance and transactions</p>
      </div>

      <div className="vendor-grid-2" style={{ marginBottom: "24px", gap: "16px" }}>
        <div className="vendor-section" style={{ background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)", color: "white", padding: "24px" }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "14px", opacity: "0.9" }}>Available Balance</p>
          <h2 style={{ margin: "0 0 16px 0", fontSize: "32px", fontWeight: "700" }}>₹{balance.toLocaleString()}</h2>
          <button className="vendor-btn primary" onClick={() => setShowWithdraw(true)} style={{ background: "white", color: "#2563eb" }}>
            💰 Withdraw Money
          </button>
        </div>

        <div className="vendor-section">
          <h3>Linked Bank Account</h3>
          <div style={{ marginTop: "12px" }}>
            <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#6b7280" }}>Account Holder</p>
            <p style={{ margin: "0 0 12px 0", fontSize: "14px" }}>Demo Vendor</p>
            <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#6b7280" }}>Bank Account</p>
            <p style={{ margin: "0 0 16px 0", fontSize: "14px", fontFamily: "monospace" }}>HDFC Bank ··· 4532</p>
            <button className="vendor-btn outline full small">Change Bank Account</button>
          </div>
        </div>
      </div>

      <div className="vendor-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: "0" }}>Transaction History</h3>
          <div style={{ display: "flex", gap: "8px" }}>
            {["All", "Credit", "Debit"].map(f => (
              <button key={f} className={`vendor-btn small ${filter === f ? "primary" : "outline"}`} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredTxns.length === 0 ? (
          <div className="vendor-empty">
            <p>No transactions found</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredTxns.map(t => (
              <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#f9fafb", borderRadius: "8px", borderLeft: `3px solid ${t.type === "Credit" ? "#16a34a" : "#dc2626"}` }}>
                <div>
                  <p style={{ margin: "0 0 2px 0", fontSize: "14px", fontWeight: "600" }}>{t.note}</p>
                  <p style={{ margin: "0", fontSize: "12px", color: "#6b7280" }}>{t.date}</p>
                </div>
                <span style={{ fontSize: "16px", fontWeight: "700", color: t.type === "Credit" ? "#16a34a" : "#dc2626" }}>
                  {t.type === "Credit" ? "+" : "-"}₹{t.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showWithdraw && (
        <div className="vendor-modal-backdrop" onClick={() => setShowWithdraw(false)}>
          <div className="vendor-modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 12px 0" }}>Withdraw Money</h3>
            <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#6b7280" }}>Available balance: ₹{balance.toLocaleString()}</p>
            <div className="vendor-form-group">
              <label>Withdrawal Amount</label>
              <input type="number" placeholder="Enter amount" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            {error && <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#dc2626" }}>❌ {error}</p>}
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="vendor-btn outline full" onClick={() => setShowWithdraw(false)}>Cancel</button>
              <button className="vendor-btn primary full" onClick={confirmWithdraw}>Confirm Withdrawal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
