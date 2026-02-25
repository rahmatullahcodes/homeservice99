import { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AdminReviews() {

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [page, setPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
  const { addToast } = useToast();

  // Fetch reviews on mount and when filters change
  useEffect(() => {
    fetchReviews();
  }, [filterStatus, page]);

  // Fetch all reviews from backend
  async function fetchReviews() {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      
      if (!token) {
        setError("Admin authentication required. Please login first.");
        setLoading(false);
        return;
      }
      
      let url = `${API_BASE_URL}/admin/reviews?page=${page}&limit=10`;
      if (filterStatus !== "All") {
        url += `&status=${filterStatus}`;
      }
        
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("token");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setReviews(Array.isArray(data.reviews) ? data.reviews : (Array.isArray(data) ? data : []));
      setTotalReviews(data.total || 0);
      
      // Calculate stats
      calculateStats();
    } catch (err) {
      const message = err.message || "Failed to load reviews";
      setError(message);
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  // Calculate review statistics
  async function calculateStats() {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/admin/reviews`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        const allReviews = Array.isArray(data.reviews) ? data.reviews : [];
        const pending = allReviews.filter(r => r.status === "Pending").length;
        const approved = allReviews.filter(r => r.status === "Approved").length;
        
        setStats({ total: allReviews.length, pending, approved });
      }
    } catch (err) {
      console.error("Error calculating stats:", err);
    }
  }

  // Filter and sort reviews locally
  const filteredReviews = reviews
    .filter(r => 
      r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.vendor?.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.comment?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "latest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "lowest") return a.rating - b.rating;
      return 0;
    });

  // Update review status
  async function updateStatus(id, newStatus) {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        addToast("Authentication required", "error");
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/admin/reviews/${id}/status`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update review");
      }

      const updatedReview = await response.json();
      
      setReviews(prev =>
        prev.map(r =>
          r._id === id ? updatedReview : r
        )
      );

      addToast(`Review ${newStatus.toLowerCase()}`, "success");
    } catch (err) {
      addToast(err.message, "error");
      console.error("Update error:", err);
    }
  }

  // Delete review
  async function deleteReviewItem(id) {
    if (!window.confirm("Delete this review permanently?")) return;

    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        addToast("Authentication required", "error");
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/admin/reviews/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete review");
      }

      setReviews(prev => prev.filter(r => r._id !== id));
      addToast("Review deleted", "success");
    } catch (err) {
      addToast(err.message, "error");
      console.error("Delete error:", err);
    }
  }

  return (
    <div className="admin-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2>Reviews Management</h2>
          <p className="admin-subtitle">
            Moderate customer feedback and maintain platform quality
          </p>
        </div>
        <button 
          className="btn-primary" 
          onClick={fetchReviews}
          style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px" }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* STATISTICS CARDS */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
        gap: "15px", 
        marginBottom: "25px" 
      }}>
        <div style={{ 
          backgroundColor: "#e3f2fd", 
          padding: "20px", 
          borderRadius: "8px", 
          borderLeft: "4px solid #2196F3" 
        }}>
          <div style={{ fontSize: "0.9em", color: "#666" }}>Total Reviews</div>
          <div style={{ fontSize: "2em", fontWeight: "bold", color: "#2196F3", marginTop: "8px" }}>
            {stats.total}
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: "#fff3e0", 
          padding: "20px", 
          borderRadius: "8px", 
          borderLeft: "4px solid #FF9800" 
        }}>
          <div style={{ fontSize: "0.9em", color: "#666" }}>Pending</div>
          <div style={{ fontSize: "2em", fontWeight: "bold", color: "#FF9800", marginTop: "8px" }}>
            {stats.pending}
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: "#e8f5e9", 
          padding: "20px", 
          borderRadius: "8px", 
          borderLeft: "4px solid #4CAF50" 
        }}>
          <div style={{ fontSize: "0.9em", color: "#666" }}>Approved</div>
          <div style={{ fontSize: "2em", fontWeight: "bold", color: "#4CAF50", marginTop: "8px" }}>
            {stats.approved}
          </div>
        </div>
      </div>

      {error && <div style={{ color: "#d32f2f", marginBottom: "15px", padding: "12px", backgroundColor: "#ffebee", borderRadius: "4px", borderLeft: "4px solid #d32f2f" }}>{error}</div>}

      {/* FILTERS & SEARCH */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by user, vendor, or comment..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ 
            flex: 1, 
            minWidth: "250px",
            padding: "10px 12px", 
            borderRadius: "6px", 
            border: "1px solid #ddd",
            fontSize: "0.95em"
          }}
        />
        
        <select 
          value={filterStatus} 
          onChange={e => {
            setFilterStatus(e.target.value);
            setPage(1);
          }}
          style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid #ddd" }}
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Hidden">Hidden</option>
          <option value="Rejected">Rejected</option>
        </select>
        
        <select 
          value={sortBy} 
          onChange={e => setSortBy(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid #ddd" }}
        >
          <option value="latest">Latest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
      </div>

      {/* REVIEWS TABLE */}
      <div className="admin-table" style={{ overflowX: "auto" }}>

        {/* TABLE HEADER */}
        <div className="table-row head" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr 0.8fr 1.5fr 0.8fr 1.2fr", gap: "10px", alignItems: "center" }}>
          <span><strong>User</strong></span>
          <span><strong>Vendor</strong></span>
          <span><strong>Service</strong></span>
          <span><strong>Rating</strong></span>
          <span><strong>Comment</strong></span>
          <span><strong>Status</strong></span>
          <span><strong>Actions</strong></span>
        </div>

        {/* TABLE BODY */}
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", gridColumn: "1/-1" }}>
            <div style={{ fontSize: "1.1em", color: "#666" }}>⏳ Loading reviews...</div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", gridColumn: "1/-1" }}>
            <div style={{ fontSize: "1.1em", color: "#999" }}>📭 No reviews found</div>
          </div>
        ) : (
          filteredReviews.map(r => (
            <div className="table-row" key={r._id} style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr 0.8fr 1.5fr 0.8fr 1.2fr", gap: "10px", alignItems: "center" }}>
              <span>
                <strong>{r.user?.name || "Unknown"}</strong>
                <div style={{ fontSize: "0.8em", color: "#999" }}>{r.user?.email || ""}</div>
              </span>
              <span>{r.vendor?.businessName || "Unknown"}</span>
              <span>{r.service?.title || "Unknown"}</span>
              <span style={{ fontWeight: "bold", color: "#FF9800" }}>
                {"⭐".repeat(r.rating)}{r.rating}/5
              </span>
              <span style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.95em" }}>
                {r.comment}
              </span>
              <span
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "0.9em",
                  fontWeight: "bold",
                  backgroundColor:
                    r.status === "Approved"
                      ? "#c8e6c9"
                      : r.status === "Pending"
                      ? "#fff9c4"
                      : r.status === "Rejected"
                      ? "#ffcdd2"
                      : "#e0e0e0",
                  color:
                    r.status === "Approved"
                      ? "#2e7d32"
                      : r.status === "Pending"
                      ? "#f57f17"
                      : r.status === "Rejected"
                      ? "#c62828"
                      : "#424242"
                }}
              >
                {r.status}
              </span>
              <span style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                {r.status !== "Approved" && (
                  <button
                    className="btn-success"
                    onClick={() => updateStatus(r._id, "Approved")}
                    style={{ fontSize: "0.8em", padding: "4px 8px", cursor: "pointer" }}
                    title="Approve this review"
                  >
                    ✓
                  </button>
                )}
                {r.status !== "Hidden" && (
                  <button
                    className="btn-warning"
                    onClick={() => updateStatus(r._id, "Hidden")}
                    style={{ fontSize: "0.8em", padding: "4px 8px", cursor: "pointer" }}
                    title="Hide this review"
                  >
                    👁
                  </button>
                )}
                <button
                  className="btn-danger"
                  onClick={() => deleteReviewItem(r._id)}
                  style={{ fontSize: "0.8em", padding: "4px 8px", cursor: "pointer" }}
                  title="Delete this review"
                >
                  🗑
                </button>
              </span>
            </div>
          ))
        )}

      </div>

      {/* PAGINATION */}
      {totalReviews > 10 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px" }}>
          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
            style={{ padding: "8px 12px", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.5 : 1 }}
          >
            ← Previous
          </button>
          <span style={{ padding: "8px 12px", fontWeight: "bold" }}>Page {page} of {Math.ceil(totalReviews / 10)}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page * 10 >= totalReviews}
            style={{ padding: "8px 12px", cursor: page * 10 >= totalReviews ? "not-allowed" : "pointer", opacity: page * 10 >= totalReviews ? 0.5 : 1 }}
          >
            Next →
          </button>
        </div>
      )}

    </div>
  );
}
