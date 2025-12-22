import { useState } from "react";
import { useToast } from "../../context/ToastContext";

export default function AdminServices() {
  const [services, setServices] = useState([
    { id: 1, name: "AC Repair", category: "Appliances", price: 699, active: true },
    { id: 2, name: "Deep Cleaning", category: "Cleaning", price: 1999, active: true },
    { id: 3, name: "Plumbing", category: "Home Repair", price: 299, active: false }
  ]);

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: ""
  });
  const { addToast } = useToast();

  function toggleStatus(id) {
    setServices(services.map(s =>
      s.id === id ? { ...s, active: !s.active } : s
    ));
  }

  function addService() {
    if (!form.name || !form.category || !form.price) {
      addToast("All fields required", 'warning');
      return;
    }

    setServices([
      ...services,
      {
        id: Date.now(),
        name: form.name,
        category: form.category,
        price: Number(form.price),
        active: true
      }
    ]);

    setForm({ name: "", category: "", price: "" });
    addToast("Service added", 'success');
  }

  return (
    <div className="admin-page">

      <h2>Services Management</h2>
      <p className="admin-subtitle">
        Control services available on the platform
      </p>

      {/* ADD SERVICE */}
      <div className="detail-box">
        <h4>Add New Service</h4>

        <input
          placeholder="Service name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Category"
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
        />

        <input
          type="number"
          placeholder="Base price"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
        />

        <button className="btn-primary" onClick={addService}>
          Add Service
        </button>
      </div>

      {/* SERVICE LIST */}
      <div style={{ marginTop: 16 }}>
        {services.map(s => (
          <div className="detail-box" key={s.id}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>{s.name}</strong>
                <p>{s.category} • ₹{s.price}</p>
                <span className={`tag ${s.active ? "success" : "danger"}`}>
                  {s.active ? "Active" : "Disabled"}
                </span>
              </div>

              <div>
                <button
                  className="btn-outline"
                  onClick={() => toggleStatus(s.id)}
                >
                  {s.active ? "Disable" : "Enable"}
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
