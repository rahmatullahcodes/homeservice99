import { useState, useEffect } from "react";

export default function VendorWallet() {

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  // INIT DATA (demo persistence)
  useEffect(() => {
    const b = localStorage.getItem("vendorBalance");
    const t = localStorage.getItem("vendorTransactions");

    setBalance(b ? Number(b) : 2100);
    setTransactions(
      t ? JSON.parse(t) : [
        { id: 1, type: "Credit", note: "Job payment received", amount: 699, date: "Today" },
        { id: 2, type: "Credit", note: "Job payment received", amount: 1299, date: "Yesterday" },
        { id: 3, type: "Debit", note: "Withdrawal to bank", amount: 500, date: "10 Aug" }
      ]
    );
  }, []);

  function confirmWithdraw() {
    const value = Number(amount);

    if (!value || value <= 0) {
      setError("Enter a valid amount");
      return;
    }

    if (value > balance) {
      setError("Insufficient wallet balance");
      return;
    }

    const newTxn = {
      id: Date.now(),
      type: "Debit",
      note: "Withdrawal to bank",
      amount: value,
      date: "Just now"
    };

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

  return (
    <div>

      <h2 className="vendor-page-title">Wallet</h2>

      {/* BALANCE */}
      <div className="vendor-wallet-card">
        <span>Available Balance</span>
        <h1>₹{balance}</h1>

        <button
          className="vendor-btn primary"
          disabled={balance === 0}
          onClick={() => setShowWithdraw(true)}
        >
          Withdraw Money
        </button>
      </div>

      {/* BANK INFO */}
      <div className="vendor-bank">
        <h3>Linked Bank Account</h3>
        <p>Account Holder: Demo Vendor</p>
        <p>Bank: HDFC Bank</p>
        <p>Account No: **** 4532</p>
        <button className="vendor-btn outline">Change Bank</button>
      </div>

      {/* TRANSACTIONS */}
      <div className="vendor-activity">
        <h3>Transaction History</h3>

        {transactions.map(t => (
          <div key={t.id} className="vendor-activity-item">
            <div>
              <strong>{t.note}</strong>
              <div className="wallet-date">{t.date}</div>
            </div>

            <span className={t.type === "Credit" ? "wallet-credit" : "wallet-debit"}>
              {t.type === "Credit" ? "+" : "-"}₹{t.amount}
            </span>
          </div>
        ))}
      </div>

      {/* WITHDRAW MODAL */}
      {showWithdraw && (
        <div className="modal-backdrop">
          <div className="modal">

            <h3>Withdraw Money</h3>

            <p style={{ fontSize: 13, color: "#6b7280" }}>
              Available balance: ₹{balance}
            </p>

            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            {error && <p style={{ color: "red", fontSize: 13 }}>{error}</p>}

            <div className="modal-actions">
              <button className="btn-outline" onClick={() => setShowWithdraw(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={confirmWithdraw}>
                Confirm Withdrawal
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
