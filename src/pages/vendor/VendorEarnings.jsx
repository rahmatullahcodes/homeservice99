import { useState } from "react";

export default function VendorEarnings() {

  const [filter, setFilter] = useState("month");
  const [payoutRequested, setPayoutRequested] = useState(false);

  const PAYMENTS = [
    { id: 1, date: "Today", customer: "Rahul", service: "AC Repair", amount: 699 },
    { id: 2, date: "Yesterday", customer: "Priya", service: "Cleaning", amount: 1299 },
    { id: 3, date: "15 Aug", customer: "Ankit", service: "Electrician", amount: 399 }
  ];

  function requestPayout() {
    if (payoutRequested) return;
    setPayoutRequested(true);
    alert("Payout request submitted (demo)");
  }

  return (
    <div className="vendor-earnings">

      {/* PAGE HEADER */}
      <div className="vendor-page-head">
        <h2>Earnings</h2>
        <p>Track income and payouts</p>
      </div>

      {/* FILTERS */}
      <div className="vendor-filter">
        {["today", "week", "month", "lifetime"].map(f => (
          <button
            key={f}
            className={filter === f ? "active" : ""}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* SUMMARY CARDS */}
      <div className="vendor-stats-grid">

        <div className="vendor-stat-card green">
          <span>This Month</span>
          <h3>₹8,200</h3>
        </div>

        <div className="vendor-stat-card blue">
          <span>Last Month</span>
          <h3>₹7,400</h3>
        </div>

        <div className="vendor-stat-card purple">
          <span>Lifetime</span>
          <h3>₹52,100</h3>
        </div>

        <div className="vendor-stat-card yellow">
          <span>Pending Payout</span>
          <h3>₹1,200</h3>
        </div>

      </div>

      {/* PAYOUT CARD */}
      <div className="vendor-payout-card">

        <div>
          <h3>Next Payout</h3>
          <p><strong>Amount:</strong> ₹1,200</p>
          <p><strong>Expected:</strong> 20 Aug 2025</p>
        </div>

        <button
          className={`vendor-btn primary ${payoutRequested ? "disabled" : ""}`}
          onClick={requestPayout}
          disabled={payoutRequested}
        >
          {payoutRequested ? "Payout Requested" : "Request Payout"}
        </button>

      </div>

      {/* PAYMENT HISTORY */}
      <div className="vendor-activity">

        <h3>Payment History</h3>

        {PAYMENTS.length === 0 && (
          <div className="detail-box">
            No earnings yet.
          </div>
        )}

        {PAYMENTS.map(p => (
          <div key={p.id} className="vendor-activity-item">

            <div className="activity-left">
              <strong>{p.customer}</strong>
              <span>{p.service}</span>
            </div>

            <div className="activity-right">
              <strong className="activity-amount">₹{p.amount}</strong>
              <small className="activity-date">{p.date}</small>
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}
