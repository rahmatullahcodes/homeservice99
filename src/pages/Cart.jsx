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

      <h1 className="section-title">Your Cart</h1>

      {cart.length === 0 && <p>No services added yet.</p>}

      {cart.map((s) => (
        <div key={s.id} className="cart-item">
          <img src={s.image} alt={s.title} className="cart-img" />
          <div style={{ flex: 1 }}>
            <strong>{s.title}</strong>
            <p>₹{s.price} each</p>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
              <button type="button" className="btn-outline" onClick={() => updateQuantity(s.id, (s.quantity || 1) - 1)} aria-label={`Decrease quantity for ${s.title}`}>-</button>
              <div style={{ minWidth: 36, textAlign: 'center' }}>{s.quantity || 1}</div>
              <button type="button" className="btn-outline" onClick={() => updateQuantity(s.id, (s.quantity || 1) + 1)} aria-label={`Increase quantity for ${s.title}`}>+</button>

              <button type="button" className="btn-outline" onClick={() => removeFromCart(s.id)} aria-label={`Remove ${s.title}`} style={{ marginLeft: 'auto' }}>
                Remove
              </button>
            </div>

          </div>
        </div>
      ))}

      {cart.length > 0 && (
        <div style={{ marginTop: 20 }}>

          <h3>Apply Coupon</h3>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
            <input
              aria-label="Coupon code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Enter coupon code"
            />

            <button type="button" className="btn-primary" onClick={applyCoupon}>
              Apply
            </button>
          </div>

          {error && <p style={{ color: "red", marginTop: 6 }}>{error}</p>}
          {discount > 0 && <p style={{ color: "green" }}>Coupon applied successfully ✅</p>}

          <h3 style={{ marginTop: 10 }}>Total: ₹{total}</h3>
          <h3>Discount: ₹{discount}</h3>
          <h2>Final Amount: ₹{finalTotal}</h2>

          <button
            className="btn-primary"
            style={{ width: "100%", marginTop: 10 }}
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout
          </button>

        </div>
      )}

    </div>
  );
}
