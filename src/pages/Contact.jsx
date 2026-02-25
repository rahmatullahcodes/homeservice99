import { useState } from "react";
import { API_ENDPOINTS } from "../config/api";
import "./Contact.css";

export default function Contact() {
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "General Inquiry",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [contactId, setContactId] = useState(null);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  // Validate form
  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) 
      return "Please enter a valid email";
    if (!formData.message.trim()) return "Message is required";
    if (formData.message.length < 10) return "Message must be at least 10 characters";
    if (formData.message.length > 2000) return "Message cannot exceed 2000 characters";
    return null;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(API_ENDPOINTS.CONTACT.SUBMIT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          userType: "Guest"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit form");
      }

      // Success!
      setSuccess(data.message);
      setContactId(data.contactId);
      setSubmitted(true);
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        category: "General Inquiry",
        message: "",
      });

      // Auto-scroll to success message
      setTimeout(() => {
        document.querySelector(".success-message")?.scrollIntoView({ behavior: "smooth" });
      }, 100);

    } catch (err) {
      console.error("Contact submission error:", err);
      setError(err.message || "Failed to submit form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      {/* HEADER SECTION */}
      <section className="contact-header">
        <div className="header-content fade-in">
          <h1 className="section-title">Get in Touch</h1>
          <p className="header-subtitle">
            We're here to help you with any questions or concerns about our services.
          </p>
        </div>
      </section>

      <div className="contact-container">
        {/* Information Cards */}
        <section className="contact-info-section">
          <div className="info-card slide-up">
            <div className="icon-box">
              <i className="fas fa-phone"></i>
            </div>
            <h3>Customer Support</h3>
            <p><a href="tel:+919999988888">+91 99999 88888</a></p>
            <p className="small-text">Available 24/7 for urgent issues</p>
          </div>

          <div className="info-card slide-up">
            <div className="icon-box">
              <i className="fas fa-envelope"></i>
            </div>
            <h3>Email Us</h3>
            <p><a href="mailto:support@homeservice99.com">support@homeservice99.com</a></p>
            <p className="small-text">Response within 24 hours</p>
          </div>

          <div className="info-card slide-up">
            <div className="icon-box">
              <i className="fas fa-map-marker-alt"></i>
            </div>
            <h3>Office Location</h3>
            <p>Sector 62, Noida</p>
            <p>Uttar Pradesh, India</p>
            <p className="small-text">Mon – Sat: 9 AM – 8 PM</p>
          </div>

          <div className="info-card slide-up">
            <div className="icon-box">
              <i className="fas fa-clock"></i>
            </div>
            <h3>Business Hours</h3>
            <p>Monday – Saturday: 9:00 AM – 8:00 PM</p>
            <p>Sunday: Emergency services only</p>
            <p className="small-text">💬 Chat support available throughout</p>
          </div>
        </section>

        {/* Main Contact Section */}
        <section className="contact-main">
          <div className="contact-form-wrapper slide-up">
            <h2 className="form-title">Send us a Message</h2>
            
            {/* Success Message */}
            {submitted && success && (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <h3>Message Sent Successfully!</h3>
                <p>{success}</p>
                {contactId && (
                  <p className="ticket-info">
                    <strong>Ticket ID:</strong> {contactId}
                  </p>
                )}
                <button 
                  className="btn-secondary"
                  onClick={() => setSubmitted(false)}
                >
                  Send Another Message
                </button>
              </div>
            )}

            {/* Contact Form */}
            {!submitted && (
              <form onSubmit={handleSubmit} className="contact-form">
                {/* Error Alert */}
                {error && (
                  <div className="alert alert-danger">
                    <i className="fas fa-exclamation-circle"></i>
                    {error}
                  </div>
                )}

                {/* Name Field */}
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="form-input"
                    maxLength="100"
                    disabled={loading}
                  />
                </div>

                {/* Email Field */}
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="form-input"
                    disabled={loading}
                  />
                </div>

                {/* Phone Field */}
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX"
                    className="form-input"
                    disabled={loading}
                  />
                </div>

                {/* Category Field */}
                <div className="form-group">
                  <label htmlFor="category" className="form-label">
                    Inquiry Category <span className="required">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-input form-select"
                    disabled={loading}
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Booking Issue">Booking Issue</option>
                    <option value="Payment Issue">Payment Issue</option>
                    <option value="Service Quality">Service Quality</option>
                    <option value="Vendor Issue">Vendor Issue</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Bug Report">Bug Report</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Message Field */}
                <div className="form-group">
                  <label htmlFor="message" className="form-label">
                    Your Message <span className="required">*</span>
                    <span className="char-count">
                      ({formData.message.length}/2000)
                    </span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your issue or inquiry in detail..."
                    className="form-input form-textarea"
                    rows="7"
                    maxLength="2000"
                    disabled={loading}
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn-primary full-width"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span> Sending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i> Send Message
                    </>
                  )}
                </button>

                <p className="form-note">
                  <i className="fas fa-info-circle"></i>
                  Our support team usually responds within 24 hours. For urgent issues, please call us directly.
                </p>
              </form>
            )}
          </div>

          {/* Sidebar - Quick Actions */}
          <div className="contact-sidebar slide-up">
            <div className="quick-actions">
              <h3>Need Immediate Help?</h3>
              
              <div className="action-item">
                <i className="fas fa-phone-volume"></i>
                <div>
                  <p className="action-title">Call Us Now</p>
                  <a href="tel:+919999988888" className="action-link">
                    +91 99999 88888
                  </a>
                </div>
              </div>

              <div className="action-item">
                <i className="fab fa-whatsapp"></i>
                <div>
                  <p className="action-title">WhatsApp Us</p>
                  <a 
                    href="https://wa.me/919999988888" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="action-link"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              </div>

              <div className="action-item">
                <i className="fas fa-video"></i>
                <div>
                  <p className="action-title">Schedule a Call</p>
                  <p className="action-description">Get a callback from our team</p>
                </div>
              </div>
            </div>

            <div className="faq-box">
              <h4>📚 Frequently Asked Questions</h4>
              <ul>
                <li>How do I book a service?</li>
                <li>What are cancellation policies?</li>
                <li>How do refunds work?</li>
                <li>Can I reschedule my booking?</li>
              </ul>
              <button className="btn-secondary full-width">
                View All FAQs
              </button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="contact-cta fade-in">
          <div className="cta-content">
            <h2>Still Can't Find What You're Looking For?</h2>
            <p>Browse our comprehensive knowledge base or chat with our support team</p>
            <div className="cta-buttons">
              <button className="btn-primary">
                <i className="fas fa-book"></i> Visit Knowledge Base
              </button>
              <button className="btn-secondary">
                <i className="fas fa-comments"></i> Start Live Chat
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
