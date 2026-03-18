import Settings from "../models/Settings.js";

const VALID_GATEWAY_CODES = ["cod", "razorpay", "bharatpe", "paytm", "bank_transfer"];

function cleanString(value) {
  return String(value || "").trim();
}

function cleanUpiId(value) {
  return cleanString(value).toLowerCase();
}

function getDefaultPaymentGateways() {
  return {
    defaultGateway: "cod",
    cod: {
      enabled: true,
      displayName: "Cash on Delivery",
      description: "Pay after the service is completed"
    },
    razorpay: {
      enabled: false,
      displayName: "Razorpay",
      description: "UPI, cards and netbanking via Razorpay Checkout",
      keyId: "",
      keySecret: "",
      webhookSecret: ""
    },
    bharatpe: {
      enabled: false,
      displayName: "BharatPe Merchant",
      description: "Collect payment using BharatPe merchant details or UPI",
      merchantId: "",
      keyId: "",
      keySecret: "",
      merchantName: "",
      merchantUpiId: ""
    },
    bank_transfer: {
      enabled: false,
      displayName: "Manual Bank Transfer",
      description: "Collect payment by sharing bank account details",
      accountHolderName: "",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      branchName: "",
      merchantUpiId: ""
    },
    paytm: {
      enabled: false,
      displayName: "Paytm Merchant",
      description: "Collect payment using Paytm merchant details or UPI",
      merchantId: "",
      merchantKey: "",
      website: "DEFAULT",
      industryTypeId: "Retail",
      merchantName: "",
      merchantUpiId: ""
    }
  };
}

function isTruthyBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

export function normalizePaymentGateways(rawPaymentGateways = {}) {
  const defaults = getDefaultPaymentGateways();
  const next = {
    defaultGateway: VALID_GATEWAY_CODES.includes(rawPaymentGateways?.defaultGateway)
      ? rawPaymentGateways.defaultGateway
      : defaults.defaultGateway,
    cod: {
      enabled: isTruthyBoolean(rawPaymentGateways?.cod?.enabled, defaults.cod.enabled),
      displayName: cleanString(rawPaymentGateways?.cod?.displayName) || defaults.cod.displayName,
      description: cleanString(rawPaymentGateways?.cod?.description) || defaults.cod.description
    },
    razorpay: {
      enabled: isTruthyBoolean(rawPaymentGateways?.razorpay?.enabled, defaults.razorpay.enabled),
      displayName: cleanString(rawPaymentGateways?.razorpay?.displayName) || defaults.razorpay.displayName,
      description: cleanString(rawPaymentGateways?.razorpay?.description) || defaults.razorpay.description,
      keyId: cleanString(rawPaymentGateways?.razorpay?.keyId),
      keySecret: cleanString(rawPaymentGateways?.razorpay?.keySecret),
      webhookSecret: cleanString(rawPaymentGateways?.razorpay?.webhookSecret)
    },
    bharatpe: {
      enabled: isTruthyBoolean(rawPaymentGateways?.bharatpe?.enabled, defaults.bharatpe.enabled),
      displayName: cleanString(rawPaymentGateways?.bharatpe?.displayName) || defaults.bharatpe.displayName,
      description: cleanString(rawPaymentGateways?.bharatpe?.description) || defaults.bharatpe.description,
      merchantId: cleanString(rawPaymentGateways?.bharatpe?.merchantId),
      keyId: cleanString(rawPaymentGateways?.bharatpe?.keyId),
      keySecret: cleanString(rawPaymentGateways?.bharatpe?.keySecret),
      merchantName: cleanString(rawPaymentGateways?.bharatpe?.merchantName),
      merchantUpiId: cleanUpiId(rawPaymentGateways?.bharatpe?.merchantUpiId)
    },
    bank_transfer: {
      enabled: isTruthyBoolean(rawPaymentGateways?.bank_transfer?.enabled, defaults.bank_transfer.enabled),
      displayName: cleanString(rawPaymentGateways?.bank_transfer?.displayName) || defaults.bank_transfer.displayName,
      description: cleanString(rawPaymentGateways?.bank_transfer?.description) || defaults.bank_transfer.description,
      accountHolderName: cleanString(rawPaymentGateways?.bank_transfer?.accountHolderName),
      bankName: cleanString(rawPaymentGateways?.bank_transfer?.bankName),
      accountNumber: cleanString(rawPaymentGateways?.bank_transfer?.accountNumber),
      ifscCode: cleanString(rawPaymentGateways?.bank_transfer?.ifscCode).toUpperCase(),
      branchName: cleanString(rawPaymentGateways?.bank_transfer?.branchName),
      merchantUpiId: cleanUpiId(rawPaymentGateways?.bank_transfer?.merchantUpiId)
    },
    paytm: {
      enabled: isTruthyBoolean(rawPaymentGateways?.paytm?.enabled, defaults.paytm.enabled),
      displayName: cleanString(rawPaymentGateways?.paytm?.displayName) || defaults.paytm.displayName,
      description: cleanString(rawPaymentGateways?.paytm?.description) || defaults.paytm.description,
      merchantId: cleanString(rawPaymentGateways?.paytm?.merchantId),
      merchantKey: cleanString(rawPaymentGateways?.paytm?.merchantKey),
      website: cleanString(rawPaymentGateways?.paytm?.website) || defaults.paytm.website,
      industryTypeId: cleanString(rawPaymentGateways?.paytm?.industryTypeId) || defaults.paytm.industryTypeId,
      merchantName: cleanString(rawPaymentGateways?.paytm?.merchantName),
      merchantUpiId: cleanUpiId(rawPaymentGateways?.paytm?.merchantUpiId)
    }
  };

  if (!isGatewaySelectableFromNormalized(next, next.defaultGateway)) {
    next.defaultGateway = getFirstSelectableGatewayFromNormalized(next) || "cod";
  }

  return next;
}

function isGatewayConfiguredFromNormalized(gateways, code) {
  const gatewayCode = cleanString(code).toLowerCase();

  if (gatewayCode === "cod") {
    return Boolean(gateways.cod.enabled);
  }

  if (gatewayCode === "razorpay") {
    return Boolean(
      gateways.razorpay.enabled &&
      gateways.razorpay.keyId &&
      gateways.razorpay.keySecret
    );
  }

  if (gatewayCode === "bharatpe") {
    return Boolean(
      gateways.bharatpe.enabled &&
      (gateways.bharatpe.merchantUpiId || gateways.bharatpe.merchantId)
    );
  }

  if (gatewayCode === "paytm") {
    return Boolean(
      gateways.paytm.enabled &&
      (gateways.paytm.merchantUpiId || (gateways.paytm.merchantId && gateways.paytm.merchantKey))
    );
  }

  if (gatewayCode === "bank_transfer") {
    return Boolean(
      gateways.bank_transfer.enabled &&
      (
        (gateways.bank_transfer.accountNumber && gateways.bank_transfer.ifscCode) ||
        gateways.bank_transfer.merchantUpiId
      )
    );
  }

  return false;
}

function isGatewaySelectableFromNormalized(gateways, code) {
  return VALID_GATEWAY_CODES.includes(cleanString(code).toLowerCase()) &&
    isGatewayConfiguredFromNormalized(gateways, code);
}

function getFirstSelectableGatewayFromNormalized(gateways) {
  return VALID_GATEWAY_CODES.find((code) => isGatewaySelectableFromNormalized(gateways, code)) || "";
}

export function isGatewayConfigured(paymentGateways, code) {
  return isGatewayConfiguredFromNormalized(normalizePaymentGateways(paymentGateways), code);
}

export function isGatewaySelectable(paymentGateways, code) {
  return isGatewaySelectableFromNormalized(normalizePaymentGateways(paymentGateways), code);
}

export function getFirstSelectableGateway(paymentGateways) {
  return getFirstSelectableGatewayFromNormalized(normalizePaymentGateways(paymentGateways));
}

export async function getSettingsDocument() {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings();
    await settings.save();
  }
  return settings;
}

export async function getNormalizedPaymentGatewaySettings() {
  const settings = await getSettingsDocument();
  return normalizePaymentGateways(settings.paymentGateways || {});
}

function withConfigState(entry, isConfigured) {
  return {
    ...entry,
    isConfigured
  };
}

export async function getAdminPaymentGatewaySettings() {
  const paymentGateways = await getNormalizedPaymentGatewaySettings();

  return {
    ...paymentGateways,
    cod: withConfigState(paymentGateways.cod, isGatewayConfigured(paymentGateways, "cod")),
    razorpay: withConfigState(paymentGateways.razorpay, isGatewayConfigured(paymentGateways, "razorpay")),
    bharatpe: withConfigState(paymentGateways.bharatpe, isGatewayConfigured(paymentGateways, "bharatpe")),
    bank_transfer: withConfigState(paymentGateways.bank_transfer, isGatewayConfigured(paymentGateways, "bank_transfer")),
    paytm: withConfigState(paymentGateways.paytm, isGatewayConfigured(paymentGateways, "paytm"))
  };
}

function buildPublicGatewayEntry(code, config) {
  if (code === "cod") {
    return {
      code,
      displayName: config.displayName,
      description: config.description,
      enabled: true,
      isConfigured: true,
      mode: "offline",
      supportsCheckout: true,
      supportsWalletTopup: false
    };
  }

  const mode = code === "razorpay" ? "sdk" : (code === "bank_transfer" ? "manual_bank" : "manual_upi");

  return {
    code,
    displayName: config.displayName,
    description: config.description,
    enabled: true,
    isConfigured: true,
    mode,
    supportsCheckout: true,
    supportsWalletTopup: true
  };
}

export async function getPublicPaymentGatewaySettings() {
  const paymentGateways = await getNormalizedPaymentGatewaySettings();
  const paymentMethods = VALID_GATEWAY_CODES
    .filter((code) => isGatewaySelectable(paymentGateways, code))
    .map((code) => buildPublicGatewayEntry(code, paymentGateways[code]));

  return {
    defaultGateway: isGatewaySelectable(paymentGateways, paymentGateways.defaultGateway)
      ? paymentGateways.defaultGateway
      : (paymentMethods[0]?.code || "cod"),
    paymentMethods
  };
}

export async function updatePaymentGatewaySettings(rawPaymentGateways, updatedBy = null) {
  const settings = await getSettingsDocument();
  settings.paymentGateways = normalizePaymentGateways(rawPaymentGateways || {});
  settings.updatedBy = updatedBy || null;
  await settings.save();
  return getAdminPaymentGatewaySettings();
}

export async function getRazorpayCredentials() {
  const paymentGateways = await getNormalizedPaymentGatewaySettings();
  const configuredKeyId = cleanString(paymentGateways?.razorpay?.keyId);
  const configuredKeySecret = cleanString(paymentGateways?.razorpay?.keySecret);
  const configuredWebhookSecret = cleanString(paymentGateways?.razorpay?.webhookSecret);

  const keyId = configuredKeyId || cleanString(process.env.RAZORPAY_KEY_ID);
  const keySecret = configuredKeySecret || cleanString(process.env.RAZORPAY_KEY_SECRET);
  const webhookSecret = configuredWebhookSecret || cleanString(process.env.RAZORPAY_WEBHOOK_SECRET);

  if (!keyId || !keySecret) {
    const error = new Error("Razorpay is not configured on server");
    error.statusCode = 503;
    throw error;
  }

  return {
    keyId,
    keySecret,
    webhookSecret
  };
}

export async function getRuntimeGatewayConfig(code, options = {}) {
  const paymentGateways = await getNormalizedPaymentGatewaySettings();
  const gatewayCode = cleanString(code || paymentGateways.defaultGateway).toLowerCase();
  const requireConfigured = options.requireConfigured !== false;

  if (!VALID_GATEWAY_CODES.includes(gatewayCode)) {
    const error = new Error("Unsupported payment gateway");
    error.statusCode = 400;
    throw error;
  }

  if (requireConfigured && !isGatewaySelectable(paymentGateways, gatewayCode)) {
    const error = new Error("Selected payment gateway is not available");
    error.statusCode = 400;
    throw error;
  }

  return {
    code: gatewayCode,
    config: paymentGateways[gatewayCode],
    paymentGateways
  };
}

function encodeUpiParam(value) {
  return encodeURIComponent(String(value || ""));
}

export function buildManualGatewayOrder({ gatewayCode, config, amount, referenceId, userId, purpose }) {
  const merchantUpiId = cleanUpiId(config?.merchantUpiId);
  const merchantName = cleanString(config?.merchantName) || cleanString(config?.displayName) || gatewayCode;
  const accountHolderName = cleanString(config?.accountHolderName);
  const bankName = cleanString(config?.bankName);
  const accountNumber = cleanString(config?.accountNumber);
  const ifscCode = cleanString(config?.ifscCode).toUpperCase();
  const branchName = cleanString(config?.branchName);
  const safeAmount = Number(amount || 0).toFixed(2);
  const note = `${purpose || "payment"} ${referenceId} ${String(userId || "").slice(-6)}`.trim();
  const hasBankDetails = Boolean(accountNumber && ifscCode);
  const mode = gatewayCode === "bank_transfer" ? "manual_bank" : "manual_upi";
  const paymentLink = merchantUpiId
    ? `upi://pay?pa=${encodeUpiParam(merchantUpiId)}&pn=${encodeUpiParam(merchantName)}&am=${encodeUpiParam(safeAmount)}&cu=INR&tn=${encodeUpiParam(note)}`
    : "";

  return {
    gateway: gatewayCode,
    mode,
    displayName: cleanString(config?.displayName) || gatewayCode,
    merchantName,
    upiId: merchantUpiId,
    bankDetails: hasBankDetails ? {
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,
      branchName
    } : null,
    orderId: referenceId,
    amount: Math.round(Number(amount || 0) * 100),
    currency: "INR",
    paymentLink,
    instructions: merchantUpiId
      ? `Pay Rs ${safeAmount} to ${merchantUpiId} and submit the UTR / transaction ID.`
      : hasBankDetails
        ? `Transfer Rs ${safeAmount} to the shared bank account and submit UTR / transaction ID.`
        : "Complete the merchant payment externally and submit the transaction ID."
  };
}
