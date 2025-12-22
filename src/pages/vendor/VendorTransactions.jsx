import { useState, useEffect } from "react";

export default function VendorTransactions() {

  const [filter, setFilter] = useState("All");
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Load from wallet if exists (shared data)
    const saved = localStorage.getItem("vendorTransactions");

    setTransactions(
      saved ? JSON.parse(saved) : [
        { id: 1, type: "Credit", amount: 699, source: "AC Repair", date: "Today", status: "Success" },
        { id: 2, type: "Credit", amount: 1299, source: "Cleaning Job", date: "Yesterday", status: "Success" },
        { id: 3, type: "Debit", amount: 500, source: "Bank Withdrawal", date: "10 Aug", status: "Processed" }
      ]
    );
  }, []);

  const filteredTx = transactions.filter(t =>
    filter === "All" ? true : t.type === filter
  );

  return (
    <div>

      <h2 className="vendor-page-title">Transactions</h2>
      <p className="vendor-page-subtitle">
        Complete record of wallet credits and withdrawals
      </p>

      {/* FILTER */}
      <div className="vendor-filter">
        {["All", "Credit", "Debit"].map(f => (
          <button
            key={f}
            className={filter === f ? "active" : ""}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="vendor-transaction-list">

        {filteredTx.length === 0 && (
          <div className="detail-box">
            No {filter.toLowerCase()} transactions found.
          </div>
        )}

        {filteredTx.map(t => (
          <div key={t.id} className="vendor-transaction-card">

            <div className="trx-left">
              <strong>{t.source}</strong>
              <span className="trx-date">{t.date}</span>
            </div>

            <div className="trx-right">
              <span className={`trx-amount ${t.type === "Credit" ? "credit" : "debit"}`}>
                {t.type === "Credit" ? "+" : "-"}₹{t.amount}
              </span>

              <span className={`trx-status ${t.status.toLowerCase()}`}>
                {t.status}
              </span>
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}
