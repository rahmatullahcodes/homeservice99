import { useState } from "react";

export default function AdminWallet() {

  const [wallet] = useState({
    platformBalance: 12000,
    vendorPayable: 7800,
    refundsPending: 900
  });

  const transactions = [
    { id: 1, type: "Commission", amount: 299, source: "Booking #1021" },
    { id: 2, type: "Vendor Payout", amount: -2500, source: "AC Experts" },
    { id: 3, type: "Refund Hold", amount: -900, source: "Order #1009" }
  ];

  return (
    <div className="admin-page">

      <h2>Wallet</h2>
      <p className="admin-subtitle">
        Platform-level wallet & settlement overview
      </p>

      {/* SUMMARY CARDS */}
      <div className="admin-kpi-grid">

        <div className="kpi-card">
          <span>Platform Balance</span>
          <h3>₹{wallet.platformBalance}</h3>
          <small className="positive">After commissions</small>
        </div>

        <div className="kpi-card">
          <span>Vendor Payable</span>
          <h3>₹{wallet.vendorPayable}</h3>
          <small className="neutral">Pending settlements</small>
        </div>

        <div className="kpi-card">
          <span>Refunds on Hold</span>
          <h3>₹{wallet.refundsPending}</h3>
          <small className="danger">Customer refunds</small>
        </div>

      </div>

      {/* TRANSACTION LOG */}
      <div className="admin-section">
        <h3>Wallet Transactions</h3>

        <div className="admin-table">

          <div className="table-row head">
            <span>Type</span>
            <span>Amount</span>
            <span>Reference</span>
          </div>

          {transactions.map(t => (
            <div className="table-row" key={t.id}>
              <span>{t.type}</span>
              <span className={t.amount >= 0 ? "positive" : "danger"}>
                {t.amount >= 0 ? "+" : "-"}₹{Math.abs(t.amount)}
              </span>
              <span>{t.source}</span>
            </div>
          ))}

        </div>
      </div>

      {/* ACTIONS */}
      <div className="admin-section">
        <h3>Admin Actions</h3>

        <div className="quick-actions">
          <button className="btn-outline">Settle Vendors</button>
          <button className="btn-outline">Release Refunds</button>
          <button className="btn-outline">Adjust Wallet</button>
          <button className="btn-outline">Export Ledger</button>
        </div>
      </div>

    </div>
  );
}
