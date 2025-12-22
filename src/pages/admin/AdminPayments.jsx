import { useState } from "react";

export default function AdminPayments() {

  const [payments, setPayments] = useState([
    {
      id: 1,
      user: "Rahul",
      amount: 699,
      method: "UPI",
      status: "Success",
      date: "2025-01-10",
      txnId: "TXN98231"
    },
    {
      id: 2,
      user: "Neha",
      amount: 1999,
      method: "COD",
      status: "Pending",
      date: "2025-01-11",
      txnId: "-"
    }
  ]);

  function updateStatus(id, status) {
    setPayments(
      payments.map(p =>
        p.id === id ? { ...p, status } : p
      )
    );
  }

  return (
    <div className="admin-page">

      <h2>Payments</h2>
      <p className="admin-subtitle">
        Track and manage all user payments
      </p>

      <div className="admin-table">

        {/* TABLE HEADER */}
        <div className="table-row head">
          <span>User</span>
          <span>Amount</span>
          <span>Method</span>
          <span>Status</span>
          <span>Txn ID</span>
          <span>Action</span>
        </div>

        {payments.map(p => (
          <div className="table-row" key={p.id}>

            <span>{p.user}</span>
            <span>₹{p.amount}</span>
            <span>{p.method}</span>

            <span className={`tag ${
              p.status === "Success" ? "success" :
              p.status === "Pending" ? "pending" : "danger"
            }`}>
              {p.status}
            </span>

            <span>{p.txnId}</span>

            <span>
              {p.status === "Pending" && (
                <>
                  <button
                    className="btn-outline"
                    onClick={() => updateStatus(p.id, "Success")}
                  >
                    Mark Paid
                  </button>

                  <button
                    className="btn-outline"
                    style={{ marginLeft: 6 }}
                    onClick={() => updateStatus(p.id, "Failed")}
                  >
                    Fail
                  </button>
                </>
              )}
            </span>

          </div>
        ))}

      </div>

    </div>
  );
}
