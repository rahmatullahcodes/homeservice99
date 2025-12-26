import { useState } from "react";

export default function AdminVendors() {
  const [vendors, setVendors] = useState([
    { id: 1, name: "AC Experts", email: "acexperts@test.com", phone: "9876543210", city: "Delhi", service: "AC Repair", joinDate: "2025-02-01", status: "Active", rating: 4.8, bookings: 45 },
    { id: 2, name: "CleanPro", email: "cleanpro@test.com", phone: "9123456789", city: "Kanpur", service: "Cleaning", joinDate: "2025-02-10", status: "Pending", rating: 0, bookings: 0 },
    { id: 3, name: "Plumb Masters", email: "plumb@test.com", phone: "9988776655", city: "Noida", service: "Plumbing", joinDate: "2025-01-15", status: "Active", rating: 4.9, bookings: 62 },
    { id: 4, name: "Beauty Pro", email: "beautypro@test.com", phone: "8765432109", city: "Delhi", service: "Salon", joinDate: "2025-02-20", status: "Active", rating: 4.7, bookings: 38 },
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    service: "",
  });

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleCreateVendor(e) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.city || !formData.service) {
      alert("Please fill all fields");
      return;
    }

    const newVendor = {
      id: vendors.length + 1,
      ...formData,
      joinDate: new Date().toISOString().split('T')[0],
      status: "Active",
      rating: 0,
      bookings: 0
    };

    setVendors([...vendors, newVendor]);
    setFormData({ name: "", email: "", phone: "", city: "", service: "" });
    setShowCreateForm(false);
    alert("Vendor account created successfully!");
  }

  function updateStatus(id, status) {
    setVendors(vendors.map(v =>
      v.id === id ? { ...v, status } : v
    ));
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

      {/* STATS */}
      <div className="admin-kpi-grid">
        <div className="kpi-card">
          <span>Total Vendors</span>
          <h3>{stats.total}</h3>
          <small className="positive">+4 this month</small>
        </div>
        <div className="kpi-card">
          <span>Active Vendors</span>
          <h3>{stats.active}</h3>
          <small className="positive">{Math.round((stats.active/stats.total)*100)}% active</small>
        </div>
        <div className="kpi-card">
          <span>Total Bookings</span>
          <h3>{stats.totalBookings}</h3>
          <small className="positive">Avg: {(stats.totalBookings/stats.total).toFixed(1)}/vendor</small>
        </div>
        <div className="kpi-card">
          <span>Avg Rating</span>
          <h3>⭐ {stats.avgRating}</h3>
          <small className="positive">From {vendors.filter(v => v.rating > 0).length} vendors</small>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="admin-section" style={{display: 'flex', gap: '16px', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap'}}>
        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
          {['All', 'Active', 'Pending', 'Rejected'].map(status => (
            <button
              key={status}
              className={`btn-sm ${filterStatus === status ? '' : 'outline'}`}
              onClick={() => setFilterStatus(status)}
              style={{cursor: 'pointer'}}
            >
              {status} ({vendors.filter(v => status === 'All' ? true : v.status === status).length})
            </button>
          ))}
        </div>
        <button className="btn-sm" onClick={() => setShowCreateForm(true)}>
          + Create Vendor
        </button>
      </div>

      {/* SEARCH */}
      <div className="admin-section">
        <div className="admin-search" style={{maxWidth: '350px'}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* VENDORS TABLE */}
      <div className="admin-section">
        <div className="admin-table">
          <div className="table-row head">
            <span>Name</span>
            <span>Service</span>
            <span>Contact</span>
            <span>Joined</span>
            <span>Status</span>
            <span>Rating</span>
            <span>Bookings</span>
            <span>Action</span>
          </div>

          {sortedVendors.length > 0 ? sortedVendors.map(v => (
            <div className="table-row" key={v.id}>
              <span style={{fontWeight: '600'}}>{v.name}</span>
              <span style={{fontSize: '13px', color: 'var(--admin-muted)'}}>{v.service}</span>
              <span style={{fontSize: '13px'}}>
                <div>{v.city}</div>
                <div style={{color: 'var(--admin-muted)', fontSize: '12px'}}>{v.phone}</div>
              </span>
              <span style={{fontSize: '13px', color: 'var(--admin-muted)'}}>
                {new Date(v.joinDate).toLocaleDateString('en-IN', { year: '2-digit', month: 'short', day: 'numeric' })}
              </span>
              <span>
                <span className={`tag ${v.status === 'Active' ? 'success' : v.status === 'Pending' ? 'pending' : 'danger'}`}>
                  {v.status}
                </span>
              </span>
              <span>{v.rating > 0 ? `⭐ ${v.rating}` : 'N/A'}</span>
              <span style={{fontWeight: '600'}}>{v.bookings}</span>
              <span>
                <button
                  className="btn-sm outline"
                  onClick={() => setSelectedVendor(v)}
                  style={{fontSize: '12px', padding: '6px 12px'}}
                >
                  View
                </button>
                {v.status === "Pending" && (
                  <>
                    <button
                      className="btn-sm"
                      onClick={() => updateStatus(v.id, "Active")}
                      style={{fontSize: '12px', padding: '6px 10px', marginLeft: '4px'}}
                    >
                      Approve
                    </button>
                    <button
                      className="btn-sm danger"
                      onClick={() => updateStatus(v.id, "Rejected")}
                      style={{fontSize: '12px', padding: '6px 10px', marginLeft: '4px'}}
                    >
                      Reject
                    </button>
                  </>
                )}
              </span>
            </div>
          )) : (
            <div style={{padding: '20px', textAlign: 'center', color: 'var(--admin-muted)'}}>
              No vendors found
            </div>
          )}
        </div>
      </div>

      {/* CREATE VENDOR MODAL */}
      {showCreateForm && (
        <div className="modal-backdrop" onClick={() => setShowCreateForm(false)}>
          <div className="modal" style={{maxWidth: '500px'}} onClick={(e) => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <h3 style={{margin: 0}}>Create Vendor Account</h3>
              <button
                style={{background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--admin-text)'}}
                onClick={() => setShowCreateForm(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVendor} style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>Vendor Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter vendor name"
                  style={{width: '100%', padding: '10px 12px', border: '1.5px solid var(--admin-border)', borderRadius: '8px', fontSize: '14px'}}
                />
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  style={{width: '100%', padding: '10px 12px', border: '1.5px solid var(--admin-border)', borderRadius: '8px', fontSize: '14px'}}
                />
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit phone number"
                  style={{width: '100%', padding: '10px 12px', border: '1.5px solid var(--admin-border)', borderRadius: '8px', fontSize: '14px'}}
                />
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>City *</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  style={{width: '100%', padding: '10px 12px', border: '1.5px solid var(--admin-border)', borderRadius: '8px', fontSize: '14px'}}
                >
                  <option value="">Select city</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Noida">Noida</option>
                  <option value="Ghaziabad">Ghaziabad</option>
                  <option value="Kanpur">Kanpur</option>
                </select>
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>Service Category *</label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleInputChange}
                  style={{width: '100%', padding: '10px 12px', border: '1.5px solid var(--admin-border)', borderRadius: '8px', fontSize: '14px'}}
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

              <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                <button
                  type="submit"
                  className="btn-sm"
                  style={{flex: 1}}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  className="btn-sm outline"
                  onClick={() => setShowCreateForm(false)}
                  style={{flex: 1}}
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
        <div className="modal-backdrop" onClick={() => setSelectedVendor(null)}>
          <div className="modal" style={{maxWidth: '500px'}} onClick={(e) => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <h3 style={{margin: 0}}>Vendor Details</h3>
              <button
                style={{background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--admin-text)'}}
                onClick={() => setSelectedVendor(null)}
              >
                ✕
              </button>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                <div>
                  <p style={{fontSize: '12px', color: 'var(--admin-muted)', margin: '0 0 4px 0'}}>Vendor Name</p>
                  <p style={{margin: 0, fontWeight: '600'}}>{selectedVendor.name}</p>
                </div>
                <div>
                  <p style={{fontSize: '12px', color: 'var(--admin-muted)', margin: '0 0 4px 0'}}>Service</p>
                  <p style={{margin: 0, fontWeight: '600'}}>{selectedVendor.service}</p>
                </div>
                <div>
                  <p style={{fontSize: '12px', color: 'var(--admin-muted)', margin: '0 0 4px 0'}}>Email</p>
                  <p style={{margin: 0, fontWeight: '600', fontSize: '14px'}}>{selectedVendor.email}</p>
                </div>
                <div>
                  <p style={{fontSize: '12px', color: 'var(--admin-muted)', margin: '0 0 4px 0'}}>Phone</p>
                  <p style={{margin: 0, fontWeight: '600'}}>{selectedVendor.phone}</p>
                </div>
                <div>
                  <p style={{fontSize: '12px', color: 'var(--admin-muted)', margin: '0 0 4px 0'}}>City</p>
                  <p style={{margin: 0, fontWeight: '600'}}>{selectedVendor.city}</p>
                </div>
                <div>
                  <p style={{fontSize: '12px', color: 'var(--admin-muted)', margin: '0 0 4px 0'}}>Joined Date</p>
                  <p style={{margin: 0, fontWeight: '600'}}>
                    {new Date(selectedVendor.joinDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p style={{fontSize: '12px', color: 'var(--admin-muted)', margin: '0 0 4px 0'}}>Status</p>
                  <span className={`tag ${selectedVendor.status === 'Active' ? 'success' : selectedVendor.status === 'Pending' ? 'pending' : 'danger'}`}>
                    {selectedVendor.status}
                  </span>
                </div>
                <div>
                  <p style={{fontSize: '12px', color: 'var(--admin-muted)', margin: '0 0 4px 0'}}>Rating</p>
                  <p style={{margin: 0, fontWeight: '600'}}>{selectedVendor.rating > 0 ? `⭐ ${selectedVendor.rating}` : 'N/A'}</p>
                </div>
                <div>
                  <p style={{fontSize: '12px', color: 'var(--admin-muted)', margin: '0 0 4px 0'}}>Total Bookings</p>
                  <p style={{margin: 0, fontWeight: '600'}}>{selectedVendor.bookings}</p>
                </div>
              </div>

              <button
                className="btn-sm outline"
                onClick={() => setSelectedVendor(null)}
                style={{marginTop: '10px'}}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
