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

  const cartCount = cart.length;

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
          <div className="mobile-menu-header">
            <h2 style={{fontSize: '16px', fontWeight: '600', margin: '0'}}>Menu</h2>
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

          <div className="mobile-menu-divider"></div>

          {/* LOCATION SELECTOR */}
          <div className="mobile-menu-section">
            <label style={{fontSize: '12px', color: '#6b7280', fontWeight: '600'}}>Location</label>
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

          {/* SEARCH */}
          <div className="mobile-menu-section">
            <form onSubmit={handleSearch} className="mobile-search-form">
              <input
                type="text"
                placeholder="Search services..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="mobile-search-input"
              />
              <button type="submit" className="mobile-search-btn" aria-label="Search">Go</button>
            </form>
          </div>

          <div className="mobile-menu-divider"></div>

          {/* CART LINK */}
          <Link to="/cart" className="mobile-menu-link" onClick={() => setMobileMenu(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 2L6.12 9H18.88L16 2M6.12 9H3L5 20C5 20.5304 5.21071 21.0391 5.58579 21.4142C5.96086 21.7893 6.46957 22 7 22H17C17.5304 22 18.0391 21.7893 18.4142 21.4142C18.7893 21.0391 19 20.5304 19 20L21 9M9 13V19M15 13V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span>Cart {cartCount > 0 && `(${cartCount})`}</span>
          </Link>

          {/* AUTH LINKS */}
          <div className="mobile-menu-divider"></div>
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="mobile-menu-link" onClick={() => setMobileMenu(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>Login</span>
              </Link>
              <Link to="/signup" className="mobile-menu-link mobile-menu-link-primary" onClick={() => setMobileMenu(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>Signup</span>
              </Link>
            </>
          ) : (
            <>
              <button className="mobile-menu-link" onClick={() => { setMobileMenu(false); navigate('/account'); }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>My Account</span>
              </button>
              <button className="mobile-menu-link" onClick={() => { setMobileMenu(false); logout(); }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 12H5m7-7l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
