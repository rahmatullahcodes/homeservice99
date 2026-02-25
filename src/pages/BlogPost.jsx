import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../config/api";
import { useToast } from "../context/ToastContext";

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToast } = useToast();

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  async function fetchBlog() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(API_ENDPOINTS.CMS.GET_BLOG_BY_SLUG(slug));
      if (!response.ok) throw new Error("Blog not found");
      
      const data = await response.json();
      setBlog(data);
    } catch (err) {
      setError(err.message);
      addToast("Failed to load blog", "error");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "60px 20px" }}>
        <p>Loading blog post...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "60px 20px" }}>
        <h2>Post not found</h2>
        <p>Sorry, the blog post you're looking for doesn't exist.</p>
        <button className="btn-primary" onClick={() => navigate('/blog')}>Back to Blog</button>
      </div>
    );
  }

  return (
    <div>
      {/* HERO IMAGE */}
      <section className="blog-post-hero">
        <img 
          src={blog.image || "https://images.unsplash.com/photo-1552664730-d307ca884978"} 
          alt={blog.title} 
          className="blog-hero-image" 
        />
      </section>

      {/* ARTICLE */}
      <article className="container blog-post-container" style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
        <div className="blog-post-header">
          <span className="blog-category">{blog.category}</span>
          <h1 className="blog-post-title">{blog.title}</h1>
          <div className="blog-post-meta">
            <span>✍️ By {blog.author}</span>
            <span>📅 {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}</span>
            <span>👁️ {blog.views} views</span>
          </div>
        </div>

        <div className="blog-post-body">
          {blog.content.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <div className="blog-post-footer" style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #e5e7eb" }}>
          <button className="btn-outline" onClick={() => navigate('/blog')}>← Back to Blog</button>
        </div>
      </article>
    </div>
  );
}
