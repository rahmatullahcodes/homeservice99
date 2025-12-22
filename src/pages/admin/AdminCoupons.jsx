import { useState } from "react";
import { useToast } from "../../context/ToastContext";

export default function AdminCoupons() {

  const [coupons, setCoupons] = useState([
    { code: "SAVE50", type: "Flat", value: 50, active: true, usage: 42 },
    { code: "NEW100", type: "Flat", value: 100, active: false, usage: 8 }
  ]);

  const [form, setForm] = useState({
    code: "",
    type: "Flat",
    value: ""
  });
  const { addToast } = useToast();

  function toggleStatus(code) {
    setCoupons(prev =>
      prev.map(c =>
        c.code === code ? { ...c, active: !c.active } : c
      )
    );
  }

  function createCoupon() {
    if (!form.code || !form.value) {
      addToast("All fields required", 'warning');
      return;
    }

    setCoupons(prev => [
      ...prev,
      {
        code: form.code.toUpperCase(),
        type: form.type,
        value: Number(form.value),
        active: true,
        usage: 0
      }
    ]);

    setForm({ code: "", type: "Flat", value: "" });
    addToast("Coupon created", 'success');
  }

  return (
    <div className="admin-page">

      <h2>Coupons</h2>
      <p className="admin-subtitle">
        Create and manage discount coupons
      </p>

      {/* CREATE COUPON */}
      <div className="detail-box">
        <h3>Create Coupon</h3>

        <div className="form-row">
          <input
            placeholder="Coupon Code"
            value={form.code}
            onChange={e => setForm({ ...form, code: e.target.value })}
          />

          <select
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
          >
            <option value="Flat">Flat</option>
            <option value="Percent">Percent</option>
          </select>

          <input
            type="number"
            placeholder="Value"
            value={form.value}
            onChange={e => setForm({ ...form, value: e.target.value })}
          />

          <button className="btn-primary" onClick={createCoupon}>
            Create
          </button>
        </div>
      </div>

      {/* COUPON LIST */}
      <div className="admin-section">
        <h3>All Coupons</h3>

        <div className="admin-table">

          <div className="table-row head">
            <span>Code</span>
            <span>Type</span>
            <span>Value</span>
            <span>Usage</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {coupons.map(c => (
            <div className="table-row" key={c.code}>
              <span><strong>{c.code}</strong></span>
              <span>{c.type}</span>
              <span>{c.type === "Flat" ? `₹${c.value}` : `${c.value}%`}</span>
              <span>{c.usage}</span>
              <span className={c.active ? "status-success" : "status-pending"}>
                {c.active ? "Active" : "Inactive"}
              </span>
              <span>
                <button
                  className="btn-outline"
                  onClick={() => toggleStatus(c.code)}
                >
                  {c.active ? "Disable" : "Enable"}
                </button>
              </span>
            </div>
          ))}

        </div>
      </div>

    </div>
  );
}
