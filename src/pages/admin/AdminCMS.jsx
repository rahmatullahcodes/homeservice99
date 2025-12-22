import { useState } from "react";

export default function AdminCMS() {

  const [banners, setBanners] = useState([
    { id: 1, title: "Summer Cleaning Offer", active: true },
    { id: 2, title: "AC Service Discount", active: false }
  ]);

  const [pages] = useState([
    "Home",
    "About Us",
    "Contact",
    "Privacy Policy",
    "Terms & Conditions"
  ]);

  const [blogs, setBlogs] = useState([
    { id: 1, title: "How to maintain AC", status: "Published" },
    { id: 2, title: "Deep cleaning checklist", status: "Draft" }
  ]);

  function toggleBanner(id) {
    setBanners(prev =>
      prev.map(b =>
        b.id === id ? { ...b, active: !b.active } : b
      )
    );
  }

  return (
    <div className="admin-page">

      <h2>CMS Management</h2>
      <p className="admin-subtitle">
        Control website content, banners and blogs
      </p>

      {/* BANNERS */}
      <section className="admin-section">
        <h3>Homepage Banners</h3>

        {banners.map(b => (
          <div key={b.id} className="detail-box">
            <strong>{b.title}</strong>
            <p>Status: {b.active ? "Active" : "Inactive"}</p>

            <button
              className="btn-outline"
              onClick={() => toggleBanner(b.id)}
            >
              {b.active ? "Disable" : "Enable"}
            </button>
          </div>
        ))}

        <button className="btn-primary" style={{ marginTop: 8 }}>
          + Add New Banner
        </button>
      </section>

      {/* STATIC PAGES */}
      <section className="admin-section">
        <h3>Static Pages</h3>

        {pages.map(p => (
          <div key={p} className="detail-box">
            <strong>{p}</strong>
            <button className="btn-outline" style={{ marginLeft: 10 }}>
              Edit
            </button>
          </div>
        ))}
      </section>

      {/* BLOG MANAGEMENT */}
      <section className="admin-section">
        <h3>Blog Management</h3>

        <div className="admin-table">
          <div className="table-row head">
            <span>Title</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {blogs.map(b => (
            <div key={b.id} className="table-row">
              <span>{b.title}</span>
              <span className={b.status === "Published" ? "status-success" : "status-pending"}>
                {b.status}
              </span>
              <span>
                <button className="btn-outline">Edit</button>
              </span>
            </div>
          ))}
        </div>

        <button className="btn-primary" style={{ marginTop: 8 }}>
          + Create Blog
        </button>
      </section>

    </div>
  );
}
