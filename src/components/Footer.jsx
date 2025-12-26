import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "../context/ToastContext";

export default function Footer() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  // Service categories for quick access
  const services = [
    { name: "Cleaning", icon: "🧹", query: "Cleaning" },
    { name: "Appliances", icon: "❄️", query: "Appliances" },
    { name: "Electrician", icon: "⚡", query: "Electrician" },
    { name: "Plumbing", icon: "🔧", query: "Plumber" },
    { name: "Salon", icon: "✨", query: "Beauty" },
    { name: "Painting", icon: "🎨", query: "Painter" },
    { name: "Carpentry", icon: "🔨", query: "Carpenter" },
    { name: "Pest Control", icon: "🐛", query: "Pest Control" }
  ];

  function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function handleSubscribe(e) {
    e.preventDefault();
    if (!email || !validateEmail(email)) {
      addToast("Enter a valid email address", 'warning');
      return;
    }

    setSubmitting(true);

    try {
      const list = JSON.parse(localStorage.getItem('newsletter') || '[]');
      if (list.includes(email)) {
        addToast("You're already subscribed", 'info');
      } else {
        list.push(email);
        localStorage.setItem('newsletter', JSON.stringify(list));
        addToast('✅ Subscribed! Check your inbox for updates.', 'success');
        setEmail("");
      }
    } catch (err) {
      addToast('Subscription failed', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function backToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">

          {/* Company Info */}
          <div className="footer-col">
            <div className="footer-col-title">📱 Company</div>
            <Link to="/" className="footer-link">Home</Link>
            <Link to="/about" className="footer-link">About Us</Link>
            <Link to="/pricing" className="footer-link">Pricing</Link>
            <Link to="/blog" className="footer-link">Blog & Articles</Link>
            <Link to="/contact" className="footer-link">Contact Us</Link>
          </div>

          {/* Browse Services */}
          <div className="footer-col">
            <div className="footer-col-title">🛠️ Services</div>
            <Link to="/services" className="footer-link">All Services</Link>
            <Link to="/services?category=Cleaning" className="footer-link">Home Cleaning</Link>
            <Link to="/services?category=Appliances" className="footer-link">AC & Appliances</Link>
            <Link to="/services?category=Electrician" className="footer-link">Electrician</Link>
            <Link to="/services?category=Plumber" className="footer-link">Plumbing</Link>
          </div>

          {/* For Professionals */}
          <div className="footer-col">
            <div className="footer-col-title">👔 Professionals</div>
            <Link to="/vendor-login" className="footer-link">Login as Professional</Link>
            <Link to="/vendor-signup" className="footer-link">Register as Partner</Link>
            <Link to="/pricing" className="footer-link">Partner Benefits</Link>
            <Link to="/contact" className="footer-link">Support</Link>
          </div>

          {/* Support & Policies */}
          <div className="footer-col">
            <div className="footer-col-title">⚖️ Support</div>
            <Link to="/terms-conditions" className="footer-link">Terms & Conditions</Link>
            <Link to="/privacy-policy" className="footer-link">Privacy Policy</Link>
            <Link to="/cancellation-refund" className="footer-link">Cancellation & Refund</Link>
            <Link to="/disclaimer" className="footer-link">Disclaimer</Link>
          </div>

          {/* Newsletter & Social */}
          <div className="footer-col footer-newsletter">
            <div className="footer-col-title">📧 Get Updates</div>
            <p className="form-note">Subscribe for exclusive offers, tips & latest service updates delivered to your inbox.</p>

            <form onSubmit={handleSubscribe}>
              <div className="footer-input-group">
                <input
                  aria-label="Email for newsletter"
                  className="footer-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="email"
                />
                <button 
                  className="btn-primary" 
                  aria-label="Subscribe" 
                  disabled={submitting}
                  type="submit"
                >
                  {submitting ? '⏳' : '✉️ Subscribe'}
                </button>
              </div>
            </form>

            <div style={{ marginTop: 14 }}>
              <div className="footer-col-title" style={{ marginBottom: 10 }}>Follow Us</div>
              <div className="social-list">
                <a href="https://instagram.com/homeservice99" target="_blank" rel="noreferrer" aria-label="Instagram" className="social-link" title="Instagram">📸</a>
                <a href="https://facebook.com/homeservice99" target="_blank" rel="noreferrer" aria-label="Facebook" className="social-link" title="Facebook">👍</a>
                <a href="https://youtube.com/homeservice99" target="_blank" rel="noreferrer" aria-label="YouTube" className="social-link" title="YouTube">▶️</a>
                <a href="https://linkedin.com/company/homeservice99" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="social-link" title="LinkedIn">💼</a>
                <a href="https://twitter.com/homeservice99" target="_blank" rel="noreferrer" aria-label="Twitter" className="social-link" title="Twitter">𝕏</a>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div className="footer-col-title" style={{ marginBottom: 10 }}>Payment Methods</div>
              <div className="payments">
                <span>💳 Credit/Debit Card</span>
                <span>📱 UPI</span>
                <span>🏦 Net Banking</span>
              </div>
            </div>
          </div>

        </div>

        {/* Quick Service Categories */}
        <div className="footer-divider"></div>
        
        <div className="footer-quick-services">
          <h3 className="footer-quick-title">Quick Service Access</h3>
          <div className="footer-services-grid">
            {services.map(service => (
              <button
                key={service.query}
                className="footer-service-chip"
                onClick={() => navigate(`/services?category=${service.query}`)}
                title={`Browse ${service.name}`}
              >
                <span className="service-chip-icon">{service.icon}</span>
                <span className="service-chip-name">{service.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-divider"></div>
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <span className="copyright">© {new Date().getFullYear()} <strong>HomeService99</strong> · All rights reserved</span>
            <span className="footer-tagline">Trusted by millions for professional home services</span>
          </div>
          <div className="footer-bottom-center">
            <div className="footer-rating">
              <span>⭐ 4.8/5 Rating</span>
              <span>✅ 50K+ Services</span>
              <span>👥 100K+ Professionals</span>
            </div>
          </div>
          <div className="footer-bottom-right">
            <button 
              className="btn-back-to-top" 
              onClick={backToTop} 
              aria-label="Back to top"
              title="Scroll to top"
            >
              ⬆️ Top
            </button>
            <span className="footer-credit">Made in India with ❤️</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
