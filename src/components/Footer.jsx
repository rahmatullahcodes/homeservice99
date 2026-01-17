import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "../context/ToastContext";
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function handleSubscribe(e) {
    e.preventDefault();
    if (!email || !validateEmail(email)) {
      addToast("Enter valid email", 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const list = JSON.parse(localStorage.getItem('newsletter') || '[]');
      if (!list.includes(email)) {
        list.push(email);
        localStorage.setItem('newsletter', JSON.stringify(list));
        addToast('✅ Subscribed!', 'success');
        setEmail("");
      } else {
        addToast('Already subscribed', 'info');
      }
    } catch {
      addToast('Failed', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <footer className="footer">
      {/* Newsletter Banner */}
      <div className="newsletter-banner">
        <div className="newsletter-content">
          <div className="newsletter-text">
            <h3>Subscribe to Our Newsletter</h3>
            <p>Get exclusive deals, tips, and updates delivered to your inbox</p>
          </div>
          <form onSubmit={handleSubscribe} className="newsletter-sub">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="sub-input"
              disabled={submitting}
            />
            <button type="submit" disabled={submitting} className="sub-btn">
              {submitting ? '...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="footer-container">
          {/* About */}
          <div className="footer-section">
            <h4>About Us</h4>
            <Link to="/">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/services">Services</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/contact">Careers</Link>
          </div>

          {/* Services */}
          <div className="footer-section">
            <h4>Services</h4>
            <Link to="/services">All Services</Link>
            <Link to="/services?category=Cleaning">Cleaning</Link>
            <Link to="/services?category=Appliances">Appliances</Link>
            <Link to="/services?category=Electrician">Electrical</Link>
            <Link to="/services?category=Plumber">Plumbing</Link>
          </div>

          {/* Customer */}
          <div className="footer-section">
            <h4>For Customers</h4>
            <Link to="/account">My Account</Link>
            <Link to="/account/bookings">My Bookings</Link>
            <Link to="/account/payments">Payments</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/contact">Support</Link>
          </div>

          {/* Business */}
          <div className="footer-section">
            <h4>For Business</h4>
            <Link to="/vendor-signup">Become a Vendor</Link>
            <Link to="/vendor-login">Vendor Login</Link>
            <Link to="/admin/login">Admin Portal</Link>
            <Link to="/contact">Partnerships</Link>
            <Link to="/contact">Contact Us</Link>
          </div>

          {/* Contact */}
          <div className="footer-section contact-section">
            <h4>Connect With Us</h4>
            <div className="social-icons">
              <a href="https://facebook.com/homeservice99" target="_blank" rel="noopener noreferrer" title="Facebook">
                <Facebook size={18} />
              </a>
              <a href="https://twitter.com/homeservice99" target="_blank" rel="noopener noreferrer" title="Twitter">
                <Twitter size={18} />
              </a>
              <a href="https://instagram.com/homeservice99" target="_blank" rel="noopener noreferrer" title="Instagram">
                <Instagram size={18} />
              </a>
              <a href="https://linkedin.com/company/homeservice99" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                <Linkedin size={18} />
              </a>
            </div>

            <div className="payment-methods">
              <div className="method">✓ Secure Payments</div>
              <div className="method">✓ Verified Vendors</div>
              <div className="method">✓ Money-Back Guarantee</div>
            </div>
          </div>
        </div>

        {/* Statistics Bar */}
        <div className="stats-bar">
          <div className="stat">
            <div className="stat-icon">⭐</div>
            <div className="stat-text">4.8/5 Rating<br/>50K+ Reviews</div>
          </div>
          <div className="stat">
            <div className="stat-icon">🛠️</div>
            <div className="stat-text">100K+ Services<br/>Available</div>
          </div>
          <div className="stat">
            <div className="stat-icon">👥</div>
            <div className="stat-text">50K+ Professionals<br/>Verified</div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <div>
            <p>&copy; {new Date().getFullYear()} HomeService99. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', marginTop: '8px', color: '#64748b' }}>
              <Link to="/privacy-policy" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }}>
                Privacy Policy
              </Link>
              <Link to="/terms-conditions" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }}>
                Terms & Conditions
              </Link>
              <Link to="/disclaimer" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }}>
                Disclaimer
              </Link>
            </div>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <p className="tagline">🇮🇳 Made in India with ❤️</p>
            <button className="btn-scroll-top" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              ⬆️ Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
