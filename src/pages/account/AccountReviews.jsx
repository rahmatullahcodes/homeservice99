export default function AccountReviews() {

  const REVIEWS = [
    {
      id: 1,
      service: "AC Service",
      rating: 5,
      comment: "Excellent service! Technician was on time and fixed during first visit.",
      date: "10 Feb 2025"
    },
    {
      id: 2,
      service: "Deep Cleaning",
      rating: 4,
      comment: "Very good cleaning. Bathroom was spotless, kitchen could be better.",
      date: "22 Jan 2025"
    }
  ];

  return (
    <div className="reviews-wrapper">

      <h2 className="dashboard-title">Your Reviews</h2>
      <p className="dashboard-subtitle">Feedback you've given on services</p>

      {REVIEWS.length === 0 && (
        <div className="detail-box">
          You have not reviewed any service yet.
        </div>
      )}

      <div className="review-list">
        {REVIEWS.map(r => (
          <div key={r.id} className="review-card">

            <div className="review-header">
              <strong>{r.service}</strong>
              <span>{"⭐".repeat(r.rating)}</span>
            </div>

            <p className="review-text">{r.comment}</p>
            <small className="review-date">{r.date}</small>

          </div>
        ))}
      </div>

    </div>
  );
}
