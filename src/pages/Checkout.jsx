import { useCart } from "../context/CartContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

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

      {/* STEP 1 — LOGIN */}
      {step === 1 && (
        <div className="detail-box">
          <h3>Account</h3>
          <p>Please login or signup to continue</p>
          <button className="btn-primary" onClick={goToLogin}>
            Login
          </button>
        </div>
      )}

      {/* STEP 2 — DELIVERY */}
      {step === 2 && (
        <>
          <div className="detail-box">
            <h3>Delivery Details</h3>

            <div className="form-field">
              <label>Full Name</label>
              <input aria-label="Full name" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div className="form-field">
              <label>Phone Number</label>
              <input aria-label="Phone number" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>

            <div className="form-field">
              <label>Full Address</label>
              <textarea aria-label="Full address" placeholder="Full Address" rows="3" value={address} onChange={e => setAddress(e.target.value)} />
            </div>

            <button type="button" className="btn-primary" style={{ marginTop: 10 }} onClick={continueToPayment}>
              Continue to Payment
            </button>
          </div>

          <OrderSummary cart={cart} subtotal={subtotal} serviceFee={serviceFee} total={total} />
        </>
      )}

      {/* STEP 3 — PAYMENT */}
      {step === 3 && (
        <>
          <div className="detail-box">
            <h3>Payment Method</h3>

            <label style={{ display: 'block', marginBottom: 8 }}>
              <input
                type="radio"
                name="payment"
                checked={method === "cod"}
                onChange={() => setMethod("cod")}
              />
              {' '}Cash on Delivery
            </label>

            <label style={{ display: 'block', marginBottom: 8 }}>
              <input
                type="radio"
                name="payment"
                checked={method === "upi"}
                onChange={() => setMethod("upi")}
              />
              {' '}UPI / Card
            </label>

            <button type="button" className="btn-primary" style={{ marginTop: 15 }} onClick={placeOrder}>
              Pay ₹{total}
            </button>
          </div>

          <OrderSummary cart={cart} subtotal={subtotal} serviceFee={serviceFee} total={total} />
        </>
      )}

    </div>
  );
}

/* ============================= */

function OrderSummary({ cart, subtotal, serviceFee, total }) {
  return (
    <div className="detail-box" style={{ marginTop: 20 }}>
      <h3>Order Summary</h3>

      {cart.map((c,i) => (
        <p key={i}>{c.title} x {c.quantity || 1} - ₹{(c.price * (c.quantity || 1)).toFixed(0)}</p>
      ))}

      <hr />
      <p>Subtotal: ₹{subtotal}</p>
      <p>Service Fee: ₹{serviceFee}</p>
      <strong>Total: ₹{total}</strong>
    </div>
  );
}
