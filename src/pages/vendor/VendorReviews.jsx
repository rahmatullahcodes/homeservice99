import { useState, useEffect } from "react";
import { useVendor } from "../../context/VendorContext";
import { useToast } from "../../context/ToastContext";
import { API_ENDPOINTS } from "../../config/api";

export default function VendorReviews() {
  const { vendor, loading: vendorLoading } = useVendor();
  const { addToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("latest");
  const [replyText, setReplyText] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [submitting, setSubmitting] = useState({});

  // Fetch vendor reviews on mount
  useEffect(() => {
    if (vendor?._id) {
      fetchVendorReviews();
    }
  }, [vendor?._id]);

  async function fetchVendorReviews() {
    try {
      setLoading(true);
      setError("");

      if (!vendor?._id) {
        setError("Vendor information not available");
        setLoading(false);
        return;
      }

      const endpoint = `${API_ENDPOINTS.ADMIN.GET_VENDOR_REVIEWS(vendor._id)}`;
      
      const response = await fetch(endpoint, {
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
      setReviews(Array.isArray(data) ? data : data.reviews || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  // Calculate stats
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (r.rating && ratingCounts.hasOwnProperty(r.rating)) {
      ratingCounts[r.rating]++;
    }
  });

  // Filter and sort reviews
  let visible = reviews.filter(r => 
    filter === "All" ? true : r.rating === (typeof filter === 'string' ? parseInt(filter) : filter)
  );

  if (sort === "rating") {
    visible = [...visible].sort((a, b) => b.rating - a.rating);
  } else {
    visible = [...visible].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  async function handleReply(reviewId) {
    if (!replyText[reviewId]?.trim()) {
      addToast("Reply cannot be empty", "error");
      return;
    }

    // Note: Reply functionality can be implemented later with a dedicated backend endpoint
    setSubmitting(prev => ({ ...prev, [reviewId]: false }));
    addToast("Reply would be saved here", "success");
    setReplyingTo(null);
  }

  const ratingPercentage = (star) => {
    return reviews.length > 0 ? (ratingCounts[star] / reviews.length) * 100 : 0;
  };

  if (vendorLoading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <div className="vendor-loading-spinner" />
        <p style={{ marginTop: "16px", color: "#6b7280" }}>Loading reviews...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="vendor-page-head">
        <h2>Customer Reviews & Ratings</h2>
        <p>Manage and respond to customer feedback</p>
      </div>

      {error && (
        <div style={{ 
          color: "#dc2626", 
          marginBottom: "20px", 
          padding: "14px", 
          backgroundColor: "#fee2e2", 
          borderRadius: "8px",
          border: "1px solid #fca5a5"
        }}>
          {error}
        </div>
      )}

      <div className="vendor-grid-2" style={{ marginBottom: "24px", gap: "16px" }}>
        {/* Rating Summary Card */}
        <div className="vendor-section" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", color: "white", padding: "24px" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: "0 0 8px 0", fontSize: "13px", opacity: "0.9", fontWeight: "600" }}>Overall Rating</p>
            <h2 style={{ margin: "0 0 8px 0", fontSize: "56px", fontWeight: "700" }}>
              {avgRating}
            </h2>
            <p style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600" }}>
              {"⭐".repeat(Math.round(avgRating))}
            </p>
            <p style={{ margin: "0", fontSize: "13px", opacity: "0.9" }}>
              Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>

        {/* Rating Distribution Card */}
        <div className="vendor-section">
          <h3 style={{ margin: "0 0 14px 0", fontSize: "16px", fontWeight: "700" }}>Rating Distribution</h3>
          {[5, 4, 3, 2, 1].map(star => (
            <div key={star} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", minWidth: "40px", color: "#6b7280" }}>
                {star} ⭐
              </span>
              <div style={{ flex: 1, height: "10px", background: "#e5e7eb", borderRadius: "5px", overflow: "hidden" }}>
                <div style={{ 
                  height: "100%", 
                  background: `linear-gradient(90deg, #f59e0b, #d97706)`,
                  width: `${ratingPercentage(star)}%`,
                  transition: "width 0.3s ease"
                }} />
              </div>
              <span style={{ fontSize: "12px", color: "#6b7280", minWidth: "35px", textAlign: "right", fontWeight: "600" }}>
                {ratingCounts[star]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Sort Controls */}
      <div className="vendor-section" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Filter:</span>
            {["All", 5, 4, 3, 2, 1].map(f => (
              <button
                key={f}
                className={`vendor-btn ${filter === f ? "primary" : "outline"} small`}
                onClick={() => setFilter(f)}
                style={{ cursor: "pointer" }}
              >
                {f === "All" ? "All Reviews" : `${f} ⭐`}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              backgroundColor: "white",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
              color: "#374151"
            }}
          >
            <option value="latest">Latest First</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="vendor-section">
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div className="vendor-loading-spinner" />
            <p style={{ marginTop: "16px", color: "#6b7280" }}>Loading reviews...</p>
          </div>
        ) : visible.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", background: "#f9fafb", borderRadius: "8px" }}>
            <p style={{ fontSize: "16px", fontWeight: "600", color: "#374151", margin: "0 0 8px 0" }}>
              {reviews.length === 0 ? "📭 No reviews yet" : "No reviews match this filter"}
            </p>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: "0" }}>
              {reviews.length === 0 ? "Complete more bookings to receive customer reviews" : "Try adjusting your filters"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {visible.map(review => (
              <div
                key={review._id}
                style={{
                  padding: "16px",
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  transition: "all 0.2s ease"
                }}
              >
                {/* Review Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                  <div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "700", color: "#111827" }}>
                      {review.user?.name || review.userName || "Anonymous"}
                    </p>
                    <p style={{ margin: "0", fontSize: "12px", color: "#6b7280" }}>
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    backgroundColor: "#fef3c7",
                    padding: "6px 10px",
                    borderRadius: "6px"
                  }}>
                    <span style={{ fontSize: "16px" }}>⭐</span>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#f59e0b" }}>
                      {review.rating || 0}
                    </span>
                  </div>
                </div>

                {/* Review Title and Comment */}
                {review.title && (
                  <p style={{
                    margin: "0 0 8px 0",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#111827"
                  }}>
                    {review.title}
                  </p>
                )}

                <p style={{
                  margin: "0 0 12px 0",
                  fontSize: "14px",
                  color: "#374151",
                  lineHeight: "1.6"
                }}>
                  {review.comment || review.description || "No comment provided"}
                </p>

                {/* Service Info */}
                {review.service && (
                  <div style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginBottom: "12px",
                    padding: "8px 10px",
                    backgroundColor: "#f3f4f6",
                    borderRadius: "6px"
                  }}>
                    <strong>Service:</strong> {review.service?.title || review.service?.name || "Service"}
                  </div>
                )}

                {/* Reply Section */}
                {replyingTo === review._id ? (
                  <div style={{
                    padding: "12px",
                    background: "#f0f9ff",
                    borderRadius: "8px",
                    border: "1px solid #bfdbfe"
                  }}>
                    <label style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#1e40af",
                      marginBottom: "8px"
                    }}>
                      Your Reply
                    </label>
                    <textarea
                      value={replyText[review._id] || ""}
                      onChange={e => setReplyText(prev => ({ ...prev, [review._id]: e.target.value }))}
                      placeholder="Write a response to this review..."
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #bfdbfe",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontFamily: "inherit",
                        resize: "vertical",
                        minHeight: "80px",
                        marginBottom: "10px",
                        boxSizing: "border-box"
                      }}
                    />
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="vendor-btn primary small"
                        onClick={() => handleReply(review._id)}
                        disabled={submitting[review._id]}
                        style={{
                          cursor: submitting[review._id] ? "not-allowed" : "pointer",
                          opacity: submitting[review._id] ? 0.6 : 1
                        }}
                      >
                        {submitting[review._id] ? "Sending..." : "Send Reply"}
                      </button>
                      <button
                        className="vendor-btn outline small"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText(prev => {
                            const newState = { ...prev };
                            delete newState[review._id];
                            return newState;
                          });
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="vendor-btn outline small"
                    onClick={() => setReplyingTo(review._id)}
                    style={{ cursor: "pointer" }}
                  >
                    💬 Reply to Review
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Summary at Bottom */}
      {reviews.length > 0 && (
        <div className="vendor-section" style={{ marginTop: "24px", background: "#f9fafb", padding: "16px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px"
          }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: "0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Total Reviews</p>
              <p style={{ margin: "4px 0 0 0", fontSize: "24px", fontWeight: "700", color: "#1f2937" }}>
                {reviews.length}
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: "0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Average Rating</p>
              <p style={{ margin: "4px 0 0 0", fontSize: "24px", fontWeight: "700", color: "#f59e0b" }}>
                {avgRating} ⭐
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: "0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>5-Star Reviews</p>
              <p style={{ margin: "4px 0 0 0", fontSize: "24px", fontWeight: "700", color: "#16a34a" }}>
                {ratingCounts[5]}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
