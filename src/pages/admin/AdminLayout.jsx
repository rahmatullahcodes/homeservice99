import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../../styles/admin.css";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function logout() {
    localStorage.removeItem("admin");
    navigate("/admin-login");
  }

  return (
    <div className="admin-layout">

      {/* TOP BAR */}
      <header className="admin-topbar">
        <div className="topbar-left">
          <button
            className="admin-hamburger"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Toggle menu"
            aria-expanded={sidebarOpen}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="admin-top-title">Admin Dashboard</div>
        </div>

        <div className="topbar-right">
          <span className="admin-role">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Super Admin
          </span>
          <button className="btn-logout" onClick={logout} aria-label="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5m7-7l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar-inner">
          <div className="admin-brand">
            <div className="brand-icon">HS</div>
            <div className="brand-text">
              <strong>HomeService99</strong>
              <span>Admin Portal</span>
            </div>
          </div>

          {/* SEARCH */}
          <div className="admin-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input placeholder="Search modules..." />
          </div>

          {/* MAIN NAV */}
          <nav className="admin-nav">
            <div className="nav-section">
              <label className="nav-label">Main</label>
              <NavLink to="/admin" end onClick={() => setSidebarOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12h8V3H3v9zm10 0h8V3h-8v9zm-10 10h8v-8H3v8zm10 0h8v-8h-8v8z" fill="currentColor"/></svg>
                Dashboard
              </NavLink>
              <NavLink to="/admin/bookings" onClick={() => setSidebarOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M16 2v4M8 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Bookings
              </NavLink>
              <NavLink to="/admin/payments" onClick={() => setSidebarOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M2 8h20" stroke="currentColor" strokeWidth="2"/></svg>
                Payments
              </NavLink>
            </div>

            <div className="nav-section">
              <label className="nav-label">Management</label>
              <NavLink to="/admin/users" onClick={() => setSidebarOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 3v6m-3-3h6M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Users
              </NavLink>
              <NavLink to="/admin/vendors" onClick={() => setSidebarOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Vendors
              </NavLink>
              <NavLink to="/admin/services" onClick={() => setSidebarOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l9 5v6c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V7l9-5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Services
              </NavLink>
            </div>

            <div className="nav-section">
              <label className="nav-label">Platform</label>
              <NavLink to="/admin/coupons" onClick={() => setSidebarOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16M4 10h16M4 14h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Coupons
              </NavLink>
              <NavLink to="/admin/reviews" onClick={() => setSidebarOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" fill="currentColor"/></svg>
                Reviews
              </NavLink>
              <NavLink to="/admin/wallet" onClick={() => setSidebarOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm-2 14H3V6h16v12Z" fill="currentColor"/></svg>
                Wallet
              </NavLink>
            </div>

            <div className="nav-section">
              <label className="nav-label">Content & Reports</label>
              <NavLink to="/admin/cms" onClick={() => setSidebarOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 00.948-.684l1.498-4.493a1 1 0 011.502 0l1.498 4.493a1 1 0 00.948.684H19a2 2 0 012 2v1a2 2 0 00-2 2v3a2 2 0 002 2v1a2 2 0 01-2 2h-2.28a1 1 0 00-.948.684l-1.498 4.493a1 1 0 01-1.502 0l-1.498-4.493a1 1 0 00-.948-.684H5a2 2 0 01-2-2v-1a2 2 0 00-2-2V7a2 2 0 002-2V5z" stroke="currentColor" strokeWidth="2"/></svg>
                CMS
              </NavLink>
              <NavLink to="/admin/reports" onClick={() => setSidebarOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M18 5l-5 5-4-4-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Reports
              </NavLink>
              <NavLink to="/admin/support" onClick={() => setSidebarOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Support
              </NavLink>
            </div>

            <div className="nav-section">
              <label className="nav-label">Settings</label>
              <NavLink to="/admin/notifications" onClick={() => setSidebarOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Notifications
              </NavLink>
              <NavLink to="/admin/settings" onClick={() => setSidebarOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/><path d="M12 1v6m8 5h-6m-4 8v-6M1 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Settings
              </NavLink>
            </div>
          </nav>
        </div>

        <div className="admin-sidebar-foot">
          <button className="btn-logout-sidebar" onClick={logout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5m7-7l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* MAIN CONTENT */}
      <main className="admin-main">
        <Outlet />
      </main>

    </div>
  );
}
