import { useState, useEffect } from "react";
import { useVendor } from "../../context/VendorContext";
import { useToast } from "../../context/ToastContext";
import { API_ENDPOINTS } from "../../config/api";

export default function VendorReviews() {
  const { vendor, loading: vendorLoading } = useVendor();
  const { addToast } = useToast();
  const token = localStorage.getItem("vendorToken");

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("latest");
  const [replyText, setReplyText] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [submitting, setSubmitting] = useState({});

  useEffect(() => {
    if (!token) return;
    fetchVendorReviews();
  }, [token, vendor?._id]);

  async function fetchVendorReviews() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_ENDPOINTS.VENDOR.GET_REVIEWS, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 404 && vendor?._id) {
        await fetchVendorReviewsLegacy(vendor._id);
        return;
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to load reviews");
      }

      const list = Array.isArray(data) ? data : data.reviews || [];
      setReviews(list);
    } catch (err) {
      const isNetworkError = String(err?.message || "").toLowerCase().includes("failed to fetch");
      const message = isNetworkError
        ? "Backend server unreachable. Please start backend on port 5000."
        : (err.message || "Failed to load reviews");

      setError(message);
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function fetchVendorReviewsLegacy(vendorId) {
    const endpoint = API_ENDPOINTS.ADMIN.GET_VENDOR_REVIEWS(vendorId);
    const response = await fetch(endpoint, { method: "GET" });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Failed to load reviews");
    }

    const list = Array.isArray(data) ? data : data.reviews || [];
    setReviews(list);
    setError("");
    addToast("Using legacy reviews API. Please restart backend for latest vendor endpoints.", "warning");
  }

  async function handleReply(reviewId) {
    const message = String(replyText[reviewId] || "").trim();
    if (!message) {
      addToast("Reply cannot be empty", "error");
      return;
    }

    try {
      setSubmitting((prev) => ({ ...prev, [reviewId]: true }));

      const response = await fetch(API_ENDPOINTS.VENDOR.REPLY_REVIEW(reviewId), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      });

      if (response.status === 404) {
        throw new Error("Reply API is not available on current backend build. Please restart/update backend.");
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to save reply");
      }

      const updatedReview = data.review;
      setReviews((prev) => prev.map((review) => (review._id === reviewId ? updatedReview : review)));
      setReplyingTo(null);
      setReplyText((prev) => {
        const next = { ...prev };
        delete next[reviewId];
        return next;
      });
      addToast("Reply saved successfully", "success");
    } catch (err) {
      const isNetworkError = String(err?.message || "").toLowerCase().includes("failed to fetch");
      const message = isNetworkError
        ? "Backend server unreachable. Please start backend on port 5000."
        : (err.message || "Failed to save reply");

      addToast(message, "error");
    } finally {
      setSubmitting((prev) => ({ ...prev, [reviewId]: false }));
    }
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length).toFixed(1)
    : "0.0";

  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((review) => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingCounts[review.rating] += 1;
    }
  });

  let visible = reviews.filter((review) => (
    filter === "All" ? true : review.rating === (typeof filter === "string" ? parseInt(filter, 10) : filter)
  ));

  if (sort === "rating") {
    visible = [...visible].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else {
    visible = [...visible].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  const ratingPercentage = (star) => (
    reviews.length > 0 ? (ratingCounts[star] / reviews.length) * 100 : 0
  );

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
        <div
          style={{
            color: "#dc2626",
            marginBottom: "20px",
            padding: "14px",
            backgroundColor: "#fee2e2",
            borderRadius: "8px",
            border: "1px solid #fca5a5"
          }}
        >
          {error}
        </div>
      )}

      <div className="vendor-grid-2" style={{ marginBottom: "24px", gap: "16px" }}>
        <div
          className="vendor-section"
          style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", color: "white", padding: "24px" }}
        >
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: "0 0 8px 0", fontSize: "13px", opacity: "0.9", fontWeight: "600" }}>Overall Rating</p>
            <h2 style={{ margin: "0 0 8px 0", fontSize: "56px", fontWeight: "700" }}>
              {avgRating}
            </h2>
            <p style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600" }}>
              {"*".repeat(Math.round(Number(avgRating)))}
            </p>
            <p style={{ margin: "0", fontSize: "13px", opacity: "0.9" }}>
              Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>

        <div className="vendor-section">
          <h3 style={{ margin: "0 0 14px 0", fontSize: "16px", fontWeight: "700" }}>Rating Distribution</h3>
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", minWidth: "40px", color: "#6b7280" }}>
                {star}
              </span>
              <div style={{ flex: 1, height: "10px", background: "#e5e7eb", borderRadius: "5px", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    background: "linear-gradient(90deg, #f59e0b, #d97706)",
                    width: `${ratingPercentage(star)}%`,
                    transition: "width 0.3s ease"
                  }}
                />
              </div>
              <span style={{ fontSize: "12px", color: "#6b7280", minWidth: "35px", textAlign: "right", fontWeight: "600" }}>
                {ratingCounts[star]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="vendor-section" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Filter:</span>
            {["All", 5, 4, 3, 2, 1].map((value) => (
              <button
                key={value}
                className={`vendor-btn ${filter === value ? "primary" : "outline"} small`}
                onClick={() => setFilter(value)}
              >
                {value === "All" ? "All Reviews" : `${value} Star`}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
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

      <div className="vendor-section">
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div className="vendor-loading-spinner" />
            <p style={{ marginTop: "16px", color: "#6b7280" }}>Loading reviews...</p>
          </div>
        ) : visible.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", background: "#f9fafb", borderRadius: "8px" }}>
            <p style={{ fontSize: "16px", fontWeight: "600", color: "#374151", margin: "0 0 8px 0" }}>
              {reviews.length === 0 ? "No reviews yet" : "No reviews match this filter"}
            </p>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: "0" }}>
              {reviews.length === 0 ? "Complete more bookings to receive customer reviews" : "Try adjusting your filters"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {visible.map((review) => (
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                  <div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "700", color: "#111827" }}>
                      {review.user?.name || "Anonymous"}
                    </p>
                    <p style={{ margin: "0", fontSize: "12px", color: "#6b7280" }}>
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      backgroundColor: "#fef3c7",
                      padding: "6px 10px",
                      borderRadius: "6px"
                    }}
                  >
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#f59e0b" }}>
                      {review.rating || 0}
                    </span>
                  </div>
                </div>

                {review.title && (
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#111827"
                    }}
                  >
                    {review.title}
                  </p>
                )}

                <p
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: "14px",
                    color: "#374151",
                    lineHeight: "1.6"
                  }}
                >
                  {review.comment || "No comment provided"}
                </p>

                {review.service && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginBottom: "12px",
                      padding: "8px 10px",
                      backgroundColor: "#f3f4f6",
                      borderRadius: "6px"
                    }}
                  >
                    <strong>Service:</strong> {review.service?.title || "Service"}
                  </div>
                )}

                {review.vendorReply?.message && (
                  <div
                    style={{
                      marginBottom: "12px",
                      padding: "10px",
                      borderRadius: "8px",
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe"
                    }}
                  >
                    <p style={{ margin: "0 0 6px 0", fontSize: "12px", fontWeight: "700", color: "#1d4ed8" }}>
                      Your Reply
                    </p>
                    <p style={{ margin: "0", fontSize: "13px", color: "#1f2937" }}>
                      {review.vendorReply.message}
                    </p>
                    {review.vendorReply.repliedAt && (
                      <p style={{ margin: "6px 0 0 0", fontSize: "11px", color: "#6b7280" }}>
                        {new Date(review.vendorReply.repliedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {replyingTo === review._id ? (
                  <div
                    style={{
                      padding: "12px",
                      background: "#f0f9ff",
                      borderRadius: "8px",
                      border: "1px solid #bfdbfe"
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#1e40af",
                        marginBottom: "8px"
                      }}
                    >
                      Your Reply
                    </label>
                    <textarea
                      value={replyText[review._id] || ""}
                      onChange={(event) => setReplyText((prev) => ({ ...prev, [review._id]: event.target.value }))}
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
                      >
                        {submitting[review._id] ? "Saving..." : "Save Reply"}
                      </button>
                      <button
                        className="vendor-btn outline small"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText((prev) => {
                            const next = { ...prev };
                            delete next[review._id];
                            return next;
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
                    onClick={() => {
                      setReplyingTo(review._id);
                      setReplyText((prev) => ({
                        ...prev,
                        [review._id]: review.vendorReply?.message || ""
                      }));
                    }}
                  >
                    {review.vendorReply?.message ? "Edit Reply" : "Reply to Review"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
