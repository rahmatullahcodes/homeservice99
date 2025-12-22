import { useState } from "react";
import { useToast } from "../../context/ToastContext";

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
    <div className="payments-wrapper">

      <h2 className="dashboard-title">Payment Methods</h2>
      <p className="dashboard-subtitle">Manage your saved payment options</p>

      {/* ADD NEW */}
      <div className="payment-add-box">
        <select value={type} onChange={e => setType(e.target.value)}>
          <option>UPI</option>
          <option>Card</option>
        </select>

        <input
          placeholder={type === "UPI" ? "example@upi" : "Card last digits"}
          value={value}
          onChange={e => setValue(e.target.value)}
        />

        <button className="btn-primary" onClick={addMethod}>
          Add
        </button>
      </div>

      {/* LIST */}
      <div className="payment-list">
        {methods.map(m => (
          <div key={m.id} className="payment-card">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 20 }}>{m.type === 'Card' ? '💳' : '🔗'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{m.type}</div>
                <strong style={{ display: 'block' }}>{m.value}</strong>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-outline" onClick={() => quickTopUp(m)}>Add to wallet</button>
                <button className="btn-outline" onClick={() => removeMethod(m.id)}>Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        <p className="form-note">Tip: Use a saved payment method to quickly top up your Wallet for faster checkout.</p>
      </div>

    </div>
  );
}
