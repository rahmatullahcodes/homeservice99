import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AdminUsers() {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Fetch users from backend
  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        setError("Admin authentication required. Please login first.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/users`, {
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
        localStorage.removeItem("token");
        localStorage.removeItem("user");
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

      // Transform backend data to include status and other fields
      const transformedUsers = data.map(user => ({
        ...user,
        _id: user._id || user.id,
        status: user.blocked ? "Blocked" : "Active",
        bookings: user.totalBookings || 0,
        rating: user.averageRating || 0,
        city: user.city || "N/A",
        address: user.address || "N/A",
        joinedDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      }));
      setUsers(transformedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message || "Failed to load users. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.city || !formData.address) {
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

      const response = await fetch(`${API_BASE_URL}/admin/users`, {
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
          address: formData.address
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create user");
      }

      const newUser = await response.json();
      // Add the newly created user to the list
      const transformedUser = {
        ...newUser,
        _id: newUser._id || newUser.id,
        status: "Active",
        bookings: 0,
        rating: 0,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      setUsers([transformedUser, ...users]);
      setFormData({ name: "", email: "", phone: "", city: "", address: "" });
      setShowCreateForm(false);
      alert("User account created successfully!");
    } catch (err) {
      console.error("Error creating user:", err);
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

      const user = users.find(u => u._id === id || u.id === id);
      const newStatus = user.status === "Active" ? "Blocked" : "Active";
      const isBlocked = newStatus === "Blocked";

      const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ blocked: isBlocked })
      });

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      // Update the user in the list
      setUsers(users.map(u =>
        (u._id === id || u.id === id)
          ? { ...u, status: newStatus }
          : u
      ));
    } catch (err) {
      console.error("Error updating user status:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteUser(id) {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      setUsers(users.filter(u => u._id !== id && u.id !== id));
      setSelectedUser(null);
      alert("User deleted successfully!");
    } catch (err) {
      console.error("Error deleting user:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
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
            onClick={fetchUsers}
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
          <span style={{fontSize: 'clamp(12px, 3vw, 14px)', color: '#666', display: 'block', marginBottom: '8px'}}>Total Users</span>
          <h3 style={{fontSize: 'clamp(24px, 6vw, 32px)', margin: '8px 0'}}>{users.length}</h3>
          <small className="positive" style={{fontSize: 'clamp(11px, 3vw, 12px)', color: '#28a745'}}>+24 this month</small>
        </div>
        <div className="kpi-card" style={{padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee'}}>
          <span style={{fontSize: 'clamp(12px, 3vw, 14px)', color: '#666', display: 'block', marginBottom: '8px'}}>Active Users</span>
          <h3 style={{fontSize: 'clamp(24px, 6vw, 32px)', margin: '8px 0'}}>{activeCount}</h3>
          <small className="positive" style={{fontSize: 'clamp(11px, 3vw, 12px)', color: '#28a745'}}>{Math.round((activeCount/users.length)*100)}% of total</small>
        </div>
        <div className="kpi-card" style={{padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee'}}>
          <span style={{fontSize: 'clamp(12px, 3vw, 14px)', color: '#666', display: 'block', marginBottom: '8px'}}>Blocked Users</span>
          <h3 style={{fontSize: 'clamp(24px, 6vw, 32px)', margin: '8px 0'}}>{blockedCount}</h3>
          <small className="neutral" style={{fontSize: 'clamp(11px, 3vw, 12px)', color: '#999'}}>{Math.round((blockedCount/users.length)*100)}% of total</small>
        </div>
        <div className="kpi-card" style={{padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee'}}>
          <span style={{fontSize: 'clamp(12px, 3vw, 14px)', color: '#666', display: 'block', marginBottom: '8px'}}>Total Bookings</span>
          <h3 style={{fontSize: 'clamp(24px, 6vw, 32px)', margin: '8px 0'}}>{totalBookings}</h3>
          <small className="positive" style={{fontSize: 'clamp(11px, 3vw, 12px)', color: '#28a745'}}>Avg: {(totalBookings/users.length).toFixed(1)}/user</small>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="admin-section" style={{display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', alignItems: 'start'}}>
        <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap', gridColumn: 'auto'}}>
          {['All', 'Active', 'Blocked'].map(status => (
            <button
              key={status}
              className={`btn-sm ${filterStatus === status ? '' : 'outline'}`}
              onClick={() => setFilterStatus(status)}
              style={{cursor: 'pointer', fontSize: 'clamp(11px, 3vw, 13px)', padding: '6px 10px'}}
            >
              {status} ({users.filter(u => status === 'All' ? true : u.status === status).length})
            </button>
          ))}
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', gridColumn: 'auto'}}>
          <button className="btn-sm" onClick={() => setShowCreateForm(true)} style={{fontSize: 'clamp(11px, 3vw, 13px)', padding: '8px 14px', whiteSpace: 'nowrap'}}>
            + Create User
          </button>
        </div>
      </div>

      {/* SEARCH & FILTER */}
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

      {/* USERS TABLE */}
      <div className="admin-section" style={{'overflowX': 'auto'}}>
        <div className="admin-table" style={{'minWidth': '700px'}}>

          <div className="table-row head" style={{'display': 'grid', 'gridTemplateColumns': 'repeat(7, 1fr)', 'gap': '12px', 'padding': '12px', 'backgroundColor': '#f5f5f5', 'fontWeight': '600', 'fontSize': 'clamp(12px, 3vw, 14px)'}}>
            <span>Name</span>
            <span>Contact</span>
            <span>Joined</span>
            <span>Bookings</span>
            <span>Rating</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {loading ? (
            <div style={{padding: '20px', textAlign: 'center', color: '#999'}}>
              Loading users... 
            </div>
          ) : sortedUsers.length > 0 ? sortedUsers.map(u => (
            <div className="table-row" key={u._id || u.id} style={{'display': 'grid', 'gridTemplateColumns': 'repeat(7, 1fr)', 'gap': '12px', 'padding': '12px', 'borderBottom': '1px solid #eee', 'fontSize': 'clamp(12px, 3vw, 13px)', 'alignItems': 'center'}}>
              <span style={{fontWeight: '600', 'fontSize': 'clamp(12px, 3vw, 14px)'}}>{u.name}</span>
              <span style={{fontSize: 'clamp(11px, 3vw, 12px)'}}>
                <div>{u.email}</div>
                <div style={{color: '#999', fontSize: 'clamp(10px, 2.5vw, 11px)'}}>{u.phone}</div>
              </span>
              <span style={{fontSize: 'clamp(11px, 3vw, 12px)', 'color': '#999'}}>
                {new Date(u.joinedDate).toLocaleDateString('en-IN', { year: '2-digit', month: 'short', day: 'numeric' })}
              </span>
              <span style={{fontWeight: '600'}}>{u.bookings}</span>
              <span>{u.rating > 0 ? `⭐ ${u.rating}` : 'N/A'}</span>
              <span>
                <span className={`tag ${u.status === "Active" ? "success" : "danger"}`} style={{'fontSize': 'clamp(11px, 3vw, 12px)', 'padding': '4px 8px'}}>
                  {u.status}
                </span>
              </span>
              <span style={{'display': 'flex', 'flexDirection': 'column', 'gap': '6px'}}>
                <button
                  className="btn-sm outline"
                  onClick={() => setSelectedUser(u)}
                  style={{fontSize: 'clamp(11px, 3vw, 12px)', 'padding': '6px 10px', 'whiteSpace': 'nowrap'}}
                  disabled={isSubmitting}
                >
                  View
                </button>
                <button
                  className={`btn-sm ${u.status === "Active" ? "danger" : "outline"}`}
                  onClick={() => toggleStatus(u._id || u.id)}
                  style={{fontSize: 'clamp(11px, 3vw, 12px)', 'padding': '6px 8px', 'whiteSpace': 'nowrap'}}
                  disabled={isSubmitting}
                >
                  {u.status === "Active" ? "Block" : "Unblock"}
                </button>
              </span>
            </div>
          )) : (
            <div style={{padding: '20px', textAlign: 'center', color: '#999'}}>
              No users found
            </div>
          )}

        </div>
      </div>

      {/* CREATE USER MODAL */}
      {showCreateForm && (
        <div className="modal-backdrop" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px'}} onClick={() => setShowCreateForm(false)}>
          <div className="modal" style={{position: 'relative', maxWidth: '90vw', width: 'clamp(280px, 90vw, 500px)', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', padding: 'clamp(20px, 5vw, 30px)', maxHeight: '90vh', overflowY: 'auto'}} onClick={(e) => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <h3 style={{margin: 0, fontSize: 'clamp(18px, 5vw, 22px)'}}>Create User Account</h3>
              <button
                style={{background: 'none', border: 'none', fontSize: 'clamp(20px, 5vw, 28px)', cursor: 'pointer', color: '#333', padding: '0', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                onClick={() => setShowCreateForm(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: 'clamp(13px, 3.5vw, 15px)', color: '#333'}}>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter user name"
                  required
                  style={{width: '100%', padding: '12px 14px', border: '1.5px solid #ddd', borderRadius: '8px', fontSize: 'clamp(13px, 4vw, 16px)', boxSizing: 'border-box', fontFamily: 'inherit'}}
                />
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: 'clamp(13px, 3.5vw, 15px)', color: '#333'}}>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  required
                  style={{width: '100%', padding: '12px 14px', border: '1.5px solid #ddd', borderRadius: '8px', fontSize: 'clamp(13px, 4vw, 16px)', boxSizing: 'border-box', fontFamily: 'inherit'}}
                />
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: 'clamp(13px, 3.5vw, 15px)', color: '#333'}}>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit phone number"
                  pattern="[0-9]{10}"
                  required
                  style={{width: '100%', padding: '12px 14px', border: '1.5px solid #ddd', borderRadius: '8px', fontSize: 'clamp(13px, 4vw, 16px)', boxSizing: 'border-box', fontFamily: 'inherit'}}
                />
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: 'clamp(13px, 3.5vw, 15px)', color: '#333'}}>City *</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  style={{width: '100%', padding: '12px 14px', border: '1.5px solid #ddd', borderRadius: '8px', fontSize: 'clamp(13px, 4vw, 16px)', boxSizing: 'border-box', fontFamily: 'inherit'}}
                >
                  <option value="">Select city</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Noida">Noida</option>
                  <option value="Ghaziabad">Ghaziabad</option>
                  <option value="Kanpur">Kanpur</option>
                </select>
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: 'clamp(13px, 3.5vw, 15px)', color: '#333'}}>Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter full address"
                  rows="3"
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
                  {isSubmitting ? "Creating..." : "Create Account"}
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

      {/* USER DETAILS MODAL */}
      {selectedUser && (
        <div className="modal-backdrop" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px'}} onClick={() => setSelectedUser(null)}>
          <div className="modal" style={{position: 'relative', maxWidth: '90vw', width: 'clamp(280px, 90vw, 500px)', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', padding: 'clamp(20px, 5vw, 30px)', maxHeight: '90vh', overflowY: 'auto'}} onClick={(e) => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <h3 style={{margin: 0, fontSize: 'clamp(18px, 5vw, 22px)'}}>User Details</h3>
              <button
                style={{background: 'none', border: 'none', fontSize: 'clamp(20px, 5vw, 28px)', cursor: 'pointer', color: '#333', padding: '0', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                onClick={() => setSelectedUser(null)}
              >
                ✕
              </button>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px'}}>
                <div>
                  <p style={{fontSize: 'clamp(11px, 3vw, 12px)', color: '#999', margin: '0 0 4px 0'}}>Name</p>
                  <p style={{margin: 0, fontWeight: '600', fontSize: 'clamp(13px, 3.5vw, 15px)'}}>{selectedUser.name}</p>
                </div>
                <div>
                  <p style={{fontSize: 'clamp(11px, 3vw, 12px)', color: '#999', margin: '0 0 4px 0'}}>City</p>
                  <p style={{margin: 0, fontWeight: '600', fontSize: 'clamp(13px, 3.5vw, 15px)'}}>{selectedUser.city}</p>
                </div>
                <div style={{gridColumn: '1 / -1'}}>
                  <p style={{fontSize: 'clamp(11px, 3vw, 12px)', color: '#999', margin: '0 0 4px 0'}}>Email</p>
                  <p style={{margin: 0, fontWeight: '600', fontSize: 'clamp(13px, 3.5vw, 15px)', wordBreak: 'break-all'}}>{selectedUser.email}</p>
                </div>
                <div>
                  <p style={{fontSize: 'clamp(11px, 3vw, 12px)', color: '#999', margin: '0 0 4px 0'}}>Phone</p>
                  <p style={{margin: 0, fontWeight: '600', fontSize: 'clamp(13px, 3.5vw, 15px)'}}>{selectedUser.phone}</p>
                </div>
                <div>
                  <p style={{fontSize: 'clamp(11px, 3vw, 12px)', color: '#999', margin: '0 0 4px 0'}}>Joined Date</p>
                  <p style={{margin: 0, fontWeight: '600', fontSize: 'clamp(13px, 3.5vw, 15px)'}}>
                    {new Date(selectedUser.joinedDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p style={{fontSize: 'clamp(11px, 3vw, 12px)', color: '#999', margin: '0 0 4px 0'}}>Status</p>
                  <span className={`tag ${selectedUser.status === "Active" ? "success" : "danger"}`} style={{fontSize: 'clamp(11px, 3vw, 12px)', padding: '4px 8px', display: 'inline-block'}}>
                    {selectedUser.status}
                  </span>
                </div>
                <div>
                  <p style={{fontSize: 'clamp(11px, 3vw, 12px)', color: '#999', margin: '0 0 4px 0'}}>Bookings</p>
                  <p style={{margin: 0, fontWeight: '600', fontSize: 'clamp(13px, 3.5vw, 15px)'}}>{selectedUser.bookings}</p>
                </div>
                <div>
                  <p style={{fontSize: 'clamp(11px, 3vw, 12px)', color: '#999', margin: '0 0 4px 0'}}>Rating</p>
                  <p style={{margin: 0, fontWeight: '600', fontSize: 'clamp(13px, 3.5vw, 15px)'}}>{selectedUser.rating > 0 ? `⭐ ${selectedUser.rating}` : 'N/A'}</p>
                </div>
              </div>

              <div style={{borderTop: '1.5px solid #eee', paddingTop: '12px', marginTop: '8px'}}>
                <p style={{fontSize: 'clamp(11px, 3vw, 12px)', color: '#999', margin: '0 0 6px 0'}}>Address</p>
                <p style={{margin: 0, fontSize: 'clamp(13px, 3.5vw, 15px)', wordBreak: 'break-word'}}>{selectedUser.address}</p>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginTop: '10px'}}>
                <button
                  className="btn-sm outline"
                  onClick={() => setSelectedUser(null)}
                  style={{fontSize: 'clamp(11px, 3vw, 13px)', padding: '8px 12px'}}
                >
                  Close
                </button>
                <button
                  className="btn-sm danger"
                  onClick={() => {
                    deleteUser(selectedUser._id || selectedUser.id);
                  }}
                  style={{fontSize: 'clamp(11px, 3vw, 13px)', padding: '8px 12px'}}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Deleting..." : "Delete User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
