import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";
import { useToast } from "../context/ToastContext";

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToast } = useToast();

  useEffect(() => {
    fetchBlogs();
  }, []);

  async function fetchBlogs() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(API_ENDPOINTS.CMS.GET_BLOGS_PUBLIC);
      if (!response.ok) throw new Error("Failed to fetch blogs");
      
      const data = await response.json();
      setBlogs(data);
    } catch (err) {
      setError(err.message);
      addToast("Failed to load blogs", "error");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div>
      {/* HEADER */}
      <section className="container fade-in" style={{ marginTop: "40px" }}>
        <h1 className="section-title">Home Service Blog</h1>
        <p style={{ fontSize: "15px", color: "#6b7280", marginBottom: "30px", maxWidth: "600px" }}>
          Expert tips, guides, and insights to help you maintain your home like a pro. Learn from industry experts.
        </p>
      </section>

      {error && (
        <div className="container" style={{ color: "#d32f2f", marginBottom: "15px", padding: "12px", backgroundColor: "#ffebee", borderRadius: "4px" }}>
          {error}
        </div>
      )}

      {loading ? (
        <section className="container" style={{ textAlign: "center", padding: "40px 20px" }}>
          <p>Loading blogs...</p>
        </section>
      ) : blogs.length === 0 ? (
        <section className="container" style={{ textAlign: "center", padding: "40px 20px" }}>
          <p>No blog posts available yet. Check back soon!</p>
        </section>
      ) : (
        <>
          {/* BLOG GRID */}
          <section className="container slide-up" style={{ marginBottom: "60px" }}>
            <div className="blog-grid">
              {blogs.map((blog) => (
                <article key={blog._id} className="blog-card">
                  <div className="blog-image-wrapper">
                    <img 
                      src={blog.image || "https://images.unsplash.com/photo-1552664730-d307ca884978"} 
                      alt={blog.title} 
                      className="blog-image" 
                    />
                    <span className="blog-category">{blog.category}</span>
                  </div>
                  <div className="blog-content">
                    <div className="blog-meta">
                      <span className="blog-date">📅 {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}</span>
                      <span className="blog-author">By {blog.author}</span>
                    </div>
                    <h3 className="blog-title">{blog.title}</h3>
                    <p className="blog-summary">{blog.summary}</p>
                    <Link to={`/blog/${blog.slug}`} className="blog-read-more">
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
        </>
      )}
    </div>
  );
}
