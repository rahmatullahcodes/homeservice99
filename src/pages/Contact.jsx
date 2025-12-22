export default function Contact() {
  return (
    <div className="container">

      {/* HEADER */}
      <section className="contact-header fade-in">
        <h1 className="section-title">Contact Home Service99</h1>
        <p>We're here to help you with bookings, services, and support.</p>
      </section>

      <section className="contact-layout">

        {/* LEFT INFO PANEL */}
        <div className="contact-info slide-up">

          <div className="contact-box">
            <strong>Customer Support</strong>
            <p>Email: support@homeservice99.com</p>
            <p>Phone: +91 99999 88888</p>
          </div>

          <div className="contact-box">
            <strong>Office Address</strong>
            <p>
              Home Service99 Pvt Ltd<br />
              Sector 62, Noida<br />
              Uttar Pradesh, India
            </p>
          </div>

          <div className="contact-box">
            <strong>Business Hours</strong>
            <p>Mon – Sat: 9:00 AM – 8:00 PM</p>
            <p>Sunday: Emergency services only</p>
          </div>

          <div className="contact-map">
            Map view (coming soon)
          </div>

        </div>

        {/* RIGHT FORM PANEL */}
        <div className="contact-form slide-up">

          <h2>Send us a message</h2>

          <div className="form-field">
            <label>Name</label>
            <input placeholder="Your full name" />
          </div>

          <div className="form-field">
            <label>Email</label>
            <input placeholder="you@example.com" />
          </div>

          <div className="form-field">
            <label>Message</label>
            <textarea rows={5} placeholder="Describe your issue or enquiry..." />
          </div>

          <button className="btn-primary full">
            Submit request
          </button>

          <div className="form-note">
            Our support team usually responds within 24 hours.
          </div>

        </div>

      </section>

      {/* CTA */}
      <section className="contact-cta fade-in">
        <h2>Need urgent help?</h2>
        <p>Call our support team or chat with us on WhatsApp.</p>
        <button className="btn-primary">Request a call back</button>
      </section>

    </div>
  );
}
