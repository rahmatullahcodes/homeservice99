import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useVendor } from "../../context/VendorContext";
import "../../styles/vendor.css";

export default function VendorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { vendor, logout: contextLogout, loading, error } = useVendor();

  // Close sidebar when clicking a link or on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Handle scroll effect for header shadow
  useEffect(() => {
    const handleScroll = (e) => {
      setIsScrolled(e.target.scrollTop > 10);
    };
    const contentArea = document.querySelector(".vendor-content");
    contentArea?.addEventListener("scroll", handleScroll);
    return () => contentArea?.removeEventListener("scroll", handleScroll);
  }, []);

  // Close sidebar when pressing Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen]);

  const handleLogout = async () => {
    try {
      contextLogout();
      setShowLogoutConfirm(false);
      navigate("/vendor-login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const navigationItems = [
    {
      path: "/vendor",
      label: "Dashboard",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      path: "/vendor/bookings",
      label: "Bookings",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <path d="M16 2v4M8 2v4M3 10h18"/>
        </svg>
      ),
    },
    {
      path: "/vendor/services",
      label: "Services",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9h12M6 9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2M6 9v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9"/>
          <path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2H9V5z"/>
        </svg>
      ),
    },
    {
      path: "/vendor/earnings",
      label: "Earnings",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
    },
    {
      path: "/vendor/wallet",
      label: "Wallet",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
    },
    {
      path: "/vendor/transactions",
      label: "Transactions",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 17"/>
          <polyline points="17 6 23 6 23 12"/>
        </svg>
      ),
    },
    {
      path: "/vendor/reviews",
      label: "Reviews",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
    },
    {
      path: "/vendor/profile",
      label: "Profile",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="vendor-shell">
      {/* MOBILE HEADER - TOGGLE BAR */}
      <header className={`vendor-mobile-header ${isScrolled ? "scrolled" : ""}`} role="banner">
        <button
          className={`vendor-toggle ${sidebarOpen ? "active" : ""}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
          aria-expanded={sidebarOpen}
          aria-controls="vendor-sidebar"
        >
          <span className="toggle-line line1"></span>
          <span className="toggle-line line2"></span>
          <span className="toggle-line line3"></span>
        </button>

        <div className="vendor-header-title">
          <h1>HomeService</h1>
          {error && <span className="connection-status error">⚠ Offline</span>}
        </div>

        <button
          className="vendor-user-menu-btn"
          onClick={() => setShowLogoutConfirm(true)}
          aria-label="User menu"
          title="Logout"
        >
          {vendor?.name?.charAt(0).toUpperCase() || "U"}
        </button>
      </header>

      {/* SIDEBAR NAVIGATION */}
      <aside 
        className={`vendor-sidebar ${sidebarOpen ? "open" : ""}`} 
        role="navigation" 
        aria-label="Main navigation"
        id="vendor-sidebar"
      >
        {/* Sidebar Header */}
        <div className="vendor-sidebar-header">
          <div className="vendor-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            </svg>
            <h2>HomeService</h2>
          </div>
          <button
            className="vendor-close-sidebar"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* Vendor Info Card */}
        {vendor && (
          <div className="vendor-info-card">
            <div className="vendor-avatar">
              {vendor.name?.charAt(0).toUpperCase()}
            </div>
            <div className="vendor-info-content">
              <h4>{vendor.name || "Vendor"}</h4>
              <p className="vendor-email">{vendor.email}</p>
              {vendor.rating && (
                <div className="vendor-rating">
                  <span className="stars">★</span>
                  <span>{vendor.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="vendor-nav">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/vendor"}
              className={({ isActive }) => `vendor-nav-link ${isActive ? "active" : ""}`}
              role="menuitem"
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="vendor-sidebar-footer">
          <button
            className="vendor-logout-btn"
            onClick={() => setShowLogoutConfirm(true)}
            role="menuitem"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div
          className="vendor-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          role="presentation"
        />
      )}

      {/* MAIN CONTENT AREA */}
      <main className="vendor-content" role="main">
        {loading && (
          <div className="vendor-loading-state">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        )}
        {!loading && <Outlet />}
      </main>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="vendor-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="logout-title">
          <div className="vendor-modal">
            <h3 id="logout-title">Confirm Logout</h3>
            <p>Are you sure you want to logout? You'll need to login again to access your account.</p>
            <div className="vendor-modal-actions">
              <button
                className="vendor-modal-btn cancel"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button className="vendor-modal-btn confirm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
