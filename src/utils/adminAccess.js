export const ADMIN_PERMISSION_GROUPS = [
  {
    label: "Main",
    items: [
      { key: "dashboard", label: "Dashboard" },
      { key: "bookings", label: "Bookings" },
      { key: "payments", label: "Payments" },
      { key: "wallet", label: "Wallet" }
    ]
  },
  {
    label: "Management",
    items: [
      { key: "users", label: "Users" },
      { key: "vendors", label: "Vendors" },
      { key: "services", label: "Services" }
    ]
  },
  {
    label: "Platform",
    items: [
      { key: "coupons", label: "Coupons" },
      { key: "reviews", label: "Reviews" }
    ]
  },
  {
    label: "Content & Reports",
    items: [
      { key: "cms", label: "CMS" },
      { key: "homePage", label: "Home Page" },
      { key: "contacts", label: "Contacts" },
      { key: "reports", label: "Reports" },
      { key: "support", label: "Support" }
    ]
  },
  {
    label: "Settings",
    items: [
      { key: "notifications", label: "Notifications" },
      { key: "paymentMethods", label: "Payment Methods" },
      { key: "settings", label: "Settings" },
      { key: "diagnostics", label: "Diagnostics" }
    ]
  }
];

export const ADMIN_ROUTE_PERMISSIONS = [
  { path: "/admin/admins", permission: "adminTeam" },
  { path: "/admin/users", permission: "users" },
  { path: "/admin/vendors", permission: "vendors" },
  { path: "/admin/services", permission: "services" },
  { path: "/admin/bookings", permission: "bookings" },
  { path: "/admin/payments", permission: "payments" },
  { path: "/admin/wallet", permission: "wallet" },
  { path: "/admin/coupons", permission: "coupons" },
  { path: "/admin/reviews", permission: "reviews" },
  { path: "/admin/cms", permission: "cms" },
  { path: "/admin/home-page", permission: "homePage" },
  { path: "/admin/reports", permission: "reports" },
  { path: "/admin/payment-methods", permission: "paymentMethods" },
  { path: "/admin/settings", permission: "settings" },
  { path: "/admin/support", permission: "support" },
  { path: "/admin/notifications", permission: "notifications" },
  { path: "/admin/contacts", permission: "contacts" },
  { path: "/admin/diagnostics", permission: "diagnostics" },
  { path: "/admin", permission: "dashboard" }
];

function normalizePermissions(rawPermissions) {
  if (Array.isArray(rawPermissions)) {
    return rawPermissions
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }
  if (typeof rawPermissions === "string") {
    return rawPermissions
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  if (rawPermissions && typeof rawPermissions === "object") {
    return Object.entries(rawPermissions)
      .filter(([, value]) => Boolean(value))
      .map(([key]) => String(key).trim())
      .filter((item) => item.length > 0);
  }
  return [];
}

export function normalizeAdminPermissions(rawPermissions) {
  return normalizePermissions(rawPermissions);
}

export function normalizeAdminUser(rawAdmin) {
  if (!rawAdmin || typeof rawAdmin !== "object") {
    return {};
  }

  const permissions = normalizePermissions(rawAdmin.permissions);
  return { ...rawAdmin, permissions };
}

export function setAdminUser(rawAdmin) {
  if (typeof window === "undefined") {
    return {};
  }

  const normalized = normalizeAdminUser(rawAdmin);
  try {
    localStorage.setItem("adminUser", JSON.stringify(normalized));
  } catch {
    // Ignore storage errors
  }

  try {
    window.dispatchEvent(new CustomEvent("admin-user-updated", { detail: normalized }));
  } catch {
    // Ignore event errors
  }

  return normalized;
}

export function getAdminUser() {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const parsed = JSON.parse(localStorage.getItem("adminUser") || "{}");
    return normalizeAdminUser(parsed);
  } catch {
    return {};
  }
}

export function isSuperAdmin(adminUser) {
  return adminUser?.role === "admin";
}

export function getAdminPermissions(adminUser) {
  return normalizePermissions(adminUser?.permissions);
}

export function hasAdminPermission(adminUser, permission) {
  if (!permission) {
    return true;
  }
  if (isSuperAdmin(adminUser)) {
    return true;
  }
  return getAdminPermissions(adminUser).includes(permission);
}

export function getPermissionForPath(pathname) {
  if (!pathname) {
    return null;
  }
  const cleanPath = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  const sorted = [...ADMIN_ROUTE_PERMISSIONS].sort((a, b) => b.path.length - a.path.length);
  const match = sorted.find((entry) => cleanPath.startsWith(entry.path));
  return match?.permission || null;
}
