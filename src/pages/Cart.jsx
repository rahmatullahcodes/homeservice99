import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { API_ENDPOINTS } from "../config/api";

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
    const localHint =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

    if (localHint) {
      throw new Error("Unable to connect API. Start backend on http://localhost:5000 and keep it running.");
    }
    throw new Error(error?.message || "Unable to connect API endpoint.");
  }
}

export default function Cart() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    appliedCoupon,
    setAppliedCoupon,
    clearAppliedCoupon
  } = useCart();
  const navigate = useNavigate();

  const [coupon, setCoupon] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState({ type: "", text: "" });

  async function applyCoupon() {
    const code = coupon.trim().toUpperCase();
    if (!code) {
      setCouponMessage({ type: "error", text: "Please enter a coupon code" });
      return;
    }

    try {
      setCouponLoading(true);
      setCouponMessage({ type: "", text: "" });

      const response = await fetchWithApiHint(API_ENDPOINTS.ADMIN.VALIDATE_COUPON, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
      });

      const payload = await parseResponseJson(response);
      if (!response.ok) {
        throw new Error(payload?.message || "Invalid coupon code");
      }

      setAppliedCoupon(payload);
      setCouponMessage({ type: "success", text: "Coupon applied successfully" });
      setCoupon("");
    } catch (error) {
      setCouponMessage({ type: "error", text: error.message || "Invalid coupon code" });
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    clearAppliedCoupon();
    setCoupon("");
    setCouponMessage({ type: "info", text: "Coupon removed" });
  }

  const total = cart.reduce((sum, item) => sum + Number(item.price || 0) * (Number(item.quantity) || 1), 0);
  const discount = parseCouponDiscount(appliedCoupon, total);
  const finalTotal = Math.max(total - discount, 0);

  return (
    <div className="container">
      <h1 className="section-title">Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-icon">Cart</div>
          <h2>Your cart is empty</h2>
          <p>No services added yet. Browse our services and add them to your cart.</p>
          <button className="btn-primary" onClick={() => navigate("/services")}>
            Browse Services
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cart.map((service) => (
              <div key={service.id} className="cart-item fade-in">
                <img src={service.image} alt={service.title} className="cart-img" />

                <div className="cart-item-content">
                  <h3>{service.title}</h3>
                  <p className="item-price">Rs {service.price} each</p>

                  <div className="quantity-group">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => updateQuantity(service.id, Math.max((service.quantity || 1) - 1, 1))}
                      aria-label={`Decrease quantity for ${service.title}`}
                    >
                      -
                    </button>
                    <span className="qty-display">{service.quantity || 1}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => updateQuantity(service.id, (service.quantity || 1) + 1)}
                      aria-label={`Increase quantity for ${service.title}`}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="cart-item-actions">
                  <div className="item-total">
                    <span className="label">Total</span>
                    <span className="price">Rs {Number(service.price || 0) * (service.quantity || 1)}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeFromCart(service.id)}
                    aria-label={`Remove ${service.title}`}
                  >
                    X
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="cart-summary-box">
            <div className="summary-card">
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>
                  Subtotal ({cart.length} item{cart.length !== 1 ? "s" : ""})
                </span>
                <span>Rs {total}</span>
              </div>

              {discount > 0 && (
                <div className="summary-row discount">
                  <span>Discount</span>
                  <span>-Rs {discount.toFixed(0)}</span>
                </div>
              )}

              <div className="coupon-section">
                <h4>Apply Coupon</h4>

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
                      type="button"
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
                  <div className="coupon-group">
                    <input
                      type="text"
                      aria-label="Coupon code"
                      className="coupon-input"
                      value={coupon}
                      onChange={(event) => setCoupon(event.target.value)}
                      placeholder="Enter coupon code"
                    />
                    <button
                      type="button"
                      className="btn-apply-coupon"
                      onClick={applyCoupon}
                      disabled={couponLoading}
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                )}

                {couponMessage.type === "error" && <p className="error-msg">X {couponMessage.text}</p>}
                {couponMessage.type === "success" && <p className="success-msg">OK {couponMessage.text}</p>}
              </div>

              <div className="summary-divider"></div>
              <div className="summary-row final-total">
                <span>Final Amount</span>
                <span>Rs {finalTotal.toFixed(0)}</span>
              </div>

              <button className="btn-primary checkout-btn" onClick={() => navigate("/checkout")}>
                Proceed to Checkout
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
