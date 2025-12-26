import { useState } from "react";

export default function VendorReviews() {
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("latest");
  const [replies, setReplies] = useState({});

  const REVIEWS = [
    { id: 1, name: "Amit Kumar", stars: 5, msg: "Technician was on time and very skilled", date: "15 Aug 2025" },
    { id: 2, name: "Neha Verma", stars: 4, msg: "Good service, but arrived a little late", date: "14 Aug 2025" },
    { id: 3, name: "Rohit Singh", stars: 3, msg: "Work was done but not clean", date: "12 Aug 2025" },
    { id: 4, name: "Priya Sharma", stars: 5, msg: "Excellent work, highly recommended!", date: "10 Aug 2025" }
  ];

  const avgRating = (REVIEWS.reduce((sum, r) => sum + r.stars, 0) / REVIEWS.length).toFixed(1);
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  REVIEWS.forEach(r => ratingCounts[r.stars]++);

  let visible = REVIEWS.filter(r => filter === "All" ? true : r.stars === filter);
  if (sort === "rating") visible = [...visible].sort((a, b) => b.stars - a.stars);

  return (
    <div>
      <div className="vendor-page-head">
        <h2>Customer Reviews</h2>
        <p>See what customers say about your services</p>
      </div>

      <div className="vendor-grid-2" style={{ marginBottom: "24px", gap: "16px" }}>
        <div className="vendor-section">
          <div style={{ textAlign: "center", paddingBottom: "16px" }}>
            <h2 style={{ margin: "0 0 8px 0", fontSize: "48px", fontWeight: "700", color: "#f59e0b" }}>
              {avgRating}
            </h2>
            <p style={{ margin: "0 0 8px 0", fontSize: "16px" }}>
              {"⭐".repeat(Math.round(avgRating))} {Math.round(avgRating)} out of 5
            </p>
            <p style={{ margin: "0", fontSize: "13px", color: "#6b7280" }}>
              Based on {REVIEWS.length} reviews
            </p>
          </div>
        </div>

        <div className="vendor-section">
          <h3 style={{ margin: "0 0 12px 0" }}>Rating Distribution</h3>
          {[5, 4, 3, 2, 1].map(star => {
            const count = ratingCounts[star];
            const percentage = (count / REVIEWS.length) * 100;
            return (
              <div key={star} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ fontSize: "14px", minWidth: "30px" }}>{star}⭐</span>
                <div style={{ flex: 1, height: "8px", background: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "#f59e0b", width: `${percentage}%` }} />
                </div>
                <span style={{ fontSize: "12px", color: "#6b7280", minWidth: "30px", textAlign: "right" }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="vendor-section" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {["All", 5, 4, 3, 2, 1].map(f => (
              <button key={f} className={`vendor-btn ${filter === f ? "primary" : "outline"} small`} onClick={() => setFilter(f)}>
                {f === "All" ? "All" : `${f}⭐`}
              </button>
            ))}
          </div>
          <select className="vendor-form-group" value={sort} onChange={e => setSort(e.target.value)} style={{ width: "auto", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }}>
            <option value="latest">Latest First</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      <div className="vendor-section">
        {visible.length === 0 ? (
          <div className="vendor-empty">
            <p>No reviews found for this filter</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {visible.map(r => (
              <div key={r.id} style={{ padding: "16px", background: "#f9fafb", borderRadius: "8px", borderLeft: "3px solid #f59e0b" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                  <div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "600" }}>{r.name}</p>
                    <p style={{ margin: "0", fontSize: "12px", color: "#6b7280" }}>{r.date}</p>
                  </div>
                  <span style={{ fontSize: "14px" }}>{"⭐".repeat(r.stars)}</span>
                </div>
                <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#374151", lineHeight: "1.5" }}>{r.msg}</p>
                {replies[r.id] ? (
                  <div style={{ padding: "12px", background: "white", borderRadius: "6px", borderLeft: "2px solid #2563eb" }}>
                    <p style={{ margin: "0 0 4px 0", fontSize: "12px", fontWeight: "600", color: "#6b7280" }}>Your Reply</p>
                    <p style={{ margin: "0", fontSize: "13px" }}>{replies[r.id]}</p>
                  </div>
                ) : (
                  <textarea
                    placeholder="Reply to this review (optional)"
                    style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", resize: "vertical" }}
                    onBlur={e => {
                      if (e.target.value.trim()) {
                        setReplies(prev => ({ ...prev, [r.id]: e.target.value }));
                      }
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
