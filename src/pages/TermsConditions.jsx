import { useNavigate } from "react-router-dom";
import "./PolicyPages.css";

export default function TermsConditions() {
  const navigate = useNavigate();

  return (
    <div className="policy-container">
      <div className="policy-header">
        <h1>⚖️ Terms & Conditions</h1>
        <p className="policy-subtitle">Last Updated: December 26, 2025</p>
      </div>

      <div className="policy-content">
        <section className="policy-section">
          <h2>1️⃣ Agreement</h2>
          <p>
            By accessing and using the services provided by HomeService99 ("the Company"), you agree 
            to be bound by the following terms and conditions. If you do not agree to these terms and 
            conditions, please refrain from using our services.
          </p>
        </section>

        <section className="policy-section">
          <h2>2️⃣ Service Description</h2>
          <p>
            HomeService99 provides professional repair, maintenance, and installation services across 
            multiple categories including but not limited to:
          </p>
          <ul className="services-list">
            <li>🧹 Home Cleaning & Housekeeping</li>
            <li>❄️ AC & Appliances Repair & Maintenance</li>
            <li>⚡ Electrical Work & Installations</li>
            <li>🔧 Plumbing Services</li>
            <li>✨ Salon & Beauty Services</li>
            <li>🎨 Painting & Interior Work</li>
            <li>🔨 Carpentry & Furniture Repair</li>
            <li>🐛 Pest Control Services</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3️⃣ Service Fees</h2>
          <p>
            The fees for our services are determined based on factors such as:
          </p>
          <ul className="services-list">
            <li>The type of service required</li>
            <li>The complexity of the repair/work</li>
            <li>The parts/materials needed</li>
            <li>Service duration and location</li>
          </ul>
          <p>
            <strong>All fees will be communicated to the customer prior to the commencement of the service.</strong> 
            Payment is due upon completion of the service unless otherwise agreed upon in writing.
          </p>
        </section>

        <section className="policy-section">
          <h2>4️⃣ Appointment Scheduling</h2>
          <p>
            Customers can schedule appointments for services through:
          </p>
          <ul className="services-list">
            <li>Our website portal</li>
            <li>Mobile application</li>
            <li>Direct contact with our customer service team</li>
          </ul>
          <p>
            The Company will make every effort to accommodate the customer's preferred date and time; 
            however, appointment availability may vary depending on factors such as technician availability 
            and workload.
          </p>
        </section>

        <section className="policy-section">
          <h2>5️⃣ Cancellation and Rescheduling</h2>
          <div className="policy-box">
            <p>
              <strong>✅ Without Penalty:</strong> Customers may cancel or reschedule appointments 
              without penalty up to 24 hours before the scheduled service time.
            </p>
            <p>
              <strong>⚠️ With Penalty:</strong> Cancellations or rescheduling requests made less than 
              24 hours before the appointment may be subject to a cancellation fee.
            </p>
          </div>
        </section>

        <section className="policy-section">
          <h2>6️⃣ Warranty</h2>
          <p>
            HomeService99 offers a warranty on repairs and installations performed by our technicians. 
            The warranty period and terms will vary depending on:
          </p>
          <ul className="services-list">
            <li>The type of service provided</li>
            <li>The parts used</li>
            <li>Manufacturer guarantees</li>
          </ul>
          <p>
            <strong>Customers are encouraged to review the warranty terms provided at the time of service.</strong>
          </p>
        </section>

        <section className="policy-section">
          <h2>7️⃣ Liability & Indemnification</h2>
          <p>
            HomeService99 shall not be liable for any damages or losses resulting from the use or 
            inability to use our services, including but not limited to:
          </p>
          <ul className="services-list">
            <li>Damages to property</li>
            <li>Loss of data</li>
            <li>Loss of business opportunities</li>
            <li>Indirect or consequential damages</li>
          </ul>
          <p>
            The customer agrees to indemnify and hold harmless HomeService99 and its employees from any 
            claims, damages, or liabilities arising from the use of our services.
          </p>
        </section>

        <section className="policy-section">
          <h2>8️⃣ Privacy Policy</h2>
          <p>
            HomeService99 is committed to protecting the privacy of our customers' personal information. 
            We collect, use, and disclose personal information in accordance with our Privacy Policy, 
            which can be found on our website at <strong>/privacy-policy</strong>.
          </p>
        </section>

        <section className="policy-section">
          <h2>9️⃣ Governing Law</h2>
          <p>
            These terms and conditions shall be governed by and construed in accordance with the laws 
            of India. Any disputes arising under or relating to these terms and conditions shall be 
            resolved through mutual agreement or legal proceedings in Indian courts.
          </p>
        </section>

        <section className="policy-section">
          <h2>🔟 Modifications</h2>
          <p>
            HomeService99 reserves the right to modify these terms and conditions at any time without 
            prior notice. Any changes to these terms and conditions will be posted on our website and 
            will become effective immediately upon posting.
          </p>
          <p>
            <strong>Your continued use of our website and services constitutes your acceptance of the 
            modified terms and conditions.</strong>
          </p>
        </section>

        <section className="policy-section">
          <h2>1️⃣1️⃣ User Responsibilities</h2>
          <p>
            By using HomeService99, you agree to:
          </p>
          <ul className="services-list">
            <li>Provide accurate and truthful information</li>
            <li>Maintain the confidentiality of your account</li>
            <li>Not engage in any unlawful or prohibited activities</li>
            <li>Respect the rights and privacy of service providers</li>
            <li>Not attempt to manipulate pricing or services</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>1️⃣2️⃣ Service Provider Standards</h2>
          <p>
            All service providers on our platform must:
          </p>
          <ul className="services-list">
            <li>Maintain professional behavior and conduct</li>
            <li>Adhere to safety regulations</li>
            <li>Provide quality workmanship</li>
            <li>Respect customer properties and privacy</li>
            <li>Complete services as agreed</li>
          </ul>
        </section>

        <section className="policy-section policy-contact">
          <h3>📞 Contact Us</h3>
          <p>
            If you have any questions or concerns about these terms and conditions, 
            please contact us:
          </p>
          <div className="contact-info">
            <p>📧 <strong>Email:</strong> support@homeservice99.com</p>
            <p>🌐 <strong>Website:</strong> https://www.homeservice99.com</p>
            <p>📱 <strong>App:</strong> HomeService99 Mobile Application</p>
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
