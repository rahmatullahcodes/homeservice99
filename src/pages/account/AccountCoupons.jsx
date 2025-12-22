import { useState } from "react";

export default function AccountCoupons() {

  const [copiedId, setCopiedId] = useState(null);

  const COUPONS = [
    {
      id: 1,
      code: "SAVE50",
      desc: "Flat ₹50 off",
      expiry: "31 Mar 2025",
      status: "Active",
      value: 50
    },
    {
      id: 2,
      code: "FIRST100",
      desc: "₹100 for first booking",
      expiry: "30 Apr 2025",
      status: "Active",
      value: 100
    },
    {
      id: 3,
      code: "OLD20",
      desc: "Expired coupon",
      expiry: "31 Dec 2024",
      status: "Expired",
      value: 20
    }
  ];

  function copy(code, id) {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="coupon-wrapper">

      <h2 className="dashboard-title">Coupons</h2>
      <p className="dashboard-subtitle">Use coupons during checkout</p>

      <div className="coupon-list">

        {COUPONS.map(c => (
          <div key={c.id} className={`coupon-card ${c.status.toLowerCase()}`}>

            <div>
              <strong>{c.code}</strong>
              <p>{c.desc}</p>
              <small>Expires: {c.expiry}</small>
            </div>

            <div className="coupon-right">
              <span>₹{c.value}</span>

              {c.status === "Active" ? (
                <button onClick={() => copy(c.code, c.id)}>
                  {copiedId === c.id ? "Copied" : "Copy"}
                </button>
              ) : (
                <span className="expired-text">Expired</span>
              )}
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}
