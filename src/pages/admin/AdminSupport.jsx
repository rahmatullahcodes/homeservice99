import { useEffect, useMemo, useState } from "react";
import { API_ENDPOINTS } from "../../config/api";
import { SUPPORT_STATUSES, SUPPORT_PRIORITIES } from "../../data/adminSupportData";

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterFrom, setFilterFrom] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");
      if (!token) {
        setTickets([]);
        setError("Admin authentication required. Please login first.");
        return;
      }

      const response = await fetch(API_ENDPOINTS.SUPPORT.GET_TICKETS, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || payload.message || `Failed to load tickets (${response.status})`);
      }

      setTickets(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setTickets([]);
      setError(err.message || "Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  }

  async function updateTicketStatus(ticketId, status) {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setError("Admin authentication required. Please login first.");
        return;
      }

      const response = await fetch(API_ENDPOINTS.SUPPORT.UPDATE_TICKET_STATUS(ticketId), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || payload.message || "Failed to update ticket status");
      }

      setTickets((prev) => prev.map((ticket) => (ticket._id === ticketId ? payload : ticket)));
      setSelectedTicket((prev) => (prev && prev._id === ticketId ? payload : prev));
      setError("");
    } catch (err) {
      setError(err.message || "Failed to update ticket status");
    }
  }

  async function deleteTicket(ticketId) {
    if (!window.confirm("Are you sure you want to delete this ticket?")) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setError("Admin authentication required. Please login first.");
        return;
      }

      const response = await fetch(API_ENDPOINTS.SUPPORT.DELETE_TICKET(ticketId), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || payload.message || "Failed to delete ticket");
      }

      setTickets((prev) => prev.filter((ticket) => ticket._id !== ticketId));
      if (selectedTicket?._id === ticketId) {
        setSelectedTicket(null);
      }
      setError("");
    } catch (err) {
      setError(err.message || "Failed to delete ticket");
    }
  }

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === "Open").length,
      inProgress: tickets.filter((ticket) => ticket.status === "In Progress").length,
      closed: tickets.filter((ticket) => ticket.status === "Closed").length
    };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const result = tickets.filter((ticket) => {
      const matchesSearch =
        !term ||
        String(ticket.name || "").toLowerCase().includes(term) ||
        String(ticket.email || "").toLowerCase().includes(term) ||
        String(ticket.issue || "").toLowerCase().includes(term);
      const matchesStatus = filterStatus === "all" || ticket.status === filterStatus;
      const matchesPriority = filterPriority === "all" || ticket.priority === filterPriority;
      const matchesFrom = filterFrom === "all" || ticket.from === filterFrom;
      return matchesSearch && matchesStatus && matchesPriority && matchesFrom;
    });

    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return result;
  }, [tickets, searchTerm, filterStatus, filterPriority, filterFrom]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / itemsPerPage));
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterPriority, filterFrom]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="admin-support">
      <div className="admin-page-head">
        <h2>Support Tickets</h2>
        <p className="admin-subtitle">Issue management and customer support</p>
      </div>

      {error && (
        <div style={{ padding: "12px 14px", marginBottom: "16px", borderRadius: "8px", border: "1px solid #fecaca", backgroundColor: "#fef2f2", color: "#b91c1c" }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "16px" }}>
        <div className="kpi-card"><span>Total</span><h3>{stats.total}</h3></div>
        <div className="kpi-card"><span>Open</span><h3>{stats.open}</h3></div>
        <div className="kpi-card"><span>In Progress</span><h3>{stats.inProgress}</h3></div>
        <div className="kpi-card"><span>Closed</span><h3>{stats.closed}</h3></div>
      </div>

      <div className="admin-section" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", alignItems: "center" }}>
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by name, email, or issue"
          style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px" }}
        />
        <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} style={{ padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px" }}>
          <option value="all">All Status</option>
          {SUPPORT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <select value={filterPriority} onChange={(event) => setFilterPriority(event.target.value)} style={{ padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px" }}>
          <option value="all">All Priority</option>
          {SUPPORT_PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
        </select>
        <select value={filterFrom} onChange={(event) => setFilterFrom(event.target.value)} style={{ padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px" }}>
          <option value="all">All Sources</option>
          <option value="User">User</option>
          <option value="Vendor">Vendor</option>
        </select>
        <button className="btn-sm outline" onClick={fetchTickets}>Refresh</button>
      </div>

      <div className="admin-section">
        <div className="admin-table card-mobile">
          <div className="table-row head">
            <span>ID</span>
            <span>Name</span>
            <span>Issue</span>
            <span>Priority</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {loading ? (
            <div style={{ padding: "16px", textAlign: "center", color: "#6b7280" }}>Loading tickets...</div>
          ) : paginatedTickets.length === 0 ? (
            <div style={{ padding: "16px", textAlign: "center", color: "#6b7280" }}>No tickets found</div>
          ) : (
            paginatedTickets.map((ticket) => (
              <div className="table-row" key={ticket._id}>
                <span data-label="ID">{String(ticket._id || "").slice(-8)}</span>
                <span data-label="Name">
                  <strong>{ticket.name || "N/A"}</strong>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>{ticket.email || "N/A"}</div>
                </span>
                <span data-label="Issue">{ticket.issue || "N/A"}</span>
                <span data-label="Priority">{ticket.priority || "N/A"}</span>
                <span data-label="Status">
                  <span className={`tag ${ticket.status === "Closed" ? "success" : ticket.status === "In Progress" ? "pending" : "active"}`}>
                    {ticket.status}
                  </span>
                </span>
                <span data-label="Action" style={{ display: "flex", gap: "8px" }}>
                  <button className="btn-sm outline" onClick={() => setSelectedTicket(ticket)}>View</button>
                  <button className="btn-sm danger" onClick={() => deleteTicket(ticket._id)}>Delete</button>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
          <button className="btn-sm outline" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1}>
            Previous
          </button>
          <span style={{ alignSelf: "center", color: "#6b7280" }}>
            Page {currentPage} of {totalPages}
          </span>
          <button className="btn-sm outline" onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      )}

      {selectedTicket && (
        <div className="admin-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setSelectedTicket(null)}>
          <div className="admin-section" style={{ width: "min(92vw, 640px)", margin: 0 }} onClick={(event) => event.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ margin: 0 }}>Ticket Details</h3>
              <button className="btn-sm outline" onClick={() => setSelectedTicket(null)}>Close</button>
            </div>

            <p><strong>From:</strong> {selectedTicket.from || "N/A"}</p>
            <p><strong>Name:</strong> {selectedTicket.name || "N/A"}</p>
            <p><strong>Email:</strong> {selectedTicket.email || "N/A"}</p>
            <p><strong>Issue:</strong> {selectedTicket.issue || "N/A"}</p>
            <p><strong>Description:</strong> {selectedTicket.description || "N/A"}</p>
            <p><strong>Priority:</strong> {selectedTicket.priority || "N/A"}</p>
            <p><strong>Status:</strong> {selectedTicket.status || "N/A"}</p>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
              {SUPPORT_STATUSES.map((status) => (
                <button
                  key={status}
                  className={`btn-sm ${selectedTicket.status === status ? "" : "outline"}`}
                  disabled={selectedTicket.status === status}
                  onClick={() => updateTicketStatus(selectedTicket._id, status)}
                >
                  Mark {status}
                </button>
              ))}
              <button className="btn-sm danger" onClick={() => deleteTicket(selectedTicket._id)}>Delete Ticket</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
