import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

export default function AdminServicesManagement() {
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState("all"); // all, pending, active, inactive
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchServices();
  }, [filter]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== "all") params.status = filter;
      
      const response = await axios.get(`${API_BASE_URL}/services/admin/services/all`, { params });
      setServices(response.data);
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveService = async (serviceId) => {
    try {
      await axios.put(`${API_BASE_URL}/services/admin/services/${serviceId}/approve`, {
        adminNotes: "Approved by admin"
      });
      fetchServices();
      alert("Service approved successfully!");
    } catch (err) {
      console.error("Error approving service:", err);
      alert("Failed to approve service");
    }
  };

  const handleRejectService = async (serviceId) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      await axios.put(`${API_BASE_URL}/services/admin/services/${serviceId}/reject`, {
        reason
      });
      fetchServices();
      alert("Service rejected!");
    } catch (err) {
      console.error("Error rejecting service:", err);
      alert("Failed to reject service");
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/services/admin/services/${serviceId}/delete`);
      fetchServices();
      alert("Service deleted successfully!");
    } catch (err) {
      console.error("Error deleting service:", err);
      alert("Failed to delete service");
    }
  };

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: "20px", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "30px" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "10px", color: "#333" }}>
            Services Management
          </h1>
          <p style={{ color: "#666" }}>Manage and moderate all services</p>
        </div>

        {/* Filters and Search */}
        <div style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <div style={{ display: "flex", gap: "15px", marginBottom: "15px", flexWrap: "wrap" }}>
            {["all", "pending", "active", "inactive"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: filter === f ? "#007bff" : "#e0e0e0",
                  color: filter === f ? "white" : "#333",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "500",
                  textTransform: "capitalize"
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 15px",
              border: "2px solid #ddd",
              borderRadius: "5px",
              fontSize: "1rem"
            }}
          />
        </div>

        {/* Services Table */}
        <div style={{
          backgroundColor: "#fff",
          borderRadius: "10px",
          overflowX: "auto",
          overflowY: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <p>Loading services...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
              <p>No services found</p>
            </div>
          ) : (
            <table style={{ width: "100%", minWidth: "760px", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
                  <th style={{ padding: "15px", textAlign: "left", fontWeight: "600" }}>Service</th>
                  <th style={{ padding: "15px", textAlign: "left", fontWeight: "600" }}>Category</th>
                  <th style={{ padding: "15px", textAlign: "left", fontWeight: "600" }}>Price</th>
                  <th style={{ padding: "15px", textAlign: "left", fontWeight: "600" }}>Status</th>
                  <th style={{ padding: "15px", textAlign: "left", fontWeight: "600" }}>Vendor</th>
                  <th style={{ padding: "15px", textAlign: "left", fontWeight: "600" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service, idx) => (
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
                        ₹{service.price}
                      </div>
                    </td>
                    <td style={{ padding: "15px" }}>
                      <span style={{ color: "#666" }}>
                        {service.category} / {service.subcategory}
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
                      <div style={{ fontSize: "0.9rem", color: "#666" }}>
                        {service.vendor?.name || "Unknown"}
                      </div>
                    </td>
                    <td style={{ padding: "15px" }}>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {service.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApproveService(service._id)}
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "0.85rem"
                              }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectService(service._id)}
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
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteService(service._id)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#6c757d",
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
