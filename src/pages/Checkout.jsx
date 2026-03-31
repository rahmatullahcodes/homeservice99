import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { API_ENDPOINTS } from "../config/api";
import { openRazorpayCheckout } from "../utils/razorpay";
import {
  fetchPublicPaymentGateways,
  findPaymentGateway
} from "../utils/paymentGateways";

function parseCouponDiscount(coupon, subtotal) {
  if (!coupon) return 0;
  if (coupon.type === "Flat") return Number(coupon.value || 0);
  if (coupon.type === "Percent") return (Number(subtotal || 0) * Number(coupon.value || 0)) / 100;
  return 0;
}

async function parseResponseJson(response) {
  return response.json().catch(() => ({}));
}

async function fetchWithApiHint(url, options = {}) {
  try {
    return await fetch(url, options);
  } catch (error) {
    const localHint = typeof window !== "undefined" && (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    );
    if (localHint) {
      throw new Error("Unable to connect API. Start backend on http://localhost:5000 and keep it running.");
    }
    throw new Error(error?.message || "Unable to connect API endpoint.");
  }
}

export default function Checkout() {
  const { cart, clearCart, appliedCoupon, setAppliedCoupon, clearAppliedCoupon } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const [step, setStep] = useState(isLoggedIn ? 2 : 1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [method, setMethod] = useState("cod");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    if (!isLoggedIn) return;

    try {
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (!savedUser || typeof savedUser !== "object") return;

      setName((prev) => prev || savedUser.name || "");
      setPhone((prev) => prev || savedUser.phone || "");
      const storedLocation = localStorage.getItem("selectedLocation") || "";
      setAddress((prev) => prev || savedUser.address || savedUser.city || storedLocation || "");
    } catch (error) {
      console.warn("Unable to prefill checkout details:", error);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function handleLocationUpdate(event) {
      const nextLocation = event?.detail?.location;
      if (!nextLocation || typeof nextLocation !== "string") return;
      setAddress((prev) => (prev && prev.trim() ? prev : nextLocation));
    }

    window.addEventListener("hs99-location-selected", handleLocationUpdate);
    return () => window.removeEventListener("hs99-location-selected", handleLocationUpdate);
  }, []);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * (Number(item.quantity) || 1), 0);
  const serviceFee = 49;
  const discount = parseCouponDiscount(appliedCoupon, subtotal);
  const payableTotal = Math.max(0, subtotal + serviceFee - discount);
  const selectedGateway = findPaymentGateway(paymentMethods, method);

  async function loadPaymentMethods() {
    try {
      const data = await fetchPublicPaymentGateways();
      const available = Array.isArray(data?.paymentMethods) ? data.paymentMethods : [];
      setPaymentMethods(available);

      const preferred = available.find((entry) => entry.code === data?.defaultGateway) || available[0];
      if (preferred?.code) {
        setMethod(preferred.code);
      }
    } catch (error) {
      console.error("Unable to load payment methods:", error);
    }
  }

  function goToLogin() {
    navigate("/login");
  }

  function continueToPayment() {
    if (!name || !phone || !address) {
      addToast("Fill all delivery details", "warning");
      return;
    }
    setStep(3);
  }

  function buildBookingPayloads() {
    const scheduledAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const payloads = [];

    cart.forEach((item) => {
      const quantity = Math.max(1, Number(item.quantity) || 1);
      for (let i = 0; i < quantity; i += 1) {
        payloads.push({
          serviceId: item.id,
          serviceTitle: item.title,
          serviceCategory: item.category || "",
          price: Number(item.price) || 0,
          scheduledAt,
          name,
          phone,
          address
        });
      }
    });

    return payloads;
  }

  async function placeCodOrder(token, bookingPayloads) {
    const results = await Promise.all(
      bookingPayloads.map(async (payload) => {
        const response = await fetchWithApiHint(API_ENDPOINTS.BOOKINGS.CREATE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...payload,
            paymentMethod: "cod"
          })
        });
        const data = await parseResponseJson(response);
        return { ok: response.ok, data };
      })
    );

    const failed = results.find((entry) => !entry.ok);
    if (failed) {
      throw new Error(failed.data?.message || "Failed to place order");
    }

    return {
      message: "Order placed successfully. Vendors can now accept your booking.",
      tone: "success"
    };
  }

  async function placeOnlineOrder(token, bookingPayloads, gatewayCode) {
    if (payableTotal <= 0) {
      throw new Error("Invalid payable amount");
    }

    const orderResponse = await fetchWithApiHint(API_ENDPOINTS.BOOKINGS.CREATE_PAYMENT_ORDER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        amount: payableTotal,
        gateway: gatewayCode
      })
    });
    const orderData = await parseResponseJson(orderResponse);
    if (!orderResponse.ok) {
      throw new Error(orderData?.message || "Failed to create payment order");
    }

    if (gatewayCode !== "razorpay") {
      if (orderData?.paymentLink) {
        window.open(orderData.paymentLink, "_blank", "noopener,noreferrer");
      }

      const paymentReference = window.prompt(
        [
          orderData?.instructions || "Complete the payment and enter the transaction ID.",
          orderData?.upiId ? `UPI ID: ${orderData.upiId}` : "",
          orderData?.bankDetails?.accountHolderName ? `Account Holder: ${orderData.bankDetails.accountHolderName}` : "",
          orderData?.bankDetails?.bankName ? `Bank: ${orderData.bankDetails.bankName}` : "",
          orderData?.bankDetails?.accountNumber ? `A/C: ${orderData.bankDetails.accountNumber}` : "",
          orderData?.bankDetails?.ifscCode ? `IFSC: ${orderData.bankDetails.ifscCode}` : "",
          orderData?.bankDetails?.branchName ? `Branch: ${orderData.bankDetails.branchName}` : "",
          `Reference: ${orderData?.orderId || "-"}`,
          "",
          "Enter UTR / Transaction ID:"
        ].filter(Boolean).join("\n"),
        ""
      );

      if (!paymentReference || !paymentReference.trim()) {
        throw new Error("Transaction ID is required to submit this payment");
      }

      const verifyResponse = await fetchWithApiHint(API_ENDPOINTS.BOOKINGS.VERIFY_PAYMENT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          gateway: gatewayCode,
          orderReference: orderData.orderId,
          paymentReference: paymentReference.trim(),
          bookings: bookingPayloads,
          customer: {
            name,
            phone,
            address
          }
        })
      });

      const verifyData = await parseResponseJson(verifyResponse);
      if (!verifyResponse.ok) {
        throw new Error(verifyData?.message || "Payment submission failed");
      }

      return {
        message: verifyData?.message || "Payment submitted successfully",
        tone: verifyData?.paymentStatus === "Pending" ? "info" : "success"
      };
    }

    const paymentResponse = await openRazorpayCheckout({
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency || "INR",
      name: "HomeService99",
      description: "Service booking payment",
      order_id: orderData.orderId,
      prefill: {
        name,
        contact: phone
      }
    });

    const verifyResponse = await fetchWithApiHint(API_ENDPOINTS.BOOKINGS.VERIFY_PAYMENT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        razorpayOrderId: paymentResponse.razorpay_order_id,
        razorpayPaymentId: paymentResponse.razorpay_payment_id,
        razorpaySignature: paymentResponse.razorpay_signature,
        bookings: bookingPayloads,
        customer: {
          name,
          phone,
          address
        }
      })
    });

    const verifyData = await parseResponseJson(verifyResponse);
    if (!verifyResponse.ok) {
      throw new Error(verifyData?.message || "Payment verification failed");
    }

    return {
      message: verifyData?.message || "Payment verified and order placed successfully",
      tone: "success"
    };
  }

  async function placeOrder() {
    if (placingOrder) return;

    if (!name || !phone || !address) {
      addToast("Fill all delivery details", "warning");
      setStep(2);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      addToast("Please login to place order", "warning");
      navigate("/login?redirect=/checkout");
      return;
    }

    if (cart.length === 0) {
      addToast("Your cart is empty", "warning");
      return;
    }

    if (!selectedGateway) {
      addToast("No payment method is currently configured", "warning");
      return;
    }

    try {
      setPlacingOrder(true);
      const bookingPayloads = buildBookingPayloads();
      let result;

      if (method === "cod") {
        result = await placeCodOrder(token, bookingPayloads);
      } else {
        result = await placeOnlineOrder(token, bookingPayloads, method);
      }

      clearCart();
      addToast(
        result?.message || "Order placed successfully. Vendors can now accept your booking.",
        result?.tone || "success"
      );
      navigate("/account/bookings");
    } catch (error) {
      console.error("Place order error:", error);
      addToast(error.message || "Order placement failed", "error");
    } finally {
      setPlacingOrder(false);
    }
  }

  return (
    <div className="container">
      <h1 className="section-title">Checkout</h1>

      <div className="checkout-progress">
        <div className={`progress-step ${step >= 1 ? "active" : ""}`}>
          <span className="step-num">1</span>
          <span>Account</span>
        </div>
        <div className={`progress-step ${step >= 2 ? "active" : ""}`}>
          <span className="step-num">2</span>
          <span>Details</span>
        </div>
        <div className={`progress-step ${step >= 3 ? "active" : ""}`}>
          <span className="step-num">3</span>
          <span>Payment</span>
        </div>
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          {step === 1 && (
            <div className="checkout-card fade-in">
              <h3>Account</h3>
              <p className="step-desc">Please login or signup to continue with checkout</p>
              <div className="login-actions">
                <button className="btn-primary" onClick={goToLogin}>
                  Login
                </button>
                <button className="btn-outline" onClick={() => navigate("/signup")}>
                  Signup
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="checkout-card fade-in">
              <h3>Delivery Details</h3>

              <form className="form-grid">
                <div className="form-field">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    aria-label="Full name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    aria-label="Phone number"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </div>

                <div className="form-field full-width">
                  <label htmlFor="address">Full Address</label>
                  <textarea
                    id="address"
                    aria-label="Full address"
                    placeholder="Street, City, State, Postal Code"
                    rows="3"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                  />
                </div>
              </form>

              <button type="button" className="btn-primary continue-btn" onClick={continueToPayment}>
                Continue to Payment
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="checkout-card fade-in">
              <h3>Payment Method</h3>
              <p className="step-desc">Choose your preferred payment method</p>

              {paymentMethods.length === 0 ? (
                <div className="account-alert info" style={{ marginBottom: "16px" }}>
                  No payment method is configured right now. Contact admin.
                </div>
              ) : (
                <div className="payment-options">
                  {paymentMethods.map((paymentOption) => (
                    <label className="payment-option" key={paymentOption.code}>
                      <input
                        type="radio"
                        name="payment"
                        checked={method === paymentOption.code}
                        onChange={() => setMethod(paymentOption.code)}
                      />
                      <div className="option-content">
                        <span className="option-title">{paymentOption.displayName}</span>
                        <span className="option-desc">{paymentOption.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {selectedGateway?.mode?.startsWith("manual") && (
                <div className="account-alert info" style={{ marginBottom: "16px" }}>
                  After payment, you will need to enter the UTR / transaction ID. Booking payment will remain pending until verification.
                </div>
              )}

              <button
                type="button"
                className="btn-primary place-order-btn"
                onClick={placeOrder}
                disabled={placingOrder || !selectedGateway}
              >
                {placingOrder
                  ? "Placing Order..."
                  : method !== "cod"
                    ? `Pay & Place Order - Rs ${payableTotal.toFixed(0)}`
                    : `Place Order - Rs ${payableTotal.toFixed(0)}`}
              </button>

              <button type="button" className="btn-outline back-btn" onClick={() => setStep(2)}>
                Back to Details
              </button>
            </div>
          )}
        </div>

        <aside className="checkout-sidebar">
          <div className="summary-sticky">
            <OrderSummary
              cart={cart}
              subtotal={subtotal}
              serviceFee={serviceFee}
              appliedCoupon={appliedCoupon}
              setAppliedCoupon={setAppliedCoupon}
              clearAppliedCoupon={clearAppliedCoupon}
              addToast={addToast}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function OrderSummary({
  cart,
  subtotal,
  serviceFee,
  appliedCoupon,
  setAppliedCoupon,
  clearAppliedCoupon,
  addToast
}) {
  const [couponCode, setCouponCode] = useState("");
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  async function applyCoupon() {
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      addToast("Please enter a coupon code", "warning");
      return;
    }

    try {
      setLoadingCoupon(true);
      const response = await fetchWithApiHint(API_ENDPOINTS.ADMIN.VALIDATE_COUPON, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        const errorData = await parseResponseJson(response);
        throw new Error(errorData?.message || "Invalid coupon code");
      }

      const coupon = await parseResponseJson(response);
      setAppliedCoupon(coupon);
      const discountLabel = coupon.type === "Flat" ? `Rs ${coupon.value}` : `${coupon.value}%`;
      addToast(`Coupon applied! ${discountLabel} discount`, "success");
      setCouponCode("");
    } catch (err) {
      addToast(err.message, "error");
      console.error("Coupon validation error:", err);
    } finally {
      setLoadingCoupon(false);
    }
  }

  function removeCoupon() {
    clearAppliedCoupon();
    setCouponCode("");
    addToast("Coupon removed", "info");
  }

  const discount = parseCouponDiscount(appliedCoupon, subtotal);
  const finalTotal = Math.max(0, subtotal + serviceFee - discount);

  return (
    <div className="order-summary-card">
      <h3>Order Summary</h3>

      <div className="order-items">
        {cart.map((item, index) => (
          <div key={index} className="order-item">
            <span className="item-info">
              <span className="item-name">{item.title}</span>
              <span className="item-qty">x {item.quantity || 1}</span>
            </span>
            <span className="item-price">Rs {(item.price * (item.quantity || 1)).toFixed(0)}</span>
          </div>
        ))}
      </div>

      <div className="summary-divider" />

      <div style={{ marginBottom: "15px", padding: "10px 0" }}>
        {appliedCoupon ? (
          <div
            style={{
              backgroundColor: "#d4edda",
              padding: "8px",
              borderRadius: "4px",
              marginBottom: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <span style={{ fontSize: "0.9em", color: "#155724" }}>
              Coupon: {appliedCoupon.code}
            </span>
            <button
              onClick={removeCoupon}
              style={{
                background: "none",
                border: "none",
                color: "#155724",
                cursor: "pointer",
                fontSize: "0.9em",
                textDecoration: "underline"
              }}
            >
              Remove
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "5px" }}>
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value)}
              style={{
                flex: 1,
                padding: "6px 10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "0.9em"
              }}
            />
            <button
              onClick={applyCoupon}
              disabled={loadingCoupon}
              style={{
                padding: "6px 12px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loadingCoupon ? "not-allowed" : "pointer",
                fontSize: "0.9em",
                opacity: loadingCoupon ? 0.6 : 1
              }}
            >
              {loadingCoupon ? "..." : "Apply"}
            </button>
          </div>
        )}
      </div>

      <div className="price-breakdown">
        <div className="price-row">
          <span>Subtotal</span>
          <span>Rs {subtotal.toFixed(0)}</span>
        </div>
        <div className="price-row">
          <span>Service Fee</span>
          <span>Rs {serviceFee.toFixed(0)}</span>
        </div>
        {discount > 0 && (
          <div className="price-row" style={{ color: "#28a745" }}>
            <span>Discount</span>
            <span>-Rs {discount.toFixed(0)}</span>
          </div>
        )}
      </div>

      <div className="price-row total">
        <span>Total Amount</span>
        <span>Rs {finalTotal.toFixed(0)}</span>
      </div>
    </div>
  );
}
