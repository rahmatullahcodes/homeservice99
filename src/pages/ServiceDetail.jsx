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
  if (!service) return <p>Service not found.</p>;

  return (
    <div className="container">

      {/* MAIN INFO */}
      <section className="service-detail">
        <img src={service.image} alt={service.title} className="service-img" />

        <div>
          <h1>{service.title}</h1>
          <p>{service.description}</p>

          <div className="detail-meta">
            <div aria-hidden>{`⏱ ${service.duration}`}</div>
            <div aria-hidden>{`🛡 ${service.warranty}`}</div>
          </div>

          <h2>₹{service.price}</h2>

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
        </div>
      </section>

      {/* INCLUDED / EXCLUDED */}
      <section className="detail-grid">
        <div className="detail-box">
          <h3>What’s included</h3>
          <ul>{service.includes.map((i, k) => <li key={k}>✅ {i}</li>)}</ul>
        </div>

        <div className="detail-box">
          <h3>Not included</h3>
          <ul>{service.excludes.map((i, k) => <li key={k}>❌ {i}</li>)}</ul>
        </div>
      </section>

      {/* PROCESS */}
      <section className="detail-process">
        <h2>How it works</h2>
        <div className="detail-steps">
          {service.process.map((step, i) => (
            <div key={i} className="step">
              {i + 1}. {step}
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section style={{ marginTop: 30 }}>
        <h2>Customer Reviews</h2>

        {[5, 4, 5].map((r, i) => (
          <div key={i} className="detail-box">
            {"⭐".repeat(r)}
            <p>Fast, clean and professional service.</p>
          </div>
        ))}
      </section>

    </div>
  );
}
