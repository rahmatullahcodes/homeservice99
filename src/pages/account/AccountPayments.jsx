import { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import {
  addPaymentMethod,
  createWalletTopupOrder,
  fetchPaymentMethods,
  fetchWallet,
  removePaymentMethod,
  setDefaultPaymentMethod,
  verifyWalletTopup
} from "../../utils/accountApi";
import { openRazorpayCheckout } from "../../utils/razorpay";
import {
  fetchPublicPaymentGateways,
  findPaymentGateway,
  getWalletTopupGateways
} from "../../utils/paymentGateways";
import "../../styles/account.css";

export default function AccountPayments() {
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [methods, setMethods] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [type, setType] = useState("UPI");
  const [value, setValue] = useState("");
  const [label, setLabel] = useState("");
  const [gatewayOptions, setGatewayOptions] = useState([]);
  const [selectedGateway, setSelectedGateway] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [methodData, walletData, paymentGatewayData] = await Promise.all([
        fetchPaymentMethods(),
        fetchWallet(),
        fetchPublicPaymentGateways()
      ]);
      setMethods(Array.isArray(methodData) ? methodData : []);
      setWalletBalance(Number(walletData?.balance || 0));

      const topupGateways = getWalletTopupGateways(paymentGatewayData?.paymentMethods || []);
      setGatewayOptions(topupGateways);

      const preferredGateway = topupGateways.find(
        (gateway) => gateway.code === paymentGatewayData?.defaultGateway
      ) || topupGateways[0];
      setSelectedGateway(preferredGateway?.code || "");
    } catch (err) {
      addToast(err.message || "Failed to load payment data", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMethod() {
    if (!value.trim()) {
      addToast("Enter payment details", "warning");
      return;
    }

    try {
      setSaving(true);
      const response = await addPaymentMethod({
        type,
        value,
        label: label || value
      });
      setMethods(response.paymentMethods || []);
      setValue("");
      setLabel("");
      addToast("Payment method added", "success");
    } catch (err) {
      addToast(err.message || "Failed to add method", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveMethod(methodId) {
    if (!window.confirm("Remove this payment method?")) return;

    try {
      const response = await removePaymentMethod(methodId);
      setMethods(response.paymentMethods || []);
      addToast("Payment method removed", "success");
    } catch (err) {
      addToast(err.message || "Failed to remove method", "error");
    }
  }

  async function handleSetDefault(methodId) {
    try {
      const response = await setDefaultPaymentMethod(methodId);
      setMethods(response.paymentMethods || []);
      addToast("Default payment method updated", "success");
    } catch (err) {
      addToast(err.message || "Failed to update default method", "error");
    }
  }

  async function quickTopUp(method) {
    const gateway = findPaymentGateway(gatewayOptions, selectedGateway);
    const amount = Number(window.prompt(`Enter wallet top-up amount using ${method.type}`, "500"));
    if (!amount || amount <= 0) {
      addToast("Invalid amount", "warning");
      return;
    }

    if (!gateway) {
      addToast("Select a payment gateway first", "warning");
      return;
    }

    try {
      const order = await createWalletTopupOrder({
        amount,
        methodId: method._id,
        gateway: gateway.code,
        note: `Added via ${method.type}`
      });

      let response;
      if (gateway.code === "razorpay") {
        const paymentResponse = await openRazorpayCheckout({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency || "INR",
          name: "HomeService99",
          description: "Wallet top-up",
          order_id: order.orderId
        });

        response = await verifyWalletTopup({
          razorpayOrderId: paymentResponse.razorpay_order_id,
          razorpayPaymentId: paymentResponse.razorpay_payment_id,
          razorpaySignature: paymentResponse.razorpay_signature
        });
      } else {
        if (order?.paymentLink) {
          window.open(order.paymentLink, "_blank", "noopener,noreferrer");
        }

        const paymentReference = window.prompt(
          [
            order?.instructions || "Complete the payment and enter the transaction ID.",
            order?.upiId ? `UPI ID: ${order.upiId}` : "",
            order?.bankDetails?.accountHolderName ? `Account Holder: ${order.bankDetails.accountHolderName}` : "",
            order?.bankDetails?.bankName ? `Bank: ${order.bankDetails.bankName}` : "",
            order?.bankDetails?.accountNumber ? `A/C: ${order.bankDetails.accountNumber}` : "",
            order?.bankDetails?.ifscCode ? `IFSC: ${order.bankDetails.ifscCode}` : "",
            order?.bankDetails?.branchName ? `Branch: ${order.bankDetails.branchName}` : "",
            `Reference: ${order?.orderId || "-"}`,
            "",
            "Enter UTR / Transaction ID:"
          ].filter(Boolean).join("\n"),
          ""
        );

        if (!paymentReference || !paymentReference.trim()) {
          throw new Error("Transaction ID is required to submit this wallet top-up");
        }

        response = await verifyWalletTopup({
          gateway: gateway.code,
          orderReference: order.orderId,
          paymentReference: paymentReference.trim()
        });
      }

      setWalletBalance(Number(response.balance || 0));
      addToast(
        response?.message || (gateway.code === "razorpay" ? `Added Rs ${amount} to wallet` : "Wallet top-up submitted"),
        gateway.code === "razorpay" ? "success" : "info"
      );
    } catch (err) {
      addToast(err.message || "Wallet top-up failed", "error");
    }
  }

  return (
    <div className="dashboard-wrapper">
      <h2 className="dashboard-title">Payment Methods</h2>
      <p className="dashboard-subtitle">Save methods once and use them for fast wallet top-up</p>

      <div className="dashboard-grid" style={{ marginBottom: "32px" }}>
        <div className="dash-card green">
          <div className="dash-icon">WL</div>
          <div>
            <p className="dash-label">Wallet Balance</p>
            <h3>Rs {walletBalance.toLocaleString()}</h3>
            <span className="dash-trend">Ready to use</span>
          </div>
        </div>

        <div className="dash-card blue">
          <div className="dash-icon">PM</div>
          <div>
            <p className="dash-label">Saved Methods</p>
            <h3>{methods.length}</h3>
            <span className="dash-trend">Payment options</span>
          </div>
        </div>
      </div>

      <div className="account-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <h3 style={{ marginBottom: "6px" }}>Configured Payment Gateways</h3>
            <p style={{ margin: 0, color: "#6b7280" }}>
              Select which gateway to use for quick wallet top-up from this page.
            </p>
          </div>

          <div style={{ minWidth: "240px" }}>
            <select value={selectedGateway} onChange={(event) => setSelectedGateway(event.target.value)} className="account-form-input">
              <option value="">Select payment gateway</option>
              {gatewayOptions.map((gateway) => (
                <option key={gateway.code} value={gateway.code}>
                  {gateway.displayName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "16px" }}>
          {gatewayOptions.length === 0 ? (
            <span style={{ color: "#6b7280" }}>No gateway configured yet</span>
          ) : gatewayOptions.map((gateway) => (
            <span
              key={gateway.code}
              className="account-badge blue"
              style={{ border: gateway.code === selectedGateway ? "1px solid #2563eb" : "1px solid transparent" }}
            >
              {gateway.displayName}
            </span>
          ))}
        </div>

        {findPaymentGateway(gatewayOptions, selectedGateway)?.mode?.startsWith("manual") && (
          <div className="account-alert info" style={{ marginTop: "16px" }}>
            BharatPe, Paytm and Bank Transfer top-ups are submitted with UTR and remain pending until verified.
          </div>
        )}
      </div>

      <div className="account-card" style={{ marginBottom: "32px" }}>
        <h3 style={{ marginBottom: "16px" }}>Add Payment Method</h3>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "150px" }}>
            <select value={type} onChange={(event) => setType(event.target.value)} className="account-form-input">
              <option>UPI</option>
              <option>Card</option>
              <option>NetBanking</option>
              <option>Wallet</option>
            </select>
          </div>

          <div style={{ flex: 1, minWidth: "200px" }}>
            <input
              placeholder={type === "UPI" ? "example@upi" : "Card or account reference"}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="account-form-input"
            />
          </div>

          <div style={{ flex: 1, minWidth: "200px" }}>
            <input
              placeholder="Friendly label (optional)"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              className="account-form-input"
            />
          </div>

          <button className="account-btn primary" onClick={handleAddMethod} disabled={saving}>
            {saving ? "Adding..." : "Add Method"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="account-alert info">Loading payment methods...</div>
      ) : methods.length === 0 ? (
        <div className="account-alert info">
          Add a payment method to quickly top up your wallet.
        </div>
      ) : (
        <div className="account-grid-2" style={{ marginBottom: "32px" }}>
          {methods.map((method) => (
            <div key={method._id} className="account-card">
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <span style={{ fontSize: 28 }}>{method.type === "Card" ? "CD" : method.type === "UPI" ? "UPI" : "PM"}</span>
                <div>
                  <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>{method.type}</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{method.maskedValue || method.label || method.value}</p>
                  {method.isDefault && <span className="account-badge blue">Default</span>}
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  className="account-btn primary"
                  style={{ flex: 1, fontSize: "12px", padding: "8px 12px" }}
                  onClick={() => quickTopUp(method)}
                >
                  Add to Wallet
                </button>
                <button
                  className="account-btn secondary"
                  style={{ flex: 1, fontSize: "12px", padding: "8px 12px" }}
                  onClick={() => handleSetDefault(method._id)}
                >
                  Set Default
                </button>
                <button
                  className="account-btn danger"
                  style={{ flex: 1, fontSize: "12px", padding: "8px 12px" }}
                  onClick={() => handleRemoveMethod(method._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
