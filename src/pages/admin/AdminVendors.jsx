import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../config/api";

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showVendorLogin, setShowVendorLogin] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [vendorLoginEmail, setVendorLoginEmail] = useState("");
  const [vendorLoginPass, setVendorLoginPass] = useState("");
  const [vendorLoginError, setVendorLoginError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    service: "",
    password: "",
  });

  // Fetch vendors from backend
  useEffect(() => {
    fetchVendors();
  }, []);

  async function fetchVendors() {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        setError("Admin authentication required. Please login first.");
        setLoading(false);
        return;
      }

      const response = await fetch(API_ENDPOINTS.ADMIN.GET_VENDORS, {
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

      // Transform backend data for UI
      const transformedVendors = data.map(vendor => ({
        ...vendor,
        _id: vendor._id || vendor.id,
        name: vendor.name || vendor.businessName,
        service: vendor.service || vendor.category || "N/A",
        status: vendor.status || "Pending",
        rating: vendor.rating || vendor.averageRating || 0,
        bookings: vendor.totalBookings || 0,
        joinDate: vendor.createdAt ? new Date(vendor.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      }));
      setVendors(transformedVendors);
    } catch (err) {
      console.error("Error fetching vendors:", err);
      setError(err.message || "Failed to load vendors. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleCreateVendor(e) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.city || !formData.service || !formData.password) {
      alert("Please fill all fields including password");
      return;
    }

    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        return;
      }

      const response = await fetch(API_ENDPOINTS.ADMIN.CREATE_VENDOR, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          service: formData.service,
          password: formData.password,
          category: formData.service
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create vendor");
      }

      const newVendor = await response.json();
      const transformedVendor = {
        ...newVendor,
        _id: newVendor._id || newVendor.id,
        name: newVendor.name || newVendor.businessName,
        service: newVendor.service || newVendor.category || "N/A",
        status: newVendor.status || "Active",
        rating: newVendor.rating || 0,
        bookings: newVendor.totalBookings || 0,
        joinDate: new Date().toISOString().split('T')[0]
      };
      setVendors([transformedVendor, ...vendors]);
      setFormData({ name: "", email: "", phone: "", city: "", service: "", password: "" });
      setShowCreateForm(false);
      alert("Vendor account created successfully!");
    } catch (err) {
      console.error("Error creating vendor:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        return;
      }

      const response = await fetch(API_ENDPOINTS.ADMIN.UPDATE_VENDOR_STATUS(id), {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error("Failed to update vendor status");
      }

      const updatedVendor = await response.json();
      setVendors(vendors.map(v =>
        (v._id === id || v.id === id)
          ? { 
              ...v, 
              status: updatedVendor.status,
              verified: updatedVendor.verified
            }
          : v
      ));
      
      // Update selected vendor if viewing
      if (selectedVendor && (selectedVendor._id === id || selectedVendor.id === id)) {
        setSelectedVendor({
          ...selectedVendor,
          status: updatedVendor.status
        });
      }
    } catch (err) {
      console.error("Error updating vendor status:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteVendorHandler(id) {
    if (!window.confirm("Are you sure you want to delete this vendor?")) {
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        return;
      }

      const response = await fetch(API_ENDPOINTS.ADMIN.DELETE_VENDOR(id), {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete vendor");
      }

      setVendors(vendors.filter(v => v._id !== id && v.id !== id));
      setSelectedVendor(null);
      alert("Vendor deleted successfully!");
    } catch (err) {
      console.error("Error deleting vendor:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVendorLogin(e) {
    e.preventDefault();
    if (!vendorLoginEmail || !vendorLoginPass) {
      setVendorLoginError("All fields required");
      return;
    }

    try {
      setVendorLoginError("");
      const response = await fetch(API_ENDPOINTS.VENDOR_AUTH.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: vendorLoginEmail,
          password: vendorLoginPass,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setVendorLoginError(data.message || "Invalid vendor credentials");
        return;
      }

      // Store vendor token and info
      localStorage.setItem("vendorToken", data.token);
      localStorage.setItem("vendorUser", JSON.stringify(data.vendor || data.data));
      localStorage.setItem("vendor", "true");

      alert("Vendor logged in successfully!");
      setShowVendorLogin(false);
      setVendorLoginEmail("");
      setVendorLoginPass("");
    } catch (err) {
      console.error("Vendor login error:", err);
      setVendorLoginError("Connection error. Please check if backend is running.");
    }
  }

  const filteredVendors = vendors.filter(v => {
    const matchesStatus = filterStatus === "All" || v.status === filterStatus;
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         v.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: vendors.length,
    active: vendors.filter(v => v.status === "Active").length,
    pending: vendors.filter(v => v.status === "Pending").length,
    totalBookings: vendors.reduce((sum, v) => sum + v.bookings, 0),
    avgRating: (vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.filter(v => v.rating > 0).length).toFixed(1)
  };

  // Sort by date - newest first
  const sortedVendors = [...filteredVendors].sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));

  return (
    <div className="admin-page">

      {/* PAGE HEADER */}
      <div className="admin-page-head">
        <h2>Vendors Management</h2>
        <p className="admin-subtitle">Manage partner vendors and approvals</p>
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
            onClick={fetchVendors}
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
          <span style={{fontSize: 'clamp(12px, 3vw, 14px)', color: '#666', display: 'block', marginBottom: '8px'}}>Total Vendors</span>
          <h3 style={{fontSize: 'clamp(24px, 6vw, 32px)', margin: '8px 0'}}>{stats.total}</h3>
          <small className="positive" style={{fontSize: 'clamp(11px, 3vw, 12px)', color: '#28a745'}}>+4 this month</small>
        </div>
        <div className="kpi-card" style={{padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee'}}>
          <span style={{fontSize: 'clamp(12px, 3vw, 14px)', color: '#666', display: 'block', marginBottom: '8px'}}>Active Vendors</span>
          <h3 style={{fontSize: 'clamp(24px, 6vw, 32px)', margin: '8px 0'}}>{stats.active}</h3>
          <small className="positive" style={{fontSize: 'clamp(11px, 3vw, 12px)', color: '#28a745'}}>{Math.round((stats.active/stats.total)*100)}% active</small>
        </div>
        <div className="kpi-card" style={{padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee'}}>
          <span style={{fontSize: 'clamp(12px, 3vw, 14px)', color: '#666', display: 'block', marginBottom: '8px'}}>Total Bookings</span>
          <h3 style={{fontSize: 'clamp(24px, 6vw, 32px)', margin: '8px 0'}}>{stats.totalBookings}</h3>
          <small className="positive" style={{fontSize: 'clamp(11px, 3vw, 12px)', color: '#28a745'}}>Avg: {(stats.totalBookings/stats.total).toFixed(1)}/vendor</small>
        </div>
        <div className="kpi-card" style={{padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee'}}>
          <span style={{fontSize: 'clamp(12px, 3vw, 14px)', color: '#666', display: 'block', marginBottom: '8px'}}>Avg Rating</span>
          <h3 style={{fontSize: 'clamp(24px, 6vw, 32px)', margin: '8px 0'}}>⭐ {stats.avgRating}</h3>
          <small className="positive" style={{fontSize: 'clamp(11px, 3vw, 12px)', color: '#28a745'}}>From {vendors.filter(v => v.rating > 0).length} vendors</small>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="admin-section" style={{display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', alignItems: 'start'}}>
        <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap', gridColumn: 'auto'}}>
          {['All', 'Active', 'Pending', 'Rejected'].map(status => (
            <button
              key={status}
              className={`btn-sm ${filterStatus === status ? '' : 'outline'}`}
              onClick={() => setFilterStatus(status)}
              style={{cursor: 'pointer', fontSize: 'clamp(11px, 3vw, 13px)', padding: '6px 10px'}}
            >
              {status} ({vendors.filter(v => status === 'All' ? true : v.status === status).length})
            </button>
          ))}
        </div>
        <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end', gridColumn: 'auto', flexWrap: 'wrap'}}>
          <button className="btn-sm outline" onClick={() => setShowVendorLogin(true)} style={{fontSize: 'clamp(11px, 3vw, 13px)', padding: '8px 14px', whiteSpace: 'nowrap'}}>
            🔐 Vendor Login
          </button>
          <button className="btn-sm" onClick={() => setShowCreateForm(true)} style={{fontSize: 'clamp(11px, 3vw, 13px)', padding: '8px 14px', whiteSpace: 'nowrap'}}>
            + Create Vendor
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="admin-section">
        <div className="admin-search" style={{maxWidth: '100%', width: 'clamp(200px, 100%, 500px)'}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{fontSize: 'clamp(13px, 4vw, 15px)'}}
          />
        </div>
      </div>

      {/* VENDORS TABLE */}
      <div className="admin-section" style={{'overflowX': 'auto'}}>
        <div className="admin-table" style={{'minWidth': '800px'}}>
          <div className="table-row head" style={{'display': 'grid', 'gridTemplateColumns': 'repeat(8, 1fr)', 'gap': '12px', 'padding': '12px', 'backgroundColor': '#f5f5f5', 'fontWeight': '600', 'fontSize': 'clamp(12px, 3vw, 14px)'}}>
            <span>Name</span>
            <span>Service</span>
            <span>Contact</span>
            <span>Joined</span>
            <span>Status</span>
            <span>Rating</span>
            <span>Bookings</span>
            <span>Action</span>
          </div>

          {loading ? (
            <div style={{'padding': '20px', 'textAlign': 'center', 'color': '#999'}}>
              Loading vendors...
            </div>
          ) : sortedVendors.length > 0 ? sortedVendors.map(v => (
            <div className="table-row" key={v._id || v.id} style={{'display': 'grid', 'gridTemplateColumns': 'repeat(8, 1fr)', 'gap': '12px', 'padding': '12px', 'borderBottom': '1px solid #eee', 'fontSize': 'clamp(12px, 3vw, 13px)', 'alignItems': 'center'}}>
              <span style={{'fontWeight': '600', 'fontSize': 'clamp(12px, 3vw, 14px)'}}>{v.name}</span>
              <span style={{'fontSize': 'clamp(11px, 3vw, 13px)', 'color': '#999'}}>{v.service}</span>
              <span style={{'fontSize': 'clamp(11px, 3vw, 12px)'}}>
                <div>{v.city}</div>
                <div style={{'color': '#999', 'fontSize': 'clamp(10px, 2.5vw, 11px)'}}>{v.phone}</div>
              </span>
              <span style={{'fontSize': 'clamp(11px, 3vw, 12px)', 'color': '#999'}}>
                {new Date(v.joinDate).toLocaleDateString('en-IN', { year: '2-digit', month: 'short', day: 'numeric' })}
              </span>
              <span>
                <span className={`tag ${v.status === 'Active' ? 'success' : v.status === 'Pending' ? 'pending' : 'danger'}`} style={{'fontSize': 'clamp(11px, 3vw, 12px)', 'padding': '4px 8px'}}>
                  {v.status}
                </span>
              </span>
              <span>{v.rating > 0 ? `⭐ ${v.rating}` : 'N/A'}</span>
              <span style={{'fontWeight': '600'}}>{v.bookings}</span>
              <span style={{'display': 'flex', 'flexDirection': 'column', 'gap': '6px'}}>
                <button
                  className="btn-sm outline"
                  onClick={() => setSelectedVendor(v)}
                  style={{'fontSize': 'clamp(11px, 3vw, 12px)', 'padding': '6px 10px', 'whiteSpace': 'nowrap'}}
                  disabled={isSubmitting}
                >
                  View
                </button>
                {v.status === "Pending" && (
                  <>
                    <button
                      className="btn-sm"
                      onClick={() => updateStatus(v._id || v.id, "Active")}
                      style={{'fontSize': 'clamp(11px, 3vw, 12px)', 'padding': '6px 8px', 'whiteSpace': 'nowrap'}}
                      disabled={isSubmitting}
                    >
                      Approve
                    </button>
                    <button
                      className="btn-sm danger"
                      onClick={() => updateStatus(v._id || v.id, "Rejected")}
                      style={{'fontSize': 'clamp(11px, 3vw, 12px)', 'padding': '6px 8px', 'whiteSpace': 'nowrap'}}
                      disabled={isSubmitting}
                    >
                      Reject
                    </button>
                  </>
                )}
              </span>
            </div>
          )) : (
            <div style={{'padding': '20px', 'textAlign': 'center', 'color': '#999'}}>
              No vendors found
            </div>
          )}
        </div>
      </div>

      {/* CREATE VENDOR MODAL */}
      {showCreateForm && (
        <div 
          className="modal-backdrop" 
          onClick={() => setShowCreateForm(false)}
          style={{'position': 'fixed', 'top': 0, 'left': 0, 'right': 0, 'bottom': 0, 'backgroundColor': 'rgba(0,0,0,0.5)', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'zIndex': 1000, 'padding': '16px', 'overflow': 'auto'}}
        >
          <div 
            className="modal" 
            onClick={(e) => e.stopPropagation()}
            style={{'backgroundColor': 'white', 'borderRadius': '12px', 'padding': '24px', 'width': '100%', 'maxWidth': '90vw', 'maxHeight': '90vh', 'overflowY': 'auto', 'boxShadow': '0 10px 40px rgba(0,0,0,0.2)'}}
          >
            <div style={{'display': 'flex', 'justifyContent': 'space-between', 'alignItems': 'center', 'marginBottom': '24px', 'borderBottom': '1px solid #eee', 'paddingBottom': '16px'}}>
              <h3 style={{'margin': 0, 'fontSize': 'clamp(18px, 5vw, 22px)', 'color': '#333'}}>Create Vendor Account</h3>
              <button
                style={{'background': 'none', 'border': 'none', 'fontSize': '28px', 'cursor': 'pointer', 'color': '#666', 'padding': '4px 8px', 'lineHeight': 1}}
                onClick={() => setShowCreateForm(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVendor} style={{'display': 'flex', 'flexDirection': 'column', 'gap': '18px'}}>
              <div>
                <label style={{'display': 'block', 'marginBottom': '8px', 'fontWeight': '600', 'fontSize': '14px', 'color': '#333'}}>Vendor Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter vendor name"
                  required
                  style={{'width': '100%', 'padding': '12px 14px', 'border': '1.5px solid #ddd', 'borderRadius': '8px', 'fontSize': 'clamp(13px, 4vw, 16px)', 'fontFamily': 'inherit', 'boxSizing': 'border-box', 'outline': 'none'}}
                />
              </div>

              <div>
                <label style={{'display': 'block', 'marginBottom': '8px', 'fontWeight': '600', 'fontSize': '14px', 'color': '#333'}}>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  required
                  style={{'width': '100%', 'padding': '12px 14px', 'border': '1.5px solid #ddd', 'borderRadius': '8px', 'fontSize': 'clamp(13px, 4vw, 16px)', 'fontFamily': 'inherit', 'boxSizing': 'border-box', 'outline': 'none'}}
                />
              </div>

              <div>
                <label style={{'display': 'block', 'marginBottom': '8px', 'fontWeight': '600', 'fontSize': '14px', 'color': '#333'}}>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit phone number"
                  required
                  pattern="[0-9]{10}"
                  style={{'width': '100%', 'padding': '12px 14px', 'border': '1.5px solid #ddd', 'borderRadius': '8px', 'fontSize': 'clamp(13px, 4vw, 16px)', 'fontFamily': 'inherit', 'boxSizing': 'border-box', 'outline': 'none'}}
                />
              </div>

              <div>
                <label style={{'display': 'block', 'marginBottom': '8px', 'fontWeight': '600', 'fontSize': '14px', 'color': '#333'}}>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password (min 6 characters)"
                  required
                  minLength="6"
                  style={{'width': '100%', 'padding': '12px 14px', 'border': '1.5px solid #ddd', 'borderRadius': '8px', 'fontSize': 'clamp(13px, 4vw, 16px)', 'fontFamily': 'inherit', 'boxSizing': 'border-box', 'outline': 'none'}}
                />
              </div>

              <div style={{'display': 'grid', 'gridTemplateColumns': 'repeat(auto-fit, minmax(200px, 1fr))', 'gap': '14px'}}>
                <div>
                  <label style={{'display': 'block', 'marginBottom': '8px', 'fontWeight': '600', 'fontSize': '14px', 'color': '#333'}}>City *</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    style={{'width': '100%', 'padding': '12px 14px', 'border': '1.5px solid #ddd', 'borderRadius': '8px', 'fontSize': 'clamp(13px, 4vw, 16px)', 'fontFamily': 'inherit', 'boxSizing': 'border-box', 'outline': 'none', 'cursor': 'pointer'}}
                  >
                    <option value="">Select city</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Noida">Noida</option>
                    <option value="Ghaziabad">Ghaziabad</option>
                    <option value="Kanpur">Kanpur</option>
                  </select>
                </div>

                <div>
                  <label style={{'display': 'block', 'marginBottom': '8px', 'fontWeight': '600', 'fontSize': '14px', 'color': '#333'}}>Service Category *</label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    required
                    style={{'width': '100%', 'padding': '12px 14px', 'border': '1.5px solid #ddd', 'borderRadius': '8px', 'fontSize': 'clamp(13px, 4vw, 16px)', 'fontFamily': 'inherit', 'boxSizing': 'border-box', 'outline': 'none', 'cursor': 'pointer'}}
                  >
                    <option value="">Select service</option>
                    <option value="AC Repair">AC Repair</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Salon">Salon</option>
                    <option value="Painting">Painting</option>
                    <option value="Carpentry">Carpentry</option>
                  </select>
                </div>
              </div>

              <div style={{'display': 'grid', 'gridTemplateColumns': 'repeat(auto-fit, minmax(120px, 1fr))', 'gap': '12px', 'marginTop': '16px', 'paddingTop': '20px', 'borderTop': '1px solid #eee'}}>
                <button
                  type="submit"
                  className="btn-sm"
                  disabled={isSubmitting}
                  style={{'padding': '12px 16px', 'fontSize': 'clamp(13px, 4vw, 16px)', 'fontWeight': '600', 'backgroundColor': isSubmitting ? '#ccc' : '#007bff', 'color': 'white', 'border': 'none', 'borderRadius': '8px', 'cursor': isSubmitting ? 'not-allowed' : 'pointer', 'transition': 'background-color 0.2s', 'opacity': isSubmitting ? 0.7 : 1}}
                >
                  {isSubmitting ? "Creating..." : "Create Account"}
                </button>
                <button
                  type="button"
                  className="btn-sm outline"
                  onClick={() => setShowCreateForm(false)}
                  disabled={isSubmitting}
                  style={{'padding': '12px 16px', 'fontSize': 'clamp(13px, 4vw, 16px)', 'fontWeight': '600', 'backgroundColor': 'white', 'color': '#666', 'border': '1.5px solid #ddd', 'borderRadius': '8px', 'cursor': isSubmitting ? 'not-allowed' : 'pointer', 'transition': 'all 0.2s', 'opacity': isSubmitting ? 0.7 : 1}}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VENDOR DETAILS MODAL */}
      {selectedVendor && (
        <div 
          className="modal-backdrop" 
          onClick={() => setSelectedVendor(null)}
          style={{'position': 'fixed', 'top': 0, 'left': 0, 'right': 0, 'bottom': 0, 'backgroundColor': 'rgba(0,0,0,0.5)', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'zIndex': 1000, 'padding': '16px', 'overflow': 'auto'}}
        >
          <div 
            className="modal" 
            onClick={(e) => e.stopPropagation()}
            style={{'backgroundColor': 'white', 'borderRadius': '12px', 'padding': '24px', 'width': '100%', 'maxWidth': 'min(90vw, 500px)', 'maxHeight': '90vh', 'overflowY': 'auto', 'boxShadow': '0 10px 40px rgba(0,0,0,0.2)'}}
          >
            <div style={{'display': 'flex', 'justifyContent': 'space-between', 'alignItems': 'center', 'marginBottom': '24px', 'borderBottom': '1px solid #eee', 'paddingBottom': '16px'}}>
              <h3 style={{'margin': 0, 'fontSize': 'clamp(18px, 5vw, 22px)', 'color': '#333'}}>Vendor Details</h3>
              <button
                style={{'background': 'none', 'border': 'none', 'fontSize': '28px', 'cursor': 'pointer', 'color': '#666', 'padding': '4px 8px', 'lineHeight': 1}}
                onClick={() => setSelectedVendor(null)}
              >
                ✕
              </button>
            </div>

            <div style={{'display': 'flex', 'flexDirection': 'column', 'gap': '14px'}}>
              <div style={{'display': 'grid', 'gridTemplateColumns': 'repeat(auto-fit, minmax(200px, 1fr))', 'gap': '16px'}}>
                <div>
                  <p style={{'fontSize': '12px', 'color': '#999', 'margin': '0 0 6px 0', 'fontWeight': '500'}}>Vendor Name</p>
                  <p style={{'margin': 0, 'fontWeight': '600', 'fontSize': '14px', 'color': '#333'}}>{selectedVendor.name}</p>
                </div>
                <div>
                  <p style={{'fontSize': '12px', 'color': '#999', 'margin': '0 0 6px 0', 'fontWeight': '500'}}>Service</p>
                  <p style={{'margin': 0, 'fontWeight': '600', 'fontSize': '14px', 'color': '#333'}}>{selectedVendor.service}</p>
                </div>
                <div>
                  <p style={{'fontSize': '12px', 'color': '#999', 'margin': '0 0 6px 0', 'fontWeight': '500'}}>Email</p>
                  <p style={{'margin': 0, 'fontWeight': '600', 'fontSize': '14px', 'color': '#333', 'wordBreak': 'break-all'}}>{selectedVendor.email}</p>
                </div>
                <div>
                  <p style={{'fontSize': '12px', 'color': '#999', 'margin': '0 0 6px 0', 'fontWeight': '500'}}>Phone</p>
                  <p style={{'margin': 0, 'fontWeight': '600', 'fontSize': '14px', 'color': '#333'}}>{selectedVendor.phone}</p>
                </div>
                <div>
                  <p style={{'fontSize': '12px', 'color': '#999', 'margin': '0 0 6px 0', 'fontWeight': '500'}}>City</p>
                  <p style={{'margin': 0, 'fontWeight': '600', 'fontSize': '14px', 'color': '#333'}}>{selectedVendor.city}</p>
                </div>
                <div>
                  <p style={{'fontSize': '12px', 'color': '#999', 'margin': '0 0 6px 0', 'fontWeight': '500'}}>Joined Date</p>
                  <p style={{'margin': 0, 'fontWeight': '600', 'fontSize': '14px', 'color': '#333'}}>
                    {new Date(selectedVendor.joinDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p style={{'fontSize': '12px', 'color': '#999', 'margin': '0 0 6px 0', 'fontWeight': '500'}}>Status</p>
                  <span className={`tag ${selectedVendor.status === 'Active' ? 'success' : selectedVendor.status === 'Pending' ? 'pending' : 'danger'}`} style={{'fontSize': '13px', 'padding': '4px 8px', 'borderRadius': '6px'}}>
                    {selectedVendor.status}
                  </span>
                </div>
                <div>
                  <p style={{'fontSize': '12px', 'color': '#999', 'margin': '0 0 6px 0', 'fontWeight': '500'}}>Rating</p>
                  <p style={{'margin': 0, 'fontWeight': '600', 'fontSize': '14px', 'color': '#333'}}>{selectedVendor.rating > 0 ? `⭐ ${selectedVendor.rating}` : 'N/A'}</p>
                </div>
                <div>
                  <p style={{'fontSize': '12px', 'color': '#999', 'margin': '0 0 6px 0', 'fontWeight': '500'}}>Total Bookings</p>
                  <p style={{'margin': 0, 'fontWeight': '600', 'fontSize': '14px', 'color': '#333'}}>{selectedVendor.bookings}</p>
                </div>
              </div>

              <div style={{'display': 'grid', 'gridTemplateColumns': 'repeat(auto-fit, minmax(100px, 1fr))', 'gap': '12px', 'marginTop': '20px', 'paddingTop': '20px', 'borderTop': '1px solid #eee'}}>
                <button
                  className="btn-sm outline"
                  onClick={() => setSelectedVendor(null)}
                  style={{'padding': '10px 16px', 'fontSize': 'clamp(13px, 4vw, 14px)', 'fontWeight': '600', 'backgroundColor': 'white', 'color': '#666', 'border': '1.5px solid #ddd', 'borderRadius': '8px', 'cursor': 'pointer', 'transition': 'all 0.2s'}}
                >
                  Close
                </button>
                <button
                  className="btn-sm danger"
                  onClick={() => {
                    deleteVendorHandler(selectedVendor._id || selectedVendor.id);
                  }}
                  disabled={isSubmitting}
                  style={{'padding': '10px 16px', 'fontSize': 'clamp(13px, 4vw, 14px)', 'fontWeight': '600', 'backgroundColor': isSubmitting ? '#ccc' : '#dc3545', 'color': 'white', 'border': 'none', 'borderRadius': '8px', 'cursor': isSubmitting ? 'not-allowed' : 'pointer', 'transition': 'background-color 0.2s', 'opacity': isSubmitting ? 0.7 : 1}}
                >
                  {isSubmitting ? "Deleting..." : "Delete Vendor"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VENDOR LOGIN MODAL */}
      {showVendorLogin && (
        <div
          className="modal-backdrop"
          onClick={() => setShowVendorLogin(false)}
          style={{'position': 'fixed', 'top': 0, 'left': 0, 'right': 0, 'bottom': 0, 'backgroundColor': 'rgba(0,0,0,0.5)', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'zIndex': 1000, 'padding': '16px', 'overflow': 'auto'}}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{'backgroundColor': 'white', 'borderRadius': '12px', 'padding': '24px', 'width': '100%', 'maxWidth': 'min(90vw, 450px)', 'maxHeight': '90vh', 'overflowY': 'auto', 'boxShadow': '0 10px 40px rgba(0,0,0,0.2)'}}
          >
            <div style={{'display': 'flex', 'justifyContent': 'space-between', 'alignItems': 'center', 'marginBottom': '24px', 'borderBottom': '1px solid #eee', 'paddingBottom': '16px'}}>
              <h3 style={{'margin': 0, 'fontSize': 'clamp(18px, 5vw, 22px)', 'color': '#333'}}>Vendor Login</h3>
              <button
                style={{'background': 'none', 'border': 'none', 'fontSize': '28px', 'cursor': 'pointer', 'color': '#666', 'padding': '4px 8px', 'lineHeight': 1}}
                onClick={() => setShowVendorLogin(false)}
              >
                ✕
              </button>
            </div>

            {vendorLoginError && (
              <div style={{
                backgroundColor: '#fee',
                border: '1px solid #ffcccc',
                color: '#c33',
                padding: '12px 14px',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                {vendorLoginError}
              </div>
            )}

            <form onSubmit={handleVendorLogin} style={{'display': 'flex', 'flexDirection': 'column', 'gap': '18px'}}>
              <div>
                <label style={{'display': 'block', 'marginBottom': '8px', 'fontWeight': '600', 'fontSize': '14px', 'color': '#333'}}>Email Address *</label>
                <input
                  type="email"
                  value={vendorLoginEmail}
                  onChange={(e) => setVendorLoginEmail(e.target.value)}
                  placeholder="Enter vendor email"
                  required
                  style={{'width': '100%', 'padding': '12px 14px', 'border': '1.5px solid #ddd', 'borderRadius': '8px', 'fontSize': 'clamp(13px, 4vw, 16px)', 'fontFamily': 'inherit', 'boxSizing': 'border-box', 'outline': 'none'}}
                />
              </div>

              <div>
                <label style={{'display': 'block', 'marginBottom': '8px', 'fontWeight': '600', 'fontSize': '14px', 'color': '#333'}}>Password *</label>
                <input
                  type="password"
                  value={vendorLoginPass}
                  onChange={(e) => setVendorLoginPass(e.target.value)}
                  placeholder="Enter password"
                  required
                  style={{'width': '100%', 'padding': '12px 14px', 'border': '1.5px solid #ddd', 'borderRadius': '8px', 'fontSize': 'clamp(13px, 4vw, 16px)', 'fontFamily': 'inherit', 'boxSizing': 'border-box', 'outline': 'none'}}
                />
              </div>

              <div style={{
                backgroundColor: '#f0f6ff',
                border: '1px solid #d0e8ff',
                padding: '12px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#555',
                marginTop: '8px'
              }}>
                <strong>Demo credentials:</strong><br/>
                Email: <code style={{'backgroundColor': '#fff', 'padding': '2px 6px', 'borderRadius': '3px'}}>vendor@demo.com</code><br/>
                Password: <code style={{'backgroundColor': '#fff', 'padding': '2px 6px', 'borderRadius': '3px'}}>123456</code>
              </div>

              <div style={{'display': 'grid', 'gridTemplateColumns': 'repeat(auto-fit, minmax(120px, 1fr))', 'gap': '12px', 'marginTop': '16px', 'paddingTop': '20px', 'borderTop': '1px solid #eee'}}>
                <button
                  type="submit"
                  style={{'padding': '12px 16px', 'fontSize': 'clamp(13px, 4vw, 16px)', 'fontWeight': '600', 'backgroundColor': '#007bff', 'color': 'white', 'border': 'none', 'borderRadius': '8px', 'cursor': 'pointer', 'transition': 'background-color 0.2s'}}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setShowVendorLogin(false)}
                  style={{'padding': '12px 16px', 'fontSize': 'clamp(13px, 4vw, 16px)', 'fontWeight': '600', 'backgroundColor': 'white', 'color': '#666', 'border': '1.5px solid #ddd', 'borderRadius': '8px', 'cursor': 'pointer', 'transition': 'all 0.2s'}}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
