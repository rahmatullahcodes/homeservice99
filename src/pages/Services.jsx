import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SERVICES = [
  {
    id: 1,
    title: "Full Home Deep Cleaning",
    category: "Cleaning",
    description: "Complete cleaning for 1–3 BHK including kitchen & bathrooms.",
    price: 1999,
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952"
  },
  {
    id: 2,
    title: "AC Service & Repair",
    category: "Appliances",
    description: "Wet service, gas top-up and basic repair at your doorstep.",
    price: 699,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"
  },
  {
    id: 3,
    title: "Electrician Visit",
    category: "Electrician",
    description: "Fan, lights, wiring, switches and minor electrical work.",
    price: 249,
    image: "https://images.unsplash.com/photo-1582719478250-cc970d17f9d4"
  },
  {
    id: 4,
    title: "Plumbing Service",
    category: "Plumber",
    description: "Leakage, tap replacement and other plumbing issues.",
    price: 299,
    image: "https://images.unsplash.com/photo-1589929460218-da4ba9f483b3"
  }
];

export default function Services() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const location = useLocation();

  // If a ?category= query param is provided, set category from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const c = params.get('category');
    if (c) setCategory(c);
  }, [location.search]);

  const categories = ["All", "Cleaning", "Electrician", "Plumber", "Appliances"];

  // close mobile filters when category is selected
  function selectCategory(c) {
    setCategory(c);
    setMobileFilterOpen(false);
  }

  let filtered = SERVICES.filter(
    s =>
      (category === "All" || s.category === category) &&
      s.title.toLowerCase().includes(search.toLowerCase())
  );

  if (sort === "low") filtered.sort((a, b) => a.price - b.price);
  if (sort === "high") filtered.sort((a, b) => b.price - a.price);

  return (
    <div className="container">

      {/* HEADER */}
      <section className="fade-in">
        <h1 className="section-title">Services</h1>
        <p className="services-subtitle">
          Book verified professionals in minutes
        </p>
      </section>

      {/* SEARCH */}
      <div style={{ marginTop: 12 }}>
        <input
          aria-label="Search services"
          className="service-search full-search"
          placeholder="Search by service name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* FILTER & SORT BAR (sticky on mobile) */}
      <div className="services-filter-bar">
        {/* Mobile Filter Toggle */}
        <button
          className="filter-toggle"
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          aria-label="Toggle filters"
          aria-expanded={mobileFilterOpen}
        >
          ☰ Filters
        </button>

        {/* Sort Dropdown */}
        <select
          aria-label="Sort services"
          className="service-select"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          <option value="default">Sort by</option>
          <option value="low">Price: Low → High</option>
          <option value="high">Price: High → Low</option>
        </select>
      </div>

      {/* CATEGORY CHIPS (Mobile Drawer + Desktop Bar) */}
      <div className={`category-bar ${mobileFilterOpen ? 'open' : ''}`}>
        {categories.map(c => (
          <div
            key={c}
            className={`category-chip ${category === c ? 'active' : ''}`}
            onClick={() => selectCategory(c)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && selectCategory(c)}
          >
            {c}
          </div>
        ))}
      </div>

      {/* SERVICES */}
      <div className="service-grid">

        {filtered.length === 0 && (
          <div className="empty-state">
            <p style={{ fontSize: '16px', fontWeight: 600 }}>No services found</p>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: 6 }}>Try adjusting your filters or search query</p>
          </div>
        )}

        {filtered.map((s) => (
          <div key={s.id} className="service-card slide-up">

            <img src={s.image} alt={s.title} className="service-img" />

            <strong>{s.title}</strong>

            <span className="service-price">Starting at ₹{s.price}</span>

            <p>{s.description}</p>

            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate(`/services/${s.id}`)}
              aria-label={`View details for ${s.title}`}
            >
              View details
            </button>

          </div>
        ))}
      </div>

    </div>
  );
}
