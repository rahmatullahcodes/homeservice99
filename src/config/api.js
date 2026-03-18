// Frontend API Configuration
const LOCAL_API_BASE_URL = "http://localhost:5000/api";
const DEFAULT_PROD_API_BASE_URL = "/api";
const envApiUrl = String(import.meta.env.VITE_API_URL || "").trim();
const envLocalApiUrl = String(import.meta.env.VITE_API_URL_LOCAL || "").trim();

function isLocalHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

const browserHostname = typeof window !== "undefined" ? window.location.hostname : "";
const useLocalApi = isLocalHost(browserHostname);

const browserOrigin = typeof window !== "undefined" ? window.location.origin : "";
const prodFallbackApiUrl = browserOrigin
  ? `${browserOrigin}/api`
  : DEFAULT_PROD_API_BASE_URL;

const API_BASE_URL = useLocalApi
  ? (envLocalApiUrl || LOCAL_API_BASE_URL)
  : (envApiUrl || prodFallbackApiUrl);

export const API_ENDPOINTS = {
  // User Authentication
  AUTH: {
    SIGNUP: `${API_BASE_URL}/auth/user/signup`,
    LOGIN: `${API_BASE_URL}/auth/user/login`,
  },
  
  // Vendor Authentication
  VENDOR_AUTH: {
    SIGNUP: `${API_BASE_URL}/auth/vendor/signup`,
    LOGIN: `${API_BASE_URL}/auth/vendor/login`,
  },
  
  // Admin Authentication
  ADMIN_AUTH: {
    LOGIN: `${API_BASE_URL}/auth/admin/login`,
  },
  
  // User Profile
  USER: {
    ME: `${API_BASE_URL}/user/me`,
    DASHBOARD: `${API_BASE_URL}/user/dashboard`,
    PROFILE: `${API_BASE_URL}/user/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/user/profile`,
    UPDATE_PASSWORD: `${API_BASE_URL}/user/password`,
    DELETE_ACCOUNT: `${API_BASE_URL}/user/account`,
    BOOKINGS: `${API_BASE_URL}/user/bookings`,
    CANCEL_BOOKING: (bookingId) => `${API_BASE_URL}/user/bookings/${bookingId}/cancel`,
    BOOKING_INVOICE: (bookingId) => `${API_BASE_URL}/user/bookings/${bookingId}/invoice`,
    ADDRESSES: `${API_BASE_URL}/user/addresses`,
    ADDRESS_BY_ID: (addressId) => `${API_BASE_URL}/user/addresses/${addressId}`,
    ADDRESS_SET_DEFAULT: (addressId) => `${API_BASE_URL}/user/addresses/${addressId}/default`,
    PAYMENT_METHODS: `${API_BASE_URL}/user/payment-methods`,
    PAYMENT_METHOD_SET_DEFAULT: (methodId) => `${API_BASE_URL}/user/payment-methods/${methodId}/default`,
    PAYMENT_METHOD_BY_ID: (methodId) => `${API_BASE_URL}/user/payment-methods/${methodId}`,
    WALLET: `${API_BASE_URL}/user/wallet`,
    WALLET_TOPUP: `${API_BASE_URL}/user/wallet/topup`,
    WALLET_TOPUP_ORDER: `${API_BASE_URL}/user/wallet/topup/order`,
    WALLET_TOPUP_VERIFY: `${API_BASE_URL}/user/wallet/topup/verify`,
    COUPONS: `${API_BASE_URL}/user/coupons`,
    REVIEWS: `${API_BASE_URL}/user/reviews`,
    REVIEWABLE_BOOKINGS: `${API_BASE_URL}/user/reviews/reviewable-bookings`,
    REFERRAL: `${API_BASE_URL}/user/referral`,
  },
  
  // Services
  SERVICES: {
    GET_ALL: `${API_BASE_URL}/services`,
    GET_BY_ID: (id) => `${API_BASE_URL}/services/${id}`,
    GET_BY_CATEGORY: (category) => `${API_BASE_URL}/services/category/${category}`,
  },
  
  // Bookings
  BOOKINGS: {
    CREATE: `${API_BASE_URL}/bookings`,
    CREATE_PAYMENT_ORDER: `${API_BASE_URL}/bookings/payment/order`,
    VERIFY_PAYMENT: `${API_BASE_URL}/bookings/payment/verify`,
    GET_MY_BOOKINGS: `${API_BASE_URL}/bookings/my-bookings`,
    GET_BY_ID: (id) => `${API_BASE_URL}/bookings/${id}`,
    CANCEL: (id) => `${API_BASE_URL}/bookings/${id}/cancel`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/bookings/${id}/status`,
  },
  
  // Vendor Services & Profile
  VENDOR: {
    ME: `${API_BASE_URL}/vendor/me`,
    GET_SERVICES: `${API_BASE_URL}/vendor/services`,
    CREATE_SERVICE: `${API_BASE_URL}/vendor/services`,
    UPDATE_SERVICE: (id) => `${API_BASE_URL}/vendor/services/${id}`,
    DELETE_SERVICE: (id) => `${API_BASE_URL}/vendor/services/${id}`,
    GET_PROFILE: `${API_BASE_URL}/auth/vendor/profile`,
    UPDATE: `${API_BASE_URL}/auth/vendor/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/auth/vendor/profile`,
    VERIFY: `${API_BASE_URL}/auth/vendor/verify`,
    // Dashboard endpoints
    DASHBOARD_STATS: `${API_BASE_URL}/vendor/dashboard/stats`,
    GET_BOOKINGS: `${API_BASE_URL}/vendor/bookings`,
    GET_ALL_BOOKINGS: `${API_BASE_URL}/vendor/bookings/list`,
    UPDATE_BOOKING_STATUS: (id) => `${API_BASE_URL}/vendor/bookings/${id}/status`,
    GET_ACTIVITY: `${API_BASE_URL}/vendor/activity`,
    // Wallet and Transaction endpoints
    GET_WALLET_BALANCE: `${API_BASE_URL}/vendor/wallet/balance`,
    GET_TRANSACTIONS: `${API_BASE_URL}/vendor/transactions`,
    GET_TRANSACTION: (id) => `${API_BASE_URL}/vendor/transactions/${id}`,
    GET_EARNINGS_REPORT: `${API_BASE_URL}/vendor/earnings`,
    REQUEST_TOPUP: `${API_BASE_URL}/vendor/wallet/topup`,
    REQUEST_WITHDRAWAL: `${API_BASE_URL}/vendor/wallet/withdraw`,
    GET_REVIEWS: `${API_BASE_URL}/vendor/reviews`,
    REPLY_REVIEW: (id) => `${API_BASE_URL}/vendor/reviews/${id}/reply`,
  },
  
  // Admin
  ADMIN: {
    GET_DASHBOARD: `${API_BASE_URL}/admin/dashboard`,
    GET_USERS: `${API_BASE_URL}/admin/users`,
    GET_VENDORS: `${API_BASE_URL}/admin/vendors`,
    CREATE_VENDOR: `${API_BASE_URL}/admin/vendors`,
    UPDATE_VENDOR_STATUS: (id) => `${API_BASE_URL}/admin/vendors/${id}/status`,
    DELETE_VENDOR: (id) => `${API_BASE_URL}/admin/vendors/${id}`,
    GET_BOOKINGS: `${API_BASE_URL}/admin/bookings`,
    GET_PAYMENTS: `${API_BASE_URL}/admin/payments`,
    GET_SERVICES: `${API_BASE_URL}/admin/services`,
    CREATE_SERVICE: `${API_BASE_URL}/admin/services`,
    UPDATE_SERVICE: (id) => `${API_BASE_URL}/admin/services/${id}`,
    TOGGLE_SERVICE: (id) => `${API_BASE_URL}/admin/services/${id}/toggle`,
    DELETE_SERVICE: (id) => `${API_BASE_URL}/admin/services/${id}`,
    GET_SERVICE_TAXONOMY: `${API_BASE_URL}/admin/services/taxonomy`,
    RENAME_SERVICE_CATEGORY: `${API_BASE_URL}/admin/services/category/rename`,
    TOGGLE_SERVICE_CATEGORY_STATUS: `${API_BASE_URL}/admin/services/category/status`,
    RENAME_SERVICE_SUBCATEGORY: `${API_BASE_URL}/admin/services/subcategory/rename`,
    TOGGLE_SERVICE_SUBCATEGORY_STATUS: `${API_BASE_URL}/admin/services/subcategory/status`,
    GET_COUPONS: `${API_BASE_URL}/admin/coupons`,
    CREATE_COUPON: `${API_BASE_URL}/admin/coupons`,
    UPDATE_COUPON: (id) => `${API_BASE_URL}/admin/coupons/${id}`,
    DELETE_COUPON: (id) => `${API_BASE_URL}/admin/coupons/${id}`,
    TOGGLE_COUPON: (id) => `${API_BASE_URL}/admin/coupons/${id}/toggle`,
    VALIDATE_COUPON: `${API_BASE_URL}/admin/validate-coupon`,
    GET_REVIEWS: `${API_BASE_URL}/admin/reviews`,
    GET_REVIEW_STATS: `${API_BASE_URL}/admin/reviews/stats`,
    CREATE_REVIEW: `${API_BASE_URL}/admin/reviews`,
    UPDATE_REVIEW_STATUS: (id) => `${API_BASE_URL}/admin/reviews/${id}/status`,
    DELETE_REVIEW: (id) => `${API_BASE_URL}/admin/reviews/${id}`,
    GET_VENDOR_REVIEWS: (vendorId) => `${API_BASE_URL}/admin/reviews/vendor/${vendorId}`,
    GET_USER_REVIEWS: (userId) => `${API_BASE_URL}/admin/reviews/user/${userId}`,
    UPDATE_USER: (id) => `${API_BASE_URL}/admin/users/${id}`,
    ADJUST_USER_WALLET: (id) => `${API_BASE_URL}/admin/users/${id}/wallet-adjust`,
    DELETE_USER: (id) => `${API_BASE_URL}/admin/users/${id}`,
    UPDATE_BOOKING_STATUS: (id) => `${API_BASE_URL}/admin/bookings/${id}/status`,
    UPDATE_PAYMENT_STATUS: (id) => `${API_BASE_URL}/admin/payments/${id}/status`,
    MANUAL_VENDOR_PAYMENT: `${API_BASE_URL}/admin/payments/manual-credit`,
  },

  // Reports & Analytics
  REPORTS: {
    DASHBOARD_STATS: `${API_BASE_URL}/reports/dashboard-stats`,
    SERVICE_PERFORMANCE: `${API_BASE_URL}/reports/service-performance`,
    TOP_VENDORS: `${API_BASE_URL}/reports/top-vendors`,
    CATEGORY_PERFORMANCE: `${API_BASE_URL}/reports/category-performance`,
    REVENUE_TREND: `${API_BASE_URL}/reports/revenue-trend`,
    BOOKING_TREND: `${API_BASE_URL}/reports/booking-trend`,
    USER_ANALYTICS: `${API_BASE_URL}/reports/user-analytics`,
    BOOKING_STATUS: `${API_BASE_URL}/reports/booking-status`,
    COMPLETE_REPORT: `${API_BASE_URL}/reports/complete-report`,
  },

  // Support & Tickets
  SUPPORT: {
    GET_TICKETS: `${API_BASE_URL}/admin/support-tickets`,
    GET_TICKET: (id) => `${API_BASE_URL}/admin/support-tickets/${id}`,
    CREATE_TICKET: `${API_BASE_URL}/admin/support-tickets`,
    UPDATE_TICKET: (id) => `${API_BASE_URL}/admin/support-tickets/${id}`,
    UPDATE_TICKET_STATUS: (id) => `${API_BASE_URL}/admin/support-tickets/${id}/status`,
    DELETE_TICKET: (id) => `${API_BASE_URL}/admin/support-tickets/${id}`,
    GET_TICKET_STATS: `${API_BASE_URL}/admin/support-tickets/stats`,
  },

  // Notifications
  NOTIFICATIONS: {
    GET_ALL: `${API_BASE_URL}/admin/notifications`,
    GET_PUBLIC_POPUP: `${API_BASE_URL}/public/broadcast-popup`,
    CREATE: `${API_BASE_URL}/admin/notifications`,
    GET_BY_ID: (id) => `${API_BASE_URL}/admin/notifications/${id}`,
    UPDATE: (id) => `${API_BASE_URL}/admin/notifications/${id}`,
    DELETE: (id) => `${API_BASE_URL}/admin/notifications/${id}`,
    SEND: (id) => `${API_BASE_URL}/admin/notifications/${id}/send`,
    GET_STATS: `${API_BASE_URL}/admin/notifications/stats`,
  },

  // Settings
  SETTINGS: {
    GET_ALL: `${API_BASE_URL}/admin/settings`,
    UPDATE: `${API_BASE_URL}/admin/settings`,
    GET_STATS: `${API_BASE_URL}/admin/settings/stats`,
    RESET: `${API_BASE_URL}/admin/settings/reset`,
  },

  // Home page settings
  HOME_PAGE: {
    GET_PUBLIC: `${API_BASE_URL}/settings/homepage`,
    ADMIN_GET: `${API_BASE_URL}/admin/settings/homepage`,
    ADMIN_UPDATE: `${API_BASE_URL}/admin/settings/homepage`,
    ADMIN_GET_FALLBACK: `${API_BASE_URL}/admin/homepage`,
    ADMIN_UPDATE_FALLBACK: `${API_BASE_URL}/admin/homepage`,
  },

  // Payment gateway settings
  PAYMENT_GATEWAYS: {
    GET_PUBLIC: `${API_BASE_URL}/settings/payment-methods`,
    ADMIN_GET: `${API_BASE_URL}/admin/settings/payment-methods`,
    ADMIN_UPDATE: `${API_BASE_URL}/admin/settings/payment-methods`,
    ADMIN_GET_FALLBACK: `${API_BASE_URL}/admin/payment-methods`,
    ADMIN_UPDATE_FALLBACK: `${API_BASE_URL}/admin/payment-methods`,
  },

  // CMS
  CMS: {
    // Banners
    GET_BANNERS: `${API_BASE_URL}/cms/banners`,
    GET_BANNERS_PUBLIC: `${API_BASE_URL}/cms/banners/public/active`,
    GET_BANNER: (id) => `${API_BASE_URL}/cms/banners/${id}`,
    CREATE_BANNER: `${API_BASE_URL}/cms/banners`,
    UPDATE_BANNER: (id) => `${API_BASE_URL}/cms/banners/${id}`,
    TOGGLE_BANNER: (id) => `${API_BASE_URL}/cms/banners/${id}/toggle`,
    DELETE_BANNER: (id) => `${API_BASE_URL}/cms/banners/${id}`,
    
    // Blogs
    GET_BLOGS: `${API_BASE_URL}/cms/blogs`,
    GET_BLOGS_PUBLIC: `${API_BASE_URL}/cms/blogs/public/published`,
    GET_BLOG: (id) => `${API_BASE_URL}/cms/blogs/${id}`,
    GET_BLOG_BY_SLUG: (slug) => `${API_BASE_URL}/cms/blogs/public/slug/${slug}`,
    CREATE_BLOG: `${API_BASE_URL}/cms/blogs`,
    UPDATE_BLOG: (id) => `${API_BASE_URL}/cms/blogs/${id}`,
    PUBLISH_BLOG: (id) => `${API_BASE_URL}/cms/blogs/${id}/publish`,
    DELETE_BLOG: (id) => `${API_BASE_URL}/cms/blogs/${id}`,
    
    // Pages
    GET_PAGES: `${API_BASE_URL}/cms/pages`,
    GET_PAGE: (id) => `${API_BASE_URL}/cms/pages/${id}`,
    GET_PAGE_BY_SLUG: (slug) => `${API_BASE_URL}/cms/pages/public/slug/${slug}`,
    CREATE_PAGE: `${API_BASE_URL}/cms/pages`,
    UPDATE_PAGE: (id) => `${API_BASE_URL}/cms/pages/${id}`,
    DELETE_PAGE: (id) => `${API_BASE_URL}/cms/pages/${id}`,
    
    // Stats
    GET_STATS: `${API_BASE_URL}/cms/stats`,
  },

  // Contact Form
  CONTACT: {
    SUBMIT: `${API_BASE_URL}/contact/submit`,
    GET_ALL: `${API_BASE_URL}/contact`,
    GET_BY_ID: (id) => `${API_BASE_URL}/contact/${id}`,
    GET_MY_CONTACTS: `${API_BASE_URL}/contact/my-contacts`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/contact/${id}/status`,
    DELETE: (id) => `${API_BASE_URL}/contact/${id}`,
    GET_STATS: `${API_BASE_URL}/contact/stats`,
  },
};

export default API_BASE_URL;
