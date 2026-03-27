import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { API_ENDPOINTS } from "../../config/api";
import {
  getAdminUser,
  getPermissionForPath,
  hasAdminPermission,
  normalizeAdminUser,
  setAdminUser
} from "../../utils/adminAccess";
import "../../styles/admin.css";

const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      { to: "/admin", label: "Dashboard", end: true, icon: "grid", permission: "dashboard" },
      { to: "/admin/bookings", label: "Bookings", icon: "calendar", permission: "bookings" },
      { to: "/admin/payments", label: "Payments", icon: "card", permission: "payments" }
    ]
  },
  {
    label: "Management",
    items: [
      { to: "/admin/users", label: "Users", icon: "users", permission: "users" },
      { to: "/admin/vendors", label: "Vendors", icon: "shield", permission: "vendors" },
      { to: "/admin/services", label: "Services", icon: "service", permission: "services" }
    ]
  },
  {
    label: "Platform",
    items: [
      { to: "/admin/coupons", label: "Coupons", icon: "list", permission: "coupons" },
      { to: "/admin/reviews", label: "Reviews", icon: "star", permission: "reviews" },
      { to: "/admin/wallet", label: "Wallet", icon: "wallet", permission: "wallet" }
    ]
  },
  {
    label: "Content & Reports",
    items: [
      { to: "/admin/cms", label: "CMS", icon: "gear", permission: "cms" },
      { to: "/admin/home-page", label: "Home Page", icon: "grid", permission: "homePage" },
      { to: "/admin/contacts", label: "Contacts", icon: "message", permission: "contacts" },
      { to: "/admin/reports", label: "Reports", icon: "chart", permission: "reports" },
      { to: "/admin/support", label: "Support", icon: "message", permission: "support" }
    ]
  },
  {
    label: "Settings",
    items: [
      { to: "/admin/notifications", label: "Notifications", icon: "bell", permission: "notifications" },
      { to: "/admin/payment-methods", label: "Payment Methods", icon: "card", permission: "paymentMethods" },
      { to: "/admin/settings", label: "Settings", icon: "settings", permission: "settings" },
      { to: "/admin/diagnostics", label: "Diagnostics", icon: "pulse", permission: "diagnostics" },
      { to: "/admin/admins", label: "Sub Admins", icon: "shield", permission: "adminTeam" }
    ]
  }
];

function renderIcon(type) {
  if (type === "grid") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 12h8V3H3v9zm10 0h8V3h-8v9zm-10 10h8v-8H3v8zm10 0h8v-8h-8v8z" fill="currentColor" />
      </svg>
    );
  }

  if (type === "calendar") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M16 2v4M8 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "card") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M2 8h20" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }

  if (type === "users") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 3v6m-3-3h6M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "shield") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "service") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2l9 5v6c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V7l9-5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "list") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 6h16M4 10h16M4 14h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "star") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" fill="currentColor" />
      </svg>
    );
  }

  if (type === "wallet") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm-2 14H3V6h16v12Z" fill="currentColor" />
      </svg>
    );
  }

  if (type === "gear") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 0 .948-.684l1.498-4.493a1 1 0 0 1 1.502 0l1.498 4.493A1 1 0 0 0 16.72 3H19a2 2 0 0 1 2 2v1a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2v1a2 2 0 0 1-2 2h-2.28a1 1 0 0 0-.948.684l-1.498 4.493a1 1 0 0 1-1.502 0l-1.498-4.493A1 1 0 0 0 9.28 17H5a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2V7a2 2 0 0 0 2-2V5Z" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }

  if (type === "chart") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M18 5l-5 5-4-4-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "message") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "bell") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "settings") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M12 1v6m8 5h-6m-4 8v-6M1 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 12h18M12 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("adminSidebarCollapsed") === "true";
    } catch {
      return false;
    }
  });
  const [stats, setStats] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [moduleQuery, setModuleQuery] = useState("");

  const [adminSnapshot, setAdminSnapshot] = useState(() => getAdminUser());
  const [permissionsReady, setPermissionsReady] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const adminUser = adminSnapshot || {};
  const canViewDashboard = hasAdminPermission(adminUser, "dashboard");
  const requiredPermission = getPermissionForPath(location.pathname);
  const canAccessRoute = hasAdminPermission(adminUser, requiredPermission);

  const syncAdminProfile = useCallback(async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setAdminSnapshot(getAdminUser());
      setPermissionsReady(true);
      return;
    }

    try {
      setSyncMessage("");
      const response = await fetch(API_ENDPOINTS.ADMIN.ME, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
          setAdminSnapshot(null);
          setPermissionsReady(true);
          return;
        }

        setSyncMessage(`Permissions sync failed (${response.status})`);
        // Fallback to cached permissions if backend is outdated / unavailable.
        setAdminSnapshot(getAdminUser());
        setPermissionsReady(true);
        return;
      }

      const payload = await response.json().catch(() => ({}));
      if (payload && Object.keys(payload).length > 0) {
        const normalized = setAdminUser(payload);
        setAdminSnapshot(normalized);
      } else {
        setAdminSnapshot(getAdminUser());
      }
      setPermissionsReady(true);
    } catch (error) {
      console.error("Admin profile sync error:", error);
      setSyncMessage("Permissions sync failed");
      setAdminSnapshot(getAdminUser());
      setPermissionsReady(true);
    }
  }, []);

  useEffect(() => {
    let isActive = true;
    syncAdminProfile();
    const intervalId = setInterval(() => {
      if (isActive) {
        syncAdminProfile();
      }
    }, 30000);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [syncAdminProfile]);

  useEffect(() => {
    syncAdminProfile();
  }, [location.pathname, syncAdminProfile]);

  useEffect(() => {
    function handleFocus() {
      syncAdminProfile();
    }

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [syncAdminProfile]);

  useEffect(() => {
    function handleAdminUserUpdated(event) {
      if (event?.detail) {
        setAdminSnapshot(normalizeAdminUser(event.detail));
      }
    }

    window.addEventListener("admin-user-updated", handleAdminUserUpdated);
    return () => {
      window.removeEventListener("admin-user-updated", handleAdminUserUpdated);
    };
  }, []);

  useEffect(() => {
    if (canViewDashboard) {
      fetchDashboardStats();
    }
  }, [canViewDashboard]);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("adminSidebarCollapsed", sidebarCollapsed ? "true" : "false");
    } catch {
      // Ignore storage errors
    }
  }, [sidebarCollapsed]);

  useEffect(() => {
    function onWindowClick(event) {
      if (!dropdownRef.current) {
        return;
      }
      if (!dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }

    function onEscape(event) {
      if (event.key === "Escape") {
        setUserDropdownOpen(false);
      }
    }

    window.addEventListener("click", onWindowClick);
    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("click", onWindowClick);
      window.removeEventListener("keydown", onEscape);
    };
  }, []);

  async function fetchDashboardStats() {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        return;
      }

      const response = await fetch(API_ENDPOINTS.ADMIN.GET_DASHBOARD, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json().catch(() => ({}));
      setStats(data);
    } catch (error) {
      console.error("Dashboard stats error:", error);
    }
  }

  function logout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin-login");
  }

  function closeSidebarIfMobile() {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }

  const allowedNavSections = useMemo(() => {
    return NAV_SECTIONS
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => hasAdminPermission(adminUser, item.permission))
      }))
      .filter((section) => section.items.length > 0);
  }, [adminUser]);

  const filteredNavSections = useMemo(() => {
    const searchTerm = moduleQuery.trim().toLowerCase();
    if (!searchTerm) {
      return allowedNavSections;
    }

    return allowedNavSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => item.label.toLowerCase().includes(searchTerm))
      }))
      .filter((section) => section.items.length > 0);
  }, [moduleQuery, allowedNavSections]);

  const isSidebarCollapsed = sidebarCollapsed && !isMobile;
  const hasFilteredResults = filteredNavSections.some((section) => section.items.length > 0);
  const firstAllowedRoute = allowedNavSections[0]?.items?.[0]?.to || "/admin";

  useEffect(() => {
    if (
      !canAccessRoute &&
      firstAllowedRoute &&
      (location.pathname === "/admin" || location.pathname === "/admin/dashboard")
    ) {
      navigate(firstAllowedRoute, { replace: true });
    }
  }, [canAccessRoute, firstAllowedRoute, location.pathname, navigate]);

  return (
    <div className="admin-layout">
      <header className="admin-topbar">
        <div className="topbar-left">
          <button
            className="admin-hamburger"
            onClick={() => {
              if (isMobile) {
                setSidebarOpen((prev) => !prev);
                return;
              }
              setSidebarCollapsed((prev) => !prev);
            }}
            aria-label={isMobile ? "Toggle menu" : isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={isMobile ? sidebarOpen : !isSidebarCollapsed}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="admin-top-title">
            <h1>Admin Dashboard</h1>
            <span className="breadcrumb-separator">|</span>
            <span className="admin-status">
              Platform Status:
              <span className="status-online">
                <span className="status-dot" />
                Online
              </span>
            </span>
          </div>
        </div>

        <div className="topbar-right">
          {canViewDashboard && (
            <div className="topbar-stats">
              <div className="stat-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="stat-content">
                  <span className="stat-label">Users</span>
                  <span className="stat-value">{stats?.totalUsers?.toLocaleString() || 0}</span>
                </div>
              </div>

              <div className="stat-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="stat-content">
                  <span className="stat-label">Vendors</span>
                  <span className="stat-value">{stats?.totalVendors?.toLocaleString() || 0}</span>
                </div>
              </div>

              <div className="stat-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H4a4 4 0 0 0-4 4v2M10 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM18 9h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="stat-content">
                  <span className="stat-label">Bookings</span>
                  <span className="stat-value">{stats?.totalBookings?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>
          )}

          <div className="topbar-profile" ref={dropdownRef}>
            <button
              className="profile-button"
              onClick={() => setUserDropdownOpen((prev) => !prev)}
              title={adminUser.email}
            >
              <div className="profile-avatar">
                {adminUser.email ? adminUser.email.charAt(0).toUpperCase() : "A"}
              </div>
              <span className="profile-name">{adminUser.email?.split("@")[0] || "Admin"}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {userDropdownOpen && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    {adminUser.email ? adminUser.email.charAt(0).toUpperCase() : "A"}
                  </div>
                  <div>
                    <p className="dropdown-name">{adminUser.email?.split("@")[0] || "Admin"}</p>
                    <p className="dropdown-email">{adminUser.email || "admin@homeservice99.com"}</p>
                  </div>
                </div>

                <div className="dropdown-divider" />

                {hasAdminPermission(adminUser, "settings") && (
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigate("/admin/settings");
                    }}
                  >
                    {renderIcon("settings")}
                    Settings
                  </button>
                )}

                {hasAdminPermission(adminUser, "dashboard") && (
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigate("/admin");
                    }}
                  >
                    {renderIcon("grid")}
                    Dashboard
                  </button>
                )}

                <div className="dropdown-divider" />

                <button
                  className="dropdown-item logout-item"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout();
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M19 12H5m7-7l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""} ${isSidebarCollapsed ? "collapsed" : ""}`}>
        <div className="admin-sidebar-inner">
          <div className="admin-brand">
            <div className="brand-icon">HS</div>
            <div className="brand-text">
              <strong>HomeService99</strong>
              <span>Admin Portal</span>
            </div>
          </div>

          <div className="admin-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              placeholder="Search modules..."
              value={moduleQuery}
              onChange={(event) => setModuleQuery(event.target.value)}
            />
          </div>

          <nav className="admin-nav">
            {!permissionsReady ? (
              <p className="admin-nav-empty">Loading permissions...</p>
            ) : !hasFilteredResults ? (
              <p className="admin-nav-empty">No module found for "{moduleQuery.trim()}"</p>
            ) : (
              filteredNavSections.map((section) => (
                <div className="nav-section" key={section.label}>
                  <label className="nav-label">{section.label}</label>
                  {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={Boolean(item.end)}
                      onClick={closeSidebarIfMobile}
                    >
                      {renderIcon(item.icon)}
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              ))
            )}
          </nav>
        </div>

        <div className="admin-sidebar-foot">
          <button className="btn-logout-sidebar" onClick={logout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5m7-7l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {isMobile && sidebarOpen && (
        <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <main className={`admin-main ${isSidebarCollapsed ? "collapsed" : ""}`}>
        {!permissionsReady ? (
          <div className="admin-page">
            <div className="admin-page-head">
              <h2>Loading permissions...</h2>
              <p className="admin-subtitle">Syncing your access rights.</p>
            </div>
          </div>
        ) : canAccessRoute ? (
          <Outlet />
        ) : (
          <div className="admin-page">
            <div className="admin-page-head">
              <h2>Access Denied</h2>
              <p className="admin-subtitle">You do not have permission to view this module.</p>
            </div>
            <div className="admin-section">
              <p style={{ color: "var(--admin-muted)", marginBottom: "8px" }}>
                Required permission: <strong>{requiredPermission || "None"}</strong>
              </p>
              <p style={{ color: "var(--admin-muted)", marginBottom: "16px" }}>
                Your permissions: {(adminUser?.permissions || []).length ? adminUser.permissions.join(", ") : "None"}
              </p>
              {syncMessage && (
                <p style={{ color: "#b45309", marginBottom: "16px" }}>
                  {syncMessage}. Please refresh permissions.
                </p>
              )}
              <p style={{ color: "var(--admin-muted)", marginBottom: "16px" }}>
                Please contact the super admin to request access.
              </p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button className="btn-sm" onClick={() => navigate(firstAllowedRoute)}>
                  Go to allowed module
                </button>
                <button className="btn-sm outline" onClick={syncAdminProfile}>
                  Refresh permissions
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
