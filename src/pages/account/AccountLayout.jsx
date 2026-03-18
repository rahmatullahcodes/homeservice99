import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { getStoredUser } from "../../utils/accountApi";
import "../../styles/account.css";

export default function AccountLayout() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("accountSidebarCollapsed") === "true");
  const [isMobile, setIsMobile] = useState(() => (typeof window !== "undefined" ? window.innerWidth <= 980 : false));
  const navRef = useRef(null);
  const navigate = useNavigate();

  const user = useMemo(() => getStoredUser(), []);

  useEffect(() => {
    try {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    } catch {
      // no-op
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem("accountSidebarCollapsed", collapsed ? "true" : "false");
    } catch {
      // no-op
    }
  }, [collapsed]);

  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth <= 980);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (isMobile && open) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isMobile, open]);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape" && isMobile && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobile, open]);

  useEffect(() => {
    if (open && isMobile) {
      setTimeout(() => {
        try {
          navRef.current?.querySelector("a,button")?.focus();
        } catch {
          // no-op
        }
      }, 0);
    }
  }, [open, isMobile]);

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    navigate("/login");
  }

  return (
    <div className="container account-layout">
      <div className="account-topbar">
        <button
          className="btn-ghost mobile-menu-btn"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-controls="account-sidebar"
          aria-label={open ? "Close account menu" : "Open account menu"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>My Account</h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            className="btn-ghost"
            onClick={() => navigate("/services")}
            title="Book a new service"
            aria-label="Book a new service"
          >
            Book Service
          </button>

          {!isMobile && (
            <button
              className="btn-ghost"
              onClick={() => setCollapsed((prev) => !prev)}
              aria-pressed={collapsed}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            </button>
          )}
        </div>
      </div>

      <div className={`account-overlay ${open ? "visible" : ""}`} onClick={() => setOpen(false)} aria-hidden={!open}></div>

      <aside
        id="account-sidebar"
        className={`account-sidebar ${open ? "open" : ""} ${collapsed && !isMobile ? "collapsed" : ""}`}
        aria-hidden={isMobile ? !open : false}
        aria-label="Account navigation"
      >
        <div className="account-sidebar-inner">
          <div className="account-sidebar-header" style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="logo-circle">HS</div>
              {!collapsed && (
                <div>
                  <strong>{user?.name || "HomeService99"}</strong>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{user?.email || "Member"}</div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                className="btn-ghost collapse-toggle"
                onClick={() => setCollapsed((prev) => !prev)}
                aria-pressed={collapsed}
                title={collapsed ? "Expand" : "Collapse"}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? ">" : "="}
              </button>
            </div>
          </div>

          <nav ref={navRef} className="account-nav" role="navigation" aria-label="Account navigation">
            <NavLink to="/account/dashboard" title="Dashboard" className={({ isActive }) => (isActive ? "active" : "") }>
              <span className="nav-ico">DB</span> <span className="label">Dashboard</span>
            </NavLink>

            <NavLink to="/account/bookings" title="Bookings" className={({ isActive }) => (isActive ? "active" : "") }>
              <span className="nav-ico">BK</span> <span className="label">My Bookings</span>
            </NavLink>

            <NavLink to="/services" title="Book New Service" className={({ isActive }) => (isActive ? "active" : "") }>
              <span className="nav-ico">NS</span> <span className="label">Book Service</span>
            </NavLink>

            <NavLink to="/account/reviews" title="Reviews" className={({ isActive }) => (isActive ? "active" : "") }>
              <span className="nav-ico">RV</span> <span className="label">Reviews</span>
            </NavLink>

            <NavLink to="/account/payments" title="Payment Methods" className={({ isActive }) => (isActive ? "active" : "") }>
              <span className="nav-ico">PM</span> <span className="label">Payment Methods</span>
            </NavLink>

            <NavLink to="/account/wallet" title="Wallet" className={({ isActive }) => (isActive ? "active" : "") }>
              <span className="nav-ico">WL</span> <span className="label">Wallet</span>
            </NavLink>

            <NavLink to="/account/referral" title="Referral" className={({ isActive }) => (isActive ? "active" : "") }>
              <span className="nav-ico">RF</span> <span className="label">Referral</span>
            </NavLink>

            <NavLink to="/account/coupons" title="Coupons" className={({ isActive }) => (isActive ? "active" : "") }>
              <span className="nav-ico">CP</span> <span className="label">Coupons</span>
            </NavLink>

            <NavLink to="/account/addresses" title="Addresses" className={({ isActive }) => (isActive ? "active" : "") }>
              <span className="nav-ico">AD</span> <span className="label">Addresses</span>
            </NavLink>

            <NavLink to="/account/settings" title="Settings" className={({ isActive }) => (isActive ? "active" : "") }>
              <span className="nav-ico">ST</span> <span className="label">Settings</span>
            </NavLink>

            <button className="btn-outline logout" onClick={logout} title="Logout">
              <span className="nav-ico">LO</span><span className="label">Logout</span>
            </button>

            <button className="btn-outline" onClick={toggleTheme} style={{ marginTop: 8 }}>
              <span className="label">Theme: {theme}</span>
            </button>
          </nav>
        </div>
      </aside>

      <section className="account-content">
        <Outlet />
      </section>
    </div>
  );
}
