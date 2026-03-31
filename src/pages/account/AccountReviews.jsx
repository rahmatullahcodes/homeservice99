import { useEffect, useMemo, useState } from "react";
import { useToast } from "../../context/ToastContext";
import {
  createUserReview,
  fetchReviewableBookings,
  fetchUserReviews
} from "../../utils/accountApi";
import "../../styles/account.css";
import { ACCOUNT_REVIEW_INITIAL_FORM } from "../../data/accountFormsData";

export default function AccountReviews() {
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewableBookings, setReviewableBookings] = useState([]);
  const [formData, setFormData] = useState(ACCOUNT_REVIEW_INITIAL_FORM);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const [reviewsData, bookingData] = await Promise.all([
        fetchUserReviews(),
        fetchReviewableBookings()
      ]);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      setReviewableBookings(Array.isArray(bookingData) ? bookingData : []);
    } catch (err) {
      const message = err.message || "Failed to load reviews";
      setError(message);
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const fiveStarCount = useMemo(
    () => reviews.filter((review) => Number(review.rating) === 5).length,
    [reviews]
  );

  const filteredReviews = useMemo(() => {
    if (!filter) return reviews;
    return reviews.filter((review) => Number(review.rating) === filter);
  }, [filter, reviews]);

  async function submitReview() {
    if (!formData.bookingId || !formData.comment.trim()) {
      addToast("Please select booking and enter comment", "warning");
      return;
    }

    try {
      setSubmitting(true);
      const review = await createUserReview(formData);
      setReviews((prev) => [review, ...prev]);
      setReviewableBookings((prev) => prev.filter((booking) => booking._id !== formData.bookingId));
      setFormData(ACCOUNT_REVIEW_INITIAL_FORM);
      setShowForm(false);
      addToast("Review submitted", "success");
    } catch (err) {
      addToast(err.message || "Failed to submit review", "error");
    } finally {
      setSubmitting(false);
    }
  }

  function selectedBookingMeta() {
    const booking = reviewableBookings.find((item) => item._id === formData.bookingId);
    if (!booking) return "";
    const vendorName = booking.vendor?.businessName || booking.vendor?.name || "Vendor";
    return `${booking.service || "Service"} | ${vendorName}`;
  }

  return (
    <div className="dashboard-wrapper">
      <h2 className="dashboard-title">My Reviews</h2>
      <p className="dashboard-subtitle">Feedback you have shared on completed services</p>

      {error && <div className="account-alert danger">{error}</div>}

      <div className="dashboard-grid" style={{ marginBottom: "32px" }}>
        <div className="dash-card blue">
          <div className="dash-icon">AR</div>
          <div>
            <p className="dash-label">Average Rating</p>
            <h3>{avgRating}</h3>
            <span className="dash-trend">Out of 5</span>
          </div>
        </div>

        <div className="dash-card green">
          <div className="dash-icon">TR</div>
          <div>
            <p className="dash-label">Total Reviews</p>
            <h3>{reviews.length}</h3>
            <span className="dash-trend">All time</span>
          </div>
        </div>

        <div className="dash-card yellow">
          <div className="dash-icon">F5</div>
          <div>
            <p className="dash-label">5 Star Reviews</p>
            <h3>{fiveStarCount}</h3>
            <span className="dash-trend">Excellent</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button className="account-btn primary" onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {showForm && (
        <div className="account-card" style={{ marginBottom: "20px", padding: "20px", backgroundColor: "#f9fafb" }}>
          <h3 style={{ marginBottom: "15px" }}>Write a New Review</h3>

          {reviewableBookings.length === 0 ? (
            <div className="account-alert info">No completed booking available for review.</div>
          ) : (
            <>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>Completed Booking</label>
                <select
                  value={formData.bookingId}
                  onChange={(event) => setFormData({ ...formData, bookingId: event.target.value })}
                  className="account-form-input"
                >
                  <option value="">Select booking</option>
                  {reviewableBookings.map((booking) => (
                    <option key={booking._id} value={booking._id}>
                      {booking.service || "Service"} - {new Date(booking.createdAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                {formData.bookingId && (
                  <small style={{ color: "#6b7280" }}>{selectedBookingMeta()}</small>
                )}
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>Rating</label>
                <select
                  value={formData.rating}
                  onChange={(event) => setFormData({ ...formData, rating: Number(event.target.value) })}
                  className="account-form-input"
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Very Good</option>
                  <option value={3}>3 - Good</option>
                  <option value={2}>2 - Fair</option>
                  <option value={1}>1 - Poor</option>
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>Title (Optional)</label>
                <input
                  type="text"
                  placeholder="Short title"
                  value={formData.title}
                  onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                  className="account-form-input"
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>Your Review</label>
                <textarea
                  placeholder="Share your experience"
                  value={formData.comment}
                  onChange={(event) => setFormData({ ...formData, comment: event.target.value })}
                  className="account-form-input"
                  style={{ minHeight: "100px" }}
                />
              </div>

              <button className="account-btn primary" onClick={submitReview} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </>
          )}
        </div>
      )}

      <div style={{ marginBottom: "20px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button
          className={`account-btn ${filter === 0 ? "primary" : "secondary"}`}
          onClick={() => setFilter(0)}
        >
          All ({reviews.length})
        </button>
        {[5, 4, 3, 2, 1].map((rating) => (
          <button
            key={rating}
            className={`account-btn ${filter === rating ? "primary" : "secondary"}`}
            onClick={() => setFilter(rating)}
            style={{ fontSize: "12px", padding: "8px 12px" }}
          >
            {rating} Star ({reviews.filter((review) => Number(review.rating) === rating).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="account-alert info">Loading reviews...</div>
      ) : filteredReviews.length === 0 ? (
        <div className="account-alert info" style={{ textAlign: "center" }}>
          {reviews.length === 0 ? "No reviews yet" : "No reviews for selected filter"}
        </div>
      ) : (
        <div className="account-grid-2">
          {filteredReviews.map((review) => (
            <div key={review._id} className="account-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "16px" }}>{review.service?.title || review.booking?.service || "Service"}</h3>
                <span className="account-badge green" style={{ fontSize: "12px" }}>
                  {review.status || "Pending"}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span style={{ fontSize: "18px" }}>{"*".repeat(Number(review.rating || 0))}</span>
                <span style={{ color: "#6b7280", fontSize: "12px" }}>{review.rating} out of 5</span>
              </div>

              {review.title && <p style={{ margin: "8px 0", fontWeight: 600, color: "#374151" }}>{review.title}</p>}
              <p style={{ margin: "12px 0", color: "#6b7280", lineHeight: 1.5 }}>{review.comment}</p>

              <small style={{ color: "#9ca3af" }}>
                {new Date(review.createdAt).toLocaleDateString()}
              </small>

              <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--account-border)" }}>
                <small style={{ color: "#9ca3af" }}>
                  Vendor: {review.vendor?.businessName || review.vendor?.name || "Unknown"}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
