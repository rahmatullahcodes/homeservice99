import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import "../../styles/account.css";

export default function AccountPayments() {

  const [methods, setMethods] = useState([
    { id: 1, type: "UPI", value: "demo@upi" },
    { id: 2, type: "Card", value: "**** **** **** 2345" }
  ]);

  const [type, setType] = useState("UPI");
  const [value, setValue] = useState("");
  const { addToast } = useToast();

  // wallet helper: read / write wallet balance and transactions in localStorage
  function readWallet() {
    return Number(localStorage.getItem('walletBalance') || 0);
  }

  function writeWallet(amount, note = 'Added via payment') {
    const current = readWallet();
    const newBal = current + Number(amount);
    localStorage.setItem('walletBalance', String(newBal));

    const txs = JSON.parse(localStorage.getItem('walletTransactions') || '[]');
    txs.unshift({ id: Date.now(), type: 'Credit', note, amount: Number(amount), date: new Date().toLocaleDateString() });
    localStorage.setItem('walletTransactions', JSON.stringify(txs));

    return newBal;
  }

  function addMethod() {
    if (!value) return addToast("Enter details", 'warning');

    setMethods([...methods, { id: Date.now(), type, value }]);
    setValue("");
    addToast("Payment method added", 'success');
  }

  function removeMethod(id) {
    setMethods(methods.filter(m => m.id !== id));
  }

  function quickTopUp(m) {
    const amount = Number(prompt(`Enter amount to add to wallet using ${m.type} (${m.value})`, 500));
    if (!amount || amount <= 0) return addToast('Invalid amount', 'warning');

    const newBal = writeWallet(amount, `Added via ${m.type}`);
    addToast(`Added ₹${amount} to wallet. New balance ₹${newBal}`, 'success');
  }

  return (
    <div className="dashboard-wrapper">

      <h2 className="dashboard-title">Payment Methods</h2>
      <p className="dashboard-subtitle">Manage your saved payment options and wallet</p>

      {/* WALLET INFO CARD */}
      <div className="dashboard-grid" style={{ marginBottom: "32px" }}>
        <div className="dash-card green">
          <div className="dash-icon">💳</div>
          <div>
            <p className="dash-label">Wallet Balance</p>
            <h3>₹{readWallet().toLocaleString()}</h3>
            <span className="dash-trend">Ready to use</span>
          </div>
        </div>
        <div className="dash-card blue">
          <div className="dash-icon">📊</div>
          <div>
            <p className="dash-label">Saved Methods</p>
            <h3>{methods.length}</h3>
            <span className="dash-trend">Payment options</span>
          </div>
        </div>
      </div>

      {/* ADD NEW */}
      <div className="account-card" style={{ marginBottom: "32px" }}>
        <h3 style={{ marginBottom: "16px" }}>Add Payment Method</h3>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "150px" }}>
            <select value={type} onChange={e => setType(e.target.value)} className="account-form-input">
              <option>UPI</option>
              <option>Card</option>
              <option>Wallet</option>
            </select>
          </div>

          <div style={{ flex: 1, minWidth: "200px" }}>
            <input
              placeholder={type === "UPI" ? "example@upi" : "Card last digits"}
              value={value}
              onChange={e => setValue(e.target.value)}
              className="account-form-input"
            />
          </div>

          <button className="account-btn primary" onClick={addMethod}>
            ➕ Add Method
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="account-grid-2" style={{ marginBottom: "32px" }}>
        {methods.map(m => (
          <div key={m.id} className="account-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: 32 }}>{m.type === 'Card' ? '💳' : m.type === 'UPI' ? '🔗' : '💰'}</span>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{m.type}</p>
                <p style={{ margin: 0, fontWeight: 600 }}>{m.value}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="account-btn primary" style={{ flex: 1, fontSize: "12px", padding: "8px 12px" }} onClick={() => quickTopUp(m)}>
                ➕ Wallet
              </button>
              <button className="account-btn danger" style={{ flex: 1, fontSize: "12px", padding: "8px 12px" }} onClick={() => removeMethod(m.id)}>
                🗑️ Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {methods.length === 0 && (
        <div className="account-alert info">
          💡 Add a payment method to quickly top up your wallet and checkout faster!
        </div>
      )}

    </div>
  );
}
