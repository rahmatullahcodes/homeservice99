import { useState } from "react";
import { useToast } from "../../context/ToastContext";

export default function AdminSettings() {

  const [commission, setCommission] = useState(15);
  const [tax, setTax] = useState(18);
  const [maintenance, setMaintenance] = useState(false);
  const [vendorSignup, setVendorSignup] = useState(true);
  const [userSignup, setUserSignup] = useState(true);

  const { addToast } = useToast();

  function saveSettings() {
    addToast("Settings saved ✅ (demo)", 'success');
  }

  return (
    <div className="admin-settings">

      {/* HEADER */}
      <div className="admin-page-head">
        <h2>Platform Settings</h2>
        <p className="admin-subtitle">
          Control pricing, access & system behavior
        </p>
      </div>

      {/* COMMISSION & TAX */}
      <div className="grid-2">

        <div className="detail-box">
          <h3>Commission & Tax</h3>

          <label>Platform Commission (%)</label>
          <input
            type="number"
            value={commission}
            onChange={e => setCommission(e.target.value)}
          />

          <label>GST / Tax (%)</label>
          <input
            type="number"
            value={tax}
            onChange={e => setTax(e.target.value)}
          />
        </div>

        {/* PLATFORM CONTROL */}
        <div className="detail-box">
          <h3>Platform Controls</h3>

          <label className="toggle-row">
            <input
              type="checkbox"
              checked={maintenance}
              onChange={() => setMaintenance(!maintenance)}
            />
            Maintenance Mode
          </label>

          <label className="toggle-row">
            <input
              type="checkbox"
              checked={vendorSignup}
              onChange={() => setVendorSignup(!vendorSignup)}
            />
            Vendor Signup Enabled
          </label>

          <label className="toggle-row">
            <input
              type="checkbox"
              checked={userSignup}
              onChange={() => setUserSignup(!userSignup)}
            />
            User Signup Enabled
          </label>
        </div>

      </div>

      {/* PAYOUT RULES */}
      <div className="detail-box" style={{ marginTop: 20 }}>
        <h3>Vendor Payout Rules</h3>

        <p>• Payout cycle: Weekly</p>
        <p>• Minimum payout: ₹500</p>
        <p>• Auto-deduct commission & tax</p>

        <button className="btn-outline">Edit Payout Rules</button>
      </div>

      {/* ACTIONS */}
      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <button className="btn-primary" onClick={saveSettings}>
          Save Settings
        </button>
        <button className="btn-danger">
          Reset to Default
        </button>
      </div>

    </div>
  );
}
