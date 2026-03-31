import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useVendor } from "../../context/VendorContext";
import { API_ENDPOINTS } from "../../config/api";

import { SERVICE_CATEGORIES, PRICING_TIERS } from "../../data/vendorServicesData";
export default function VendorServices() {
  const navigate = useNavigate();
  const { vendor, isLoggedIn, loading: vendorLoading } = useVendor();
  const token = localStorage.getItem('vendorToken');
  
  // State Management
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ 
    title: "", 
    price: "", 
    category: "", 
    description: "",
    duration: "1",
    availability: "daily"
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Filtering & Sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  
  // UI State
  const [viewMode, setViewMode] = useState("grid"); // grid, list
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);

  // Fetch services on mount
  useEffect(() => {
    if (token && isLoggedIn) {
      fetchServices();
    }
  }, [token, isLoggedIn]);

  async function fetchServices() {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(API_ENDPOINTS.VENDOR.GET_SERVICES, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('vendorToken');
        window.location.href = '/vendor-login';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch services');
      }

      const data = await response.json();
      const servicesList = Array.isArray(data) ? data : data.services || data.data || [];
      setServices(servicesList);
      setError(null);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err.message || 'Failed to load services. Please try again.');
      setServices([]);
    } finally {
      setLoading(false);
    }
  }

  async function addService() {
    // Validation
    if (!newService.title || !newService.title.trim()) {
      setError("Service name is required");
      return;
    }
    if (newService.title.length < 3) {
      setError("Service name must be at least 3 characters");
      return;
    }
    if (!newService.category) {
      setError("Category is required");
      return;
    }
    if (!newService.price || Number(newService.price) <= 0) {
      setError("Valid price is required (must be greater than 0)");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(API_ENDPOINTS.VENDOR.CREATE_SERVICE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newService.title.trim(),
          price: Number(newService.price),
          category: newService.category,
          subcategory: newService.category, // Use category as subcategory
          description: newService.description?.trim() || ""
        })
      });

      if (response.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('vendorToken');
        window.location.href = '/vendor-login';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create service');
      }

      const createdService = await response.json();
      setServices([...services, createdService]);
      setNewService({ title: "", price: "", category: "", description: "" });
      setSuccessMessage('✓ Service added successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error adding service:', err);
      setError(err.message || 'Failed to add service. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(service) {
    setEditingId(service._id);
    setEditData({ ...service });
  }

  async function saveEdit() {
    // Validation
    if (!editData.title || !editData.title.trim()) {
      setError("Service name is required");
      return;
    }
    if (!editData.category) {
      setError("Category is required");
      return;
    }
    if (!editData.price || Number(editData.price) <= 0) {
      setError("Valid price is required (must be greater than 0)");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(API_ENDPOINTS.VENDOR.UPDATE_SERVICE(editingId), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editData.title.trim(),
          category: editData.category,
          subcategory: editData.category, // Use category as subcategory
          price: Number(editData.price),
          description: editData.description?.trim() || "",
          active: editData.active
        })
      });

      if (response.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('vendorToken');
        window.location.href = '/vendor-login';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update service');
      }

      const updatedService = await response.json();
      setServices(services.map(s => s._id === editingId ? updatedService : s));
      setEditingId(null);
      setEditData({});
      setSuccessMessage('✓ Service updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating service:', err);
      setError(err.message || 'Failed to update service. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(id) {
    try {
      const service = services.find(s => s._id === id);
      if (!service) return;

      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(API_ENDPOINTS.VENDOR.UPDATE_SERVICE(id), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          active: !service.active
        })
      });

      if (response.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('vendorToken');
        window.location.href = '/vendor-login';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update service status');
      }

      const updatedService = await response.json();
      setServices(services.map(s => s._id === id ? updatedService : s));
      setSuccessMessage(`✓ Service ${updatedService.active ? 'activated' : 'deactivated'}!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error toggling service status:', err);
      setError(err.message || 'Failed to update service status. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteService(id) {
    if (!window.confirm("Delete this service? This action cannot be undone.")) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(API_ENDPOINTS.VENDOR.DELETE_SERVICE(id), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('vendorToken');
        window.location.href = '/vendor-login';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete service');
      }

      setServices(services.filter(s => s._id !== id));
      setSuccessMessage('✓ Service deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting service:', err);
      setError(err.message || 'Failed to delete service. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // Filter services based on search, category, and status
  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (service.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesCategory = !filterCategory || service.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'active' && service.active) ||
                          (filterStatus === 'inactive' && !service.active);
    
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    switch(sortBy) {
      case 'priceLow': return a.price - b.price;
      case 'priceHigh': return b.price - a.price;
      case 'nameAZ': return a.title.localeCompare(b.title);
      case 'nameZA': return b.title.localeCompare(a.title);
      case 'newest': return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      default: return 0;
    }
  });

  // Statistics
  const activeServices = services.filter(s => s.active).length;
  const inactiveServices = services.filter(s => !s.active).length;
  const totalEarningPotential = services.reduce((sum, s) => sum + (s.price || 0), 0);
  const priceStats = {
    avg: services.length ? Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length) : 0,
    min: services.length ? Math.min(...services.map(s => s.price)) : 0,
    max: services.length ? Math.max(...services.map(s => s.price)) : 0
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* HEADER SECTION */}
      <div className="vendor-page-head" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2 style={{ margin: "0 0 8px 0" }}>📋 Services Management</h2>
            <p style={{ margin: 0, opacity: 0.7 }}>Create and manage your service offerings</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              transition: "all 0.3s ease"
            }}
            onMouseOver={e => e.target.style.transform = "translateY(-2px)"}
            onMouseOut={e => e.target.style.transform = "translateY(0)"}
          >
            ➕ {showAddForm ? "Hide Form" : "Add Service"}
          </button>
        </div>
      </div>

      {/* MESSAGES */}
      {successMessage && (
        <div style={{
          backgroundColor: "#dcfce7",
          border: "1px solid #86efac",
          color: "#166534",
          padding: "12px 16px",
          borderRadius: "8px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          animation: "slideIn 0.3s ease"
        }}>
          <span>✅ {successMessage}</span>
          <button 
            onClick={() => setSuccessMessage(null)}
            style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: "#fee2e2",
          border: "1px solid #fecaca",
          color: "#dc2626",
          padding: "12px 16px",
          borderRadius: "8px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          animation: "slideIn 0.3s ease"
        }}>
          <span>⚠️ {error}</span>
          <button 
            onClick={() => setError(null)}
            style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* STATISTICS CARDS */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "24px"
      }}>
        <div style={{
          background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(37, 99, 235, 0.2)"
        }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Total Services</div>
          <div style={{ fontSize: "28px", fontWeight: "700", margin: "8px 0" }}>
            {loading ? "—" : services.length}
          </div>
          <div style={{ fontSize: "12px", opacity: 0.8 }}>Product catalog</div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(16, 185, 129, 0.2)"
        }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Active Services</div>
          <div style={{ fontSize: "28px", fontWeight: "700", margin: "8px 0" }}>
            {loading ? "—" : activeServices}
          </div>
          <div style={{ fontSize: "12px", opacity: 0.8 }}>Currently available</div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(245, 158, 11, 0.2)"
        }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Avg Price</div>
          <div style={{ fontSize: "28px", fontWeight: "700", margin: "8px 0" }}>
            {loading ? "—" : `₹${priceStats.avg}`}
          </div>
          <div style={{ fontSize: "12px", opacity: 0.8 }}>Price point</div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(139, 92, 246, 0.2)"
        }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Price Range</div>
          <div style={{ fontSize: "14px", fontWeight: "700", margin: "8px 0" }}>
            {loading ? "—" : `₹${priceStats.min} - ₹${priceStats.max}`}
          </div>
          <div style={{ fontSize: "12px", opacity: 0.8 }}>Min to max price</div>
        </div>
      </div>

      {/* ADD NEW SERVICE FORM */}
      {showAddForm && !loading && (
        <div style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
          animation: "slideDown 0.3s ease"
        }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "600" }}>
            ➕ Add New Service
          </h3>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "16px",
            marginBottom: "16px"
          }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "13px" }}>
                Service Name *
              </label>
              <input
                type="text"
                placeholder="e.g., AC Repair & Maintenance"
                value={newService.title}
                onChange={e => setNewService({ ...newService, title: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid #e5e7eb",
                  fontSize: "14px",
                  fontFamily: "inherit"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "13px" }}>
                Category *
              </label>
              <select
                value={newService.category}
                onChange={e => setNewService({ ...newService, category: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid #e5e7eb",
                  fontSize: "14px",
                  fontFamily: "inherit"
                }}
              >
                <option value="">Select Category</option>
                {SERVICE_CATEGORIES.map(cat => (
                  <option key={cat.name} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "13px" }}>
                Price (₹) *
              </label>
              <input
                type="number"
                placeholder="e.g., 499"
                value={newService.price}
                onChange={e => setNewService({ ...newService, price: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid #e5e7eb",
                  fontSize: "14px",
                  fontFamily: "inherit"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "13px" }}>
                Duration (hours)
              </label>
              <input
                type="number"
                placeholder="e.g., 1"
                value={newService.duration}
                onChange={e => setNewService({ ...newService, duration: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid #e5e7eb",
                  fontSize: "14px",
                  fontFamily: "inherit"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "13px" }}>
                Availability
              </label>
              <select
                value={newService.availability}
                onChange={e => setNewService({ ...newService, availability: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid #e5e7eb",
                  fontSize: "14px",
                  fontFamily: "inherit"
                }}
              >
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays Only</option>
                <option value="weekends">Weekends Only</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "13px" }}>
              Description (Optional)
            </label>
            <textarea
              placeholder="Describe your service in detail, what's included, any requirements..."
              value={newService.description}
              onChange={e => setNewService({ ...newService, description: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
                fontFamily: "inherit",
                minHeight: "80px",
                resize: "vertical"
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={addService}
              disabled={saving}
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: saving ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "14px",
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? "Adding..." : "✓ Add Service"}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewService({ title: "", price: "", category: "", description: "", duration: "1", availability: "daily" });
                setError(null);
              }}
              style={{
                background: "white",
                color: "#64748b",
                border: "1px solid #e5e7eb",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "14px"
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* FILTERS & SEARCH */}
      {!loading && services.length > 0 && (
        <div style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "24px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
            alignItems: "end"
          }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "12px" }}>
                🔍 Search
              </label>
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #e5e7eb",
                  fontSize: "14px"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "12px" }}>
                📂 Category
              </label>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #e5e7eb",
                  fontSize: "14px"
                }}
              >
                <option value="">All Categories</option>
                {SERVICE_CATEGORIES.map(cat => (
                  <option key={cat.name} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "12px" }}>
                ⭕ Status
              </label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #e5e7eb",
                  fontSize: "14px"
                }}
              >
                <option value="all">All Services ({services.length})</option>
                <option value="active">Active ({activeServices})</option>
                <option value="inactive">Inactive ({inactiveServices})</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "12px" }}>
                📊 Sort By
              </label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #e5e7eb",
                  fontSize: "14px"
                }}
              >
                <option value="newest">Newest First</option>
                <option value="nameAZ">Name (A-Z)</option>
                <option value="nameZA">Name (Z-A)</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "12px" }}>
                👁️ View
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setViewMode("grid")}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "6px",
                    border: viewMode === "grid" ? "2px solid #2563eb" : "1px solid #e5e7eb",
                    background: viewMode === "grid" ? "#eff6ff" : "white",
                    color: viewMode === "grid" ? "#2563eb" : "#64748b",
                    cursor: "pointer",
                    fontWeight: "500",
                    fontSize: "12px"
                  }}
                >
                  ⊞ Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "6px",
                    border: viewMode === "list" ? "2px solid #2563eb" : "1px solid #e5e7eb",
                    background: viewMode === "list" ? "#eff6ff" : "white",
                    color: viewMode === "list" ? "#2563eb" : "#64748b",
                    cursor: "pointer",
                    fontWeight: "500",
                    fontSize: "12px"
                  }}
                >
                  ≡ List
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SERVICES DISPLAY */}
      {loading ? (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "white",
          borderRadius: "12px",
          border: "1px solid #e5e7eb"
        }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>⏳</div>
          <p style={{ fontSize: "16px", color: "#6b7280", margin: 0 }}>Loading your services...</p>
        </div>
      ) : services.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "white",
          borderRadius: "12px",
          border: "1p solid #e5e7eb"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>No Services Yet</h3>
          <p style={{ margin: "0 0 16px 0", color: "#6b7280" }}>
            Create your first service to get started accepting bookings
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px"
            }}
          >
            ➕ Create Your First Service
          </button>
        </div>
      ) : filteredServices.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "40px 20px",
          background: "white",
          borderRadius: "12px",
          border: "1px solid #e5e7eb"
        }}>
          <p style={{ fontSize: "16px", color: "#6b7280" }}>🔎 No services match your filters.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "16px"
        }}>
          {filteredServices.map(service => (
            <ServiceCard 
              key={service._id}
              service={service}
              isEditing={editingId === service._id}
              editData={editData}
              setEditData={setEditData}
              onStartEdit={() => {
                setEditingId(service._id);
                setEditData({ ...service });
              }}
              onSaveEdit={saveEdit}
              onCancel={() => {
                setEditingId(null);
                setEditData({});
                setError(null);
              }}
              onToggleStatus={() => toggleStatus(service._id)}
              onDelete={() => deleteService(service._id)}
              onNavigate={(path) => navigate(path)}
              saving={saving}
            />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredServices.map(service => (
            <ServiceListRow
              key={service._id}
              service={service}
              isEditing={editingId === service._id}
              editData={editData}
              setEditData={setEditData}
              onStartEdit={() => {
                setEditingId(service._id);
                setEditData({ ...service });
              }}
              onSaveEdit={saveEdit}
              onCancel={() => {
                setEditingId(null);
                setEditData({});
                setError(null);
              }}
              onToggleStatus={() => toggleStatus(service._id)}
              onDelete={() => deleteService(service._id)}
              onNavigate={(path) => navigate(path)}
              saving={saving}
            />
          ))}
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 1000px;
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .vendor-page-head {
            flex-direction: column;
          }

          div[role="grid"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// SERVICE CARD COMPONENT (Grid View)
function ServiceCard({
  service,
  isEditing,
  editData,
  setEditData,
  onStartEdit,
  onSaveEdit,
  onCancel,
  onToggleStatus,
  onDelete,
  onNavigate,
  saving
}) {
  const categoryObj = SERVICE_CATEGORIES.find(c => c.name === service.category);

  if (isEditing) {
    return (
      <div style={{
        background: "white",
        border: "2px solid #2563eb",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 4px 15px rgba(37, 99, 235, 0.15)"
      }}>
        <h4 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>Edit Service</h4>
        
        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: "500" }}>Name</label>
          <input
            value={editData.title || ""}
            onChange={e => setEditData({ ...editData, title: e.target.value })}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #e5e7eb",
              fontSize: "13px"
            }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: "500" }}>Category</label>
          <select
            value={editData.category || ""}
            onChange={e => setEditData({ ...editData, category: e.target.value })}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #e5e7eb",
              fontSize: "13px"
            }}
          >
            <option value="">Select</option>
            {SERVICE_CATEGORIES.map(cat => (
              <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: "500" }}>Price</label>
          <input
            type="number"
            value={editData.price || ""}
            onChange={e => setEditData({ ...editData, price: Number(e.target.value) })}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #e5e7eb",
              fontSize: "13px"
            }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: "500" }}>Description</label>
          <textarea
            value={editData.description || ""}
            onChange={e => setEditData({ ...editData, description: e.target.value })}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #e5e7eb",
              fontSize: "13px",
              minHeight: "60px",
              resize: "vertical"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={onSaveEdit}
            disabled={saving}
            style={{
              flex: 1,
              padding: "8px",
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: saving ? "not-allowed" : "pointer",
              fontSize: "12px",
              fontWeight: "600",
              opacity: saving ? 0.7 : 1
            }}
          >
            Save
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "8px",
              background: "#f3f4f6",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600"
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "16px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
      transition: "all 0.3s ease",
      cursor: "default"
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.12)";
      e.currentTarget.style.transform = "translateY(-4px)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.06)";
      e.currentTarget.style.transform = "translateY(0)";
    }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
        <div style={{
          fontSize: "28px",
          background: categoryObj?.color || "#e5e7eb",
          width: "48px",
          height: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px"
        }}>
          {categoryObj?.icon || "📌"}
        </div>
        <span style={{
          padding: "4px 12px",
          borderRadius: "20px",
          fontSize: "11px",
          fontWeight: "600",
          background: service.active ? "#dcfce7" : "#f3f4f6",
          color: service.active ? "#166534" : "#6b7280"
        }}>
          {service.active ? "✓ Active" : "⊘ Offline"}
        </span>
      </div>

      {/* Title & Category */}
      <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "600", lineHeight: "1.4" }}>
        {service.title}
      </h3>
      <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "#64748b" }}>
        {service.category}
      </p>

      {/* Description */}
      {service.description && (
        <p style={{
          margin: "0 0 12px 0",
          fontSize: "13px",
          color: "#6b7280",
          lineHeight: "1.5",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden"
        }}>
          {service.description}
        </p>
      )}

      {/* Duration */}
      {service.duration && (
        <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#64748b" }}>
          ⏱️ {service.duration} hour{service.duration > 1 ? "s" : ""}
        </p>
      )}

      {/* Price */}
      <div style={{
        background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
        color: "white",
        padding: "12px",
        borderRadius: "8px",
        marginBottom: "12px",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "12px", opacity: 0.9 }}>Price</div>
        <div style={{ fontSize: "22px", fontWeight: "700" }}>₹{service.price}</div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
        <button
          onClick={onStartEdit}
          disabled={saving}
          style={{
            width: "100%",
            padding: "8px",
            background: "#f0f9ff",
            color: "#2563eb",
            border: "1px solid #bfdbfe",
            borderRadius: "6px",
            cursor: saving ? "not-allowed" : "pointer",
            fontSize: "13px",
            fontWeight: "600",
            transition: "all 0.2s",
            opacity: saving ? 0.7 : 1
          }}
        >
          ✏️ Edit
        </button>
        
        <button
          onClick={onToggleStatus}
          disabled={saving}
          style={{
            width: "100%",
            padding: "8px",
            background: service.active ? "#fee2e2" : "#dcfce7",
            color: service.active ? "#dc2626" : "#16a34a",
            border: service.active ? "1px solid #fecaca" : "1px solid #bbf7d0",
            borderRadius: "6px",
            cursor: saving ? "not-allowed" : "pointer",
            fontSize: "13px",
            fontWeight: "600",
            transition: "all 0.2s",
            opacity: saving ? 0.7 : 1
          }}
        >
          {service.active ? "🔴 Go Offline" : "🟢 Go Online"}
        </button>

        <button
          onClick={onDelete}
          disabled={saving}
          style={{
            width: "100%",
            padding: "8px",
            background: "#fef2f2",
            color: "#dc2626",
            border: "1px solid #fecaca",
            borderRadius: "6px",
            cursor: saving ? "not-allowed" : "pointer",
            fontSize: "13px",
            fontWeight: "600",
            transition: "all 0.2s",
            opacity: saving ? 0.7 : 1
          }}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}

// SERVICE LIST ROW COMPONENT (List View)
function ServiceListRow({
  service,
  isEditing,
  editData,
  setEditData,
  onStartEdit,
  onSaveEdit,
  onCancel,
  onToggleStatus,
  onDelete,
  onNavigate,
  saving
}) {
  const categoryObj = SERVICE_CATEGORIES.find(c => c.name === service.category);

  if (isEditing) {
    return (
      <div style={{
        background: "white",
        border: "2px solid #2563eb",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 4px 15px rgba(37, 99, 235, 0.15)"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          marginBottom: "12px"
        }}>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: "500" }}>Name</label>
            <input
              value={editData.title || ""}
              onChange={e => setEditData({ ...editData, title: e.target.value })}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #e5e7eb", fontSize: "13px" }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: "500" }}>Category</label>
            <select
              value={editData.category || ""}
              onChange={e => setEditData({ ...editData, category: e.target.value })}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #e5e7eb", fontSize: "13px" }}
            >
              <option value="">Select</option>
              {SERVICE_CATEGORIES.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: "500" }}>Price</label>
            <input
              type="number"
              value={editData.price || ""}
              onChange={e => setEditData({ ...editData, price: Number(e.target.value) })}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #e5e7eb", fontSize: "13px" }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: "500" }}>Description</label>
          <textarea
            value={editData.description || ""}
            onChange={e => setEditData({ ...editData, description: e.target.value })}
            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #e5e7eb", fontSize: "13px", minHeight: "50px", resize: "vertical" }}
          />
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={onSaveEdit}
            disabled={saving}
            style={{
              padding: "8px 16px",
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: saving ? "not-allowed" : "pointer",
              fontSize: "12px",
              fontWeight: "600",
              opacity: saving ? 0.7 : 1
            }}
          >
            Save
          </button>
          <button
            onClick={onCancel}
            style={{
              padding: "8px 16px",
              background: "#f3f4f6",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600"
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "16px",
      display: "grid",
      gridTemplateColumns: "auto 1fr auto",
      alignItems: "center",
      gap: "16px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
      transition: "all 0.3s ease"
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.12)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.06)";
    }}
    >
      {/* Icon & Basic Info */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <div style={{
          fontSize: "28px",
          background: categoryObj?.color || "#e5e7eb",
          width: "48px",
          height: "48px",
          minWidth: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px"
        }}>
          {categoryObj?.icon || "📌"}
        </div>
        <div>
          <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "600" }}>
            {service.title}
          </h4>
          <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
            {service.category}
          </p>
          {service.description && (
            <p style={{
              margin: "4px 0 0 0",
              fontSize: "12px",
              color: "#9ca3af",
              maxWidth: "300px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}>
              {service.description}
            </p>
          )}
        </div>
      </div>

      {/* Details */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "auto auto auto",
        gap: "24px",
        alignItems: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Price</div>
          <div style={{ fontSize: "18px", fontWeight: "700", color: "#2563eb" }}>₹{service.price}</div>
        </div>

        <div style={{ textAlign: "center" }}>
          <span style={{
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: "600",
            background: service.active ? "#dcfce7" : "#f3f4f6",
            color: service.active ? "#166534" : "#6b7280"
          }}>
            {service.active ? "✓ Active" : "⊘ Offline"}
          </span>
        </div>

        {service.duration && (
          <div style={{ textAlign: "center", fontSize: "12px", color: "#64748b" }}>
            ⏱️ {service.duration}h
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={onStartEdit}
          disabled={saving}
          title="Edit"
          style={{
            width: "36px",
            height: "36px",
            padding: 0,
            background: "#f0f9ff",
            color: "#2563eb",
            border: "1px solid #bfdbfe",
            borderRadius: "6px",
            cursor: saving ? "not-allowed" : "pointer",
            fontWeight: "600",
            opacity: saving ? 0.7 : 1
          }}
        >
          ✏️
        </button>

        <button
          onClick={onToggleStatus}
          disabled={saving}
          title={service.active ? "Go Offline" : "Go Online"}
          style={{
            width: "36px",
            height: "36px",
            padding: 0,
            background: service.active ? "#fee2e2" : "#dcfce7",
            color: service.active ? "#dc2626" : "#16a34a",
            border: service.active ? "1px solid #fecaca" : "1px solid #bbf7d0",
            borderRadius: "6px",
            cursor: saving ? "not-allowed" : "pointer",
            fontWeight: "600",
            opacity: saving ? 0.7 : 1
          }}
        >
          {service.active ? "🔴" : "🟢"}
        </button>

        <button
          onClick={onDelete}
          disabled={saving}
          title="Delete"
          style={{
            width: "36px",
            height: "36px",
            padding: 0,
            background: "#fef2f2",
            color: "#dc2626",
            border: "1px solid #fecaca",
            borderRadius: "6px",
            cursor: saving ? "not-allowed" : "pointer",
            fontWeight: "600",
            opacity: saving ? 0.7 : 1
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
