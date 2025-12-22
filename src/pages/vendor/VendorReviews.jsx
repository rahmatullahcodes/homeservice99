import { useState } from "react";

export default function VendorReviews() {

  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("latest");
  const [replies, setReplies] = useState({});

  const REVIEWS = [
    { id: 1, name: "Amit Kumar", stars: 5, msg: "Technician was on time and very skilled", date: "Today" },
    { id: 2, name: "Neha Verma", stars: 4, msg: "Good service, but arrived a little late", date: "Yesterday" },
    { id: 3, name: "Rohit Singh", stars: 3, msg: "Work was done but not clean", date: "12 Aug" }
  ];

  const avgRating = (
    REVIEWS.reduce((sum, r) => sum + r.stars, 0) / REVIEWS.length
  ).toFixed(1);

  function handleReply(id, text) {
    setReplies(prev => ({ ...prev, [id]: text }));
  }

  let visible = REVIEWS.filter(r =>
    filter === "All" ? true : r.stars === filter
  );

  if (sort === "rating") {
    visible = [...visible].sort((a, b) => b.stars - a.stars);
  }

  return (
    <div>

      <h2 className="vendor-page-title">Customer Reviews</h2>
      <p className="vendor-page-subtitle">
        See what customers say about your services
      </p>

      {/* SUMMARY */}
      <div className="vendor-review-summary">

        <div className="review-score">
          <h1>{avgRating}</h1>
          <div>{"⭐".repeat(Math.round(avgRating))}</div>
          <span>{REVIEWS.length} total reviews</span>
        </div>

        <div className="review-bars">
          {[5,4,3,2,1].map(star => {
            const count = REVIEWS.filter(r => r.stars === star).length;
            return (
              <div key={star} className="review-row">
                <span>{star}★</span>
                <div className="review-bar">
                  <div style={{ width: `${(count / REVIEWS.length) * 100}%` }} />
                </div>
                <small>{count}</small>
              </div>
            );
          })}
        </div>

      </div>

      {/* CONTROLS */}
      <div className="vendor-filter">
        <div>
          {["All",5,4,3,2,1].map(f => (
            <button
              key={f}
              className={filter === f ? "active" : ""}
              onClick={() => setFilter(f)}
            >
              {f === "All" ? "All" : `${f}★`}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="vendor-select"
        >
          <option value="latest">Latest</option>
          <option value="rating">Highest Rating</option>
        </select>
      </div>

      {/* LIST */}
      <div className="vendor-review-list">

        {visible.length === 0 && (
          <div className="detail-box">
            No reviews found for this filter.
          </div>
        )}

        {visible.map(r => (
          <div key={r.id} className="vendor-review-card">

            <div className="review-top">
              <strong>{r.name}</strong>
              <span>{"⭐".repeat(r.stars)}</span>
            </div>

            <p className="review-msg">{r.msg}</p>
            <span className="review-date">{r.date}</span>

            {/* REPLY */}
            <div className="review-reply">
              {replies[r.id] ? (
                <div className="reply-box">
                  <strong>Your reply:</strong>
                  <p>{replies[r.id]}</p>
                </div>
              ) : (
                <textarea
                  placeholder="Reply to this review (optional)"
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      handleReply(r.id, e.target.value);
                    }
                  }}
                />
              )}
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}
