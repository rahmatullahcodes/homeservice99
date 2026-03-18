import { API_ENDPOINTS } from "../config/api";

export async function fetchPublicPaymentGateways() {
  let response;

  try {
    response = await fetch(API_ENDPOINTS.PAYMENT_GATEWAYS.GET_PUBLIC, {
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    const localHint = typeof window !== "undefined" && (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    );
    const hint = localHint
      ? "Unable to connect API. Start backend on http://localhost:5000 and keep it running."
      : "Unable to connect API endpoint.";
    throw new Error(error?.message || hint);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || "Failed to load payment methods");
  }

  return {
    defaultGateway: data?.defaultGateway || "cod",
    paymentMethods: Array.isArray(data?.paymentMethods) ? data.paymentMethods : []
  };
}

export function getWalletTopupGateways(paymentMethods) {
  return (Array.isArray(paymentMethods) ? paymentMethods : [])
    .filter((method) => method?.supportsWalletTopup);
}

export function findPaymentGateway(paymentMethods, code) {
  return (Array.isArray(paymentMethods) ? paymentMethods : [])
    .find((method) => method?.code === code) || null;
}
