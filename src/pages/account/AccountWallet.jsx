import { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import "../../styles/account.css";

export default function AccountWallet() {

  const [balance, setBalance] = useState(() => Number(localStorage.getItem('walletBalance') || 250));
  const [amount, setAmount] = useState("");

  const [transactions, setTransactions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('walletTransactions') || '[]'); } catch(e) { return [] }
  });

  const { addToast } = useToast();

  useEffect(() => {
    localStorage.setItem('walletBalance', String(balance));
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('walletTransactions', JSON.stringify(transactions));
  }, [transactions]);

  function addMoney() {
    const value = Number(amount);
    if (!value || value <= 0) {
      addToast("Enter valid amount", 'warning');
      return;
    }

    setBalance(prev => prev + value);

    setTransactions(prev => [
      {
        id: Date.now(),
        type: "Credit",
        note: "Added money",
        amount: value,
        date: new Date().toLocaleDateString()
      },
      ...prev
    ]);

    setAmount("");
    addToast("Added ₹" + value + " to wallet", 'success');
  }

  function truncate(text) {
    return text.length > 18 ? text.slice(0, 18) + "…" : text;
  }

  function usePaymentMethodToPay() {
    const method = prompt('Enter payment method to use (UPI/Card last digits)');
    const value = Number(prompt('Enter amount to pay from method to wallet', 500));
    if (!method || !value || value <= 0) return addToast('Invalid input', 'warning');

    setBalance(prev => prev + value);
    setTransactions(prev => [{ id: Date.now(), type: 'Credit', note: `Added via ${method}`, amount: value, date: new Date().toLocaleDateString() }, ...prev]);
    addToast(`Added ₹${value} via ${method}`, 'success');
  }

  return (
    <div className="dashboard-wrapper">

      <h2 className="dashboard-title">My Wallet</h2>
      <p className="dashboard-subtitle">Manage your wallet and view transaction history</p>

      {/* BALANCE CARD */}
      <div className="dashboard-grid" style={{ marginBottom: "32px" }}>
        <div className="dash-card green">
          <div className="dash-icon">💰</div>
          <div>
            <p className="dash-label">Wallet Balance</p>
            <h3>₹{balance.toLocaleString()}</h3>
            <span className="dash-trend">Available balance</span>
          </div>
        </div>
        <div className="dash-card blue">
          <div className="dash-icon">📥</div>
          <div>
            <p className="dash-label">Total Credits</p>
            <h3>₹{transactions.filter(t => t.type === "Credit").reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</h3>
            <span className="dash-trend">All time</span>
          </div>
        </div>
        <div className="dash-card yellow">
          <div className="dash-icon">📤</div>
          <div>
            <p className="dash-label">Total Spent</p>
            <h3>₹{transactions.filter(t => t.type === "Debit").reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</h3>
            <span className="dash-trend">All time</span>
          </div>
        </div>
      </div>

      {/* ADD MONEY SECTION */}
      <div className="account-card" style={{ marginBottom: "32px" }}>
        <h3 style={{ marginBottom: "16px" }}>Add Money to Wallet</h3>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="account-form-input"
            />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="account-btn primary" onClick={addMoney}>
              ➕ Add Money
            </button>
            <button className="account-btn secondary" onClick={usePaymentMethodToPay}>
              💳 Use Payment Method
            </button>
          </div>
        </div>
      </div>

      {/* QUICK ADD BUTTONS */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "32px", flexWrap: "wrap" }}>
        {[100, 250, 500, 1000].map(amt => (
          <button 
            key={amt}
            className="account-btn secondary"
            onClick={() => { setAmount(String(amt)); }}
            style={{ fontSize: "12px", padding: "8px 12px" }}
          >
            ₹{amt}
          </button>
        ))}
      </div>

      {/* TRANSACTIONS */}
      <div className="account-card">
        <h3 style={{ marginBottom: "16px" }}>Transaction History</h3>

        {transactions.length === 0 ? (
          <p style={{ textAlign: "center", color: "#6b7280", padding: "20px" }}>No transactions yet</p>
        ) : (
          <table className="account-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Type</th>
                <th>Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id}>
                  <td><strong>{t.note}</strong></td>
                  <td><span className={`account-badge ${t.type === "Credit" ? "green" : "red"}`}>{t.type}</span></td>
                  <td>{t.date}</td>
                  <td style={{ fontWeight: 600, color: t.type === "Credit" ? "var(--account-success)" : "var(--account-danger)" }}>
                    {t.type === "Credit" ? "+" : "-"}₹{t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
