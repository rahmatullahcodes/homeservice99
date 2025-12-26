import { useState, useEffect } from "react";

export default function VendorTransactions() {
  const [filter, setFilter] = useState("All");
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("vendorTransactions");
    setTransactions(saved ? JSON.parse(saved) : [
      { id: 1, type: "Credit", amount: 699, source: "AC Repair", date: "15 Aug 2025", status: "Success" },
      { id: 2, type: "Credit", amount: 1299, source: "Cleaning Job", date: "14 Aug 2025", status: "Success" },
      { id: 3, type: "Debit", amount: 500, source: "Bank Withdrawal", date: "10 Aug 2025", status: "Processed" }
    ]);
  }, []);

  const filteredTx = filter === "All" ? transactions : transactions.filter(t => t.type === filter);
  const stats = {
    totalCredit: transactions.filter(t => t.type === "Credit").reduce((sum, t) => sum + t.amount, 0),
    totalDebit: transactions.filter(t => t.type === "Debit").reduce((sum, t) => sum + t.amount, 0)
  };

  return (
    <div>
      <div className="vendor-page-head">
        <h2>Transactions</h2>
        <p>Complete record of wallet credits and withdrawals</p>
      </div>

      <div className="vendor-grid-2" style={{ marginBottom: "24px", gap: "16px" }}>
        <div className="vendor-stat-card green">
          <span>Total Credits</span>
          <h3>₹{stats.totalCredit.toLocaleString()}</h3>
        </div>
        <div className="vendor-stat-card orange">
          <span>Total Debits</span>
          <h3>₹{stats.totalDebit.toLocaleString()}</h3>
        </div>
      </div>

      <div className="vendor-section" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["All", "Credit", "Debit"].map(f => (
            <button key={f} className={`vendor-btn ${filter === f ? "primary" : "outline"} small`} onClick={() => setFilter(f)}>
              {f} ({transactions.filter(t => t.type === f || f === "All").length})
            </button>
          ))}
        </div>
      </div>

      <div className="vendor-section">
        {filteredTx.length === 0 ? (
          <div className="vendor-empty">
            <p>No {filter.toLowerCase()} transactions found</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="vendor-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Source</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTx.map(t => (
                  <tr key={t.id}>
                    <td className="muted">{t.date}</td>
                    <td>{t.source}</td>
                    <td>
                      <span className={`vendor-badge ${t.type.toLowerCase()}`}>
                        {t.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: "600", color: t.type === "Credit" ? "#16a34a" : "#dc2626" }}>
                      {t.type === "Credit" ? "+" : "-"}₹{t.amount}
                    </td>
                    <td>
                      <span className={`vendor-badge ${t.status.toLowerCase()}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
