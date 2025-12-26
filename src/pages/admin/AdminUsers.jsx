import { useState } from "react";

export default function AdminUsers() {

  const [users, setUsers] = useState([
    { id: 1, name: "Rahul Kumar", email: "rahul@test.com", phone: "9876543210", city: "Delhi", joinedDate: "2025-01-10", bookings: 12, rating: 4.8, status: "Active" },
    { id: 2, name: "Pooja Singh", email: "pooja@test.com", phone: "9123456789", city: "Noida", joinedDate: "2025-02-04", bookings: 0, rating: 0, status: "Blocked" },
    { id: 3, name: "Ankit Patel", email: "ankit@test.com", phone: "9988776655", city: "Kanpur", joinedDate: "2025-03-01", bookings: 28, rating: 4.9, status: "Active" },
    { id: 4, name: "Nisha Sharma", email: "nisha@test.com", phone: "8765432109", city: "Delhi", joinedDate: "2025-03-15", bookings: 8, rating: 4.6, status: "Active" },
    { id: 5, name: "Vikram Rao", email: "vikram@test.com", phone: "9555443322", city: "Ghaziabad", joinedDate: "2025-03-20", bookings: 15, rating: 4.7, status: "Active" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    address: ""
  });

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleCreateUser(e) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.city || !formData.address) {
      alert("Please fill all fields");
      return;
    }

    const newUser = {
      id: users.length + 1,
      ...formData,
      joinedDate: new Date().toISOString().split('T')[0],
      bookings: 0,
      rating: 0,
      status: "Active"
    };

    setUsers([...users, newUser]);
    setFormData({ name: "", email: "", phone: "", city: "", address: "" });
    setShowCreateForm(false);
    alert("User account created successfully!");
  }

  function toggleStatus(id) {
    setUsers(users.map(u =>
      u.id === id
        ? { ...u, status: u.status === "Active" ? "Blocked" : "Active" }
        : u
    ));
  }

  const filteredUsers = users.filter(u => {
    const matchesStatus = filterStatus === "All" || u.status === filterStatus;
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeCount = users.filter(u => u.status === "Active").length;
  const blockedCount = users.filter(u => u.status === "Blocked").length;
  const totalBookings = users.reduce((sum, u) => sum + u.bookings, 0);

  // Sort by date - newest first
  const sortedUsers = [...filteredUsers].sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate));


  return (
    <div className="admin-page">

      {/* PAGE HEADER */}
      <div className="admin-page-head">
        <h2>Users Management</h2>
        <p className="admin-subtitle">Monitor and manage user accounts</p>
      </div>

      {/* STATS */}
      <div className="admin-kpi-grid">
        <div className="kpi-card">
          <span>Total Users</span>
          <h3>{users.length}</h3>
          <small className="positive">+24 this month</small>
        </div>
        <div className="kpi-card">
          <span>Active Users</span>
          <h3>{activeCount}</h3>
          <small className="positive">{Math.round((activeCount/users.length)*100)}% of total</small>
        </div>
        <div className="kpi-card">
          <span>Blocked Users</span>
          <h3>{blockedCount}</h3>
          <small className="neutral">{Math.round((blockedCount/users.length)*100)}% of total</small>
        </div>
        <div className="kpi-card">
          <span>Total Bookings</span>
          <h3>{totalBookings}</h3>
          <small className="positive">Avg: {(totalBookings/users.length).toFixed(1)}/user</small>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="admin-section" style={{display: 'flex', gap: '16px', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap'}}>
        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
          {['All', 'Active', 'Blocked'].map(status => (
            <button
              key={status}
              className={`btn-sm ${filterStatus === status ? '' : 'outline'}`}
              onClick={() => setFilterStatus(status)}
              style={{cursor: 'pointer'}}
            >
              {status} ({users.filter(u => status === 'All' ? true : u.status === status).length})
            </button>
          ))}
        </div>
        <button className="btn-sm" onClick={() => setShowCreateForm(true)}>
          + Create User
        </button>
      </div>

      {/* SEARCH & FILTER */}
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

      {/* USERS TABLE */}
      <div className="admin-section">
        <div className="admin-table">

          <div className="table-row head">
            <span>Name</span>
            <span>Contact</span>
            <span>Joined</span>
            <span>Bookings</span>
            <span>Rating</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {sortedUsers.length > 0 ? sortedUsers.map(u => (
            <div className="table-row" key={u.id}>
              <span style={{fontWeight: '600'}}>{u.name}</span>
              <span style={{fontSize: '13px'}}>
                <div>{u.email}</div>
                <div style={{color: 'var(--admin-muted)', fontSize: '12px'}}>{u.phone}</div>
              </span>
              <span style={{fontSize: '13px', color: 'var(--admin-muted)'}}>
                {new Date(u.joinedDate).toLocaleDateString('en-IN', { year: '2-digit', month: 'short', day: 'numeric' })}
              </span>
              <span>{u.bookings}</span>
              <span>{u.rating > 0 ? `⭐ ${u.rating}` : 'N/A'}</span>
              <span>
                <span className={`tag ${u.status === "Active" ? "success" : "danger"}`}>
                  {u.status}
                </span>
              </span>
              <span>
                <button
                  className="btn-sm outline"
                  onClick={() => setSelectedUser(u)}
                  style={{fontSize: '12px', padding: '6px 12px'}}
                >
                  View
                </button>
                <button
                  className={`btn-sm ${u.status === "Active" ? "danger" : "outline"}`}
                  onClick={() => toggleStatus(u.id)}
                  style={{fontSize: '12px', padding: '6px 10px', marginLeft: '4px'}}
                >
                  {u.status === "Active" ? "Block" : "Unblock"}
                </button>
              </span>
            </div>
          )) : (
            <div style={{padding: '20px', textAlign: 'center', color: 'var(--admin-muted)'}}>
              No users found
            </div>
          )}

        </div>
      </div>

      {/* CREATE USER MODAL */}
      {showCreateForm && (
        <div className="modal-backdrop" onClick={() => setShowCreateForm(false)}>
          <div className="modal" style={{maxWidth: '500px'}} onClick={(e) => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <h3 style={{margin: 0}}>Create User Account</h3>
              <button
                style={{background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--admin-text)'}}
                onClick={() => setShowCreateForm(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter user name"
                  style={{width: '100%', padding: '10px 12px', border: '1.5px solid var(--admin-border)', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box'}}
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
                  style={{width: '100%', padding: '10px 12px', border: '1.5px solid var(--admin-border)', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box'}}
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
                  style={{width: '100%', padding: '10px 12px', border: '1.5px solid var(--admin-border)', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box'}}
                />
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>City *</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  style={{width: '100%', padding: '10px 12px', border: '1.5px solid var(--admin-border)', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box'}}
                >
                  <option value="">Select city</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Noida">Noida</option>
                  <option value="Ghaziabad">Ghaziabad</option>
                  <option value="Kanpur">Kanpur</option>
                </select>
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px'}}>Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter full address"
                  rows="3"
                  style={{width: '100%', padding: '10px 12px', border: '1.5px solid var(--admin-border)', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit'}}
                />
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

      {/* USER DETAILS MODAL */}
      {selectedUser && (
        <div className="modal-backdrop" onClick={() => setSelectedUser(null)}>
          <div className="modal" style={{maxWidth: '500px'}} onClick={(e) => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <h3 style={{margin: 0}}>User Details</h3>
              <button
                style={{background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--admin-text)'}}
                onClick={() => setSelectedUser(null)}
              >
                ✕
              </button>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                <div>
                  <p style={{fontSize: '12px', color: 'var(--admin-muted)', margin: '0 0 4px 0'}}>Name</p>
                  <p style={{margin: 0, fontWeight: '600'}}>{selectedUser.name}</p>
                </div>
                <div>
                  <p style={{fontSize: '12px', color: 'var(--admin-muted)', margin: '0 0 4px 0'}}>City</p>
                  <p style={{margin: 0, fontWeight: '600'}}>{selectedUser.city}</p>
                </div>
                <div>
                  <p style={{fontSize: '12px', color: 'var(--admin-muted)', margin: '0 0 4px 0'}}>Email</p>
                  <p style={{margin: 0, fontWeight: '600', fontSize: '14px'}}>{selectedUser.email}</p>
                </div>
                <div>
                  <p style={{fontSize: '12px', color: 'var(--admin-muted)', margin: '0 0 4px 0'}}>Phone</p>
                  <p style={{margin: 0, fontWeight: '600'}}>{selectedUser.phone}</p>
                </div>
                <div>
                  <p style={{fontSize: '12px', color: 'var(--admin-muted)', margin: '0 0 4px 0'}}>Joined Date</p>
                  <p style={{margin: 0, fontWeight: '600'}}>
                    {new Date(selectedUser.joinedDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p style={{fontSize: '12px', color: 'var(--admin-muted)', margin: '0 0 4px 0'}}>Status</p>
                  <span className={`tag ${selectedUser.status === "Active" ? "success" : "danger"}`}>
                    {selectedUser.status}
                  </span>
                </div>
                <div>
                  <p style={{fontSize: '12px', color: 'var(--admin-muted)', margin: '0 0 4px 0'}}>Bookings</p>
                  <p style={{margin: 0, fontWeight: '600'}}>{selectedUser.bookings}</p>
                </div>
                <div>
                  <p style={{fontSize: '12px', color: 'var(--admin-muted)', margin: '0 0 4px 0'}}>Rating</p>
                  <p style={{margin: 0, fontWeight: '600'}}>{selectedUser.rating > 0 ? `⭐ ${selectedUser.rating}` : 'N/A'}</p>
                </div>
              </div>

              <div style={{borderTop: '1.5px solid var(--admin-border)', paddingTop: '12px', marginTop: '8px'}}>
                <p style={{fontSize: '12px', color: 'var(--admin-muted)', margin: '0 0 6px 0'}}>Address</p>
                <p style={{margin: 0, fontSize: '14px'}}>{selectedUser.address}</p>
              </div>

              <button
                className="btn-sm outline"
                onClick={() => setSelectedUser(null)}
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
