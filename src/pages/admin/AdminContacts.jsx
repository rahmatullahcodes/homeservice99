import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../config/api";

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [selectedContact, setSelectedContact] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    high: 0
  });

  const [responseText, setResponseText] = useState("");

  // Fetch contacts from backend
  useEffect(() => {
    (async () => {
      const fetchedContacts = await fetchContacts();
      if (fetchedContacts && fetchedContacts.length > 0) {
        setStats({
          total: fetchedContacts.length,
          new: fetchedContacts.filter(c => c.status === "New").length,
          inProgress: fetchedContacts.filter(c => c.status === "In Progress").length,
          resolved: fetchedContacts.filter(c => c.status === "Resolved").length,
          closed: fetchedContacts.filter(c => c.status === "Closed").length,
          high: fetchedContacts.filter(c => c.priority === "High").length
        });
      }
    })();
  }, []);

  async function fetchContacts() {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        setError("Admin authentication required. Please login first.");
        setLoading(false);
        return;
      }

      const response = await fetch(API_ENDPOINTS.CONTACT.GET_ALL, {
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

      // Handle both array and object responses
      let contactsArray = Array.isArray(data) ? data : (data?.contacts || []);
      
      if (!Array.isArray(contactsArray)) {
        console.warn("Unexpected data format:", data);
        contactsArray = [];
      }

      // Transform data with formatted dates
      const transformedContacts = contactsArray.map(contact => ({
        ...contact,
        _id: contact._id || contact.id,
        createdAtFormatted: new Date(contact.createdAt).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric"
        }),
        createdAtTime: new Date(contact.createdAt).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit"
        })
      }));

      setContacts(transformedContacts);
      return transformedContacts;
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError(err.message || "Failed to load contacts. Make sure backend is running.");
      return [];
    } finally {
      setLoading(false);
    }
  }

  // Filter contacts based on search and filters
  function getFilteredContacts() {
    let filtered = [...contacts];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.subject?.toLowerCase().includes(query) ||
        c.message?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filterStatus !== "All") {
      filtered = filtered.filter(c => c.status === filterStatus);
    }

    // Priority filter
    if (filterPriority !== "All") {
      filtered = filtered.filter(c => c.priority === filterPriority);
    }

    // Category filter
    if (filterCategory !== "All") {
      filtered = filtered.filter(c => c.category === filterCategory);
    }

    return filtered;
  }

  async function handleUpdateStatus(contactId, newStatus) {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        return;
      }

      const response = await fetch(API_ENDPOINTS.CONTACT.UPDATE_STATUS(contactId), {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update status");
      }

      // Update local state
      const updatedContacts = contacts.map(c =>
        c._id === contactId ? { ...c, status: newStatus } : c
      );
      setContacts(updatedContacts);

      if (selectedContact?._id === contactId) {
        setSelectedContact({ ...selectedContact, status: newStatus });
      }

      // Refresh stats
      setStats({
        total: updatedContacts.length,
        new: updatedContacts.filter(c => c.status === "New").length,
        inProgress: updatedContacts.filter(c => c.status === "In Progress").length,
        resolved: updatedContacts.filter(c => c.status === "Resolved").length,
        closed: updatedContacts.filter(c => c.status === "Closed").length,
        high: updatedContacts.filter(c => c.priority === "High").length
      });

      alert("Status updated successfully!");
    } catch (err) {
      console.error("Error updating status:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddResponse(contactId) {
    if (!responseText.trim()) {
      alert("Please enter a response");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        return;
      }

      const response = await fetch(API_ENDPOINTS.CONTACT.UPDATE_STATUS(contactId), {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "Resolved",
          response: responseText,
          respondedBy: "admin" // This would be replaced by actual admin ID from token
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add response");
      }

      // Update local state
      const updatedContacts = contacts.map(c =>
        c._id === contactId 
          ? { ...c, status: "Resolved", response: responseText } 
          : c
      );
      setContacts(updatedContacts);

      if (selectedContact?._id === contactId) {
        setSelectedContact({ 
          ...selectedContact, 
          status: "Resolved", 
          response: responseText 
        });
      }

      setResponseText("");

      // Refresh stats
      setStats({
        total: updatedContacts.length,
        new: updatedContacts.filter(c => c.status === "New").length,
        inProgress: updatedContacts.filter(c => c.status === "In Progress").length,
        resolved: updatedContacts.filter(c => c.status === "Resolved").length,
        closed: updatedContacts.filter(c => c.status === "Closed").length,
        high: updatedContacts.filter(c => c.priority === "High").length
      });

      alert("Response sent successfully!");
    } catch (err) {
      console.error("Error adding response:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteContact(contactId) {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        return;
      }

      const response = await fetch(API_ENDPOINTS.CONTACT.DELETE(contactId), {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete contact");
      }

      const updatedContacts = contacts.filter(c => c._id !== contactId);
      setContacts(updatedContacts);
      setShowDetailsModal(false);
      setSelectedContact(null);

      // Refresh stats
      setStats({
        total: updatedContacts.length,
        new: updatedContacts.filter(c => c.status === "New").length,
        inProgress: updatedContacts.filter(c => c.status === "In Progress").length,
        resolved: updatedContacts.filter(c => c.status === "Resolved").length,
        closed: updatedContacts.filter(c => c.status === "Closed").length,
        high: updatedContacts.filter(c => c.priority === "High").length
      });

      alert("Contact deleted successfully!");
    } catch (err) {
      console.error("Error deleting contact:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredContacts = getFilteredContacts();

  return (
    <div className="admin-contacts">

      {/* PAGE TITLE */}
      <div className="admin-page-head">
        <h2>Customer Contacts</h2>
        <p className="admin-subtitle">
          Manage customer inquiries and support tickets
        </p>
      </div>

      {/* STATS SECTION */}
      <div className="admin-kpi-grid">
        <div className="kpi-card">
          <span>Total Contacts</span>
          <h3>{stats.total}</h3>
          <small className="neutral">All inquiries</small>
        </div>

        <div className="kpi-card">
          <span>New Contacts</span>
          <h3>{stats.new}</h3>
          <small className="positive">Need attention</small>
        </div>

        <div className="kpi-card">
          <span>In Progress</span>
          <h3>{stats.inProgress}</h3>
          <small className="neutral">Being handled</small>
        </div>

        <div className="kpi-card">
          <span>High Priority</span>
          <h3>{stats.high}</h3>
          <small className="danger">Urgent issues</small>
        </div>
      </div>

      {/* FILTERS SECTION */}
      <div className="admin-section">
        <div className="admin-filters">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search by name, email, subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-input search-input"
            />
          </div>

          <div className="filter-group">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Status</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Categories</option>
              <option value="General Inquiry">General Inquiry</option>
              <option value="Booking Issue">Booking Issue</option>
              <option value="Payment Issue">Payment Issue</option>
              <option value="Service Quality">Service Quality</option>
              <option value="Vendor Issue">Vendor Issue</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Bug Report">Bug Report</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button
            className="btn-reset"
            onClick={() => {
              setSearchQuery("");
              setFilterStatus("All");
              setFilterPriority("All");
              setFilterCategory("All");
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* ERROR HANDLING */}
      {error && (
        <div className="admin-alert error">
          <strong>Error:</strong> {error}
          <button onClick={() => fetchContacts()} className="btn-retry">Retry</button>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="admin-loading">
          <p>Loading contacts...</p>
        </div>
      )}

      {/* TABLE SECTION */}
      {!loading && !error && (
        <div className="admin-section">
          <h3>Contacts ({filteredContacts.length} of {contacts.length})</h3>

          {filteredContacts.length === 0 ? (
            <div className="admin-empty">
              <p>No contacts found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <div className="admin-table card-mobile">
                <div className="table-row head">
                  <span className="col-name">Name</span>
                  <span className="col-email">Email</span>
                  <span className="col-category">Category</span>
                  <span className="col-status">Status</span>
                  <span className="col-priority">Priority</span>
                  <span className="col-date">Date</span>
                  <span className="col-actions">Actions</span>
                </div>

                {filteredContacts.map(contact => (
                  <div key={contact._id} className="table-row">
                    <span className="col-name" data-label="Name">
                      <strong>{contact.name}</strong>
                    </span>
                    <span className="col-email" data-label="Email">{contact.email}</span>
                    <span className="col-category" data-label="Category">{contact.category}</span>
                    <span className="col-status" data-label="Status">
                      <span className={`tag ${contact.status.toLowerCase().replace(/ /g, '-')}`}>
                        {contact.status}
                      </span>
                    </span>
                    <span className="col-priority" data-label="Priority">
                      <span className={`priority-badge ${contact.priority.toLowerCase()}`}>
                        {contact.priority}
                      </span>
                    </span>
                    <span className="col-date" data-label="Date">
                      <small>{contact.createdAtFormatted}</small>
                      <br />
                      <small className="text-muted">{contact.createdAtTime}</small>
                    </span>
                    <span className="col-actions" data-label="Actions">
                      <button
                        className="btn-action view"
                        onClick={() => {
                          setSelectedContact(contact);
                          setResponseText("");
                          setShowDetailsModal(true);
                        }}
                        title="View Details">View</button>
                      <button
                        className="btn-action delete"
                        onClick={() => handleDeleteContact(contact._id)}
                        title="Delete" disabled={isSubmitting}>Delete</button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* DETAILS MODAL */}
      {showDetailsModal && selectedContact && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Contact Details</h3>
              <button
                className="btn-close"
                onClick={() => setShowDetailsModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* CONTACT INFO */}
              <div className="details-grid">
                <div className="detail-item">
                  <label>Name</label>
                  <p>{selectedContact.name}</p>
                </div>

                <div className="detail-item">
                  <label>Email</label>
                  <p>{selectedContact.email}</p>
                </div>

                <div className="detail-item">
                  <label>Phone</label>
                  <p>{selectedContact.phone || "Not provided"}</p>
                </div>

                <div className="detail-item">
                  <label>User Type</label>
                  <p>{selectedContact.userType}</p>
                </div>

                <div className="detail-item">
                  <label>Category</label>
                  <p>{selectedContact.category}</p>
                </div>

                <div className="detail-item">
                  <label>Priority</label>
                  <p>
                    <span className={`priority-badge ${selectedContact.priority.toLowerCase()}`}>
                      {selectedContact.priority}
                    </span>
                  </p>
                </div>

                <div className="detail-item">
                  <label>Status</label>
                  <p>
                    <span className={`tag ${selectedContact.status.toLowerCase().replace(/ /g, '-')}`}>
                      {selectedContact.status}
                    </span>
                  </p>
                </div>

                <div className="detail-item">
                  <label>Submitted</label>
                  <p>{selectedContact.createdAtFormatted} at {selectedContact.createdAtTime}</p>
                </div>
              </div>

              {/* SUBJECT */}
              <div className="detail-section">
                <label>Subject</label>
                <p className="detail-text">{selectedContact.subject || "No subject"}</p>
              </div>

              {/* MESSAGE */}
              <div className="detail-section">
                <label>Message</label>
                <div className="detail-message">
                  {selectedContact.message}
                </div>
              </div>

              {/* RESPONSE */}
              {selectedContact.response && (
                <div className="detail-section response-section">
                  <label>Admin Response</label>
                  <div className="detail-message response-message">
                    {selectedContact.response}
                  </div>
                </div>
              )}

              {/* STATUS UPDATE */}
              {selectedContact.status !== "Closed" && (
                <div className="detail-section">
                  <label>Update Status</label>
                  <div className="status-buttons">
                    {["New", "In Progress", "Resolved", "Closed"].map(status => (
                      <button
                        key={status}
                        className={`btn-status ${selectedContact.status === status ? "active" : ""}`}
                        onClick={() => handleUpdateStatus(selectedContact._id, status)}
                        disabled={isSubmitting || selectedContact.status === status}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ADD RESPONSE */}
              {selectedContact.status !== "Closed" && !selectedContact.response && (
                <div className="detail-section">
                  <label>Add Response</label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Type your response here..."
                    className="response-textarea"
                    rows={4}
                  />
                  <button
                    className="btn-primary"
                    onClick={() => handleAddResponse(selectedContact._id)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Response & Resolve"}
                  </button>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowDetailsModal(false)}
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

