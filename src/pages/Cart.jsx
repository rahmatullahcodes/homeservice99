import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function Cart() {

  const { cart, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState("");

  function applyCoupon() {
    const code = coupon.trim().toUpperCase();

    if (code === "SAVE50") {
      setDiscount(50);
      setError("");
    }
    else if (code === "FIRST100") {
      setDiscount(100);
      setError("");
    }
    else {
      setDiscount(0);
      setError("Invalid coupon code");
    }
  }

  const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const finalTotal = Math.max(total - discount, 0);

  return (
    <div className="container">

      <h1 className="section-title">Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>No services added yet. Browse our services and add them to your cart.</p>
          <button className="btn-primary" onClick={() => navigate('/services')}>
            Browse Services
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          
          {/* Cart Items List */}
          <div className="cart-items">
            {cart.map((s) => (
              <div key={s.id} className="cart-item fade-in">
                <img src={s.image} alt={s.title} className="cart-img" />
                
                <div className="cart-item-content">
                  <h3>{s.title}</h3>
                  <p className="item-price">₹{s.price} each</p>

                  {/* Quantity Controls */}
                  <div className="quantity-group">
                    <button 
                      type="button" 
                      className="qty-btn" 
                      onClick={() => updateQuantity(s.id, Math.max((s.quantity || 1) - 1, 1))}
                      aria-label={`Decrease quantity for ${s.title}`}
                    >
                      −
                    </button>
                    <span className="qty-display">{s.quantity || 1}</span>
                    <button 
                      type="button" 
                      className="qty-btn" 
                      onClick={() => updateQuantity(s.id, (s.quantity || 1) + 1)}
                      aria-label={`Increase quantity for ${s.title}`}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Item Total & Remove */}
                <div className="cart-item-actions">
                  <div className="item-total">
                    <span className="label">Total</span>
                    <span className="price">₹{s.price * (s.quantity || 1)}</span>
                  </div>
                  <button 
                    type="button" 
                    className="btn-remove" 
                    onClick={() => removeFromCart(s.id)}
                    aria-label={`Remove ${s.title}`}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Sidebar */}
          <aside className="cart-summary-box">
            <div className="summary-card">
              <h2>Order Summary</h2>

              {/* Subtotal */}
              <div className="summary-row">
                <span>Subtotal ({cart.length} item{cart.length !== 1 ? 's' : ''})</span>
                <span>₹{total}</span>
              </div>

              {/* Discount */}
              {discount > 0 && (
                <div className="summary-row discount">
                  <span>Discount</span>
                  <span>−₹{discount}</span>
                </div>
              )}

              {/* Coupon Section */}
              <div className="coupon-section">
                <h4>Apply Coupon</h4>
                <div className="coupon-group">
                  <input
                    type="text"
                    aria-label="Coupon code"
                    className="coupon-input"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="SAVE50, FIRST100"
                  />
                  <button type="button" className="btn-apply-coupon" onClick={applyCoupon}>
                    Apply
                  </button>
                </div>

                {error && <p className="error-msg">❌ {error}</p>}
                {discount > 0 && <p className="success-msg">✅ Coupon applied!</p>}
              </div>

              {/* Final Total */}
              <div className="summary-divider"></div>
              <div className="summary-row final-total">
                <span>Final Amount</span>
                <span>₹{finalTotal}</span>
              </div>

              {/* CTA */}
              <button
                className="btn-primary checkout-btn"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>

              {/* <button
                className="btn-outline continue-shopping"
                onClick={() => navigate('/services')}
              >
                Continue Shopping
              </button> */}
            </div>
          </aside>

        </div>
      )}

    </div>
  );
}
