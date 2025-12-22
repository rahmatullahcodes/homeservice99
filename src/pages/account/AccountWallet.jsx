import { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";

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
    <div className="wallet-wrapper">

      <h2 className="dashboard-title">Wallet</h2>

      {/* BALANCE CARD */}
      <div className="wallet-balance-card">
        <p>Current Balance</p>
        <h1>₹{balance}</h1>
      </div>

      {/* ADD MONEY */}
      <div className="wallet-add-box">
        <input
          placeholder="Enter amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-primary" onClick={addMoney}>
            Add Money
          </button>
          <button className="btn-outline" onClick={usePaymentMethodToPay}>Use Payment Method</button>
        </div>
      </div>

      {/* TRANSACTIONS */}
      <h3 style={{ marginTop: 14 }}>Recent Transactions</h3>

      <div className="wallet-list">
        {transactions.map(t => (
          <div key={t.id} className="wallet-row">

            <div>
              <strong>{truncate(t.note)}</strong>
              <p className="wallet-date">{t.date}</p>
            </div>

            <div
              className={`wallet-amount ${t.type === "Credit" ? "credit" : "debit"}`}
            >
              {t.type === "Credit" ? "+" : "-"}₹{t.amount}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
