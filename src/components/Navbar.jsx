import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

const assetImage = (fileName) => new URL(`../assets/images/${fileName}`, import.meta.url).href;


// Popular locations for search
const LOCATION_SUGGESTIONS = [
  "Sector 82, Noida",
  "Sector 90, Noida",
  "Connaught Place, Delhi",
  "Ghaziabad",
  "Greater Noida",
  "Indirapuram, Ghaziabad",
  "Vasundhara, Ghaziabad",
  "Ecotech Extn, Noida",
  "Faridabad",
  "Gurgaon",
  "DLF City, Gurgaon",
  "MG Road, Delhi"
];

export default function Navbar() {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const { cart } = useCart();

  const [location, setLocation] = useState(() => localStorage.getItem("selectedLocation") || "Sector 82, Noida");
  const [query, setQuery] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState(LOCATION_SUGGESTIONS);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [geoSuccess, setGeoSuccess] = useState(false);

  const isLoggedIn = !!localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isVendor = user?.role === "vendor";

  const cartCount = cart.length;
  const hideCartOnServicesPage = routeLocation.pathname.startsWith("/services");

  function handleLocationSelect(selectedLocation) {
    setLocation(selectedLocation);
    localStorage.setItem("selectedLocation", selectedLocation);
    setShowLocationModal(false);
    setLocationSearch("");
    setFilteredSuggestions(LOCATION_SUGGESTIONS);
    setGeoError("");
    setGeoSuccess(false);
  }

  function handleLocationSearchChange(value) {
    setLocationSearch(value);

    if (!value.trim()) {
      setFilteredSuggestions(LOCATION_SUGGESTIONS);
      return;
    }

    // Filter suggestions based on search input
    const filtered = LOCATION_SUGGESTIONS.filter(loc =>
      loc.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredSuggestions(filtered.length > 0 ? filtered : LOCATION_SUGGESTIONS);
  }

  async function getCurrentLocation() {
    setGeoLoading(true);
    setGeoError("");
    setGeoSuccess(false);

    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser");
      setGeoLoading(false);
      return;
    }

    const host = window.location.hostname;
    const isLocalhost = host === "localhost" || host === "127.0.0.1";
    if (!window.isSecureContext && !isLocalhost) {
      setGeoError("Location works only on HTTPS (or localhost). Please open the site with https://");
      setGeoLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let timeout;

        try {
          // Create abort controller with 5 second timeout
          const controller = new AbortController();
          timeout = setTimeout(() => controller.abort(), 5000);

          // Use Nominatim for reverse geocoding (free, reliable, no API key)
          const nominatimResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${latitude}&lon=${longitude}`,
            { 
              signal: controller.signal,
              headers: { 'Accept-Language': 'en' }
            }
          );

          if (nominatimResponse.ok) {
            const data = await nominatimResponse.json();
             
            if (data.address) {
              // Build a readable address from the Nominatim response
              const city = data.address.city || data.address.town || data.address.village || "";
              const state = data.address.state || "";
              const country = data.address.country || "";
              
              let address = "";
              if (city && state) {
                address = `${city}, ${state}, ${country}`;
              } else if (city) {
                address = `${city}, ${country}`;
              } else {
                address = country;
              }

              if (address.trim()) {
                handleLocationSelect(address);
                setGeoLoading(false);
                setGeoSuccess(true);
                setTimeout(() => setGeoSuccess(false), 2000);
                return;
              }
            }
          }

          setGeoError("Unable to determine your exact location. Please search manually.");
          setGeoLoading(false);
        } catch (err) {
          console.error("Location error:", err);
          if (err.name === "AbortError") {
            setGeoError("Location lookup timed out. Please search manually.");
          } else {
            setGeoError("Unable to determine your exact location. Please search manually.");
          }
          setGeoLoading(false);
        } finally {
          clearTimeout(timeout);
        }
      },
      (error) => {
        setGeoLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError("Location permission denied. Please enable location access in your browser settings.");
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError("Your location is unavailable. Please search manually.");
            break;
          case error.TIMEOUT:
            setGeoError("Location request timed out. Please try again.");
            break;
          default:
            setGeoError("Unable to get your location. Please search manually.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 300000
      }
    );
  }

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
      <div className="uc-navbar-inner">

      {/* LEFT: LOGO */}
      <div className="uc-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <img 
          src={assetImage("logohs99-removebg-preview.png")} 
          alt="HomeService99 Logo" 
          className="navbar-logo-image"
          style={{ height: "34px", width: "auto", objectFit: "contain" }}
        />
      </div>

      {/* CENTER: LOCATION + SEARCH */}
      <div className="uc-center">
        {/* Location Box - Click to open modal */}
        <div className="location-dropdown" onClick={() => setShowLocationModal(true)} style={{ cursor: "pointer" }}>
          <span className="location-icon">{"\u{1F4CD}"}</span>
          <span className="location-text">{location}</span>
          <span style={{ fontSize: "12px", color: "#9ca3af", marginLeft: "4px" }}>{"\u25BE"}</span>
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

        {/* JOIN AS A PRO BUTTON */}
        <Link 
          to={isLoggedIn ? "/vendor-dashboard" : "/vendor-signup"} 
          className="join-pro-btn" 
          aria-label="Join as a professional"
        >
          Join as a pro
        </Link>

        {/* CART */}
        {!hideCartOnServicesPage && (
          <Link to="/cart" className="uc-cart" aria-label="Shopping cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 2L6.12 9H18.88L16 2M6.12 9H3L5 20C5 20.5304 5.21071 21.0391 5.58579 21.4142C5.96086 21.7893 6.46957 22 7 22H17C17.5304 22 18.0391 21.7893 18.4142 21.4142C18.7893 21.0391 19 20.5304 19 20L21 9M9 13V19M15 13V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        )}

        {/* USER / AUTH (DESKTOP) */}
        <div className="uc-auth-desktop">
          {!isLoggedIn ? (
            <Link to="/signup" className="desktop-auth-icon desktop-auth-icon-primary" aria-label="Signup" title="Signup">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          ) : (
            <>
              <button className="desktop-auth-icon" onClick={() => navigate("/account")} aria-label="Account" title="Account">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button className="desktop-auth-icon logout-btn" onClick={logout} aria-label="Logout" title="Logout">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </>
          )}
        </div>

      </div>

      </div>

      {/* LOCATION MODAL */}
      {showLocationModal && (
        <div
          className="location-modal-backdrop"
          onClick={() => setShowLocationModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px"
          }}
        >
          <div
            className="location-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "420px",
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowLocationModal(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                padding: "0",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b7280",
                zIndex: 10000
              }}
            >
              {"\u2715"}
            </button>

            {/* Back Arrow */}
            <button
              onClick={() => setShowLocationModal(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: "18px",
                cursor: "pointer",
                marginBottom: "16px",
                padding: "8px",
                borderRadius: "6px",
                color: "#374151",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: "500",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.target.style.background = "#f3f4f6"}
              onMouseLeave={(e) => e.target.style.background = "none"}
            >
              {"\u2190 Back"}
            </button>

            {/* Search Input */}
            <div style={{ marginBottom: "16px" }}>
              <input
                type="text"
                placeholder="Search for your location/society/apartment"
                value={locationSearch}
                onChange={(e) => handleLocationSearchChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                  outline: "none"
                }}
                onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
              />
            </div>

            {/* Use Current Location Button */}
            <button
              onClick={getCurrentLocation}
              disabled={geoLoading}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #2563eb",
                background: "white",
                color: "#2563eb",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: geoLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "16px",
                transition: "all 0.2s",
                opacity: geoLoading ? 0.7 : 1
              }}
              onMouseEnter={(e) => !geoLoading && (e.target.style.background = "#eff6ff")}
              onMouseLeave={(e) => (e.target.style.background = "white")}
            >
              <span>{geoLoading ? "Getting location..." : "\u{1F4CD} Use current location"}</span>
            </button>

            {/* Error Message */}
            {geoError && (
              <div
                style={{
                  padding: "12px",
                  background: "#fee2e2",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  borderLeft: "3px solid #dc2626"
                }}
              >
                <p style={{ margin: "0", fontSize: "13px", color: "#991b1b", fontWeight: "500" }}>
                  {"\u26A0\uFE0F"} {geoError}
                </p>
              </div>
            )}

            {/* Success Message */}
            {geoSuccess && (
              <div
                style={{
                  padding: "12px",
                  background: "#dcfce7",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  borderLeft: "3px solid #16a34a"
                }}
              >
                <p style={{ margin: "0", fontSize: "13px", color: "#15803d", fontWeight: "500" }}>
                  {"\u2713"} Location updated successfully!
                </p>
              </div>
            )}

            {/* Location Suggestions */}
            {filteredSuggestions.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <p style={{
                  margin: "0 0 12px 0",
                  fontSize: "12px",
                  color: "#6b7280",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  Suggestions
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto" }}>
                  {filteredSuggestions.map((loc, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleLocationSelect(loc)}
                      style={{
                        padding: "12px",
                        border: "1px solid #e5e7eb",
                        background: "white",
                        borderRadius: "8px",
                        fontSize: "13px",
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontWeight: "500",
                        color: "#111827"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#f0fdf4";
                        e.target.style.borderColor = "#16a34a";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "white";
                        e.target.style.borderColor = "#e5e7eb";
                      }}
                    >
                      <span style={{ marginRight: "8px" }}>{"\u{1F4CD}"}</span>
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* OpenStreetMap Branding */}
            <div style={{
              textAlign: "center",
              marginTop: "12px",
              paddingTop: "12px",
              borderTop: "1px solid #e5e7eb",
              fontSize: "11px",
              color: "#9ca3af"
            }}>
              {"\u{1F5FA}\uFE0F"} Location data powered by OpenStreetMap
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
