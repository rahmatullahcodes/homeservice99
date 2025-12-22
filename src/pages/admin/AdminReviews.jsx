import { useState } from "react";

export default function AdminReviews() {

  const [reviews, setReviews] = useState([
    {
      id: 1,
      user: "Amit",
      service: "AC Repair",
      stars: 5,
      msg: "Very professional service",
      status: "Approved"
    },
    {
      id: 2,
      user: "Neha",
      service: "Cleaning",
      stars: 4,
      msg: "Good but arrived late",
      status: "Pending"
    }
  ]);

  function toggleStatus(id) {
    setReviews(prev =>
      prev.map(r =>
        r.id === id
          ? { ...r, status: r.status === "Approved" ? "Hidden" : "Approved" }
          : r
      )
    );
  }

  function deleteReview(id) {
    if (!window.confirm("Delete this review?")) return;
    setReviews(prev => prev.filter(r => r.id !== id));
  }

  return (
    <div className="admin-page">

      <h2>Reviews</h2>
      <p className="admin-subtitle">
        Moderate customer feedback across the platform
      </p>

      <div className="admin-table">

        {/* TABLE HEADER */}
        <div className="table-row head">
          <span>User</span>
          <span>Service</span>
          <span>Rating</span>
          <span>Review</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {/* TABLE BODY */}
        {reviews.map(r => (
          <div className="table-row" key={r.id}>
            <span><strong>{r.user}</strong></span>
            <span>{r.service}</span>
            <span>{"⭐".repeat(r.stars)}</span>
            <span>{r.msg}</span>
            <span
              className={
                r.status === "Approved"
                  ? "status-success"
                  : r.status === "Pending"
                  ? "status-pending"
                  : "status-danger"
              }
            >
              {r.status}
            </span>
            <span>
              <button
                className="btn-outline"
                onClick={() => toggleStatus(r.id)}
              >
                {r.status === "Approved" ? "Hide" : "Approve"}
              </button>

              <button
                className="btn-danger"
                style={{ marginLeft: 6 }}
                onClick={() => deleteReview(r.id)}
              >
                Delete
              </button>
            </span>
          </div>
        ))}

      </div>

    </div>
  );
}
