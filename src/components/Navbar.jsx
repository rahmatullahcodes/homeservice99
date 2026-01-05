import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { cart } = useCart();

  const [location, setLocation] = useState("Sector 82, Noida");
  const [query, setQuery] = useState("");

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
      <div className="uc-center">
        {/* Location Box */}
        <div className="location-dropdown">
          <span className="location-icon">📍</span>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="location-select"
          >
            <option>Sector 82, Noida</option>
            <option>Sector 90, Noida</option>
            <option>Delhi</option>
            <option>Ghaziabad</option>
          </select>
        </div>

        {/* Search Box */}
        <form className="uc-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for 'AC repair', 'Salon', 'Cleaning'..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
      </div>

      {/* RIGHT: ACTIONS */}
      <div className="uc-actions">

        {/* MOBILE ICONS (shown only on small screens) */}
        <div className="mobile-icons" aria-hidden="true">
          {!isLoggedIn ? (
            <Link to="/signup" className="mobile-icon mobile-icon-primary" aria-label="Signup">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          ) : (
            <Link to="/account" className="mobile-icon" aria-label="Account">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          )}
        </div>

        {/* CART */}
        <Link to="/cart" className="uc-cart" aria-label="Shopping cart">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 2L6.12 9H18.88L16 2M6.12 9H3L5 20C5 20.5304 5.21071 21.0391 5.58579 21.4142C5.96086 21.7893 6.46957 22 7 22H17C17.5304 22 18.0391 21.7893 18.4142 21.4142C18.7893 21.0391 19 20.5304 19 20L21 9M9 13V19M15 13V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>

        {/* USER / AUTH (DESKTOP) - ICONS ONLY */}
        <div className="uc-auth-desktop">
          {!isLoggedIn ? (
            <Link to="/signup" className="desktop-auth-icon desktop-auth-icon-primary" aria-label="Signup" title="Signup">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          ) : (
            <button className="desktop-auth-icon" onClick={() => navigate("/account")} aria-label="Account" title="Account">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
