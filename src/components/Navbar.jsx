import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { getServiceabilityMessage, isServiceableLocation } from "../utils/serviceAvailability";
import "./Navbar.css";

const assetImage = (fileName) => new URL(`../assets/images/${fileName}`, import.meta.url).href;
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_SCRIPT_ID = "hs99-google-maps-script";
const GOOGLE_MAPS_LIBRARIES = "places";
const DEFAULT_LOCATION = "Sector 82, Noida";

function loadGoogleMapsScript(apiKey) {
  if (!apiKey) {
    return Promise.reject(new Error("Google Maps API key is missing"));
  }

  if (window.google?.maps?.places && window.google?.maps?.Geocoder) {
    return Promise.resolve(window.google);
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);

    if (existingScript) {
      if (window.google?.maps?.places && window.google?.maps?.Geocoder) {
        resolve(window.google);
        return;
      }

      let settled = false;

      const cleanup = () => {
        existingScript.removeEventListener("load", onLoad);
        existingScript.removeEventListener("error", onError);
      };

      const resolveIfReady = () => {
        if (window.google?.maps?.places && window.google?.maps?.Geocoder) {
          settled = true;
          cleanup();
          resolve(window.google);
          return true;
        }
        return false;
      };

      const onLoad = () => {
        if (resolveIfReady()) {
          return;
        }
        if (!settled) {
          settled = true;
          cleanup();
          reject(new Error("Google Maps services are unavailable"));
        }
      };

      const onError = () => {
        if (!settled) {
          settled = true;
          cleanup();
          reject(new Error("Failed to load Google Maps script"));
        }
      };

      if (resolveIfReady()) {
        return;
      }

      existingScript.addEventListener("load", onLoad);
      existingScript.addEventListener("error", onError);

      setTimeout(() => {
        if (!settled) {
          if (!resolveIfReady()) {
            settled = true;
            cleanup();
            reject(new Error("Google Maps script did not become ready"));
          }
        }
      }, 4000);
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${GOOGLE_MAPS_LIBRARIES}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));
    document.head.appendChild(script);
  });
}

export default function Navbar() {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const { cart } = useCart();
  const { addToast } = useToast();

  const [location, setLocation] = useState(() => {
    const storedLocation = localStorage.getItem("selectedLocation");
    if (!storedLocation || storedLocation === DEFAULT_LOCATION) {
      if (storedLocation === DEFAULT_LOCATION) {
        localStorage.removeItem("selectedLocation");
      }
      return "";
    }
    return storedLocation;
  });
  const [query, setQuery] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [googleReady, setGoogleReady] = useState(false);
  const [googleSuggestions, setGoogleSuggestions] = useState([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [geoSuccess, setGeoSuccess] = useState(false);
  const autocompleteServiceRef = useRef(null);
  const geocoderRef = useRef(null);
  const searchRequestIdRef = useRef(0);
  const searchDebounceRef = useRef(null);

  const isLoggedIn = !!localStorage.getItem("token");

  const cartCount = cart.length;
  const isCheckoutRoute = routeLocation.pathname.startsWith("/checkout");
  const hideCartOnCurrentPage =
    routeLocation.pathname.startsWith("/services") ||
    isCheckoutRoute ||
    routeLocation.pathname.startsWith("/account");
  const showJoinAsPro = !isLoggedIn && !isCheckoutRoute;
  const displayLocation = location?.trim() ? location : "Select location";
  const isLocationPlaceholder = !location?.trim();

  useEffect(() => {
    if (!showLocationModal) {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = null;
      }
      searchRequestIdRef.current += 1;
      setGoogleSuggestions([]);
      return;
    }

    let cancelled = false;

    if (!GOOGLE_MAPS_API_KEY) {
      setGoogleReady(false);
      autocompleteServiceRef.current = null;
      geocoderRef.current = null;
      return () => {
        cancelled = true;
      };
    }

    loadGoogleMapsScript(GOOGLE_MAPS_API_KEY)
      .then(() => {
        if (cancelled) {
          return;
        }

        if (!window.google?.maps?.places || !window.google?.maps?.Geocoder) {
          throw new Error("Google Maps services are unavailable");
        }

        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        geocoderRef.current = new window.google.maps.Geocoder();
        setGoogleReady(true);
      })
      .catch((error) => {
        console.error("Google Maps load error:", error);
        if (cancelled) {
          return;
        }

        setGoogleReady(false);
        autocompleteServiceRef.current = null;
        geocoderRef.current = null;
      });

    return () => {
      cancelled = true;
    };
  }, [showLocationModal]);

  function handleLocationSelect(selectedLocation) {
    setLocation(selectedLocation);
    localStorage.setItem("selectedLocation", selectedLocation);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("hs99-location-selected", { detail: { location: selectedLocation } }));
    }
    if (!isServiceableLocation(selectedLocation)) {
      addToast(getServiceabilityMessage(selectedLocation), "warning", 6000);
    }
    setShowLocationModal(false);
    setLocationSearch("");
    setGoogleSuggestions([]);
    setGeoLoading(false);
    setGeoError("");
    setGeoSuccess(false);
  }

  async function fetchOsmSuggestions(value, requestId) {
    const data = await fetchJsonWithTimeout(
      `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&q=${encodeURIComponent(
        value
      )}`,
      9000
    );

    if (searchRequestIdRef.current !== requestId) {
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      setGoogleSuggestions([]);
      return;
    }

    setGoogleSuggestions(
      data.map((item) => {
        const address = item.address || {};
        const description =
          buildAddressFromParts([
            item.name,
            address.suburb,
            address.city_district,
            address.city,
            address.town,
            address.state,
            address.country,
          ]) ||
          item.display_name ||
          value;

        return {
          id: item.place_id || `${item.osm_type}-${item.osm_id}`,
          description,
          placeId: null,
        };
      })
    );
  }

  function scheduleOsmSuggestions(value) {
    const requestId = searchRequestIdRef.current + 1;
    searchRequestIdRef.current = requestId;
    searchDebounceRef.current = setTimeout(() => {
      fetchOsmSuggestions(value, requestId);
    }, 350);
  }

  function handleLocationSearchChange(value) {
    setLocationSearch(value);
    setGeoError("");
    setGeoSuccess(false);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }

    if (!value.trim()) {
      searchRequestIdRef.current += 1;
      setGoogleSuggestions([]);
      return;
    }

    if (googleReady && autocompleteServiceRef.current) {
      const requestId = searchRequestIdRef.current + 1;
      searchRequestIdRef.current = requestId;

      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: value,
          componentRestrictions: { country: "in" },
          types: ["geocode"],
        },
        (predictions, status) => {
          if (searchRequestIdRef.current !== requestId) {
            return;
          }

          const okStatus = window.google?.maps?.places?.PlacesServiceStatus?.OK || "OK";
          if (status === okStatus && Array.isArray(predictions) && predictions.length > 0) {
            setGoogleSuggestions(
              predictions.map((prediction) => ({
                id: prediction.place_id || prediction.description,
                description: prediction.description,
                placeId: prediction.place_id,
              }))
            );
            return;
          }

          fetchOsmSuggestions(value, requestId);
        }
      );
      return;
    }

    scheduleOsmSuggestions(value);
  }

  function handleGoogleSuggestionSelect(suggestion) {
    if (!suggestion) {
      return;
    }

    if (suggestion.placeId && geocoderRef.current) {
      geocoderRef.current.geocode({ placeId: suggestion.placeId }, (results, status) => {
        const okStatus = window.google?.maps?.GeocoderStatus?.OK || "OK";
        if (status === okStatus && Array.isArray(results) && results.length > 0) {
          handleLocationSelect(results[0].formatted_address);
          return;
        }
        handleLocationSelect(suggestion.description);
      });
      return;
    }

    handleLocationSelect(suggestion.description);
  }

  async function ensureGoogleServicesReady() {
    if (window.google?.maps?.Geocoder && geocoderRef.current) {
      return true;
    }

    if (!GOOGLE_MAPS_API_KEY) {
      return false;
    }

    try {
      await loadGoogleMapsScript(GOOGLE_MAPS_API_KEY);
      if (!window.google?.maps?.Geocoder) {
        return false;
      }

      if (!geocoderRef.current) {
        geocoderRef.current = new window.google.maps.Geocoder();
      }

      if (!autocompleteServiceRef.current && window.google?.maps?.places) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      }

      setGoogleReady(Boolean(window.google?.maps?.Geocoder && window.google?.maps?.places));
      return true;
    } catch (error) {
      console.error("Google Maps readiness error:", error);
      return false;
    }
  }

  function buildAddressFromParts(parts) {
    const normalized = parts
      .map((part) => (typeof part === "string" ? part.trim() : ""))
      .filter(Boolean);

    return [...new Set(normalized)].join(", ");
  }

  function extractGoogleComponent(components, type) {
    if (!Array.isArray(components)) {
      return "";
    }

    const match = components.find((component) => Array.isArray(component.types) && component.types.includes(type));
    return match?.long_name || "";
  }

  function pickBestGoogleResult(results) {
    if (!Array.isArray(results) || results.length === 0) {
      return null;
    }

    const preferredTypes = [
      "sublocality_level_1",
      "sublocality",
      "neighborhood",
      "premise",
      "route",
      "street_address",
      "locality",
      "postal_town",
      "administrative_area_level_2",
      "administrative_area_level_1",
    ];

    for (const type of preferredTypes) {
      const match = results.find((result) => Array.isArray(result.types) && result.types.includes(type));
      if (match) {
        return match;
      }
    }

    return results[0];
  }

  function formatGoogleAddress(result) {
    if (!result) {
      return "";
    }

    const components = result.address_components || [];
    const sublocality =
      extractGoogleComponent(components, "sublocality_level_1") ||
      extractGoogleComponent(components, "sublocality") ||
      extractGoogleComponent(components, "neighborhood");
    const locality =
      extractGoogleComponent(components, "locality") ||
      extractGoogleComponent(components, "postal_town") ||
      extractGoogleComponent(components, "administrative_area_level_2");
    const state = extractGoogleComponent(components, "administrative_area_level_1");
    const country = extractGoogleComponent(components, "country");

    return buildAddressFromParts([sublocality, locality, state, country]) || result.formatted_address || "";
  }

  function reverseGeocodeWithGoogleJs(latitude, longitude) {
    if (!geocoderRef.current) {
      return Promise.resolve("");
    }

    return new Promise((resolve, reject) => {
      geocoderRef.current.geocode(
        { location: { lat: latitude, lng: longitude } },
        (results, status) => {
          const okStatus = window.google?.maps?.GeocoderStatus?.OK || "OK";
          if (status === okStatus && Array.isArray(results) && results.length > 0) {
            const bestResult = pickBestGoogleResult(results);
            resolve(formatGoogleAddress(bestResult));
            return;
          }

          if (status === "ZERO_RESULTS") {
            resolve("");
            return;
          }

          reject(new Error(`Google JS reverse geocoding failed with status: ${status}`));
        }
      );
    });
  }

  async function fetchJsonWithTimeout(url, timeoutMs) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "Accept-Language": "en",
        },
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Reverse geocode fetch failed:", error);
      }
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async function reverseGeocodeWithGoogleHttp(latitude, longitude) {
    if (!GOOGLE_MAPS_API_KEY) {
      return "";
    }

    const data = await fetchJsonWithTimeout(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&language=en&key=${GOOGLE_MAPS_API_KEY}`,
      10000
    );

    if (!data || data.status !== "OK" || !Array.isArray(data.results) || data.results.length === 0) {
      return "";
    }

    const bestResult = pickBestGoogleResult(data.results);
    return formatGoogleAddress(bestResult);
  }

  async function reverseGeocodeWithBigDataCloud(latitude, longitude) {
    const data = await fetchJsonWithTimeout(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      9000
    );

    if (!data) {
      return "";
    }

    const locality =
      data.locality ||
      data.city ||
      data.principalSubdivision ||
      data.localityInfo?.administrative?.[0]?.name ||
      "";

    return buildAddressFromParts([locality, data.principalSubdivision, data.countryName]);
  }

  async function reverseGeocodeWithNominatim(latitude, longitude) {
    const data = await fetchJsonWithTimeout(
      `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&zoom=18&lat=${latitude}&lon=${longitude}`,
      12000
    );

    if (!data) {
      return "";
    }

    const address = data.address || {};
    const locality =
      address.suburb ||
      address.neighbourhood ||
      address.city_district ||
      address.city ||
      address.town ||
      address.village ||
      address.county ||
      "";

    return (
      buildAddressFromParts([locality, address.state, address.country]) ||
      (typeof data.display_name === "string" ? data.display_name : "")
    );
  }

  async function resolveAddressFromCoordinates(latitude, longitude) {
    const googleReadyNow = await ensureGoogleServicesReady();
    if (googleReadyNow) {
      try {
        const googleJsAddress = await reverseGeocodeWithGoogleJs(latitude, longitude);
        if (googleJsAddress) {
          return googleJsAddress;
        }
      } catch (error) {
        console.error("Google JS reverse geocode error:", error);
      }
    }

    const googleHttpAddress = await reverseGeocodeWithGoogleHttp(latitude, longitude);
    if (googleHttpAddress) {
      return googleHttpAddress;
    }

    const bigDataCloudAddress = await reverseGeocodeWithBigDataCloud(latitude, longitude);
    if (bigDataCloudAddress) {
      return bigDataCloudAddress;
    }

    const nominatimAddress = await reverseGeocodeWithNominatim(latitude, longitude);
    if (nominatimAddress) {
      return nominatimAddress;
    }

    return "";
  }

  async function resolveAndApplyLocation(latitude, longitude) {
    const address = await resolveAddressFromCoordinates(latitude, longitude);
    if (!address) {
      return false;
    }

    handleLocationSelect(address);
    setGeoLoading(false);
    setGeoSuccess(true);
    setTimeout(() => setGeoSuccess(false), 2000);
    return true;
  }

  async function getIpCoordinates() {
    const data = await fetchJsonWithTimeout("https://ipapi.co/json/", 7000);
    if (!data) {
      return null;
    }

    const latitude = Number(data.latitude);
    const longitude = Number(data.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    return { latitude, longitude };
  }

  function getGeoErrorMessage(error) {
    switch (error?.code) {
      case 1:
        return "Location permission denied. Turn on location access for better accuracy.";
      case 2:
        return "GPS location is unavailable. Showing approximate location instead.";
      case 3:
        return "Location request timed out. Showing approximate location instead.";
      default:
        return "Unable to get precise GPS location. Showing approximate location instead.";
    }
  }

  async function applyIpFallback(error) {
    try {
      const ipCoordinates = await getIpCoordinates();
      if (ipCoordinates) {
        const applied = await resolveAndApplyLocation(ipCoordinates.latitude, ipCoordinates.longitude);
        if (applied) {
          return true;
        }
      }
    } catch (fallbackError) {
      console.error("IP fallback location error:", fallbackError);
    }

    setGeoError(getGeoErrorMessage(error));
    setGeoLoading(false);
    return false;
  }

  async function getCurrentLocation() {
    setGeoLoading(true);
    setGeoError("");
    setGeoSuccess(false);

    if (!navigator.geolocation) {
      const fallbackApplied = await applyIpFallback();
      if (!fallbackApplied) {
        setGeoError("Geolocation is not supported by your browser.");
      }
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
        const applied = await resolveAndApplyLocation(latitude, longitude);

        if (applied) {
          return;
        }

        const ipFallbackApplied = await applyIpFallback();
        if (!ipFallbackApplied) {
          setGeoError("Unable to determine your location. Please search manually.");
          setGeoLoading(false);
        }
      },
      async (error) => {
        const ipFallbackApplied = await applyIpFallback(error);
        if (!ipFallbackApplied) {
          setGeoError(getGeoErrorMessage(error));
          setGeoLoading(false);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
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
          <span className={`location-text${isLocationPlaceholder ? " placeholder" : ""}`}>
            {displayLocation}
          </span>
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
        {showJoinAsPro && (
          <Link
            to="/vendor-signup"
            className="join-pro-btn"
            aria-label="Join as a professional"
          >
            Join as a pro
          </Link>
        )}

        {/* CART */}
        {!hideCartOnCurrentPage && (
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

            {googleSuggestions.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <p style={{
                  margin: "0 0 12px 0",
                  fontSize: "12px",
                  color: "#6b7280",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  Search results
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto" }}>
                  {googleSuggestions.map((prediction) => (
                    <button
                      key={prediction.id}
                      onClick={() => handleGoogleSuggestionSelect(prediction)}
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
                        e.target.style.background = "#eff6ff";
                        e.target.style.borderColor = "#2563eb";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "white";
                        e.target.style.borderColor = "#e5e7eb";
                      }}
                    >
                      <span style={{ marginRight: "8px" }}>{"\u{1F4CD}"}</span>
                      {prediction.description}
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
              {googleReady ? "powered by Google" : "\u{1F5FA}\uFE0F Location data powered by OpenStreetMap"}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
