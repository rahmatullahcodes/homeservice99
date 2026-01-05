import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/vendor-signup.css";

export default function VendorSignup() {

  const navigate = useNavigate();
  const [phone, setPhone] = useState("");

  function handleWhatsAppRedirect() {
    // Redirect to company's WhatsApp number
    const companyWhatsApp = "918969361100"; // HomeService99 WhatsApp number
    const message = encodeURIComponent("Hi! I'm interested in joining HomeService99 as a service professional. Please share more details about the partnership program.");
    
    // Open WhatsApp with company number
    window.open(`https://wa.me/${companyWhatsApp}?text=${message}`, "_blank");
  }

  return (
    <div className="vendor-signup-container">
      {/* HEADER */}
      {/* <header className="vendor-header">
        <div className="vendor-header-content">
          <div className="vendor-logo">HS</div>
          <nav className="vendor-nav">
            <a href="/">Book a service</a>
            <a href="/about">About us</a>
            <div className="location-selector">
              🇮🇳 Delhi NCR <span>▼</span>
            </div>
          </nav>
        </div>
      </header> */}

      {/* HERO SECTION */}
      <section className="vendor-hero">
        <div className="vendor-hero-content">
          <div className="vendor-hero-text">
            <h1 className="vendor-hero-title">
              Earn More. Earn Respect.<br/>Safety Ensured.
            </h1>
            <p className="vendor-hero-subtitle">
              Join 50,000+ service professionals* across India, KSA, Singapore, UAE
            </p>
          </div>
          
          <div className="vendor-hero-image">
            <div className="hero-image-placeholder">
              <div className="professional-icon">👨‍🔧</div>
              <div className="professional-icon">👩‍💼</div>
            </div>
          </div>
        </div>
      </section>

      {/* WHATSAPP CTA BANNER */}
      <section className="vendor-whatsapp-banner">
        <div className="banner-content">
          <h2>Share your WhatsApp number and we'll reach out via our WhatsApp Business Account.</h2>
          
          <div className="whatsapp-input-group">
            <input
              type="tel"
              placeholder="Enter your WhatsApp number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="whatsapp-input"
            />
            <button 
              onClick={handleWhatsAppRedirect}
              className="btn-whatsapp"
            >
              ✓ Continue
            </button>
          </div>
        </div>
      </section>

      {/* INFO SECTION */}
      <section className="vendor-info-section">
        <h2 className="vendor-section-title">Join HomeService99 to change your life</h2>
        <p className="vendor-section-description">
          HomeService99 is an app-based marketplace that empowers professionals like you to earn more, build trust, and ensure your safety.
        </p>

        <div className="vendor-benefits">
          <div className="benefit-card">
            <div className="benefit-icon">💰</div>
            <h3>Earn More</h3>
            <p>Get consistent bookings and grow your income</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">🛡️</div>
            <h3>Safety Ensured</h3>
            <p>Verified customers and secure payment system</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">⭐</div>
            <h3>Build Respect</h3>
            <p>Professional profile and customer reviews</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">📱</div>
            <h3>Easy to Use</h3>
            <p>Simple app interface for managing bookings</p>
          </div>
        </div>
      </section>

      {/* FOOTER NOTE */}
      <section className="vendor-footer-note">
        <p>*Based on active service professionals on HomeService99 platform</p>
        <p className="vendor-login-link">
          Already a partner? <Link to="/vendor-login">Login here</Link>
        </p>
      </section>
    </div>
  );
}
