import { Link } from "react-router-dom";

const POSTS = [
  { 
    id: 1, 
    title: "5 Pro Tips to Keep Your Home Spotless", 
    summary: "Quick, effective cleaning hacks for busy professionals.",
    category: "Cleaning",
    date: "Dec 20, 2025",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952",
    author: "Sarah Johnson"
  },
  { 
    id: 2, 
    title: "AC Maintenance Guide: Avoid Summer Breakdowns", 
    summary: "When, why, and how to service your air conditioner.",
    category: "Maintenance",
    date: "Dec 18, 2025",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd",
    author: "Mike Chen"
  },
  { 
    id: 3, 
    title: "Home Painting Trends 2025", 
    summary: "Latest colors and techniques for modern homes.",
    category: "Painting",
    date: "Dec 15, 2025",
    image: "https://images.unsplash.com/photo-1600607686527-6fb886090705",
    author: "Emma Davis"
  },
  { 
    id: 4, 
    title: "Electrical Safety Checklist for Homeowners", 
    summary: "Common hazards and how to fix them safely.",
    category: "Electrical",
    date: "Dec 12, 2025",
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789",
    author: "Alex Kumar"
  },
  { 
    id: 5, 
    title: "Plumbing Issues: DIY vs Professional Help", 
    summary: "Know when to call a plumber and save money.",
    category: "Plumbing",
    date: "Dec 10, 2025",
    image: "https://images.unsplash.com/photo-1589929460218-da4ba9f483b3",
    author: "James Wilson"
  },
  { 
    id: 6, 
    title: "Modern Salon Trends at Home", 
    summary: "Beauty treatments you can get at home comfort.",
    category: "Beauty",
    date: "Dec 8, 2025",
    image: "https://images.unsplash.com/photo-1522338242f2-fed3985c5c08",
    author: "Priya Sharma"
  }
];

export default function BlogList() {
  return (
    <div>
      {/* HEADER */}
      <section className="container fade-in" style={{ marginTop: "40px" }}>
        <h1 className="section-title">Home Service Blog</h1>
        <p style={{ fontSize: "15px", color: "#6b7280", marginBottom: "30px", maxWidth: "600px" }}>
          Expert tips, guides, and insights to help you maintain your home like a pro. Learn from industry experts.
        </p>
      </section>

      {/* BLOG GRID */}
      <section className="container slide-up" style={{ marginBottom: "60px" }}>
        <div className="blog-grid">
          {POSTS.map((p) => (
            <article key={p.id} className="blog-card">
              <div className="blog-image-wrapper">
                <img src={p.image} alt={p.title} className="blog-image" />
                <span className="blog-category">{p.category}</span>
              </div>
              <div className="blog-content">
                <div className="blog-meta">
                  <span className="blog-date">📅 {p.date}</span>
                  <span className="blog-author">By {p.author}</span>
                </div>
                <h3 className="blog-title">{p.title}</h3>
                <p className="blog-summary">{p.summary}</p>
                <Link to={`/blog/${p.id}`} className="blog-read-more">
                  Read full article →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="container slide-up" style={{ marginBottom: "60px" }}>
        <div className="newsletter-card">
          <h2>Get Home Care Tips Every Week</h2>
          <p>Subscribe to our newsletter for expert advice, maintenance tips, and exclusive offers.</p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "16px" }}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              style={{ flex: 1, minWidth: "200px", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e7eb" }}
            />
            <button className="btn-primary">Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  );
}
