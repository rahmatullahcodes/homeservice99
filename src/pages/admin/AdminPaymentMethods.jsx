import { useEffect, useMemo, useState } from "react";
import { API_ENDPOINTS } from "../../config/api";

const DEFAULT_PAYMENT_GATEWAYS = {
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

const GATEWAY_CODES = ["cod", "razorpay", "bharatpe", "paytm", "bank_transfer"];

function getToken() {
  return localStorage.getItem("adminToken");
}

async function parseJson(response) {
  return response.json().catch(() => ({}));
}

async function requestWithFallback({
  token,
  method = "GET",
  payload = null
}) {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  const methodCandidates = method === "PATCH"
    ? [
        API_ENDPOINTS.PAYMENT_GATEWAYS.ADMIN_UPDATE,
        API_ENDPOINTS.PAYMENT_GATEWAYS.ADMIN_UPDATE_FALLBACK
      ]
    : [
        API_ENDPOINTS.PAYMENT_GATEWAYS.ADMIN_GET,
        API_ENDPOINTS.PAYMENT_GATEWAYS.ADMIN_GET_FALLBACK
      ];

  for (const endpoint of methodCandidates) {
    const response = await fetch(endpoint, {
      method,
      headers,
      ...(payload ? { body: JSON.stringify(payload) } : {})
    });
    const data = await parseJson(response);
    if (response.ok) {
      return data;
    }
    if (response.status !== 404) {
      throw new Error(data?.message || `Failed to ${method === "PATCH" ? "save" : "load"} payment methods`);
    }
  }

  if (method === "PATCH") {
    const fallback = await fetch(API_ENDPOINTS.SETTINGS.UPDATE, {
      method: "PATCH",
      headers,
      body: JSON.stringify(payload || {})
    });
    const fallbackData = await parseJson(fallback);
    if (!fallback.ok) {
      throw new Error(fallbackData?.message || "Failed to save payment methods");
    }
    return {
      paymentGateways: fallbackData?.data?.paymentGateways || payload?.paymentGateways || DEFAULT_PAYMENT_GATEWAYS
    };
  }

  const fallback = await fetch(API_ENDPOINTS.SETTINGS.GET_ALL, { headers });
  const fallbackData = await parseJson(fallback);
  if (!fallback.ok) {
    throw new Error(fallbackData?.message || "Failed to load payment methods");
  }
  return {
    paymentGateways: fallbackData?.paymentGateways || DEFAULT_PAYMENT_GATEWAYS
  };
}

export default function AdminPaymentMethods() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [paymentGateways, setPaymentGateways] = useState(DEFAULT_PAYMENT_GATEWAYS);

  useEffect(() => {
    fetchPaymentGateways();
  }, []);

  async function fetchPaymentGateways() {
    try {
      setLoading(true);
      setError("");

      const token = getToken();
      if (!token) {
        throw new Error("Admin authentication required");
      }

      const data = await requestWithFallback({ token, method: "GET" });
      setPaymentGateways({
        ...DEFAULT_PAYMENT_GATEWAYS,
        ...(data?.paymentGateways || {})
      });
    } catch (requestError) {
      setError(requestError.message || "Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  }

  function handleTopLevelChange(field, value) {
    setPaymentGateways((prev) => ({ ...prev, [field]: value }));
  }

  function handleGatewayChange(code, field, value) {
    setPaymentGateways((prev) => ({
      ...prev,
      [code]: {
        ...prev[code],
        [field]: value
      }
    }));
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError("");

      const token = getToken();
      if (!token) {
        throw new Error("Admin authentication required");
      }

      const payload = { paymentGateways };
      const data = await requestWithFallback({ token, method: "PATCH", payload });

      setPaymentGateways({
        ...DEFAULT_PAYMENT_GATEWAYS,
        ...(data?.paymentGateways || paymentGateways)
      });
      setSuccessMessage("Payment methods saved successfully");
      window.setTimeout(() => setSuccessMessage(""), 3000);
    } catch (requestError) {
      setError(requestError.message || "Failed to save payment methods");
    } finally {
      setSaving(false);
    }
  }

  const enabledGateways = useMemo(
    () => GATEWAY_CODES.filter((code) => paymentGateways?.[code]?.enabled).length,
    [paymentGateways]
  );

  const gatewayCards = [
    {
      code: "cod",
      title: "Cash on Delivery",
      summary: "Offline payment after service completion.",
      fields: [
        { key: "displayName", label: "Display Name" },
        { key: "description", label: "Description" }
      ]
    },
    {
      code: "razorpay",
      title: "Razorpay",
      summary: "Instant checkout for UPI, cards and netbanking.",
      fields: [
        { key: "displayName", label: "Display Name" },
        { key: "description", label: "Description" },
        { key: "keyId", label: "Key ID" },
        { key: "keySecret", label: "Key Secret", type: "password" },
        { key: "webhookSecret", label: "Webhook Secret", type: "password" }
      ]
    },
    {
      code: "bharatpe",
      title: "BharatPe Merchant",
      summary: "Merchant collection flow with UPI or transaction reference.",
      fields: [
        { key: "displayName", label: "Display Name" },
        { key: "description", label: "Description" },
        { key: "merchantId", label: "Merchant ID" },
        { key: "keyId", label: "Key ID" },
        { key: "keySecret", label: "Secret Key", type: "password" },
        { key: "merchantName", label: "Merchant Name" },
        { key: "merchantUpiId", label: "Merchant UPI ID" }
      ]
    },
    {
      code: "paytm",
      title: "Paytm Merchant",
      summary: "Merchant collection flow with Paytm config and UPI support.",
      fields: [
        { key: "displayName", label: "Display Name" },
        { key: "description", label: "Description" },
        { key: "merchantId", label: "Merchant ID" },
        { key: "merchantKey", label: "Merchant Key", type: "password" },
        { key: "website", label: "Website" },
        { key: "industryTypeId", label: "Industry Type" },
        { key: "merchantName", label: "Merchant Name" },
        { key: "merchantUpiId", label: "Merchant UPI ID" }
      ]
    },
    {
      code: "bank_transfer",
      title: "Manual Bank Transfer",
      summary: "Share bank account details and collect payment with UTR reference.",
      fields: [
        { key: "displayName", label: "Display Name" },
        { key: "description", label: "Description" },
        { key: "accountHolderName", label: "Account Holder Name" },
        { key: "bankName", label: "Bank Name" },
        { key: "accountNumber", label: "Account Number" },
        { key: "ifscCode", label: "IFSC Code" },
        { key: "branchName", label: "Branch Name" },
        { key: "merchantUpiId", label: "Fallback UPI ID (Optional)" }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page-head">
          <h2>Payment Methods</h2>
          <p className="admin-subtitle">Loading payment gateway configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h2>Payment Methods</h2>
        <p className="admin-subtitle">Manage Razorpay, BharatPe, Paytm and manual bank transfer credentials</p>
      </div>

      {error && <div className="admin-alert error">{error}</div>}
      {successMessage && <div className="admin-alert success">{successMessage}</div>}

      <div className="admin-kpi-grid">
        <div className="kpi-card">
          <span>Enabled Methods</span>
          <h3>{enabledGateways}</h3>
          <small className="positive">Visible across checkout and wallet pages</small>
        </div>
        <div className="kpi-card">
          <span>Default Gateway</span>
          <h3>{paymentGateways.defaultGateway}</h3>
          <small className="neutral">Used as the default selection</small>
        </div>
        <div className="kpi-card">
          <span>Manual Review</span>
          <h3>3</h3>
          <small className="neutral">BharatPe, Paytm and Bank Transfer stay pending until verified</small>
        </div>
      </div>

      <section className="admin-section payment-method-section">
        <h3>Global Preferences</h3>
        <div className="payment-method-fields">
          <div className="payment-method-field">
            <label className="payment-label">Default Payment Gateway</label>
            <select
              value={paymentGateways.defaultGateway}
              onChange={(event) => handleTopLevelChange("defaultGateway", event.target.value)}
              className="admin-input"
            >
              <option value="cod">Cash on Delivery</option>
              <option value="razorpay">Razorpay</option>
              <option value="bharatpe">BharatPe Merchant</option>
              <option value="paytm">Paytm Merchant</option>
              <option value="bank_transfer">Manual Bank Transfer</option>
            </select>
          </div>
        </div>
        <p className="payment-method-note">
          BharatPe, Paytm and Bank Transfer are merchant collection methods. Customer UTR or transaction ID
          will be stored, but wallet credit or booking payment approval remains pending until manually verified.
        </p>
      </section>

      <div className="payment-methods-grid">
        {gatewayCards.map((gateway) => {
          const gatewayState = paymentGateways[gateway.code] || {};
          return (
            <section key={gateway.code} className="admin-section payment-method-section">
              <div className="payment-method-head">
                <div>
                  <h3>{gateway.title}</h3>
                  <p>{gateway.summary}</p>
                </div>

                <label
                  className={`payment-method-toggle ${gatewayState.enabled ? "enabled" : "disabled"}`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(gatewayState.enabled)}
                    onChange={(event) => handleGatewayChange(gateway.code, "enabled", event.target.checked)}
                  />
                  {gatewayState.enabled ? "Enabled" : "Disabled"}
                </label>
              </div>

              <div className="payment-method-fields">
                {gateway.fields.map((field) => (
                  <div key={field.key} className="payment-method-field">
                    <label className="payment-label">{field.label}</label>
                    <input
                      type={field.type || "text"}
                      value={gatewayState[field.key] || ""}
                      onChange={(event) => handleGatewayChange(gateway.code, field.key, event.target.value)}
                      className="admin-input"
                    />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="payment-method-actions">
        <button className="btn-sm outline" onClick={fetchPaymentGateways} disabled={saving}>
          Refresh
        </button>
        <button className="btn-sm" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Payment Methods"}
        </button>
      </div>
    </div>
  );
}
