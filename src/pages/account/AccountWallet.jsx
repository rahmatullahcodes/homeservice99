import { useEffect, useMemo, useState } from "react";
import { useToast } from "../../context/ToastContext";
import {
  createWalletTopupOrder,
  fetchPaymentMethods,
  fetchWallet,
  verifyWalletTopup
} from "../../utils/accountApi";
import { openRazorpayCheckout } from "../../utils/razorpay";
import {
  fetchPublicPaymentGateways,
  findPaymentGateway,
  getWalletTopupGateways
} from "../../utils/paymentGateways";
import "../../styles/account.css";

export default function AccountWallet() {
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [methods, setMethods] = useState([]);
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [gatewayMethods, setGatewayMethods] = useState([]);
  const [selectedGateway, setSelectedGateway] = useState("");

  useEffect(() => {
    loadWallet();
  }, []);

  async function loadWallet() {
    try {
      setLoading(true);
      const [wallet, paymentMethods, paymentGatewayData] = await Promise.all([
        fetchWallet(),
        fetchPaymentMethods(),
        fetchPublicPaymentGateways()
      ]);

      setBalance(Number(wallet?.balance || 0));
      setTransactions(Array.isArray(wallet?.transactions) ? wallet.transactions : []);

      const methodList = Array.isArray(paymentMethods) ? paymentMethods : [];
      setMethods(methodList);

      const defaultMethod = methodList.find((method) => method.isDefault) || methodList[0];
      setSelectedMethodId(defaultMethod?._id || "");

      const availableGateways = getWalletTopupGateways(paymentGatewayData?.paymentMethods || []);
      setGatewayMethods(availableGateways);

      const preferredGateway = availableGateways.find(
        (gateway) => gateway.code === paymentGatewayData?.defaultGateway
      ) || availableGateways[0];
      setSelectedGateway(preferredGateway?.code || "");
    } catch (err) {
      addToast(err.message || "Failed to load wallet", "error");
    } finally {
      setLoading(false);
    }
  }

  const totalCredits = useMemo(
    () => transactions
      .filter((txn) => txn.type === "Credit" && txn.status === "Success")
      .reduce((sum, txn) => sum + Number(txn.amount || 0), 0),
    [transactions]
  );

  const totalSpent = useMemo(
    () => transactions
      .filter((txn) => txn.type === "Debit" && txn.status === "Success")
      .reduce((sum, txn) => sum + Number(txn.amount || 0), 0),
    [transactions]
  );

  async function addMoney() {
    const value = Number(amount);
    const gateway = findPaymentGateway(gatewayMethods, selectedGateway);
    if (!value || value <= 0) {
      addToast("Enter a valid amount", "warning");
      return;
    }

    if (!selectedMethodId) {
      addToast("Select a payment method first", "warning");
      return;
    }

    if (!gateway) {
      addToast("Select a payment gateway first", "warning");
      return;
    }

    try {
      setAdding(true);
      const order = await createWalletTopupOrder({
        amount: value,
        methodId: selectedMethodId,
        gateway: gateway.code,
        note: "Wallet top-up from My Wallet page"
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

      setBalance(Number(response?.balance || 0));
      if (response?.wallet?.transactions) {
        setTransactions(response.wallet.transactions);
      } else if (response?.transaction) {
        setTransactions((prev) => [response.transaction, ...prev]);
      } else {
        await loadWallet();
      }

      setAmount("");
      addToast(
        response?.message || (gateway.code === "razorpay" ? `Added Rs ${value} to wallet` : "Wallet top-up submitted"),
        gateway.code === "razorpay" ? "success" : "info"
      );
    } catch (err) {
      addToast(err.message || "Failed to add money", "error");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="dashboard-wrapper">
      <h2 className="dashboard-title">My Wallet</h2>
      <p className="dashboard-subtitle">Add money and track wallet transactions</p>

      <div className="dashboard-grid" style={{ marginBottom: "32px" }}>
        <div className="dash-card green">
          <div className="dash-icon">BL</div>
          <div>
            <p className="dash-label">Wallet Balance</p>
            <h3>Rs {balance.toLocaleString()}</h3>
            <span className="dash-trend">Available balance</span>
          </div>
        </div>

        <div className="dash-card blue">
          <div className="dash-icon">CR</div>
          <div>
            <p className="dash-label">Total Credits</p>
            <h3>Rs {totalCredits.toLocaleString()}</h3>
            <span className="dash-trend">All time</span>
          </div>
        </div>

        <div className="dash-card yellow">
          <div className="dash-icon">DB</div>
          <div>
            <p className="dash-label">Total Spent</p>
            <h3>Rs {totalSpent.toLocaleString()}</h3>
            <span className="dash-trend">All time</span>
          </div>
        </div>
      </div>

      <div className="account-card" style={{ marginBottom: "32px" }}>
        <h3 style={{ marginBottom: "16px" }}>Add Money to Wallet</h3>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="account-form-input"
            />
          </div>

          <div style={{ flex: 1, minWidth: "240px" }}>
            <select
              value={selectedMethodId}
              onChange={(event) => setSelectedMethodId(event.target.value)}
              className="account-form-input"
            >
              <option value="">Select payment method</option>
              {methods.map((method) => (
                <option key={method._id} value={method._id}>
                  {method.type} - {method.maskedValue || method.label || method.value}{method.isDefault ? " (Default)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: "240px" }}>
            <select
              value={selectedGateway}
              onChange={(event) => setSelectedGateway(event.target.value)}
              className="account-form-input"
            >
              <option value="">Select payment gateway</option>
              {gatewayMethods.map((gateway) => (
                <option key={gateway.code} value={gateway.code}>
                  {gateway.displayName}
                </option>
              ))}
            </select>
          </div>

          <button className="account-btn primary" onClick={addMoney} disabled={adding}>
            {adding ? "Adding..." : "Add Money"}
          </button>
        </div>

        {findPaymentGateway(gatewayMethods, selectedGateway)?.mode?.startsWith("manual") && (
          <div className="account-alert info" style={{ marginTop: "16px" }}>
            Merchant gateway top-ups stay pending until transaction verification. Balance will update after approval.
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "32px", flexWrap: "wrap" }}>
        {[100, 250, 500, 1000].map((preset) => (
          <button
            key={preset}
            className="account-btn secondary"
            onClick={() => setAmount(String(preset))}
            style={{ fontSize: "12px", padding: "8px 12px" }}
          >
            Rs {preset}
          </button>
        ))}
      </div>

      <div className="account-card">
        <h3 style={{ marginBottom: "16px" }}>Transaction History</h3>

        {loading ? (
          <p style={{ textAlign: "center", color: "#6b7280", padding: "20px" }}>Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p style={{ textAlign: "center", color: "#6b7280", padding: "20px" }}>No transactions yet</p>
        ) : (
          <table className="account-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn._id}>
                  <td><strong>{txn.note || txn.source || "Wallet transaction"}</strong></td>
                  <td>
                    <span className={`account-badge ${txn.type === "Credit" ? "green" : "red"}`}>
                      {txn.type}
                    </span>
                  </td>
                  <td>{new Date(txn.createdAt).toLocaleDateString()}</td>
                  <td>{txn.status || "Success"}</td>
                  <td style={{ fontWeight: 600, color: txn.type === "Credit" ? "var(--account-success)" : "var(--account-danger)" }}>
                    {txn.type === "Credit" ? "+" : "-"}Rs {Number(txn.amount || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && methods.length === 0 && (
        <div className="account-alert info" style={{ marginTop: "16px" }}>
          No payment method found. Add one from Payment Methods page to top-up wallet.
        </div>
      )}

      {!loading && gatewayMethods.length === 0 && (
        <div className="account-alert info" style={{ marginTop: "16px" }}>
          No wallet top-up gateway is configured by admin yet.
        </div>
      )}
    </div>
  );
}
