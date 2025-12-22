import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "../context/ToastContext";

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
        addToast('Subscribed! We will send updates to your inbox.', 'success');
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

          {/* Company */}
          <div className="footer-col">
            <div className="footer-col-title">Company</div>
            <Link to="/about" className="footer-link">About Us</Link>
            <Link to="/careers" className="footer-link">Careers</Link>
            <Link to="/team" className="footer-link">Our Team</Link>
            <Link to="/blog" className="footer-link">Blog</Link>
            <Link to="/press" className="footer-link">Press</Link>
          </div>

          {/* Services */}
          <div className="footer-col">
            <div className="footer-col-title">Popular Services</div>
            <Link to="/services?category=Cleaning" className="footer-link">Home Cleaning</Link>
            <Link to="/services?category=Appliances" className="footer-link">AC & Appliances</Link>
            <Link to="/services?category=Electrician" className="footer-link">Electrician</Link>
            <Link to="/services?category=Plumber" className="footer-link">Plumbing</Link>
            <Link to="/services?category=Beauty" className="footer-link">Salon & Beauty</Link>
          </div>

          {/* For Professionals */}
          <div className="footer-col">
            <div className="footer-col-title">For Professionals</div>
            <Link to="/vendor-login" className="footer-link">Register as a professional</Link>
            <Link to="/vendor-signup" className="footer-link">Become a partner</Link>
          </div>

          {/* Support */}
          <div className="footer-col">
            <div className="footer-col-title">Support</div>
            <Link to="/help" className="footer-link">Help Center</Link>
            <Link to="/terms" className="footer-link">Terms & Conditions</Link>
            <Link to="/privacy-policy" className="footer-link">Privacy Policy</Link>
            <Link to="/refund-policy" className="footer-link">Refund Policy</Link>
            <Link to="/complaint-policy" className="footer-link">Complaint Policy</Link>
          </div>

          {/* Newsletter + Social */}
          <div className="footer-col footer-newsletter">
            <div className="footer-col-title">Stay updated</div>
            <p className="form-note">Subscribe for offers, tips and service updates.</p>

            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                aria-label="Email for newsletter"
                className="footer-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <button className="btn-primary" aria-label="Subscribe" disabled={submitting}>
                {submitting ? '…' : 'Subscribe'}
              </button>
            </form>

            <div style={{ marginTop: 12 }}>
              <div className="footer-col-title" style={{ marginBottom: 8 }}>Follow us</div>
              <div className="social-list">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="social-link">📸</a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="social-link">👍</a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" className="social-link">▶️</a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="social-link">💼</a>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div className="footer-col-title" style={{ marginBottom: 8 }}>We accept</div>
              <div className="payments" aria-hidden="true">💳 UPI • Card • Netbanking</div>
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} HomeService99. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn-outline" onClick={backToTop} aria-label="Back to top">Back to top</button>
            <span className="muted">Built with ❤️ in India · UI only</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
