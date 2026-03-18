import { API_ENDPOINTS } from "../config/api";

function getToken() {
  return localStorage.getItem("token");
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (!user) return;
  localStorage.setItem("user", JSON.stringify(user));
}

async function request(url, options = {}) {
  const token = getToken();
  if (!token) {
    throw new Error("Please login first");
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`
      }
    });
  } catch {
    const localHint = typeof window !== "undefined" && (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    );
    const hint = localHint
      ? "Unable to connect API. Start backend on http://localhost:5000 and keep it running."
      : "Unable to connect API endpoint.";
    throw new Error(hint);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}

export function fetchUserMe() {
  return request(API_ENDPOINTS.USER.ME);
}

export function fetchUserDashboard() {
  return request(API_ENDPOINTS.USER.DASHBOARD);
}

export function fetchUserBookings(status = "All") {
  const url = new URL(API_ENDPOINTS.USER.BOOKINGS);
  if (status && status !== "All") {
    url.searchParams.set("status", status);
  }
  return request(url.toString());
}

export function cancelUserBooking(bookingId) {
  return request(API_ENDPOINTS.USER.CANCEL_BOOKING(bookingId), {
    method: "PATCH"
  });
}

export function fetchBookingInvoice(bookingId) {
  return request(API_ENDPOINTS.USER.BOOKING_INVOICE(bookingId));
}

export function updateUserProfile(payload) {
  return request(API_ENDPOINTS.USER.UPDATE_PROFILE, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function updateUserPassword(payload) {
  return request(API_ENDPOINTS.USER.UPDATE_PASSWORD, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteUserAccount() {
  return request(API_ENDPOINTS.USER.DELETE_ACCOUNT, {
    method: "DELETE"
  });
}

export function fetchUserAddresses() {
  return request(API_ENDPOINTS.USER.ADDRESSES);
}

export function addUserAddress(payload) {
  return request(API_ENDPOINTS.USER.ADDRESSES, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateUserAddress(addressId, payload) {
  return request(API_ENDPOINTS.USER.ADDRESS_BY_ID(addressId), {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function setUserDefaultAddress(addressId) {
  return request(API_ENDPOINTS.USER.ADDRESS_SET_DEFAULT(addressId), {
    method: "PATCH"
  });
}

export function deleteUserAddress(addressId) {
  return request(API_ENDPOINTS.USER.ADDRESS_BY_ID(addressId), {
    method: "DELETE"
  });
}

export function fetchPaymentMethods() {
  return request(API_ENDPOINTS.USER.PAYMENT_METHODS);
}

export function addPaymentMethod(payload) {
  return request(API_ENDPOINTS.USER.PAYMENT_METHODS, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function setDefaultPaymentMethod(methodId) {
  return request(API_ENDPOINTS.USER.PAYMENT_METHOD_SET_DEFAULT(methodId), {
    method: "PATCH"
  });
}

export function removePaymentMethod(methodId) {
  return request(API_ENDPOINTS.USER.PAYMENT_METHOD_BY_ID(methodId), {
    method: "DELETE"
  });
}

export function fetchWallet() {
  return request(API_ENDPOINTS.USER.WALLET);
}

export function topupWallet(payload) {
  return request(API_ENDPOINTS.USER.WALLET_TOPUP, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function createWalletTopupOrder(payload) {
  return request(API_ENDPOINTS.USER.WALLET_TOPUP_ORDER, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function verifyWalletTopup(payload) {
  return request(API_ENDPOINTS.USER.WALLET_TOPUP_VERIFY, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function fetchUserCoupons() {
  return request(API_ENDPOINTS.USER.COUPONS);
}

export function fetchUserReviews() {
  return request(API_ENDPOINTS.USER.REVIEWS);
}

export function fetchReviewableBookings() {
  return request(API_ENDPOINTS.USER.REVIEWABLE_BOOKINGS);
}

export function createUserReview(payload) {
  return request(API_ENDPOINTS.USER.REVIEWS, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function fetchReferralData() {
  return request(API_ENDPOINTS.USER.REFERRAL);
}
