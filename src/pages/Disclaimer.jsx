import { useNavigate } from "react-router-dom";
import "./PolicyPages.css";

export default function Disclaimer() {
  const navigate = useNavigate();

  return (
    <div className="policy-container">
      <div className="policy-header">
        <h1>📋 Disclaimer</h1>
        <p className="policy-subtitle">Last Updated: December 26, 2025</p>
      </div>

      <div className="policy-content">
        <section className="policy-section">
          <h2>Disclaimer for HomeService99</h2>
          <p>
            If you require any more information or have any questions about our site's disclaimer, 
            please feel free to contact us by email at <strong>support@homeservice99.com</strong>.
          </p>
        </section>

        <section className="policy-section">
          <h2>📌 Disclaimers for HomeService99</h2>
          <div className="policy-text">
            <p>
              All the information on this website – <strong>https://www.homeservice99.com/</strong> – 
              is published in good faith and for general information purpose only. HomeService99 does 
              not make any warranties about the completeness, reliability and accuracy of this information.
            </p>

            <p>
              <strong>Any action you take upon the information you find on this website 
              (HomeService99), is strictly at your own risk.</strong> HomeService99 will not be liable 
              for any losses and/or damages in connection with the use of our website.
            </p>

            <p>
              From our website, you can visit other websites by following hyperlinks to such external sites. 
              While we strive to provide only quality links to useful and ethical websites, we have no control 
              over the content and nature of these sites. These links to other websites do not imply a 
              recommendation for all the content found on these sites.
            </p>

            <p>
              Site owners and content may change without notice and may occur before we have the opportunity 
              to remove a link which may have gone 'bad'.
            </p>

            <p>
              Please be also aware that when you leave our website, other sites may have different privacy 
              policies and terms which are beyond our control. Please be sure to check the Privacy Policies 
              of these sites as well as their "Terms of Service" before engaging in any business or uploading 
              any information.
            </p>
          </div>
        </section>

        <section className="policy-section">
          <h2>✅ Consent</h2>
          <p>
            By using our website, you hereby consent to our disclaimer and agree to its terms.
          </p>
        </section>

        <section className="policy-section">
          <h2>🔄 Updates to This Disclaimer</h2>
          <p>
            Should we update, amend or make any changes to this document, those changes will be 
            prominently posted here. We recommend reviewing this disclaimer periodically for any changes.
          </p>
        </section>

        <section className="policy-section policy-contact">
          <h3>❓ Questions?</h3>
          <p>
            If you have any questions about our disclaimer, please contact us:
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
