import crypto from "crypto";
import { getRazorpayCredentials } from "./paymentGatewayService.js";

const RAZORPAY_API_BASE = process.env.RAZORPAY_API_BASE || "https://api.razorpay.com/v1";

export async function getRazorpayPublicConfig() {
  try {
    const { keyId, keySecret } = await getRazorpayCredentials();
    return {
      enabled: Boolean(keyId && keySecret),
      keyId
    };
  } catch {
    return {
      enabled: false,
      keyId: ""
    };
  }
}

async function ensureConfigured() {
  const { keyId, keySecret } = await getRazorpayCredentials();
  return {
    keyId,
    keySecret
  };
}

async function getAuthHeader() {
  const { keyId, keySecret } = await ensureConfigured();
  const token = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  return `Basic ${token}`;
}

export async function createRazorpayOrder({
  amountInPaise,
  currency = "INR",
  receipt,
  notes = {}
}) {
  const response = await fetch(`${RAZORPAY_API_BASE}/orders`, {
    method: "POST",
    headers: {
      Authorization: await getAuthHeader(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency,
      receipt,
      notes
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload?.error?.description || payload?.message || "Failed to create Razorpay order");
    error.statusCode = response.status || 500;
    throw error;
  }

  return payload;
}

function secureEqual(valueA, valueB) {
  const a = Buffer.from(String(valueA || ""));
  const b = Buffer.from(String(valueB || ""));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function verifyRazorpaySignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
}) {
  const { keySecret } = await ensureConfigured();
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return secureEqual(expected, razorpaySignature);
}
