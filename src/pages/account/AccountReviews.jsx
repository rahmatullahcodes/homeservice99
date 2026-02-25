import { useState, useEffect } from "react";
import "../../styles/account.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AccountReviews() {

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    comment: "",
    vendorId: "",
    serviceId: "",
    bookingId: ""
  });

  // Fetch user reviews on mount
  useEffect(() => {
    fetchUserReviews();
  }, []);

  async function fetchUserReviews() {
    try {
      setLoading(true);
      setError("");
      
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("auth");
      
      if (!userId || !token) {
        setError("Please login to view your reviews");
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/admin/reviews/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to load reviews");
      }

      const data = await response.json();
      setReviews(data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitReview() {
    if (!formData.comment || !formData.vendorId || !formData.serviceId) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("auth");
      
      const response = await fetch(`${API_BASE_URL}/admin/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          ...formData
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to submit review");
      }

      const newReview = await response.json();
      setReviews(prev => [newReview, ...prev]);
      setFormData({ rating: 5, title: "", comment: "", vendorId: "", serviceId: "", bookingId: "" });
      setShowForm(false);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Calculate stats
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;
  const fiveStarCount = reviews.filter(r => r.rating === 5).length;
  
  const filteredReviews = filter ? reviews.filter(r => r.rating === filter) : reviews;

  return (
    <div className="dashboard-wrapper">

      <h2 className="dashboard-title">My Reviews</h2>
      <p className="dashboard-subtitle">Feedback you've given on services</p>

      {/* KPI CARDS */}
      <div className="dashboard-grid" style={{ marginBottom: "32px" }}>
        <div className="dash-card blue">
          <div className="dash-icon">⭐</div>
          <div>
            <p className="dash-label">Average Rating</p>
            <h3>{avgRating}</h3>
            <span className="dash-trend">Out of 5.0</span>
          </div>
        </div>
        <div className="dash-card green">
          <div className="dash-icon">📝</div>
          <div>
            <p className="dash-label">Total Reviews</p>
            <h3>{reviews.length}</h3>
            <span className="dash-trend">All time</span>
          </div>
        </div>
        <div className="dash-card yellow">
          <div className="dash-icon">👍</div>
          <div>
            <p className="dash-label">5 Star Reviews</p>
            <h3>{fiveStarCount}</h3>
            <span className="dash-trend">Excellent</span>
          </div>
        </div>
      </div>

      {/* WRITE REVIEW BUTTON */}
      <div style={{ marginBottom: "20px" }}>
        <button 
          className="account-btn primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "✕ Cancel" : "✏️ Write a Review"}
        </button>
      </div>

      {/* WRITE REVIEW FORM */}
      {showForm && (
        <div className="account-card" style={{ marginBottom: "20px", padding: "20px", backgroundColor: "#f9fafb" }}>
          <h3 style={{ marginBottom: "15px" }}>Write a New Review</h3>
          
          {error && <div style={{ color: "red", marginBottom: "10px", padding: "8px", backgroundColor: "#ffe6e6", borderRadius: "4px" }}>{error}</div>}
          
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Vendor ID *</label>
            <input
              type="text"
              placeholder="Enter vendor ID"
              value={formData.vendorId}
              onChange={e => setFormData({ ...formData, vendorId: e.target.value })}
              style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Service ID *</label>
            <input
              type="text"
              placeholder="Enter service ID"
              value={formData.serviceId}
              onChange={e => setFormData({ ...formData, serviceId: e.target.value })}
              style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Rating *</label>
            <select
              value={formData.rating}
              onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })}
              style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
            >
              <option value={5}>⭐⭐⭐⭐⭐ Excellent</option>
              <option value={4}>⭐⭐⭐⭐ Very Good</option>
              <option value={3}>⭐⭐⭐ Good</option>
              <option value={2}>⭐⭐ Fair</option>
              <option value={1}>⭐ Poor</option>
            </select>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Title (Optional)</label>
            <input
              type="text"
              placeholder="Brief title for your review"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Your Review *</label>
            <textarea
              placeholder="Share your experience..."
              value={formData.comment}
              onChange={e => setFormData({ ...formData, comment: e.target.value })}
              style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", minHeight: "100px", fontFamily: "inherit" }}
            />
          </div>

          <button 
            className="account-btn primary"
            onClick={submitReview}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      )}

      {/* FILTER */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button
          className={`account-btn ${!filter ? "primary" : "secondary"}`}
          onClick={() => setFilter(null)}
        >
          All ({reviews.length})
        </button>
        {[5, 4, 3, 2, 1].map(rating => (
          <button
            key={rating}
            className={`account-btn ${filter === rating ? "primary" : "secondary"}`}
            onClick={() => setFilter(rating)}
            style={{ fontSize: "12px", padding: "8px 12px" }}
          >
            {"⭐".repeat(rating)} ({reviews.filter(r => r.rating === rating).length})
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign: "center", padding: "20px" }}>Loading reviews...</div>}

      {filteredReviews.length === 0 && !loading && (
        <div className="account-alert info" style={{ textAlign: "center" }}>
          {reviews.length === 0 ? "No reviews yet. Write your first review!" : "No reviews with this rating"}
        </div>
      )}

      <div className="account-grid-2">
        {filteredReviews.map(r => (
          <div key={r._id} className="account-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "16px" }}>{r.service?.title || "Service"}</h3>
              <span className="account-badge green" style={{ fontSize: "12px" }}>
                {r.status || "Submitted"}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "18px" }}>{"⭐".repeat(r.rating)}</span>
              <span style={{ color: "#6b7280", fontSize: "12px" }}>{r.rating} out of 5</span>
            </div>

            {r.title && <p style={{ margin: "8px 0", fontWeight: "600", color: "#374151" }}>{r.title}</p>}
            <p style={{ margin: "12px 0", color: "#6b7280", lineHeight: 1.5 }}>{r.comment}</p>
            
            <small style={{ color: "#9ca3af" }}>
              📅 {new Date(r.createdAt).toLocaleDateString()}
            </small>

            <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--account-border)" }}>
              <small style={{ color: "#9ca3af" }}>Vendor: {r.vendor?.businessName || "Unknown"}</small>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
