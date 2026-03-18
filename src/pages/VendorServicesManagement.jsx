import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

export default function VendorServicesManagement() {
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    subcategory: "",
    price: "",
    duration: "",
    image: "",
    features: []
  });

  // Get auth token (assuming stored in localStorage)
  const token = localStorage.getItem("vendorToken");

  useEffect(() => {
    fetchServices();
    fetchStats();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/services/vendor/my-services`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(response.data);
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/services/vendor/services/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        features: formData.features.split(",").map(f => f.trim()),
        price: parseInt(formData.price)
      };

      if (editingService) {
        await axios.put(
          `${API_BASE_URL}/services/vendor/services/${editingService._id}/update`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Service updated successfully!");
      } else {
        await axios.post(
          `${API_BASE_URL}/services/vendor/services/create`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Service created successfully! Awaiting admin approval.");
      }

      setFormData({
        title: "",
        category: "",
        subcategory: "",
        price: "",
        duration: "",
        image: "",
        features: []
      });
      setEditingService(null);
      setShowCreateForm(false);
      fetchServices();
      fetchStats();
    } catch (err) {
      console.error("Error saving service:", err);
      alert("Failed to save service");
    }
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      category: service.category,
      subcategory: service.subcategory,
      price: service.price.toString(),
      duration: service.duration,
      image: service.image,
      features: service.features.join(", ")
    });
    setShowCreateForm(true);
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/services/vendor/services/${serviceId}/delete`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Service deleted successfully!");
      fetchServices();
      fetchStats();
    } catch (err) {
      console.error("Error deleting service:", err);
      alert("Failed to delete service");
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingService(null);
    setFormData({
      title: "",
      category: "",
      subcategory: "",
      price: "",
      duration: "",
      image: "",
      features: []
    });
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "2rem", marginBottom: "10px", color: "#333" }}>
              My Services
            </h1>
            <p style={{ color: "#666" }}>Manage your service offerings</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "600"
            }}
          >
            {showCreateForm ? "Cancel" : "+ Add New Service"}
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "30px"
        }}>
          {[
            { label: "Total Services", value: stats.totalServices || 0, color: "#007bff" },
            { label: "Active Services", value: stats.activeServices || 0, color: "#28a745" },
            { label: "Pending Approval", value: stats.pendingServices || 0, color: "#ff9800" },
            { label: "Avg Rating", value: `${(stats.avgRating || 0).toFixed(1)}⭐`, color: "#9c27b0" }
          ].map((stat, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                borderLeft: `4px solid ${stat.color}`
              }}
            >
              <p style={{ color: "#666", margin: "0 0 10px 0", fontSize: "0.9rem" }}>
                {stat.label}
              </p>
              <p style={{ fontSize: "2rem", fontWeight: "bold", color: stat.color, margin: "0" }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div style={{
            backgroundColor: "#fff",
            padding: "25px",
            borderRadius: "10px",
            marginBottom: "30px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h2 style={{ marginTop: "0", marginBottom: "20px" }}>
              {editingService ? "Edit Service" : "Create New Service"}
            </h2>
            <form onSubmit={handleCreateService}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
                marginBottom: "20px"
              }}>
                <input
                  type="text"
                  placeholder="Service Title"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                  style={{
                    padding: "10px 15px",
                    border: "2px solid #ddd",
                    borderRadius: "5px",
                    fontSize: "1rem"
                  }}
                />
                <input
                  type="text"
                  placeholder="Category (e.g., Cleaning)"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  required
                  style={{
                    padding: "10px 15px",
                    border: "2px solid #ddd",
                    borderRadius: "5px",
                    fontSize: "1rem"
                  }}
                />
                <input
                  type="text"
                  placeholder="Subcategory (e.g., Home Cleaning)"
                  value={formData.subcategory}
                  onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
                  required
                  style={{
                    padding: "10px 15px",
                    border: "2px solid #ddd",
                    borderRadius: "5px",
                    fontSize: "1rem"
                  }}
                />
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  required
                  style={{
                    padding: "10px 15px",
                    border: "2px solid #ddd",
                    borderRadius: "5px",
                    fontSize: "1rem"
                  }}
                />
                <input
                  type="text"
                  placeholder="Duration (e.g., 1-2 hrs)"
                  value={formData.duration}
                  onChange={e => setFormData({ ...formData, duration: e.target.value })}
                  required
                  style={{
                    padding: "10px 15px",
                    border: "2px solid #ddd",
                    borderRadius: "5px",
                    fontSize: "1rem"
                  }}
                />
                <input
                  type="url"
                  placeholder="Image URL"
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  required
                  style={{
                    padding: "10px 15px",
                    border: "2px solid #ddd",
                    borderRadius: "5px",
                    fontSize: "1rem"
                  }}
                />
              </div>

              <textarea
                placeholder="Features (comma-separated, e.g., Professional service, Free consultation, 24-hour support)"
                value={formData.features}
                onChange={e => setFormData({ ...formData, features: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "10px 15px",
                  border: "2px solid #ddd",
                  borderRadius: "5px",
                  fontSize: "1rem",
                  fontFamily: "Arial",
                  minHeight: "100px",
                  marginBottom: "20px"
                }}
              />

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "1rem",
                    fontWeight: "600"
                  }}
                >
                  {editingService ? "Update Service" : "Create Service"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "1rem",
                    fontWeight: "600"
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Services List */}
        <div style={{
          backgroundColor: "#fff",
          borderRadius: "10px",
          overflowX: "auto",
          overflowY: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <p>Loading your services...</p>
            </div>
          ) : services.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
              <p>You haven't created any services yet.</p>
              <p style={{ marginTop: "10px", color: "#999" }}>Click "Add New Service" to get started.</p>
            </div>
          ) : (
            <table style={{ width: "100%", minWidth: "760px", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
                  <th style={{ padding: "15px", textAlign: "left", fontWeight: "600" }}>Service</th>
                  <th style={{ padding: "15px", textAlign: "left", fontWeight: "600" }}>Category</th>
                  <th style={{ padding: "15px", textAlign: "left", fontWeight: "600" }}>Price</th>
                  <th style={{ padding: "15px", textAlign: "left", fontWeight: "600" }}>Status</th>
                  <th style={{ padding: "15px", textAlign: "left", fontWeight: "600" }}>Rating</th>
                  <th style={{ padding: "15px", textAlign: "left", fontWeight: "600" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service, idx) => (
                  <tr
                    key={service._id}
                    style={{
                      borderBottom: "1px solid #eee",
                      backgroundColor: idx % 2 === 0 ? "#fff" : "#f9f9f9"
                    }}
                  >
                    <td style={{ padding: "15px" }}>
                      <div style={{ fontWeight: "600", color: "#333" }}>
                        {service.title}
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "#666" }}>
                        {service.duration}
                      </div>
                    </td>
                    <td style={{ padding: "15px" }}>
                      <span style={{ color: "#666" }}>
                        {service.category}
                      </span>
                    </td>
                    <td style={{ padding: "15px" }}>
                      <strong>₹{service.price}</strong>
                    </td>
                    <td style={{ padding: "15px" }}>
                      <span style={{
                        display: "inline-block",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        backgroundColor:
                          service.status === "active" ? "#d4edda" :
                          service.status === "pending" ? "#fff3cd" :
                          "#f8d7da",
                        color:
                          service.status === "active" ? "#155724" :
                          service.status === "pending" ? "#856404" :
                          "#721c24"
                      }}>
                        {service.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "15px" }}>
                      <div style={{ fontSize: "1rem", fontWeight: "600", color: "#ff9800" }}>
                        ⭐ {service.rating || "N/A"}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "#999" }}>
                        ({service.reviews || 0} reviews)
                      </div>
                    </td>
                    <td style={{ padding: "15px" }}>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          onClick={() => handleEditService(service)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#17a2b8",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.85rem"
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteService(service._id)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#dc3545",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.85rem"
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
