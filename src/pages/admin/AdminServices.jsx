import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: ""
  });

  // Fetch services from backend
  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        setError("Admin authentication required. Please login first.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/services`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format from server");
      }

      setServices(data);
    } catch (err) {
      console.error("Error fetching services:", err);
      setError(err.message || "Failed to load services. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleCreateService(e) {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.price) {
      alert("Please fill all fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/services`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          price: Number(formData.price)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create service");
      }

      const newService = await response.json();
      setServices([newService, ...services]);
      setFormData({ title: "", category: "", price: "" });
      setShowCreateForm(false);
      alert("Service created successfully!");
    } catch (err) {
      console.error("Error creating service:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleStatus(id) {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/services/${id}/toggle`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to update service status");
      }

      const updatedService = await response.json();
      
      setServices(services.map(s =>
        s._id === id || s.id === id ? updatedService : s
      ));

      // Update selected service if viewing
      if (selectedService && (selectedService._id === id || selectedService.id === id)) {
        setSelectedService(updatedService);
      }
    } catch (err) {
      console.error("Error updating service status:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteServiceHandler(id) {
    if (!window.confirm("Are you sure you want to delete this service?")) {
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/services/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete service");
      }

      setServices(services.filter(s => s._id !== id && s.id !== id));
      setSelectedService(null);
      alert("Service deleted successfully!");
    } catch (err) {
      console.error("Error deleting service:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredServices = services.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: services.length,
    active: services.filter(s => s.active).length,
    avgPrice: services.length > 0 ? (services.reduce((sum, s) => sum + s.price, 0) / services.length).toFixed(0) : 0
  };

  return (
    <div className="admin-page">

      {/* PAGE HEADER */}
      <div className="admin-page-head">
        <h2>Services Management</h2>
        <p className="admin-subtitle">Manage services available on the platform</p>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div style={{
          backgroundColor: '#fee',
          border: '1px solid #ffcccc',
          color: '#c33',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <strong>Error:</strong> {error}
          <button
            onClick={fetchServices}
            style={{
              marginLeft: 'auto',
              marginRight: '0',
              display: 'block',
              marginTop: '8px',
              padding: '6px 12px',
              backgroundColor: '#c33',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* STATS */}
      <div className="admin-kpi-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px'}}>
        <div className="kpi-card" style={{padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee'}}>
          <span style={{fontSize: 'clamp(12px, 3vw, 14px)', color: '#666', display: 'block', marginBottom: '8px'}}>Total Services</span>
          <h3 style={{fontSize: 'clamp(24px, 6vw, 32px)', margin: '8px 0'}}>{stats.total}</h3>
          <small className="positive" style={{fontSize: 'clamp(11px, 3vw, 12px)', color: '#28a745'}}>All Available</small>
        </div>
        <div className="kpi-card" style={{padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee'}}>
          <span style={{fontSize: 'clamp(12px, 3vw, 14px)', color: '#666', display: 'block', marginBottom: '8px'}}>Active Services</span>
          <h3 style={{fontSize: 'clamp(24px, 6vw, 32px)', margin: '8px 0'}}>{stats.active}</h3>
          <small className="positive" style={{fontSize: 'clamp(11px, 3vw, 12px)', color: '#28a745'}}>{Math.round((stats.active/stats.total)*100) || 0}% active</small>
        </div>
        <div className="kpi-card" style={{padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee'}}>
          <span style={{fontSize: 'clamp(12px, 3vw, 14px)', color: '#666', display: 'block', marginBottom: '8px'}}>Average Price</span>
          <h3 style={{fontSize: 'clamp(24px, 6vw, 32px)', margin: '8px 0'}}>₹{stats.avgPrice}</h3>
          <small className="positive" style={{fontSize: 'clamp(11px, 3vw, 12px)', color: '#28a745'}}>Base Price</small>
        </div>
      </div>

      {/* CONTROLS & SEARCH */}
      <div className="admin-section" style={{display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', alignItems: 'start'}}>
        <div style={{display: 'flex', justifyContent: 'flex-start', gridColumn: 'auto'}}>
          <button className="btn-sm" onClick={() => setShowCreateForm(true)} style={{fontSize: 'clamp(11px, 3vw, 13px)', padding: '8px 14px', whiteSpace: 'nowrap'}}>
            + Create Service
          </button>
        </div>
        <div style={{gridColumn: 'auto'}}>
          <div className="admin-search" style={{maxWidth: '100%', width: 'clamp(200px, 100%, 500px)'}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input 
              placeholder="Search services..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{fontSize: 'clamp(13px, 4vw, 15px)'}}
            />
          </div>
        </div>
      </div>

      {/* SERVICES TABLE */}
      <div className="admin-section" style={{'overflowX': 'auto'}}>
        <div className="admin-table" style={{'minWidth': '600px'}}>
          <div className="table-row head" style={{'display': 'grid', 'gridTemplateColumns': 'repeat(5, 1fr)', 'gap': '12px', 'padding': '12px', 'backgroundColor': '#f5f5f5', 'fontWeight': '600', 'fontSize': 'clamp(12px, 3vw, 14px)'}}>
            <span>Service Name</span>
            <span>Category</span>
            <span>Base Price</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {loading ? (
            <div style={{'padding': '20px', 'textAlign': 'center', 'color': '#999'}}>
              Loading services...
            </div>
          ) : filteredServices.length > 0 ? filteredServices.map(service => (
            <div className="table-row" key={service._id || service.id} style={{'display': 'grid', 'gridTemplateColumns': 'repeat(5, 1fr)', 'gap': '12px', 'padding': '12px', 'borderBottom': '1px solid #eee', 'fontSize': 'clamp(12px, 3vw, 13px)', 'alignItems': 'center'}}>
              <span style={{'fontWeight': '600', 'fontSize': 'clamp(12px, 3vw, 14px)'}}>{service.title}</span>
              <span style={{'fontSize': 'clamp(11px, 3vw, 13px)', 'color': '#999'}}>{service.category}</span>
              <span style={{'fontWeight': '600'}}>₹{service.price}</span>
              <span>
                <span className={`tag ${service.active ? 'success' : 'danger'}`} style={{'fontSize': 'clamp(11px, 3vw, 12px)', 'padding': '4px 8px'}}>
                  {service.active ? "Active" : "Disabled"}
                </span>
              </span>
              <span style={{'display': 'flex', 'flexDirection': 'column', 'gap': '6px'}}>
                <button
                  className={`btn-sm ${service.active ? 'danger' : 'outline'}`}
                  onClick={() => toggleStatus(service._id || service.id)}
                  style={{'fontSize': 'clamp(11px, 3vw, 12px)', 'padding': '6px 10px', 'whiteSpace': 'nowrap'}}
                  disabled={isSubmitting}
                >
                  {service.active ? "Disable" : "Enable"}
                </button>
                <button
                  className="btn-sm outline"
                  onClick={() => setSelectedService(service)}
                  style={{'fontSize': 'clamp(11px, 3vw, 12px)', 'padding': '6px 10px', 'whiteSpace': 'nowrap'}}
                  disabled={isSubmitting}
                >
                  View
                </button>
                <button
                  className="btn-sm danger"
                  onClick={() => deleteServiceHandler(service._id || service.id)}
                  style={{'fontSize': 'clamp(11px, 3vw, 12px)', 'padding': '6px 10px', 'whiteSpace': 'nowrap'}}
                  disabled={isSubmitting}
                >
                  Delete
                </button>
              </span>
            </div>
          )) : (
            <div style={{'padding': '20px', 'textAlign': 'center', 'color': '#999'}}>
              No services found
            </div>
          )}
        </div>
      </div>

      {/* CREATE SERVICE MODAL */}
      {showCreateForm && (
        <div className="modal-backdrop" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px'}} onClick={() => setShowCreateForm(false)}>
          <div className="modal" style={{position: 'relative', maxWidth: '90vw', width: 'clamp(280px, 90vw, 500px)', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', padding: 'clamp(20px, 5vw, 30px)', maxHeight: '90vh', overflowY: 'auto'}} onClick={(e) => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <h3 style={{margin: 0, fontSize: 'clamp(18px, 5vw, 22px)'}}>Create Service</h3>
              <button
                style={{background: 'none', border: 'none', fontSize: 'clamp(20px, 5vw, 28px)', cursor: 'pointer', color: '#333', padding: '0', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                onClick={() => setShowCreateForm(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateService} style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: 'clamp(13px, 3.5vw, 15px)', color: '#333'}}>Service Name *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., AC Repair"
                  required
                  style={{width: '100%', padding: '12px 14px', border: '1.5px solid #ddd', borderRadius: '8px', fontSize: 'clamp(13px, 4vw, 16px)', boxSizing: 'border-box', fontFamily: 'inherit'}}
                />
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: 'clamp(13px, 3.5vw, 15px)', color: '#333'}}>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  style={{width: '100%', padding: '12px 14px', border: '1.5px solid #ddd', borderRadius: '8px', fontSize: 'clamp(13px, 4vw, 16px)', boxSizing: 'border-box', fontFamily: 'inherit'}}
                >
                  <option value="">Select category</option>
                  <option value="Appliances">Appliances</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Home Repair">Home Repair</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Carpentry">Carpentry</option>
                  <option value="Gardening">Gardening</option>
                </select>
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: 'clamp(13px, 3.5vw, 15px)', color: '#333'}}>Base Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="e.g., 699"
                  min="0"
                  step="100"
                  required
                  style={{width: '100%', padding: '12px 14px', border: '1.5px solid #ddd', borderRadius: '8px', fontSize: 'clamp(13px, 4vw, 16px)', boxSizing: 'border-box', fontFamily: 'inherit'}}
                />
              </div>

              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginTop: '10px'}}>
                <button
                  type="submit"
                  className="btn-sm"
                  style={{fontSize: 'clamp(13px, 3.5vw, 15px)', padding: '10px 16px'}}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Service"}
                </button>
                <button
                  type="button"
                  className="btn-sm outline"
                  onClick={() => setShowCreateForm(false)}
                  style={{fontSize: 'clamp(13px, 3.5vw, 15px)', padding: '10px 16px'}}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SERVICE DETAILS MODAL */}
      {selectedService && (
        <div className="modal-backdrop" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px'}} onClick={() => setSelectedService(null)}>
          <div className="modal" style={{position: 'relative', maxWidth: '90vw', width: 'clamp(280px, 90vw, 500px)', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', padding: 'clamp(20px, 5vw, 30px)', maxHeight: '90vh', overflowY: 'auto'}} onClick={(e) => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <h3 style={{margin: 0, fontSize: 'clamp(18px, 5vw, 22px)'}}>Service Details</h3>
              <button
                style={{background: 'none', border: 'none', fontSize: 'clamp(20px, 5vw, 28px)', cursor: 'pointer', color: '#333', padding: '0', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                onClick={() => setSelectedService(null)}
              >
                ✕
              </button>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px'}}>
                <div>
                  <p style={{fontSize: 'clamp(11px, 3vw, 12px)', color: '#999', margin: '0 0 4px 0'}}>Service Name</p>
                  <p style={{margin: 0, fontWeight: '600', fontSize: 'clamp(13px, 3.5vw, 15px)'}}>{selectedService.title}</p>
                </div>
                <div>
                  <p style={{fontSize: 'clamp(11px, 3vw, 12px)', color: '#999', margin: '0 0 4px 0'}}>Category</p>
                  <p style={{margin: 0, fontWeight: '600', fontSize: 'clamp(13px, 3.5vw, 15px)'}}>{selectedService.category}</p>
                </div>
                <div>
                  <p style={{fontSize: 'clamp(11px, 3vw, 12px)', color: '#999', margin: '0 0 4px 0'}}>Base Price</p>
                  <p style={{margin: 0, fontWeight: '600', fontSize: 'clamp(13px, 3.5vw, 15px)'}}>₹{selectedService.price}</p>
                </div>
                <div>
                  <p style={{fontSize: 'clamp(11px, 3vw, 12px)', color: '#999', margin: '0 0 4px 0'}}>Status</p>
                  <span className={`tag ${selectedService.active ? 'success' : 'danger'}`} style={{fontSize: 'clamp(11px, 3vw, 12px)', padding: '4px 8px', display: 'inline-block'}}>
                    {selectedService.active ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginTop: '10px'}}>
                <button
                  className="btn-sm outline"
                  onClick={() => setSelectedService(null)}
                  style={{fontSize: 'clamp(11px, 3vw, 13px)', padding: '8px 12px'}}
                >
                  Close
                </button>
                <button
                  className={`btn-sm ${selectedService.active ? 'danger' : 'btn-sm'}`}
                  onClick={() => {
                    toggleStatus(selectedService._id || selectedService.id);
                    setSelectedService(null);
                  }}
                  style={{fontSize: 'clamp(11px, 3vw, 13px)', padding: '8px 12px'}}
                  disabled={isSubmitting}
                >
                  {selectedService.active ? "Disable" : "Enable"}
                </button>
                <button
                  className="btn-sm danger"
                  onClick={() => {
                    deleteServiceHandler(selectedService._id || selectedService.id);
                  }}
                  style={{fontSize: 'clamp(11px, 3vw, 13px)', padding: '8px 12px'}}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
