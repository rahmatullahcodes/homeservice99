import { useNavigate } from "react-router-dom";
import "./PolicyPages.css";

export default function CancellationRefund() {
  const navigate = useNavigate();

  return (
    <div className="policy-container">
      <div className="policy-header">
        <h1>💰 Cancellation & Refund Policy</h1>
        <p className="policy-subtitle">Last Updated: January 12, 2024</p>
      </div>

      <div className="policy-content">
        <section className="policy-section">
          <h2>Overview</h2>
          <p>
            At HomeService99.com, we understand that sometimes plans change, and you may need to 
            cancel or reschedule a service. We strive to make the cancellation and refund process 
            as easy and transparent as possible. This policy outlines our cancellation and refund 
            policy for customers and service providers.
          </p>
        </section>

        <section className="policy-section">
          <h2>🛑 Customer Cancellation</h2>
          <p>
            If you need to cancel a service, please do so as soon as possible. You can cancel your 
            booking through your HomeService99.com account or by contacting our customer support team.
          </p>
          
          <div className="policy-box">
            <h4>Cancellation Timeline:</h4>
            <div className="cancellation-list">
              <div className="cancellation-item">
                <span className="check-mark">✅</span>
                <div>
                  <strong>24 hours or more before service:</strong>
                  <p>Full refund</p>
                </div>
              </div>
              <div className="cancellation-item">
                <span className="cross-mark">❌</span>
                <div>
                  <strong>Less than 24 hours before service:</strong>
                  <p>No refund</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="policy-section">
          <h2>👨‍🔧 Service Provider Cancellation</h2>
          <p>
            If a service provider needs to cancel a booking, we will notify you as soon as possible 
            and provide a <strong>full refund</strong>. We will also work with you to reschedule the 
            service at a time that is convenient for you.
          </p>
        </section>

        <section className="policy-section">
          <h2>💳 Refunds Processing</h2>
          <p>
            Refunds will be processed within <strong>7-10 business days</strong> after the cancellation. 
            The refund will be made to the original payment method used to book the service.
          </p>
        </section>

        <section className="policy-section">
          <h2>🚫 No-Show Policy</h2>
          <div className="policy-warning">
            <p>
              <strong>Important:</strong> If you do not show up for a scheduled service, you will 
              <strong> NOT be eligible for a refund</strong>.
            </p>
          </div>
        </section>

        <section className="policy-section">
          <h2>🔄 Rescheduling Policy</h2>
          <p>
            If you need to reschedule a service, please do so as soon as possible. You can reschedule 
            your booking through your HomeService99.com account or by contacting our customer support team.
          </p>
          <p>
            <strong>Note:</strong> Rescheduling is subject to availability and may be subject to 
            additional fees.
          </p>
        </section>

        <section className="policy-section">
          <h2>⚠️ Complaints & Resolution</h2>
          <p>
            If you are not satisfied with the service you received, please contact us immediately. 
            We will work with you to resolve the issue and provide a satisfactory solution.
          </p>
        </section>

        <section className="policy-section">
          <h2>📝 Changes to This Policy</h2>
          <p>
            We may update this cancellation and refund policy from time to time. We will notify you of 
            any changes by posting the new policy on our website. You are advised to review this policy 
            periodically for any changes.
          </p>
        </section>

        <section className="policy-section policy-contact">
          <h3>📞 Contact Us</h3>
          <p>
            If you have any questions or concerns about our cancellation and refund policy, 
            please contact us:
          </p>
          <div className="contact-info">
            <p>📧 <strong>Email:</strong> support@homeservice99.com</p>
            <p>🌐 <strong>Website:</strong> https://www.homeservice99.com</p>
          </div>
        </section>
      </div>

      <div className="policy-footer">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Go Back
        </button>
        <button className="btn-primary" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    </div>
  );
}
