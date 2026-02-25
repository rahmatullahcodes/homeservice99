import { useCart } from "../context/CartContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem("auth") === "true";

  const [step, setStep] = useState(isLoggedIn ? 2 : 1);
  const { addToast } = useToast();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [method, setMethod] = useState("cod");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const subtotal = cart.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0);
  const serviceFee = 49;
  const total = subtotal + serviceFee;

  function goToLogin() {
    navigate("/login");
  }

  function continueToPayment() {
    if (!name || !phone || !address) {
      addToast("Fill all delivery details", 'warning');
      return;
    }
    setStep(3);
  }

  function placeOrder() {
    // clear cart and navigate to home with success message
    clearCart();
    addToast("Order placed successfully ✅\nYour cart has been cleared.", 'success');
    navigate("/");
  }

  return (
    <div className="container">
      <h1 className="section-title">Checkout</h1>

      {/* Checkout Progress */}
      <div className="checkout-progress">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
          <span className="step-num">1</span>
          <span>Account</span>
        </div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
          <span className="step-num">2</span>
          <span>Details</span>
        </div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
          <span className="step-num">3</span>
          <span>Payment</span>
        </div>
      </div>

      <div className="checkout-layout">
        
        {/* Main Content */}
        <div className="checkout-main">

          {/* STEP 1 — LOGIN */}
          {step === 1 && (
            <div className="checkout-card fade-in">
              <h3>Account</h3>
              <p className="step-desc">Please login or signup to continue with checkout</p>
              <div className="login-actions">
                <button className="btn-primary" onClick={goToLogin}>
                  🔑 Login
                </button>
                <button className="btn-outline" onClick={() => navigate('/signup')}>
                  📝 Signup
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 — DELIVERY */}
          {step === 2 && (
            <div className="checkout-card fade-in">
              <h3>📍 Delivery Details</h3>

              <form className="form-grid">
                <div className="form-field">
                  <label htmlFor="name">Full Name</label>
                  <input 
                    id="name"
                    type="text"
                    aria-label="Full name" 
                    placeholder="John Doe" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
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
                    onChange={e => setPhone(e.target.value)} 
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
                    onChange={e => setAddress(e.target.value)} 
                  />
                </div>
              </form>

              <button 
                type="button" 
                className="btn-primary continue-btn" 
                onClick={continueToPayment}
              >
                Continue to Payment →
              </button>
            </div>
          )}

          {/* STEP 3 — PAYMENT */}
          {step === 3 && (
            <div className="checkout-card fade-in">
              <h3>💳 Payment Method</h3>
              <p className="step-desc">Choose your preferred payment method</p>

              <div className="payment-options">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    checked={method === "cod"}
                    onChange={() => setMethod("cod")}
                  />
                  <div className="option-content">
                    <span className="option-title">Cash on Delivery</span>
                    <span className="option-desc">Pay when service is delivered</span>
                  </div>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    checked={method === "upi"}
                    onChange={() => setMethod("upi")}
                  />
                  <div className="option-content">
                    <span className="option-title">UPI / Card</span>
                    <span className="option-desc">Secure online payment</span>
                  </div>
                </label>
              </div>

              <button 
                type="button" 
                className="btn-primary place-order-btn" 
                onClick={placeOrder}
              >
                Place Order • ₹{total}
              </button>

              <button 
                type="button" 
                className="btn-outline back-btn" 
                onClick={() => setStep(2)}
              >
                ← Back to Details
              </button>
            </div>
          )}

        </div>

        {/* Order Summary Sidebar */}
        <aside className="checkout-sidebar">
          <div className="summary-sticky">
            <OrderSummary 
              cart={cart} 
              subtotal={subtotal} 
              serviceFee={serviceFee} 
              total={total}
              appliedCoupon={appliedCoupon}
              setAppliedCoupon={setAppliedCoupon}
              addToast={addToast}
              apiBaseUrl={API_BASE_URL}
            />
          </div>
        </aside>

      </div>

    </div>
  );
}

/* ============================= */

function OrderSummary({ cart, subtotal, serviceFee, total, appliedCoupon, setAppliedCoupon, addToast, apiBaseUrl }) {
  const [couponCode, setCouponCode] = useState("");
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  async function applyCoupon() {
    if (!couponCode.trim()) {
      addToast("Please enter a coupon code", "warning");
      return;
    }

    try {
      setLoadingCoupon(true);
      const response = await fetch(`${apiBaseUrl}/admin/validate-coupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code: couponCode })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Invalid coupon code");
      }

      const coupon = await response.json();
      setAppliedCoupon(coupon);
      addToast(`Coupon applied! ${coupon.type === "Flat" ? `₹${coupon.value}` : `${coupon.value}%`} discount`, "success");
      setCouponCode("");
    } catch (err) {
      addToast(err.message, "error");
      console.error("Coupon validation error:", err);
    } finally {
      setLoadingCoupon(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
    addToast("Coupon removed", "info");
  }

  // Calculate discount
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "Flat") {
      discount = appliedCoupon.value;
    } else if (appliedCoupon.type === "Percent") {
      discount = (subtotal * appliedCoupon.value) / 100;
    }
  }

  const finalTotal = subtotal + serviceFee - discount;

  return (
    <div className="order-summary-card">
      <h3>📦 Order Summary</h3>

      <div className="order-items">
        {cart.map((c, i) => (
          <div key={i} className="order-item">
            <span className="item-info">
              <span className="item-name">{c.title}</span>
              <span className="item-qty">x {c.quantity || 1}</span>
            </span>
            <span className="item-price">₹{(c.price * (c.quantity || 1)).toFixed(0)}</span>
          </div>
        ))}
      </div>

      <div className="summary-divider"></div>

      {/* Coupon Section */}
      <div style={{ marginBottom: "15px", padding: "10px 0" }}>
        {appliedCoupon ? (
          <div style={{ 
            backgroundColor: "#d4edda", 
            padding: "8px", 
            borderRadius: "4px", 
            marginBottom: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span style={{ fontSize: "0.9em", color: "#155724" }}>
              ✓ Coupon: {appliedCoupon.code}
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
              onChange={e => setCouponCode(e.target.value)}
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
          <span>₹{subtotal}</span>
        </div>
        <div className="price-row">
          <span>Service Fee</span>
          <span>₹{serviceFee}</span>
        </div>
        {discount > 0 && (
          <div className="price-row" style={{ color: "#28a745" }}>
            <span>Discount</span>
            <span>-₹{discount.toFixed(0)}</span>
          </div>
        )}
      </div>

      <div className="price-row total">
        <span>Total Amount</span>
        <span>₹{finalTotal.toFixed(0)}</span>
      </div>
    </div>
  );
}
