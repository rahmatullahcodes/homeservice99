import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../../styles/admin.css";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function logout() {
    localStorage.removeItem("admin");
    navigate("/admin-login");
  }

  return (
    <div className="admin-layout">

      {/* TOP BAR */}
      <header className="admin-topbar">
        <button
          className="admin-hamburger"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <div className="admin-top-title">Admin Dashboard</div>

        <div className="admin-top-actions">
          <span className="admin-role">Super Admin</span>
          <button className="btn-outline" onClick={logout}>Logout</button>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <div className="admin-brand">
          <strong>HomeService99</strong>
          <span>Admin Panel</span>
        </div>

        {/* SEARCH */}
        <div className="admin-search">
          <input placeholder="Search module..." />
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin" end>📊 Dashboard</NavLink>
          <NavLink to="/admin/users">👥 Users</NavLink>
          <NavLink to="/admin/vendors">🤝 Vendors</NavLink>
          <NavLink to="/admin/services">🛠 Services</NavLink>
          <NavLink to="/admin/bookings">📅 Bookings</NavLink>
          <NavLink to="/admin/payments">💳 Payments</NavLink>
          <NavLink to="/admin/wallet">👛 Wallet</NavLink>
          <NavLink to="/admin/coupons">🎟 Coupons</NavLink>
          <NavLink to="/admin/reviews">⭐ Reviews</NavLink>
          <NavLink to="/admin/cms">📝 CMS</NavLink>
          <NavLink to="/admin/reports">📈 Reports</NavLink>
          <NavLink to="/admin/support">🛎 Support Tickets</NavLink>
          <NavLink to="/admin/notifications">🔔 Notifications</NavLink>
          <NavLink to="/admin/settings">⚙ Settings</NavLink>
        </nav>

        <div className="admin-sidebar-foot">
          <button className="btn-danger full" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      {open && <div className="admin-overlay" onClick={() => setOpen(false)}></div>}

      {/* MAIN CONTENT */}
      <main className="admin-main">
        <Outlet />
      </main>

    </div>
  );
}
