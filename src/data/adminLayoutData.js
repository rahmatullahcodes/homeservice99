export const NAV_SECTIONS = [
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
