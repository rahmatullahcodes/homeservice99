import { useState } from "react";
import "../../styles/account.css";

export default function AccountReviews() {

  const REVIEWS = [
    { id: 1, service: "AC Service", rating: 5, comment: "Excellent service! Technician was on time and fixed during first visit.", date: "10 Feb 2025" },
    { id: 2, service: "Deep Cleaning", rating: 4, comment: "Very good cleaning. Bathroom was spotless, kitchen could be better.", date: "22 Jan 2025" },
    { id: 3, service: "Plumbing", rating: 5, comment: "Quick and professional. Highly recommend!", date: "15 Jan 2025" },
    { id: 4, service: "Electrical Repair", rating: 3, comment: "Good work but took longer than expected.", date: "8 Jan 2025" }
  ];

  const avgRating = (REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length).toFixed(1);
  const [filter, setFilter] = useState(null);

  const filteredReviews = filter ? REVIEWS.filter(r => r.rating === filter) : REVIEWS;

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
            <h3>{REVIEWS.length}</h3>
            <span className="dash-trend">All time</span>
          </div>
        </div>
        <div className="dash-card yellow">
          <div className="dash-icon">👍</div>
          <div>
            <p className="dash-label">5 Star Reviews</p>
            <h3>{REVIEWS.filter(r => r.rating === 5).length}</h3>
            <span className="dash-trend">Excellent</span>
          </div>
        </div>
      </div>

      {/* FILTER */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button
          className={`account-btn ${!filter ? "primary" : "secondary"}`}
          onClick={() => setFilter(null)}
        >
          All ({REVIEWS.length})
        </button>
        {[5, 4, 3, 2, 1].map(rating => (
          <button
            key={rating}
            className={`account-btn ${filter === rating ? "primary" : "secondary"}`}
            onClick={() => setFilter(rating)}
            style={{ fontSize: "12px", padding: "8px 12px" }}
          >
            {"⭐".repeat(rating)} ({REVIEWS.filter(r => r.rating === rating).length})
          </button>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="account-alert info" style={{ textAlign: "center" }}>
          No reviews with this rating
        </div>
      )}

      <div className="account-grid-2">
        {filteredReviews.map(r => (
          <div key={r.id} className="account-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "16px" }}>{r.service}</h3>
              <span className="account-badge green" style={{ fontSize: "12px" }}>Reviewed</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "18px" }}>{"⭐".repeat(r.rating)}</span>
              <span style={{ color: "#6b7280", fontSize: "12px" }}>{r.rating} out of 5</span>
            </div>

            <p style={{ margin: "12px 0", color: "#6b7280", lineHeight: 1.5 }}>{r.comment}</p>
            
            <small style={{ color: "#9ca3af" }}>📅 {r.date}</small>

            <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--account-border)" }}>
              <button className="account-btn secondary" style={{ width: "100%", fontSize: "12px", padding: "6px" }}>
                ✏️ Edit Review
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
