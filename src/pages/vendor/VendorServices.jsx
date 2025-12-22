import { useState } from "react";

export default function VendorServices() {

  const [services, setServices] = useState([
    { id: 1, name: "AC Repair", price: 499, active: true, editing: false },
    { id: 2, name: "Deep Cleaning", price: 1499, active: true, editing: false },
    { id: 3, name: "Plumbing", price: 299, active: false, editing: false }
  ]);

  const [newService, setNewService] = useState({ name: "", price: "" });

  function toggleStatus(id) {
    setServices(prev =>
      prev.map(s =>
        s.id === id ? { ...s, active: !s.active } : s
      )
    );
  }

  function toggleEdit(id) {
    setServices(prev =>
      prev.map(s =>
        s.id === id ? { ...s, editing: !s.editing } : s
      )
    );
  }

  function updatePrice(id, price) {
    setServices(prev =>
      prev.map(s =>
        s.id === id ? { ...s, price } : s
      )
    );
  }

  function deleteService(id) {
    if (!window.confirm("Remove this service?")) return;
    setServices(prev => prev.filter(s => s.id !== id));
  }

  function addService() {
    if (!newService.name || !newService.price) return;

    setServices(prev => [
      ...prev,
      {
        id: Date.now(),
        name: newService.name,
        price: Number(newService.price),
        active: true,
        editing: false
      }
    ]);

    setNewService({ name: "", price: "" });
  }

  return (
    <div className="vendor-services">

      <div className="vendor-page-head">
        <h2>My Services</h2>
        <p>Manage pricing and availability</p>
      </div>

      {/* ADD SERVICE */}
      <div className="vendor-add-service">
        <input
          placeholder="Service name"
          value={newService.name}
          onChange={e =>
            setNewService({ ...newService, name: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Price ₹"
          value={newService.price}
          onChange={e =>
            setNewService({ ...newService, price: e.target.value })
          }
        />

        <button className="vendor-btn" onClick={addService}>
          + Add Service
        </button>
      </div>

      {/* EMPTY STATE */}
      {services.length === 0 && (
        <div className="detail-box">
          No services added yet.
        </div>
      )}

      {/* SERVICE LIST */}
      <div className="vendor-service-list">

        {services.map(s => (
          <div key={s.id} className="vendor-service-card">

            <div className="service-main">
              <strong>{s.name}</strong>

              {s.editing ? (
                <input
                  type="number"
                  value={s.price}
                  onChange={e => updatePrice(s.id, e.target.value)}
                />
              ) : (
                <span className="price">₹{s.price}</span>
              )}
            </div>

            <div className="service-actions">
              <span className={`status ${s.active ? "active" : "off"}`}>
                {s.active ? "LIVE" : "OFF"}
              </span>

              <button
                className="vendor-btn small outline"
                onClick={() => toggleEdit(s.id)}
              >
                {s.editing ? "Save" : "Edit"}
              </button>

              <button
                className="vendor-btn small"
                onClick={() => toggleStatus(s.id)}
              >
                {s.active ? "Disable" : "Enable"}
              </button>

              <button
                className="vendor-btn small danger"
                onClick={() => deleteService(s.id)}
              >
                Delete
              </button>
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}
