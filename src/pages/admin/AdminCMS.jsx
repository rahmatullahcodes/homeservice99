import { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { API_ENDPOINTS } from "../../config/api";

export default function AdminCMS() {
  // State for banners
  const [banners, setBanners] = useState([]);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editingBannerID, setEditingBannerID] = useState(null);
  const [bannerFormData, setBannerFormData] = useState({
    title: "",
    description: "",
    image: "",
    link: "",
    displayOrder: 0
  });

  // State for blogs
  const [blogs, setBlogs] = useState([]);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [blogFormData, setBlogFormData] = useState({
    title: "",
    content: "",
    summary: "",
    category: "Tips",
    tags: "",
    image: "",
    author: ""
  });

  // State for pages
  const [pages, setPages] = useState([]);
  const [showPageForm, setShowPageForm] = useState(false);
  const [editingPageId, setEditingPageId] = useState(null);
  const [pageFormData, setPageFormData] = useState({
    title: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: ""
  });

  // General state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const { addToast } = useToast();

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setError("Admin authentication required");
        return;
      }

      // Fetch banners
      const bannerRes = await fetch(API_ENDPOINTS.CMS.GET_BANNERS, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (bannerRes.ok) {
        setBanners(await bannerRes.json());
      }

      // Fetch blogs
      const blogRes = await fetch(API_ENDPOINTS.CMS.GET_BLOGS, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (blogRes.ok) {
        setBlogs(await blogRes.json());
      }

      // Fetch pages
      const pageRes = await fetch(API_ENDPOINTS.CMS.GET_PAGES, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (pageRes.ok) {
        setPages(await pageRes.json());
      }

      // Fetch stats
      const statsRes = await fetch(API_ENDPOINTS.CMS.GET_STATS, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }

      setError("");
    } catch (err) {
      setError(err.message);
      addToast("Failed to load CMS data", "error");
    } finally {
      setLoading(false);
    }
  }

  // ============ BANNER OPERATIONS ============

  async function saveBanner() {
    if (!bannerFormData.title) {
      addToast("Banner title is required", "error");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        addToast("Admin authentication required", "error");
        return;
      }

      const method = editingBannerID ? "PATCH" : "POST";
      const url = editingBannerID 
        ? API_ENDPOINTS.CMS.UPDATE_BANNER(editingBannerID)
        : API_ENDPOINTS.CMS.CREATE_BANNER;

      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bannerFormData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to save banner (Status: ${response.status})`);
      }

      const saved = data;
      if (editingBannerID) {
        setBanners(prev => prev.map(b => b._id === saved._id ? saved : b));
      } else {
        setBanners(prev => [...prev, saved]);
      }

      setBannerFormData({ title: "", description: "", image: "", link: "", displayOrder: 0 });
      setShowBannerForm(false);
      setEditingBannerID(null);
      addToast("Banner saved successfully", "success");
    } catch (err) {
      console.error("Banner save error:", err);
      addToast(err.message || "Failed to save banner", "error");
    }
  }

  async function deleteBanner(id) {
    if (!window.confirm("Delete this banner?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(API_ENDPOINTS.CMS.DELETE_BANNER(id), {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Failed to delete banner");
      setBanners(prev => prev.filter(b => b._id !== id));
      addToast("Banner deleted", "success");
    } catch (err) {
      addToast(err.message, "error");
    }
  }

  async function toggleBanner(id) {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(API_ENDPOINTS.CMS.TOGGLE_BANNER(id), {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Failed to toggle banner");
      const updated = await response.json();
      setBanners(prev => prev.map(b => b._id === id ? updated : b));
    } catch (err) {
      addToast(err.message, "error");
    }
  }

  function editBanner(banner) {
    setBannerFormData({
      title: banner.title,
      description: banner.description,
      image: banner.image,
      link: banner.link,
      displayOrder: banner.displayOrder
    });
    setEditingBannerID(banner._id);
    setShowBannerForm(true);
  }

  // ============ BLOG OPERATIONS ============

  async function saveBlog() {
    if (!blogFormData.title || !blogFormData.content) {
      addToast("Title and content are required", "error");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        addToast("Admin authentication required", "error");
        return;
      }

      const method = editingBlogId ? "PATCH" : "POST";
      const url = editingBlogId 
        ? API_ENDPOINTS.CMS.UPDATE_BLOG(editingBlogId)
        : API_ENDPOINTS.CMS.CREATE_BLOG;

      const payload = {
        title: blogFormData.title.trim(),
        content: blogFormData.content.trim(),
        summary: blogFormData.summary.trim(),
        category: blogFormData.category,
        author: blogFormData.author || "Admin",
        image: blogFormData.image.trim(),
        tags: blogFormData.tags.split(",").map(t => t.trim()).filter(t => t)
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to save blog (Status: ${response.status})`);
      }

      const saved = data;
      if (editingBlogId) {
        setBlogs(prev => prev.map(b => b._id === saved._id ? saved : b));
      } else {
        setBlogs(prev => [...prev, saved]);
      }

      setBlogFormData({ title: "", content: "", summary: "", category: "Tips", tags: "", image: "", author: "" });
      setShowBlogForm(false);
      setEditingBlogId(null);
      addToast("Blog saved successfully", "success");
    } catch (err) {
      console.error("Blog save error:", err);
      addToast(err.message || "Failed to save blog", "error");
    }
  }

  async function publishBlog(id) {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(API_ENDPOINTS.CMS.PUBLISH_BLOG(id), {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Failed to publish blog");
      const updated = await response.json();
      setBlogs(prev => prev.map(b => b._id === id ? updated : b));
      addToast("Blog published", "success");
    } catch (err) {
      addToast(err.message, "error");
    }
  }

  async function deleteBlog(id) {
    if (!window.confirm("Delete this blog?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(API_ENDPOINTS.CMS.DELETE_BLOG(id), {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Failed to delete blog");
      setBlogs(prev => prev.filter(b => b._id !== id));
      addToast("Blog deleted", "success");
    } catch (err) {
      addToast(err.message, "error");
    }
  }

  function editBlog(blog) {
    setBlogFormData({
      title: blog.title,
      content: blog.content,
      summary: blog.summary,
      category: blog.category,
      tags: blog.tags.join(", "),
      image: blog.image,
      author: blog.author
    });
    setEditingBlogId(blog._id);
    setShowBlogForm(true);
  }

  // ============ PAGE OPERATIONS ============

  async function savePage() {
    if (!pageFormData.title || !pageFormData.content) {
      addToast("Title and content are required", "error");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        addToast("Admin authentication required", "error");
        return;
      }

      const method = editingPageId ? "PATCH" : "POST";
      const url = editingPageId 
        ? API_ENDPOINTS.CMS.UPDATE_PAGE(editingPageId)
        : API_ENDPOINTS.CMS.CREATE_PAGE;

      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(pageFormData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to save page (Status: ${response.status})`);
      }

      const saved = data;
      if (editingPageId) {
        setPages(prev => prev.map(p => p._id === saved._id ? saved : p));
      } else {
        setPages(prev => [...prev, saved]);
      }

      setPageFormData({ title: "", content: "", metaTitle: "", metaDescription: "", metaKeywords: "" });
      setShowPageForm(false);
      setEditingPageId(null);
      addToast("Page saved successfully", "success");
    } catch (err) {
      console.error("Page save error:", err);
      addToast(err.message || "Failed to save page", "error");
    }
  }

  async function deletePage(id) {
    if (!window.confirm("Delete this page?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(API_ENDPOINTS.CMS.DELETE_PAGE(id), {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Failed to delete page");
      setPages(prev => prev.filter(p => p._id !== id));
      addToast("Page deleted", "success");
    } catch (err) {
      addToast(err.message, "error");
    }
  }

  function editPage(page) {
    setPageFormData({
      title: page.title,
      content: page.content,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      metaKeywords: page.metaKeywords
    });
    setEditingPageId(page._id);
    setShowPageForm(true);
  }

  return (
    <div className="admin-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2>CMS Management</h2>
          <p className="admin-subtitle">Control website content, banners and blogs</p>
        </div>
        <button className="btn-primary" onClick={fetchAllData}>🔄 Refresh</button>
      </div>

      {error && <div style={{ color: "#d32f2f", marginBottom: "15px", padding: "12px", backgroundColor: "#ffebee", borderRadius: "4px" }}>{error}</div>}

      {/* STATISTICS */}
      {stats && (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
          gap: "15px", 
          marginBottom: "25px" 
        }}>
          <div style={{ backgroundColor: "#e3f2fd", padding: "15px", borderRadius: "8px", borderLeft: "4px solid #2196F3" }}>
            <div style={{ fontSize: "0.9em", color: "#666" }}>Banners</div>
            <div style={{ fontSize: "1.8em", fontWeight: "bold", color: "#2196F3" }}>{stats.banners.total}</div>
            <div style={{ fontSize: "0.85em", color: "#999" }}>Active: {stats.banners.active}</div>
          </div>
          <div style={{ backgroundColor: "#f3e5f5", padding: "15px", borderRadius: "8px", borderLeft: "4px solid #9C27B0" }}>
            <div style={{ fontSize: "0.9em", color: "#666" }}>Blogs</div>
            <div style={{ fontSize: "1.8em", fontWeight: "bold", color: "#9C27B0" }}>{stats.blogs.total}</div>
            <div style={{ fontSize: "0.85em", color: "#999" }}>Published: {stats.blogs.published}</div>
          </div>
          <div style={{ backgroundColor: "#e8f5e9", padding: "15px", borderRadius: "8px", borderLeft: "4px solid #4CAF50" }}>
            <div style={{ fontSize: "0.9em", color: "#666" }}>Pages</div>
            <div style={{ fontSize: "1.8em", fontWeight: "bold", color: "#4CAF50" }}>{stats.pages.total}</div>
            <div style={{ fontSize: "0.85em", color: "#999" }}>Active: {stats.pages.active}</div>
          </div>
        </div>
      )}

      {/* BANNERS SECTION */}
      <div className="admin-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h3>Homepage Banners ({banners.length})</h3>
          <button className="btn-primary" onClick={() => {
            setBannerFormData({ title: "", description: "", image: "", link: "", displayOrder: 0 });
            setEditingBannerID(null);
            setShowBannerForm(!showBannerForm);
          }}>
            {showBannerForm ? "✕ Cancel" : "+ Add Banner"}
          </button>
        </div>

        {showBannerForm && (
          <div style={{ backgroundColor: "#f5f5f5", padding: "15px", borderRadius: "8px", marginBottom: "15px" }}>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Title *</label>
              <input
                type="text"
                value={bannerFormData.title}
                onChange={(e) => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                placeholder="Banner title"
                style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
              />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Description</label>
              <textarea
                value={bannerFormData.description}
                onChange={(e) => setBannerFormData({ ...bannerFormData, description: e.target.value })}
                placeholder="Banner description"
                style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", minHeight: "80px" }}
              />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Image URL</label>
              <input
                type="text"
                value={bannerFormData.image}
                onChange={(e) => setBannerFormData({ ...bannerFormData, image: e.target.value })}
                placeholder="https://..."
                style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
              />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Link</label>
              <input
                type="text"
                value={bannerFormData.link}
                onChange={(e) => setBannerFormData({ ...bannerFormData, link: e.target.value })}
                placeholder="https://..."
                style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
              />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Display Order</label>
              <input
                type="number"
                value={bannerFormData.displayOrder}
                onChange={(e) => setBannerFormData({ ...bannerFormData, displayOrder: Number(e.target.value) })}
                style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
              />
            </div>
            <button className="btn-success" onClick={saveBanner} style={{ marginRight: "8px" }}>
              {editingBannerID ? "Update" : "Create"} Banner
            </button>
          </div>
        )}

        <div className="admin-table">
          <div className="table-row head">
            <span>Title</span>
            <span>Status</span>
            <span>Order</span>
            <span>Actions</span>
          </div>
          {banners.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>No banners yet</div>
          ) : (
            banners.map(b => (
              <div className="table-row" key={b._id}>
                <span>{b.title}</span>
                <span style={{ color: b.active ? "#10b981" : "#ef4444", fontWeight: "bold" }}>
                  {b.active ? "✓ Active" : "✗ Inactive"}
                </span>
                <span>{b.displayOrder}</span>
                <span style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button className="btn-outline" onClick={() => toggleBanner(b._id)} style={{ padding: "4px 8px", fontSize: "0.9em" }}>
                    {b.active ? "Disable" : "Enable"}
                  </button>
                  <button className="btn-outline" onClick={() => editBanner(b)} style={{ padding: "4px 8px", fontSize: "0.9em" }}>
                    Edit
                  </button>
                  <button className="btn-danger" onClick={() => deleteBanner(b._id)} style={{ padding: "4px 8px", fontSize: "0.9em" }}>
                    Delete
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* BLOGS SECTION */}
      <div className="admin-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h3>Blog Management ({blogs.length})</h3>
          <button className="btn-primary" onClick={() => {
            setBlogFormData({ title: "", content: "", summary: "", category: "Tips", tags: "", image: "", author: "" });
            setEditingBlogId(null);
            setShowBlogForm(!showBlogForm);
          }}>
            {showBlogForm ? "✕ Cancel" : "+ Add Blog"}
          </button>
        </div>

        {showBlogForm && (
          <div style={{ backgroundColor: "#f5f5f5", padding: "15px", borderRadius: "8px", marginBottom: "15px" }}>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Title *</label>
              <input
                type="text"
                value={blogFormData.title}
                onChange={(e) => setBlogFormData({ ...blogFormData, title: e.target.value })}
                placeholder="Blog title"
                style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
              />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Content *</label>
              <textarea
                value={blogFormData.content}
                onChange={(e) => setBlogFormData({ ...blogFormData, content: e.target.value })}
                placeholder="Blog content"
                style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", minHeight: "150px", fontFamily: "monospace" }}
              />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Summary</label>
              <textarea
                value={blogFormData.summary}
                onChange={(e) => setBlogFormData({ ...blogFormData, summary: e.target.value })}
                placeholder="Blog summary"
                style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", minHeight: "60px" }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Author</label>
                <input
                  type="text"
                  value={blogFormData.author}
                  onChange={(e) => setBlogFormData({ ...blogFormData, author: e.target.value })}
                  placeholder="Author name"
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Category</label>
                <select
                  value={blogFormData.category}
                  onChange={(e) => setBlogFormData({ ...blogFormData, category: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                >
                  <option>Tips</option>
                  <option>Guides</option>
                  <option>News</option>
                  <option>Updates</option>
                  <option>Maintenance</option>
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Image URL</label>
                <input
                  type="text"
                  value={blogFormData.image}
                  onChange={(e) => setBlogFormData({ ...blogFormData, image: e.target.value })}
                  placeholder="https://..."
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Tags (comma separated)</label>
                <input
                  type="text"
                  value={blogFormData.tags}
                  onChange={(e) => setBlogFormData({ ...blogFormData, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                />
              </div>
            </div>
            <button className="btn-success" onClick={saveBlog} style={{ marginRight: "8px" }}>
              {editingBlogId ? "Update" : "Create"} Blog
            </button>
          </div>
        )}

        <div className="admin-table">
          <div className="table-row head">
            <span>Title</span>
            <span>Category</span>
            <span>Status</span>
            <span>Views</span>
            <span>Actions</span>
          </div>
          {blogs.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>No blogs yet</div>
          ) : (
            blogs.map(b => (
              <div className="table-row" key={b._id}>
                <span>{b.title}</span>
                <span style={{ fontSize: "0.9em", color: "#666" }}>{b.category}</span>
                <span style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "0.9em",
                  fontWeight: "bold",
                  backgroundColor: b.status === "Published" ? "#c8e6c9" : b.status === "Draft" ? "#fff9c4" : "#e0e0e0",
                  color: b.status === "Published" ? "#2e7d32" : b.status === "Draft" ? "#f57f17" : "#424242"
                }}>
                  {b.status}
                </span>
                <span style={{ color: "#666", fontSize: "0.9em" }}>👁 {b.views}</span>
                <span style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {b.status !== "Published" && (
                    <button className="btn-outline" onClick={() => publishBlog(b._id)} style={{ padding: "4px 8px", fontSize: "0.9em" }}>
                      Publish
                    </button>
                  )}
                  <button className="btn-outline" onClick={() => editBlog(b)} style={{ padding: "4px 8px", fontSize: "0.9em" }}>
                    Edit
                  </button>
                  <button className="btn-danger" onClick={() => deleteBlog(b._id)} style={{ padding: "4px 8px", fontSize: "0.9em" }}>
                    Delete
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PAGES SECTION */}
      <div className="admin-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h3>Static Pages ({pages.length})</h3>
          <button className="btn-primary" onClick={() => {
            setPageFormData({ title: "", content: "", metaTitle: "", metaDescription: "", metaKeywords: "" });
            setEditingPageId(null);
            setShowPageForm(!showPageForm);
          }}>
            {showPageForm ? "✕ Cancel" : "+ Add Page"}
          </button>
        </div>

        {showPageForm && (
          <div style={{ backgroundColor: "#f5f5f5", padding: "15px", borderRadius: "8px", marginBottom: "15px" }}>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Title *</label>
              <input
                type="text"
                value={pageFormData.title}
                onChange={(e) => setPageFormData({ ...pageFormData, title: e.target.value })}
                placeholder="Page title"
                style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
              />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Content *</label>
              <textarea
                value={pageFormData.content}
                onChange={(e) => setPageFormData({ ...pageFormData, content: e.target.value })}
                placeholder="Page content"
                style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", minHeight: "150px", fontFamily: "monospace" }}
              />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Meta Title</label>
              <input
                type="text"
                value={pageFormData.metaTitle}
                onChange={(e) => setPageFormData({ ...pageFormData, metaTitle: e.target.value })}
                placeholder="SEO Meta Title"
                style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
              />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Meta Description</label>
              <textarea
                value={pageFormData.metaDescription}
                onChange={(e) => setPageFormData({ ...pageFormData, metaDescription: e.target.value })}
                placeholder="SEO Meta Description"
                style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", minHeight: "60px" }}
              />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Meta Keywords</label>
              <input
                type="text"
                value={pageFormData.metaKeywords}
                onChange={(e) => setPageFormData({ ...pageFormData, metaKeywords: e.target.value })}
                placeholder="keyword1, keyword2"
                style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
              />
            </div>
            <button className="btn-success" onClick={savePage} style={{ marginRight: "8px" }}>
              {editingPageId ? "Update" : "Create"} Page
            </button>
          </div>
        )}

        <div className="admin-table">
          <div className="table-row head">
            <span>Title</span>
            <span>Slug</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {pages.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>No pages yet</div>
          ) : (
            pages.map(p => (
              <div className="table-row" key={p._id}>
                <span>{p.title}</span>
                <span style={{ fontSize: "0.9em", color: "#666" }}>/{p.slug}</span>
                <span style={{ color: p.active ? "#10b981" : "#ef4444", fontWeight: "bold" }}>
                  {p.active ? "✓ Active" : "✗ Inactive"}
                </span>
                <span style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button className="btn-outline" onClick={() => editPage(p)} style={{ padding: "4px 8px", fontSize: "0.9em" }}>
                    Edit
                  </button>
                  <button className="btn-danger" onClick={() => deletePage(p._id)} style={{ padding: "4px 8px", fontSize: "0.9em" }}>
                    Delete
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
