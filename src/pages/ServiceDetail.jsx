import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const SERVICES = [
  {
    id: "1",
    title: "Full Home Deep Cleaning",
    price: 1999,
    duration: "4–5 hours",
    warranty: "48-hour service guarantee",
    description: "Complete deep cleaning for 1–3 BHK including kitchen, bathrooms and furniture.",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952",
    includes: [
      "Kitchen degreasing",
      "Bathroom sanitization",
      "Floor scrubbing",
      "Dusting & polishing",
      "Garbage disposal"
    ],
    excludes: ["Wall painting", "Furniture dismantling"],
    process: [
      "Choose service",
      "Professional arrives",
      "Quality check",
      "Payment after service"
    ]
  },
  {
    id: "2",
    title: "AC Service & Repair",
    price: 699,
    duration: "60–90 minutes",
    warranty: "30-day service warranty",
    description: "AC cleaning, gas check and minor repairs at your doorstep.",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
    includes: [
      "Wet servicing",
      "Gas inspection",
      "Filter cleaning",
      "Cooling efficiency test"
    ],
    excludes: ["Spare parts", "Gas refill (if needed)"],
    process: [
      "Book service",
      "Technician assigned",
      "Service completion",
      "Payment"
    ]
  },
  {
    id: "3",
    title: "Electrician Visit",
    price: 249,
    duration: "30–60 minutes",
    warranty: "15-day call-back warranty",
    description: "Fix wiring issues, lights, fans and switches in one visit.",
    image: "https://images.unsplash.com/photo-1582719478250-cc970d17f9d4",
    includes: [
      "Switch repair",
      "Fan installation",
      "Socket fixing",
      "Basic wiring"
    ],
    excludes: ["New wiring setup", "High-voltage installations"],
    process: [
      "Raise request",
      "Electrician arrives",
      "Repair",
      "Payment"
    ]
  },
  {
    id: "4",
    title: "Plumbing Service",
    price: 299,
    duration: "45–90 minutes",
    warranty: "30-day service assurance",
    description: "Taps, leakages and pipe issues resolved quickly.",
    image: "https://images.unsplash.com/photo-1589929460218-da4ba9f483b3",
    includes: [
      "Leak repairs",
      "Tap installation",
      "Drain blockage removal",
      "Fitting checks"
    ],
    excludes: ["Major pipe replacement", "New bathroom setup"],
    process: [
      "Raise complaint",
      "Plumber arrives",
      "Inspection",
      "Payment"
    ]
  }
];

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const service = SERVICES.find(s => s.id === id);
  if (!service) return (
    <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <h2 style={{ marginBottom: 12 }}>Service not found</h2>
      <p style={{ color: '#6b7280', marginBottom: 20 }}>The service you're looking for doesn't exist.</p>
      <button className="btn-primary" onClick={() => navigate('/services')}>
        Browse Services
      </button>
    </div>
  );

  return (
    <div className="container">

      {/* BREADCRUMB */}
      <nav className="breadcrumb" style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
        <button onClick={() => navigate('/services')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer' }}>Services</button>
        <span style={{ margin: '0 6px' }}>→</span>
        <span>{service.title}</span>
      </nav>

      {/* HERO SECTION - Responsive image gallery + sticky booking panel */}
      <section className="service-detail fade-in">
        
        {/* Image Gallery (left/top) */}
        <div className="detail-gallery">
          <img src={service.image} alt={service.title} className="gallery-main" />
          <div className="gallery-thumbnails">
            <img src={service.image} alt={`${service.title} - thumbnail`} />
            <img src={service.image} alt={`${service.title} - thumbnail 2`} />
            <img src={service.image} alt={`${service.title} - thumbnail 3`} />
          </div>
        </div>

        {/* Booking Panel (right/bottom) - Sticky on desktop */}
        <aside className="detail-sidebar">
          <div className="booking-card">
            <h1>{service.title}</h1>
            
            <p className="service-desc">{service.description}</p>

            {/* Meta info */}
            <div className="detail-meta">
              <div className="meta-item">
                <span className="meta-icon">⏱</span>
                <span>{service.duration}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">🛡</span>
                <span>{service.warranty}</span>
              </div>
            </div>

            {/* Price */}
            <div className="price-section">
              <span className="price-label">Starting from</span>
              <h2 className="price-value">₹{service.price}</h2>
            </div>

            {/* CTA Buttons */}
            <div className="booking-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  addToCart(service);
                  navigate("/cart");
                }}
                aria-label={`Add ${service.title} to cart`}
              >
                Add to Cart
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => navigate('/services')}
              >
                Continue Shopping
              </button>
            </div>

            {/* Trust badges */}
            <div className="trust-badges">
              <div className="badge">✓ Verified professionals</div>
              <div className="badge">✓ Doorstep service</div>
              <div className="badge">✓ Payment after service</div>
            </div>
          </div>
        </aside>
      </section>

      {/* WHAT'S INCLUDED / EXCLUDED */}
      <section className="detail-grid slide-up" style={{ marginTop: 40 }}>
        <div className="detail-box">
          <h3>✅ What's included</h3>
          <ul className="detail-list">
            {service.includes.map((i, k) => <li key={k}>{i}</li>)}
          </ul>
        </div>

        <div className="detail-box">
          <h3>❌ Not included</h3>
          <ul className="detail-list">
            {service.excludes.map((i, k) => <li key={k}>{i}</li>)}
          </ul>
        </div>
      </section>

      {/* HOW IT WORKS - Process steps */}
      <section className="detail-process slide-up" style={{ marginTop: 40 }}>
        <h2>How it works</h2>
        <div className="detail-steps">
          {service.process.map((step, i) => (
            <div key={i} className="step">
              <span className="step-number">{i + 1}</span>
              <span className="step-text">{step}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CUSTOMER REVIEWS */}
      <section className="review-section slide-up" style={{ marginTop: 40, marginBottom: 60 }}>
        <h2>⭐ Customer Reviews ({[5, 4, 5].length})</h2>
        <div className="review-grid">
          {[5, 4, 5].map((r, i) => (
            <div key={i} className="review-card detail-box">
              <div className="review-stars">{"⭐".repeat(r)}</div>
              <p className="review-text">Fast, clean and professional service. Highly recommend!</p>
              <p className="review-author">— Customer {i + 1}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
