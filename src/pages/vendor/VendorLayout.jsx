import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../../styles/vendor.css";

export default function VendorLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("vendor");
    navigate("/vendor-login");
  }

  return (
    <div className="vendor-shell">

      {/* MOBILE HEADER */}
      <header className="vendor-mobile-header">
        <button className="vendor-toggle" onClick={() => setOpen(!open)}>☰</button>
        <span>Partner Panel</span>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </header>

      {/* SIDEBAR */}
      <aside className={`vendor-sidebar ${open ? "open" : ""}`}>

        <div className="vendor-header">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
            </svg>
            Partner Panel
          </h3>
        </div>

        <nav className="vendor-links">
          <NavLink to="/vendor" end>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Dashboard
          </NavLink>

          <NavLink to="/vendor/bookings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            Bookings
          </NavLink>

          <NavLink to="/vendor/services">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9h12M6 9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2M6 9v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9"/>
              <path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2H9V5z"/>
            </svg>
            Services
          </NavLink>

          <NavLink to="/vendor/earnings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            Earnings
          </NavLink>

          <NavLink to="/vendor/wallet">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            Wallet
          </NavLink>

          <NavLink to="/vendor/transactions">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 17"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
            Transactions
          </NavLink>

          <NavLink to="/vendor/reviews">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Reviews
          </NavLink>

          <NavLink to="/vendor/profile">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Profile
          </NavLink>
        </nav>

        <button className="vendor-logout" onClick={logout}>
          Logout
        </button>

      </aside>

      {/* OVERLAY FOR MOBILE */}
      {open && <div className="vendor-overlay" onClick={() => setOpen(false)}></div>}

      {/* CONTENT */}
      <main className="vendor-content">
        <Outlet />
      </main>

    </div>
  );
}
