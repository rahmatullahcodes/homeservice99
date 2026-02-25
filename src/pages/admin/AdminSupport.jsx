import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../config/api";

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterFrom, setFilterFrom] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    closed: 0
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    filterAndSortTickets();
  }, [tickets, searchTerm, filterStatus, filterPriority, filterFrom, sortBy]);

  async function fetchTickets() {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("adminToken");

      if (!token) {
        throw new Error("Admin authentication required");
      }

      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      const response = await fetch(API_ENDPOINTS.SUPPORT.GET_TICKETS, { headers });

      if (!response.ok) {
        throw new Error("Failed to fetch support tickets");
      }

      const data = await response.json();
      setTickets(Array.isArray(data) ? data : []);
      calculateStats(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError(err.message);
      // Use mock data
      const mockData = getMockTickets();
      setTickets(mockData);
      calculateStats(mockData);
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(ticketList) {
    const statsObj = {
      total: ticketList.length,
      open: ticketList.filter(t => t.status === "Open").length,
      inProgress: ticketList.filter(t => t.status === "In Progress").length,
      closed: ticketList.filter(t => t.status === "Closed").length
    };
    setStats(statsObj);
  }

  function filterAndSortTickets() {
    let filtered = [...tickets];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.issue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    // Priority filter
    if (filterPriority !== "all") {
      filtered = filtered.filter(t => t.priority === filterPriority);
    }

    // From filter
    if (filterFrom !== "all") {
      filtered = filtered.filter(t => t.from === filterFrom);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "date-asc":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "priority-high":
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        default:
          return 0;
      }
    });

    setFilteredTickets(filtered);
    setCurrentPage(1);
  }

  async function updateTicketStatus(ticketId, newStatus) {
    try {
      const token = localStorage.getItem("adminToken");
      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      const response = await fetch(API_ENDPOINTS.SUPPORT.UPDATE_TICKET_STATUS(ticketId), {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error("Failed to update ticket");

      setTickets(tickets.map(t =>
        t._id === ticketId ? { ...t, status: newStatus } : t
      ));
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    } catch (err) {
      alert("Error updating ticket: " + err.message);
    }
  }

  async function deleteTicket(ticketId) {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const headers = {
        "Authorization": `Bearer ${token}`
      };

      const response = await fetch(API_ENDPOINTS.SUPPORT.DELETE_TICKET(ticketId), {
        method: "DELETE",
        headers
      });

      if (!response.ok) throw new Error("Failed to delete ticket");

      setTickets(tickets.filter(t => t._id !== ticketId));
      setShowModal(false);
    } catch (err) {
      alert("Error deleting ticket: " + err.message);
    }
  }

  function getMockTickets() {
    return [
      {
        _id: "1",
        from: "User",
        name: "Rahul Kumar",
        email: "rahul@example.com",
        issue: "Payment not updated after booking completion",
        priority: "High",
        status: "Open",
        description: "I completed my AC repair service on 2026-02-08 but the payment hasn't been reflected in my wallet.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        _id: "2",
        from: "Vendor",
        name: "CleanPro Services",
        email: "cleanpro@example.com",
        issue: "Wallet balance incorrect",
        priority: "Medium",
        status: "In Progress",
        description: "My wallet shows ₹5,000 but I've completed 12 bookings worth ₹24,000.",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        _id: "3",
        from: "User",
        name: "Neha Singh",
        email: "neha@example.com",
        issue: "Booking cancelled automatically",
        priority: "Low",
        status: "Closed",
        description: "My booking was cancelled by the system even though the vendor was available.",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        _id: "4",
        from: "Vendor",
        name: "Plumb Masters",
        email: "plumbmasters@example.com",
        issue: "Unable to update service prices",
        priority: "High",
        status: "Open",
        description: "I'm getting an error when trying to update service prices in my dashboard.",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ];
  }

  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "#ef4444";
      case "Medium": return "#f59e0b";
      case "Low": return "#10b981";
      default: return "#6b7280";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open": return "#3b82f6";
      case "In Progress": return "#f59e0b";
      case "Closed": return "#10b981";
      default: return "#6b7280";
    }
  };

  if (loading) {
    return (
      <div className="admin-support">
        <div className="admin-page-head">
          <h2>Support Tickets</h2>
          <p className="admin-subtitle">Issue management & customer support</p>
        </div>
        <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
          <p>Loading support tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-support">
      {/* HEADER */}
      <div className="admin-page-head">
        <h2>Support Tickets</h2>
        <p className="admin-subtitle">Issue management & customer support system</p>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div style={{
          padding: "12px 16px",
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "8px",
          color: "#cc1818",
          marginBottom: "20px",
          fontSize: "14px"
        }}>
          ⚠️ {error} - Using demo data
        </div>
      )}

      {/* STATS CARDS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "24px"
      }}>
        <div style={{
          padding: "16px",
          backgroundColor: "#dbeafe",
          borderRadius: "8px",
          border: "1px solid #93c5fd",
          textAlign: "center"
        }}>
          <p style={{ font: "12px", color: "#1e40af", fontWeight: 600, margin: "0 0 4px 0", textTransform: "uppercase" }}>Total Tickets</p>
          <h3 style={{ fontSize: "28px", fontWeight: 700, color: "#1e3a8a", margin: 0 }}>{stats.total}</h3>
        </div>
        <div style={{
          padding: "16px",
          backgroundColor: "#dbeafe",
          borderRadius: "8px",
          border: "1px solid #93c5fd",
          textAlign: "center"
        }}>
          <p style={{ font: "12px", color: "#1e40af", fontWeight: 600, margin: "0 0 4px 0", textTransform: "uppercase" }}>Open</p>
          <h3 style={{ fontSize: "28px", fontWeight: 700, color: "#1e3a8a", margin: 0 }}>{stats.open}</h3>
        </div>
        <div style={{
          padding: "16px",
          backgroundColor: "#fef3c7",
          borderRadius: "8px",
          border: "1px solid #fcd34d",
          textAlign: "center"
        }}>
          <p style={{ font: "12px", color: "#92400e", fontWeight: 600, margin: "0 0 4px 0", textTransform: "uppercase" }}>In Progress</p>
          <h3 style={{ fontSize: "28px", fontWeight: 700, color: "#78350f", margin: 0 }}>{stats.inProgress}</h3>
        </div>
        <div style={{
          padding: "16px",
          backgroundColor: "#dcfce7",
          borderRadius: "8px",
          border: "1px solid #bbf7d0",
          textAlign: "center"
        }}>
          <p style={{ font: "12px", color: "#166534", fontWeight: 600, margin: "0 0 4px 0", textTransform: "uppercase" }}>Closed</p>
          <h3 style={{ fontSize: "28px", fontWeight: 700, color: "#15803d", margin: 0 }}>{stats.closed}</h3>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        marginBottom: "24px"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          marginBottom: "12px"
        }}>
          <input
            type="text"
            placeholder="🔍 Search by name, email, or issue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              fontFamily: "inherit"
            }}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              fontFamily: "inherit",
              cursor: "pointer"
            }}
          >
            <option value="all">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              fontFamily: "inherit",
              cursor: "pointer"
            }}
          >
            <option value="all">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              fontFamily: "inherit",
              cursor: "pointer"
            }}
          >
            <option value="all">From: All</option>
            <option value="User">User</option>
            <option value="Vendor">Vendor</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              fontFamily: "inherit",
              cursor: "pointer"
            }}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="priority-high">Priority: High First</option>
            <option value="name">Name: A-Z</option>
          </select>
        </div>
        <div style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap"
        }}>
          <span style={{ fontSize: "13px", color: "#666" }}>
            Showing {paginatedTickets.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredTickets.length)} of {filteredTickets.length} tickets
          </span>
        </div>
      </div>

      {/* TICKETS TABLE - Desktop */}
      <div style={{ display: "none" }}>
        <div className="support-table">
          <div className="support-table-header">
            <span style={{ flex: 1 }}>ID</span>
            <span style={{ flex: 1.5 }}>From/Name</span>
            <span style={{ flex: 2 }}>Issue</span>
            <span style={{ flex: 1 }}>Priority</span>
            <span style={{ flex: 1 }}>Status</span>
            <span style={{ flex: 1.5 }}>Actions</span>
          </div>
          {paginatedTickets.map(ticket => (
            <div key={ticket._id} className="support-table-row">
              <span style={{ flex: 1, fontWeight: 600 }}>#{ticket._id}</span>
              <span style={{ flex: 1.5 }}>
                <strong>{ticket.from}</strong><br/>
                <small style={{ color: "#666" }}>{ticket.name}</small>
              </span>
              <span style={{ flex: 2 }}>{ticket.issue}</span>
              <span style={{ flex: 1 }}>
                <span style={{
                  display: "inline-block",
                  padding: "4px 8px",
                  backgroundColor: getPriorityColor(ticket.priority) + "20",
                  color: getPriorityColor(ticket.priority),
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: 600
                }}>
                  {ticket.priority}
                </span>
              </span>
              <span style={{ flex: 1 }}>
                <span style={{
                  display: "inline-block",
                  padding: "4px 8px",
                  backgroundColor: getStatusColor(ticket.status) + "20",
                  color: getStatusColor(ticket.status),
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: 600
                }}>
                  {ticket.status}
                </span>
              </span>
              <span style={{ flex: 1.5 }}>
                <button
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setShowModal(true);
                  }}
                  style={{
                    padding: "6px 10px",
                    backgroundColor: "#4f46e5",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "12px",
                    cursor: "pointer",
                    marginRight: "4px"
                  }}
                >
                  View
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* TICKETS CARDS - Mobile */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "16px",
        marginBottom: "24px"
      }}>
        {paginatedTickets.map(ticket => (
          <div
            key={ticket._id}
            onClick={() => {
              setSelectedTicket(ticket);
              setShowModal(true);
            }}
            style={{
              padding: "16px",
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08)";
              e.currentTarget.style.borderColor = "#d1d5db";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
              e.currentTarget.style.borderColor = "#e5e7eb";
            }}
          >
            <div style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>
                  {ticket.from}
                </p>
                <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#1f2937" }}>
                  {ticket.name}
                </p>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#9ca3af" }}>
                  {ticket.email}
                </p>
              </div>
              <span style={{
                fontSize: "11px",
                fontWeight: 700,
                color: getPriorityColor(ticket.priority),
                backgroundColor: getPriorityColor(ticket.priority) + "20",
                padding: "4px 8px",
                borderRadius: "4px",
                whiteSpace: "nowrap"
              }}>
                {ticket.priority}
              </span>
            </div>
            <p style={{
              margin: "0 0 12px 0",
              fontSize: "14px",
              color: "#374151",
              fontWeight: 500,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden"
            }}>
              {ticket.issue}
            </p>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "12px",
              borderTop: "1px solid #f3f4f6"
            }}>
              <span style={{
                fontSize: "12px",
                fontWeight: 600,
                color: getStatusColor(ticket.status),
                backgroundColor: getStatusColor(ticket.status) + "20",
                padding: "4px 8px",
                borderRadius: "4px"
              }}>
                {ticket.status}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTicket(ticket);
                  setShowModal(true);
                }}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#4f46e5",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#4338ca"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#4f46e5"}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div style={{
          padding: "40px",
          textAlign: "center",
          backgroundColor: "white",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          color: "#6b7280"
        }}>
          <p style={{ fontSize: "16px", fontWeight: 500 }}>No tickets found</p>
          <p style={{ fontSize: "14px", color: "#9ca3af" }}>Try adjusting your filters or search terms</p>
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          marginTop: "24px",
          flexWrap: "wrap"
        }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                padding: "8px 12px",
                border: page === currentPage ? "2px solid #4f46e5" : "1px solid #e5e7eb",
                backgroundColor: page === currentPage ? "#4f46e5" : "white",
                color: page === currentPage ? "white" : "#374151",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 500,
                transition: "all 0.2s"
              }}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && selectedTicket && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "28px",
            maxWidth: "600px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 20px 25px rgba(0, 0, 0, 0.15)"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
              marginBottom: "20px"
            }}>
              <div>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: 700, color: "#1f2937" }}>
                  Ticket #{selectedTicket._id}
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#9ca3af" }}>
                  Created {new Date(selectedTicket.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  fontSize: "24px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: "#6b7280"
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div>
                <p style={{ margin: "0 0 6px 0", fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>FROM</p>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#1f2937" }}>{selectedTicket.from}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 6px 0", fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>PRIORITY</p>
                <span style={{
                  display: "inline-block",
                  padding: "4px 8px",
                  backgroundColor: getPriorityColor(selectedTicket.priority) + "20",
                  color: getPriorityColor(selectedTicket.priority),
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: 700
                }}>
                  {selectedTicket.priority}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <p style={{ margin: "0 0 6px 0", fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>NAME</p>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#1f2937" }}>{selectedTicket.name}</p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <p style={{ margin: "0 0 6px 0", fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>EMAIL</p>
              <p style={{ margin: 0, fontSize: "14px", color: "#1f2937" }}>{selectedTicket.email}</p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <p style={{ margin: "0 0 6px 0", fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>ISSUE</p>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#1f2937" }}>{selectedTicket.issue}</p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <p style={{ margin: "0 0 6px 0", fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>DESCRIPTION</p>
              <p style={{ margin: 0, fontSize: "14px", color: "#374151", lineHeight: "1.6" }}>
                {selectedTicket.description}
              </p>
            </div>

            <div style={{ marginBottom: "20px", paddingTop: "20px", borderTop: "1px solid #e5e7eb" }}>
              <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>STATUS</p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {["Open", "In Progress", "Closed"].map(status => (
                  <button
                    key={status}
                    onClick={() => updateTicketStatus(selectedTicket._id, status)}
                    style={{
                      padding: "8px 12px",
                      border: selectedTicket.status === status ? "2px solid" + getStatusColor(status) : "1px solid #d1d5db",
                      backgroundColor: selectedTicket.status === status ? getStatusColor(status) + "20" : "white",
                      color: selectedTicket.status === status ? getStatusColor(status) : "#6b7280",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              display: "flex",
              gap: "12px",
              paddingTop: "20px",
              borderTop: "1px solid #e5e7eb"
            }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Close
              </button>
              <button
                onClick={() => deleteTicket(selectedTicket._id)}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  backgroundColor: "#fef2f2",
                  color: "#dc2626",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Delete Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
