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

        {/* CART */}
        <Link to="/cart" className="uc-cart">
          🛒
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>

        {/* USER / AUTH */}
        {!isLoggedIn ? (
          <>
            <Link to="/login" className="btn-outline">Login</Link>
            <Link to="/signup" className="btn-primary">Signup</Link>
          </>
        ) : (
          <>
            <button className="btn-outline" onClick={() => navigate("/account")}>
              👤
            </button>
            <button className="btn-outline" onClick={logout}>
              Logout
            </button>
          </>
        )}

        {/* VENDOR CTA (ONLY IF NOT VENDOR)
        {!isVendor && (
          <Link to="/vendor-signup" className="btn-vendor">
            Become a Partner
          </Link>
        )} */}

        {/* MOBILE HAMBURGER (visible on small screens) */}
        <button className="mobile-hamburger btn-ghost" onClick={() => setMobileMenu(m => !m)} aria-expanded={mobileMenu} aria-label="Open mobile menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

      </div>

      {/* MOBILE MENU OVERLAY */}
      <div className={`mobile-menu-backdrop ${mobileMenu ? 'visible' : ''}`} onClick={() => setMobileMenu(false)} aria-hidden={!mobileMenu}></div>

      <div className={`mobile-menu ${mobileMenu ? 'visible' : ''}`} role="dialog" aria-modal="true">
        <div className="mobile-menu-inner">
          <Link to="/cart" className="mobile-menu-link" onClick={() => setMobileMenu(false)}>🛒 Cart</Link>

          {!isLoggedIn ? (
            <>
              <Link to="/login" className="mobile-menu-link" onClick={() => setMobileMenu(false)}>Login</Link>
              <Link to="/signup" className="mobile-menu-link" onClick={() => setMobileMenu(false)}>Signup</Link>
            </>
          ) : (
            <>
              <button className="mobile-menu-link" onClick={() => { setMobileMenu(false); navigate('/account'); }}>Account</button>
              <button className="mobile-menu-link" onClick={() => { setMobileMenu(false); logout(); }}>Logout</button>
            </>
          )}

          {!isVendor && <Link to="/vendor-signup" className="mobile-menu-link" onClick={() => setMobileMenu(false)}>Become a Partner</Link>}
        </div>
      </div>
    </header>
  );
}
