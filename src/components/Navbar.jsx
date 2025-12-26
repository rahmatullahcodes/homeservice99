import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { cart } = useCart();

  const [location, setLocation] = useState("Sector 82, Noida");
  const [query, setQuery] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const isLoggedIn = localStorage.getItem("auth") === "true";
  const isVendor = localStorage.getItem("vendor") === "true";
  const userRole = localStorage.getItem("userRole") || "user";

  const cartCount = cart.length;

  // Service Categories
  const serviceCategories = [
    { name: "Plumbing", icon: "🔧" },
    { name: "Electrical", icon: "⚡" },
    { name: "Cleaning", icon: "🧹" },
    { name: "Carpentry", icon: "🪛" },
    { name: "Painting", icon: "🎨" },
    { name: "AC Repair", icon: "❄️" },
    { name: "Beauty", icon: "💄" },
    { name: "Salon", icon: "✂️" }
  ];

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/services?search=${query}`);
  }

  return (
    <header className="uc-navbar">

      {/* LEFT: LOGO */}
      <div className="uc-logo" onClick={() => navigate("/")}>
        <span className="logo-circle">HS</span>
        <span className="logo-text">HomeService99</span>
      </div>

      {/* CENTER: LOCATION + SEARCH */}
      <form className="uc-search" onSubmit={handleSearch}>
        <div className="location-box">
          📍
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option>Sector 82, Noida</option>
            <option>Sector 90, Noida</option>
            <option>Delhi</option>
            <option>Ghaziabad</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Search for 'AC repair', 'Salon', 'Cleaning'..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      {/* RIGHT: ACTIONS */}
      <div className="uc-actions">

        {/* MOBILE ICONS (shown only on small screens) */}
        <div className="mobile-icons" aria-hidden="true">
          {!isLoggedIn ? (
            <Link to="/login" className="mobile-icon" aria-label="Login">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          ) : (
            <Link to="/account" className="mobile-icon" aria-label="Account">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          )}

          <Link to="/signup" className="mobile-icon mobile-icon-primary" aria-label="Signup">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>

        {/* CART */}
        <Link to="/cart" className="uc-cart" aria-label="Shopping cart">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 2L6.12 9H18.88L16 2M6.12 9H3L5 20C5 20.5304 5.21071 21.0391 5.58579 21.4142C5.96086 21.7893 6.46957 22 7 22H17C17.5304 22 18.0391 21.7893 18.4142 21.4142C18.7893 21.0391 19 20.5304 19 20L21 9M9 13V19M15 13V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>

        {/* USER / AUTH (DESKTOP) */}
        <div className="uc-auth-desktop">
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="btn-outline">Login</Link>
              <Link to="/signup" className="btn-primary">Signup</Link>
            </>
          ) : (
            <>
              <button className="btn-outline" onClick={() => navigate("/account")} aria-label="Account">Account</button>
              <button className="btn-outline" onClick={logout}>Logout</button>
            </>
          )}
        </div>

        {/* MOBILE HAMBURGER (visible on small screens) */}
        <button 
          className="mobile-hamburger" 
          onClick={() => setMobileMenu(m => !m)} 
          aria-expanded={mobileMenu} 
          aria-label="Open mobile menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

      </div>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenu && (
        <div 
          className="mobile-menu-backdrop" 
          onClick={() => setMobileMenu(false)} 
          aria-hidden={!mobileMenu}
        />
      )}

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${mobileMenu ? 'visible' : ''}`} role="dialog" aria-modal="true">
        <div className="mobile-menu-inner">
          {/* MENU HEADER */}
          <div className="mobile-menu-header">
            <div className="mobile-menu-brand">
              <span className="mobile-brand-circle">HS</span>
              <div className="mobile-brand-text">
                <h3>HomeService99</h3>
                <p>Your Service Partner</p>
              </div>
            </div>
            <button 
              className="mobile-menu-close" 
              onClick={() => setMobileMenu(false)}
              aria-label="Close menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* SCROLLABLE MENU CONTENT */}
          <div className="mobile-menu-scrollable">
            {/* LOCATION & SEARCH SECTION */}
            <div className="mobile-menu-section">
              <label style={{fontSize: '11px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px'}}>📍 Your Location</label>
              <select 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
                className="mobile-location-select"
              >
                <option>Sector 82, Noida</option>
                <option>Sector 90, Noida</option>
                <option>Delhi</option>
                <option>Ghaziabad</option>
              </select>
            </div>

            {/* SEARCH SECTION */}
            <div className="mobile-menu-section">
              <label style={{fontSize: '11px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px'}}>🔍 Search Services</label>
              <form onSubmit={handleSearch} className="mobile-search-form">
                <input
                  type="text"
                  placeholder="Search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="mobile-search-input"
                />
                <button type="submit" className="mobile-search-btn" aria-label="Search">Go</button>
              </form>
            </div>

            {/* SERVICE CATEGORIES */}
            <div className="mobile-menu-section">
              <label style={{fontSize: '11px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px'}}>⭐ Popular Services</label>
              <div className="mobile-categories-grid">
                {serviceCategories.map((category) => (
                  <button 
                    key={category.name}
                    className="mobile-category-chip"
                    onClick={() => {
                      navigate(`/services?search=${category.name}`);
                      setMobileMenu(false);
                    }}
                  >
                    <span className="category-icon">{category.icon}</span>
                    <span className="category-name">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mobile-menu-divider"></div>

            {/* NAVIGATION LINKS */}
            <div className="mobile-menu-section">
              <label style={{fontSize: '11px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px'}}>📚 Explore</label>
              <Link to="/services" className="mobile-menu-link" onClick={() => setMobileMenu(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3h18v18H3z" stroke="currentColor" strokeWidth="2"/><path d="M9 11a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" fill="currentColor"/><path d="M21 9L12 3 3 9" stroke="currentColor" strokeWidth="2"/></svg>
                <span>All Services</span>
              </Link>
              <Link to="/pricing" className="mobile-menu-link" onClick={() => setMobileMenu(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" stroke="currentColor" strokeWidth="2"/><path d="M12 6v12M15 9h-6a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                <span>Pricing Plans</span>
              </Link>
              <Link to="/blog" className="mobile-menu-link" onClick={() => setMobileMenu(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h16v16H4z" stroke="currentColor" strokeWidth="2"/><path d="M8 8h8M8 14h8M8 11h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <span>Blog & Tips</span>
              </Link>
              <Link to="/compare" className="mobile-menu-link" onClick={() => setMobileMenu(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 6h14M5 12h14M5 18h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                <span>Compare Services</span>
              </Link>
              <Link to="/about" className="mobile-menu-link" onClick={() => setMobileMenu(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2"/><path d="M6 20c0-3.313 2.686-6 6-6s6 2.687 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                <span>About Us</span>
              </Link>
            </div>

            <div className="mobile-menu-divider"></div>

            {/* SHOPPING & SUPPORT */}
            <div className="mobile-menu-section">
              <label style={{fontSize: '11px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px'}}>🛒 Shopping & Support</label>
              <Link to="/cart" className="mobile-menu-link" onClick={() => setMobileMenu(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 2L6.12 9H18.88L16 2M6.12 9H3L5 20C5 20.5304 5.21071 21.0391 5.58579 21.4142C5.96086 21.7893 6.46957 22 7 22H17C17.5304 22 18.0391 21.7893 18.4142 21.4142C18.7893 21.0391 19 20.5304 19 20L21 9M9 13V19M15 13V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>My Cart {cartCount > 0 && <span className="badge">{cartCount}</span>}</span>
              </Link>
              <Link to="/contact" className="mobile-menu-link" onClick={() => setMobileMenu(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>Contact Us</span>
              </Link>
            </div>

            <div className="mobile-menu-divider"></div>

            {/* ACCOUNT & AUTH SECTION */}
            <div className="mobile-menu-section">
              <label style={{fontSize: '11px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px'}}>👤 Account</label>
              {!isLoggedIn ? (
                <>
                  <Link to="/login" className="mobile-menu-link" onClick={() => setMobileMenu(false)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span>Login</span>
                  </Link>
                  <Link to="/signup" className="mobile-menu-link mobile-menu-link-primary" onClick={() => setMobileMenu(false)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span>Sign Up</span>
                  </Link>
                </>
              ) : (
                <>
                  <button className="mobile-menu-link" onClick={() => { setMobileMenu(false); navigate('/account'); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span>My Account</span>
                  </button>
                  <button className="mobile-menu-link" onClick={() => { setMobileMenu(false); navigate('/account?tab=bookings'); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    <span>My Bookings</span>
                  </button>
                  {isVendor && (
                    <button className="mobile-menu-link" onClick={() => { setMobileMenu(false); navigate('/vendor'); }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" stroke="currentColor" strokeWidth="2"/><polyline points="13 2 13 9 20 9" stroke="currentColor" strokeWidth="2"/></svg>
                      <span>Vendor Panel</span>
                    </button>
                  )}
                  <button className="mobile-menu-link" onClick={() => { setMobileMenu(false); logout(); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 12H5m7-7l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>

            <div className="mobile-menu-divider"></div>

            {/* VENDOR SIGNUP CTA */}
            {!isVendor && isLoggedIn && (
              <div className="mobile-menu-section">
                <button 
                  className="mobile-menu-link mobile-menu-link-highlight"
                  onClick={() => { setMobileMenu(false); navigate('/vendor-signup'); }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/></svg>
                  <span>Become a Vendor</span>
                </button>
              </div>
            )}

            <div style={{height: '20px'}}></div>
          </div>
        </div>
      </div>
    </header>
  );
}
