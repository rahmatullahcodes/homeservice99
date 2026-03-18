import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../config/api";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Form states
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("Users");
  const [city, setCity] = useState("");
  const [type, setType] = useState("Push");
  const [priority, setPriority] = useState("Medium");
  const [imageUrl, setImageUrl] = useState("");
  const [actionUrl, setActionUrl] = useState("");
  const [actionLabel, setActionLabel] = useState("View Offer");
  const [showAsPopup, setShowAsPopup] = useState(false);
  const [sending, setSending] = useState(false);
  const [editingNotificationId, setEditingNotificationId] = useState(null);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterAudience, setFilterAudience] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, []);

  useEffect(() => {
    filterAndSortNotifications();
  }, [notifications, searchTerm, filterStatus, filterType, filterAudience, sortBy]);

  function resetComposer() {
    setTitle("");
    setMessage("");
    setAudience("Users");
    setType("Push");
    setPriority("Medium");
    setCity("");
    setImageUrl("");
    setActionUrl("");
    setActionLabel("View Offer");
    setShowAsPopup(false);
    setEditingNotificationId(null);
  }

  function handleEditNotification(notification) {
    setEditingNotificationId(notification._id);
    setTitle(notification.title || "");
    setMessage(notification.message || "");
    setAudience(notification.audience || "Users");
    setType(notification.type || "Push");
    setPriority(notification.priority || "Medium");
    setCity(notification.city && notification.city !== "All" ? notification.city : "");
    setImageUrl(notification.imageUrl || "");
    setActionUrl(notification.actionUrl || "");
    setActionLabel(notification.actionLabel || "View Offer");
    setShowAsPopup(Boolean(notification.showAsPopup));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function fetchNotifications() {
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

      const response = await fetch(API_ENDPOINTS.NOTIFICATIONS.GET_ALL, { headers });

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.message);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const token = localStorage.getItem("adminToken");
      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      const response = await fetch(API_ENDPOINTS.NOTIFICATIONS.GET_STATS, { headers });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }

  function filterAndSortNotifications() {
    let filtered = [...notifications];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(n =>
        n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(n => n.status === filterStatus);
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter(n => n.type === filterType);
    }

    // Audience filter
    if (filterAudience !== "all") {
      filtered = filtered.filter(n => n.audience === filterAudience);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "date-asc") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    setFilteredNotifications(filtered);
    setCurrentPage(1);
  }

  async function handleSendNotification() {
    if (!title || !message) {
      alert("Title and message are required");
      return;
    }

    try {
      setSending(true);
      const token = localStorage.getItem("adminToken");

      if (!token) {
        throw new Error("Admin authentication required");
      }

      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };
      const payload = {
        title,
        message,
        audience,
        type,
        city: city || "All",
        priority,
        imageUrl,
        actionUrl,
        actionLabel,
        showAsPopup
      };

      if (editingNotificationId) {
        const updateResponse = await fetch(API_ENDPOINTS.NOTIFICATIONS.UPDATE(editingNotificationId), {
          method: "PATCH",
          headers,
          body: JSON.stringify(payload)
        });

        if (!updateResponse.ok) {
          throw new Error("Failed to update notification");
        }

        const updatedNotification = await updateResponse.json();
        setNotifications((prev) =>
          prev.map((item) => (item._id === updatedNotification._id ? updatedNotification : item))
        );
        alert("Notification updated successfully!");
      } else {
        const createResponse = await fetch(API_ENDPOINTS.NOTIFICATIONS.CREATE, {
          method: "POST",
          headers,
          body: JSON.stringify(payload)
        });

        if (!createResponse.ok) throw new Error("Failed to create notification");

        const notification = await createResponse.json();

        const sendResponse = await fetch(API_ENDPOINTS.NOTIFICATIONS.SEND(notification._id), {
          method: "POST",
          headers
        });

        if (!sendResponse.ok) throw new Error("Failed to send notification");

        const sendData = await sendResponse.json().catch(() => ({}));
        const sentNotification = sendData.notification || notification;
        setNotifications((prev) => [sentNotification, ...prev]);
        alert("Notification sent successfully!");
      }

      resetComposer();
      fetchStats();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSending(false);
    }
  }

  async function handleTogglePopup(notification) {
    try {
      const token = localStorage.getItem("adminToken");
      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      const response = await fetch(API_ENDPOINTS.NOTIFICATIONS.UPDATE(notification._id), {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          showAsPopup: !notification.showAsPopup
        })
      });

      if (!response.ok) {
        throw new Error("Failed to update popup status");
      }

      const updated = await response.json();
      setNotifications((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item))
      );
    } catch (err) {
      alert("Error: " + err.message);
    }
  }
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case "Sent": return "#10b981";
      case "Draft": return "#6b7280";
      case "Scheduled": return "#f59e0b";
      default: return "#3b82f6";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "#ef4444";
      case "Medium": return "#f59e0b";
      case "Low": return "#10b981";
      default: return "#6b7280";
    }
  };

  if (loading) {
    return (
      <div className="admin-notifications">
        <div className="admin-page-head">
          <h2>Notifications</h2>
          <p className="admin-subtitle">Send effective communication campaigns</p>
        </div>
        <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-notifications">
      {/* HEADER */}
      <div className="admin-page-head">
        <h2>Notifications</h2>
        <p className="admin-subtitle">Send & manage push, email & in-app notifications</p>
      </div>

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
          {error}
        </div>
      )}

      {/* STATS */}
      {stats && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
          marginBottom: "24px"
        }}>
          <div style={{
            padding: "14px",
            backgroundColor: "#dbeafe",
            borderRadius: "8px",
            border: "1px solid #93c5fd",
            textAlign: "center"
          }}>
            <p style={{ font: "11px", color: "#1e40af", fontWeight: 700, margin: "0 0 4px 0", textTransform: "uppercase" }}>Total</p>
            <h4 style={{ fontSize: "24px", fontWeight: 700, color: "#1e3a8a", margin: 0 }}>{stats.total}</h4>
          </div>
          <div style={{
            padding: "14px",
            backgroundColor: "#dcfce7",
            borderRadius: "8px",
            border: "1px solid #bbf7d0",
            textAlign: "center"
          }}>
            <p style={{ font: "11px", color: "#166534", fontWeight: 700, margin: "0 0 4px 0", textTransform: "uppercase" }}>Sent</p>
            <h4 style={{ fontSize: "24px", fontWeight: 700, color: "#15803d", margin: 0 }}>{stats.status.sent}</h4>
          </div>
          <div style={{
            padding: "14px",
            backgroundColor: "#fef3c7",
            borderRadius: "8px",
            border: "1px solid #fcd34d",
            textAlign: "center"
          }}>
            <p style={{ font: "11px", color: "#92400e", fontWeight: 700, margin: "0 0 4px 0", textTransform: "uppercase" }}>Draft</p>
            <h4 style={{ fontSize: "24px", fontWeight: 700, color: "#78350f", margin: 0 }}>{stats.status.draft}</h4>
          </div>
          <div style={{
            padding: "14px",
            backgroundColor: "#fce7f3",
            borderRadius: "8px",
            border: "1px solid #fbcfe8",
            textAlign: "center"
          }}>
            <p style={{ font: "11px", color: "#831843", fontWeight: 700, margin: "0 0 4px 0", textTransform: "uppercase" }}>Scheduled</p>
            <h4 style={{ fontSize: "24px", fontWeight: 700, color: "#be185d", margin: 0 }}>{stats.status.scheduled}</h4>
          </div>
        </div>
      )}

      {/* CREATE NOTIFICATION FORM */}
      <div style={{
        backgroundColor: "white",
        padding: "24px",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        marginBottom: "24px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
      }}>
        <h3 style={{ marginTop: 0, marginBottom: "8px", fontSize: "18px", fontWeight: 700, color: "#1f2937" }}>
          {editingNotificationId ? "Edit Popup Notification" : "Create & Send Notification"}
        </h3>
        {editingNotificationId && (
          <p style={{ margin: "0 0 14px 0", fontSize: "13px", color: "#475569" }}>
            Update fields and click save. You can disable popup from card actions.
          </p>
        )}

        <div style={{ marginBottom: "14px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>
            Notification Title *
          </label>
          <input
            type="text"
            placeholder="e.g., Special Weekend Offer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              fontFamily: "inherit",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>
            Message Body *
          </label>
          <textarea
            rows="3"
            placeholder="Enter notification message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              fontFamily: "inherit",
              boxSizing: "border-box",
              resize: "vertical"
            }}
          />
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          marginBottom: "14px"
        }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>
              Audience
            </label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                fontFamily: "inherit",
                cursor: "pointer"
              }}
            >
              <option value="Users">All Users</option>
              <option value="Vendors">All Vendors</option>
              <option value="Specific">Specific Audience</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>
              Notification Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                fontFamily: "inherit",
                cursor: "pointer"
              }}
            >
              <option value="Push">Push Notification</option>
              <option value="Email">Email</option>
              <option value="In-App">In-App Message</option>
              <option value="SMS">SMS</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                fontFamily: "inherit",
                cursor: "pointer"
              }}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>
              City (Optional)
            </label>
            <input
              type="text"
              placeholder="Leave empty for all cities"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                fontFamily: "inherit",
                boxSizing: "border-box"
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>
            Image URL (Optional)
          </label>
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              fontFamily: "inherit",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "12px",
          marginBottom: "14px"
        }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>
              Popup Button URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://example.com/offer"
              value={actionUrl}
              onChange={(event) => setActionUrl(event.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                fontFamily: "inherit",
                boxSizing: "border-box"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>
              Popup Button Text
            </label>
            <input
              type="text"
              placeholder="View Offer"
              value={actionLabel}
              onChange={(event) => setActionLabel(event.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                fontFamily: "inherit",
                boxSizing: "border-box"
              }}
            />
          </div>
        </div>

        <div style={{
          marginBottom: "16px",
          padding: "10px 12px",
          borderRadius: "8px",
          border: "1px solid #dbeafe",
          backgroundColor: "#eff6ff"
        }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px", color: "#1e3a8a", fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={showAsPopup}
              onChange={(event) => setShowAsPopup(event.target.checked)}
            />
            Show this broadcast as first-visit website popup
          </label>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={handleSendNotification}
            disabled={sending || !title || !message}
            style={{
              flex: "1 1 240px",
              padding: "12px 16px",
              backgroundColor: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: sending ? "not-allowed" : "pointer",
              opacity: sending || !title || !message ? 0.6 : 1,
              transition: "all 0.2s"
            }}
          >
            {sending ? (editingNotificationId ? "Saving..." : "Sending...") : (editingNotificationId ? "Save Changes" : "Send Notification")}
          </button>
          {editingNotificationId && (
            <button
              type="button"
              onClick={resetComposer}
              style={{
                flex: "0 0 auto",
                padding: "12px 16px",
                backgroundColor: "#ffffff",
                color: "#334155",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* FILTERS */}
      <div style={{
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        marginBottom: "20px"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px"
        }}>
          <input
            type="text"
            placeholder="🔍 Search notifications..."
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
            <option value="Sent">Sent</option>
            <option value="Draft">Draft</option>
            <option value="Scheduled">Scheduled</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              fontFamily: "inherit",
              cursor: "pointer"
            }}
          >
            <option value="all">All Types</option>
            <option value="Push">Push</option>
            <option value="Email">Email</option>
            <option value="In-App">In-App</option>
            <option value="SMS">SMS</option>
          </select>
          <select
            value={filterAudience}
            onChange={(e) => setFilterAudience(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              fontFamily: "inherit",
              cursor: "pointer"
            }}
          >
            <option value="all">All Audiences</option>
            <option value="Users">Users</option>
            <option value="Vendors">Vendors</option>
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
          </select>
        </div>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "16px",
        marginBottom: "24px"
      }}>
        {paginatedNotifications.map(notif => (
          <div
            key={notif._id}
            style={{
              padding: "16px",
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s ease"
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
            <div style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "8px", marginBottom: "8px" }}>
                <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#1f2937", flex: 1 }}>
                  {notif.title}
                </h4>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  {notif.showAsPopup && (
                    <span style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "#1e40af",
                      backgroundColor: "#dbeafe",
                      padding: "4px 6px",
                      borderRadius: "4px",
                      whiteSpace: "nowrap"
                    }}>
                      POPUP
                    </span>
                  )}
                  <span style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: getStatusColor(notif.status),
                    backgroundColor: getStatusColor(notif.status) + "20",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    whiteSpace: "nowrap"
                  }}>
                    {notif.status}
                  </span>
                </div>
              </div>
              <p style={{
                margin: 0,
                fontSize: "13px",
                color: "#374151",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: "1.4"
              }}>
                {notif.message}
              </p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
              fontSize: "12px",
              marginBottom: "12px",
              paddingBottom: "12px",
              borderBottom: "1px solid #f3f4f6"
            }}>
              <div>
                <p style={{ margin: 0, color: "#6b7280", fontWeight: 600 }}>Type</p>
                <p style={{ margin: "4px 0 0 0", color: "#1f2937", fontWeight: 500 }}>{notif.type}</p>
              </div>
              <div>
                <p style={{ margin: 0, color: "#6b7280", fontWeight: 600 }}>Audience</p>
                <p style={{ margin: "4px 0 0 0", color: "#1f2937", fontWeight: 500 }}>{notif.audience}</p>
              </div>
              <div>
                <p style={{ margin: 0, color: "#6b7280", fontWeight: 600 }}>City</p>
                <p style={{ margin: "4px 0 0 0", color: "#1f2937", fontWeight: 500 }}>{notif.city}</p>
              </div>
              <div>
                <p style={{ margin: 0, color: "#6b7280", fontWeight: 600 }}>Priority</p>
                <span style={{
                  display: "inline-block",
                  marginTop: "4px",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: getPriorityColor(notif.priority),
                  backgroundColor: getPriorityColor(notif.priority) + "20",
                  padding: "2px 6px",
                  borderRadius: "3px"
                }}>
                  {notif.priority}
                </span>
              </div>
            </div>

            {notif.status === "Sent" && notif.deliveryStatus && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "8px",
                fontSize: "11px",
                marginBottom: "12px",
                padding: "10px",
                backgroundColor: "#f9fafb",
                borderRadius: "6px"
              }}>
                <div>
                  <p style={{ margin: 0, color: "#6b7280" }}>Sent</p>
                  <p style={{ margin: "2px 0 0 0", fontSize: "14px", fontWeight: 700, color: "#10b981" }}>
                    {notif.deliveryStatus.sent}
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, color: "#6b7280" }}>Read</p>
                  <p style={{ margin: "2px 0 0 0", fontSize: "14px", fontWeight: 700, color: "#3b82f6" }}>
                    {notif.deliveryStatus.read}
                  </p>
                </div>
              </div>
            )}

            <div style={{
              marginBottom: "12px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px"
            }}>
              <button
                type="button"
                onClick={() => handleEditNotification(notif)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: editingNotificationId === notif._id ? "#e0e7ff" : "#ffffff",
                  color: "#334155",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                {editingNotificationId === notif._id ? "Editing..." : "Edit Popup"}
              </button>
              <button
                type="button"
                onClick={() => handleTogglePopup(notif)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: notif.showAsPopup ? "#dbeafe" : "#ffffff",
                  color: notif.showAsPopup ? "#1e40af" : "#334155",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                {notif.showAsPopup ? "Disable Popup" : "Enable Popup"}
              </button>
            </div>

            {notif.actionUrl && (
              <a
                href={notif.actionUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  marginBottom: "10px",
                  color: "#1d4ed8",
                  fontSize: "12px",
                  fontWeight: 600,
                  textDecoration: "none"
                }}
              >
                Popup Button: {notif.actionLabel || "View Offer"}
              </a>
            )}

            <p style={{
              margin: 0,
              fontSize: "12px",
              color: "#9ca3af"
            }}>
              {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div style={{
          padding: "40px",
          textAlign: "center",
          backgroundColor: "white",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          color: "#6b7280"
        }}>
          <p style={{ fontSize: "16px", fontWeight: 500 }}>No notifications found</p>
          <p style={{ fontSize: "14px", color: "#9ca3af" }}>Try adjusting your filters or create a new notification</p>
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
    </div>
  );
}



