import { useState } from "react";

export default function VendorServices() {
  const [services, setServices] = useState([
    { id: 1, name: "AC Repair", price: 499, active: true, description: "Regular maintenance and repair services" },
    { id: 2, name: "Deep Cleaning", price: 1499, active: true, description: "Complete home deep cleaning" },
    { id: 3, name: "Plumbing", price: 299, active: false, description: "Plumbing installation and repair" }
  ]);

  const [newService, setNewService] = useState({ name: "", price: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  function addService() {
    if (!newService.name || !newService.price) {
      alert("Please fill all fields");
      return;
    }

    setServices([...services, {
      id: Date.now(),
      name: newService.name,
      price: Number(newService.price),
      description: newService.description,
      active: true
    }])

    setNewService({ name: "", price: "", description: "" });
  }

  function startEdit(service) {
    setEditingId(service.id);
    setEditData({ ...service });
  }

  function saveEdit() {
    setServices(services.map(s => s.id === editingId ? editData : s));
    setEditingId(null);
  }

  function toggleStatus(id) {
    setServices(services.map(s => s.id === id ? { ...s, active: !s.active } : s));
  }

  function deleteService(id) {
    if (!window.confirm("Delete this service? This action cannot be undone.")) return;
    setServices(services.filter(s => s.id !== id));
  }

  const activeServices = services.filter(s => s.active).length;

  return (
    <div>
      {/* PAGE HEADER */}
      <div className="vendor-page-head">
        <h2>My Services</h2>
        <p>Manage your services and pricing</p>
      </div>

      {/* STATS */}
      <div className="vendor-grid-2" style={{ marginBottom: "24px" }}>
        <div className="vendor-stat-card blue">
          <span>Total Services</span>
          <h3>{services.length}</h3>
        </div>
        <div className="vendor-stat-card green">
          <span>Active Services</span>
          <h3>{activeServices}</h3>
        </div>
      </div>

      {/* ADD NEW SERVICE */}
      <div className="vendor-section" style={{ marginBottom: "24px" }}>
        <h3>Add New Service</h3>
        <div className="vendor-grid-2" style={{ marginTop: "16px", gap: "12px" }}>
          <div>
            <label className="vendor-form-group" style={{ marginBottom: "0" }}>
              <label style={{ display: "block", marginBottom: "6px" }}>Service Name</label>
              <input
                type="text"
                placeholder="e.g., AC Repair"
                value={newService.name}
                onChange={e => setNewService({ ...newService, name: e.target.value })}
              />
            </label>
          </div>
          <div>
            <label className="vendor-form-group" style={{ marginBottom: "0" }}>
              <label style={{ display: "block", marginBottom: "6px" }}>Price (₹)</label>
              <input
                type="number"
                placeholder="e.g., 499"
                value={newService.price}
                onChange={e => setNewService({ ...newService, price: e.target.value })}
              />
            </label>
          </div>
        </div>
        <div style={{ marginTop: "12px" }}>
          <label className="vendor-form-group" style={{ marginBottom: "0" }}>
            <label style={{ display: "block", marginBottom: "6px" }}>Description</label>
            <input
              type="text"
              placeholder="Describe your service"
              value={newService.description}
              onChange={e => setNewService({ ...newService, description: e.target.value })}
            />
          </label>
        </div>
        <button className="vendor-btn primary" onClick={addService} style={{ marginTop: "12px", width: "100%" }}>
          + Add Service
        </button>
      </div>

      {/* SERVICES LIST */}
      {services.length === 0 ? (
        <div className="vendor-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <p>No services added yet. Add your first service above!</p>
        </div>
      ) : (
        <div className="vendor-grid-2" style={{ gap: "16px" }}>
          {services.map(service => (
            <div key={service.id} className="vendor-section">
              {editingId === service.id ? (
                <>
                  <div className="vendor-form-group">
                    <label>Service Name</label>
                    <input
                      value={editData.name}
                      onChange={e => setEditData({ ...editData, name: e.target.value })}
                    />
                  </div>
                  <div className="vendor-form-group">
                    <label>Price (₹)</label>
                    <input
                      type="number"
                      value={editData.price}
                      onChange={e => setEditData({ ...editData, price: Number(e.target.value) })}
                    />
                  </div>
                  <div className="vendor-form-group">
                    <label>Description</label>
                    <input
                      value={editData.description}
                      onChange={e => setEditData({ ...editData, description: e.target.value })}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="vendor-btn success full small" onClick={saveEdit}>Save</button>
                    <button className="vendor-btn outline full small" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                    <div>
                      <h3 style={{ margin: "0 0 4px 0", fontSize: "16px" }}>{service.name}</h3>
                      <p style={{ margin: "0", fontSize: "13px", color: "#6b7280" }}>{service.description}</p>
                    </div>
                    <span className={`vendor-badge ${service.active ? "active" : "pending"}`}>
                      {service.active ? "Live" : "Offline"}
                    </span>
                  </div>
                  <p style={{ margin: "8px 0", fontSize: "20px", fontWeight: "700", color: "#2563eb" }}>₹{service.price}</p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      className="vendor-btn outline small full"
                      onClick={() => startEdit(service)}
                    >
                      Edit
                    </button>
                    <button
                      className={`vendor-btn small full ${service.active ? "danger" : "success"}`}
                      onClick={() => toggleStatus(service.id)}
                    >
                      {service.active ? "Offline" : "Online"}
                    </button>
                    <button
                      className="vendor-btn danger small full"
                      onClick={() => deleteService(service.id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
