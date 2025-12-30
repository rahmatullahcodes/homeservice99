import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '20px 0' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#2563eb',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '0',
              marginBottom: '16px'
            }}
          >
            ← Back to Home
          </button>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a', margin: '0' }}>
            Privacy Policy
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          lineHeight: '1.8'
        }}>
          {/* Last Updated */}
          <div style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '32px',
            color: '#1e40af',
            fontSize: '14px'
          }}>
            <strong>Last Updated:</strong> December 29, 2025
          </div>

          {/* Introduction */}
          <p style={{ color: '#374151', fontSize: '16px', marginBottom: '32px' }}>
            This Privacy Policy describes how Home Service99 ("the Company," "we," "us," or "our") 
            collects, uses, and protects the personal information of our customers and users ("you" 
            or "your") when you access and use our services.
          </p>

          {/* Section 1 */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '16px',
              borderBottom: '2px solid #2563eb',
              paddingBottom: '12px'
            }}>
              1. Information We Collect
            </h2>
            <p style={{ color: '#374151', marginBottom: '16px' }}>
              We may collect personal information from you when you use our services, including but not limited to:
            </p>
            <ul style={{
              marginLeft: '20px',
              color: '#374151',
              listStyleType: 'disc',
              lineHeight: '2'
            }}>
              <li><strong>Contact information</strong> such as name, address, email address, and phone number.</li>
              <li><strong>Information about your appliances</strong>, including make, model, and serial number.</li>
              <li><strong>Payment information</strong> such as credit card details (processed securely through third-party payment processors).</li>
              <li><strong>Usage data</strong> such as IP address, browser type, operating system, and other technical information collected automatically when you access our website or mobile application.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '16px',
              borderBottom: '2px solid #2563eb',
              paddingBottom: '12px'
            }}>
              2. How We Use Your Information
            </h2>
            <p style={{ color: '#374151', marginBottom: '16px' }}>
              We may use the personal information we collect for the following purposes:
            </p>
            <ul style={{
              marginLeft: '20px',
              color: '#374151',
              listStyleType: 'disc',
              lineHeight: '2'
            }}>
              <li>To provide and maintain our services, including scheduling appointments, performing repairs, and communicating with you about your service requests.</li>
              <li>To process payments and invoices.</li>
              <li>To send you promotional offers, newsletters, and other marketing communications (you may opt out of marketing communications at any time).</li>
              <li>To improve our services and develop new features and offerings.</li>
              <li>To comply with legal and regulatory requirements.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '16px',
              borderBottom: '2px solid #2563eb',
              paddingBottom: '12px'
            }}>
              3. Information Sharing and Disclosure
            </h2>
            <p style={{ color: '#374151', marginBottom: '16px' }}>
              We may share your personal information with third parties for the following purposes:
            </p>
            <ul style={{
              marginLeft: '20px',
              color: '#374151',
              listStyleType: 'disc',
              lineHeight: '2'
            }}>
              <li>With our service providers and business partners who assist us in providing our services, including technicians, payment processors, and marketing agencies.</li>
              <li>With legal and regulatory authorities as required by law or to protect our rights and property.</li>
              <li>In connection with a merger, acquisition, or sale of assets, in which case your personal information may be transferred to the acquiring entity.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '16px',
              borderBottom: '2px solid #2563eb',
              paddingBottom: '12px'
            }}>
              4. Data Security
            </h2>
            <p style={{ color: '#374151' }}>
              We take reasonable measures to protect the security of your personal information and prevent 
              unauthorized access, disclosure, or alteration. However, please be aware that no method of 
              transmission over the internet or electronic storage is completely secure, and we cannot 
              guarantee absolute security.
            </p>
          </div>

          {/* Section 5 */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '16px',
              borderBottom: '2px solid #2563eb',
              paddingBottom: '12px'
            }}>
              5. Your Rights and Choices
            </h2>
            <p style={{ color: '#374151' }}>
              You have the right to access, correct, or delete your personal information at any time. 
              You may also choose to opt out of receiving marketing communications from us.
            </p>
          </div>

          {/* Section 6 */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '16px',
              borderBottom: '2px solid #2563eb',
              paddingBottom: '12px'
            }}>
              6. Children's Privacy
            </h2>
            <p style={{ color: '#374151' }}>
              Our services are not directed to children under the age of 13, and we do not knowingly 
              collect personal information from children. If you believe that we have inadvertently 
              collected personal information from a child, please contact us immediately.
            </p>
          </div>

          {/* Section 7 */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '16px',
              borderBottom: '2px solid #2563eb',
              paddingBottom: '12px'
            }}>
              7. Changes to This Privacy Policy
            </h2>
            <p style={{ color: '#374151' }}>
              We may update this Privacy Policy from time to time to reflect changes in our practices 
              or applicable laws. We will notify you of any material changes by posting the updated 
              Privacy Policy on our website.
            </p>
          </div>

          {/* Section 8 */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '16px',
              borderBottom: '2px solid #2563eb',
              paddingBottom: '12px'
            }}>
              8. Contact Us
            </h2>
            <p style={{ color: '#374151' }}>
              If you have any questions or concerns about this Privacy Policy or our data practices, 
              please contact us at:
            </p>
            <div style={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '16px'
            }}>
              <p style={{ color: '#0f172a', fontWeight: '600', marginBottom: '8px' }}>
                Home Service99
              </p>
              <p style={{ color: '#374151', margin: '4px 0' }}>
                📞 Phone: <strong>6386158518</strong>
              </p>
              <p style={{ color: '#374151', margin: '4px 0' }}>
                📧 Email: <strong>support@homeservice99.com</strong>
              </p>
              <p style={{ color: '#374151', margin: '4px 0' }}>
                🏢 Address: Sector 62, Noida, UP, India
              </p>
            </div>
          </div>

          {/* Footer Note */}
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '32px',
            color: '#92400e',
            fontSize: '14px'
          }}>
            <strong>⚠️ Important:</strong> This policy is subject to change at any time. We encourage 
            you to review this policy periodically to stay informed about how we protect your information.
          </div>
        </div>
      </div>
    </div>
  );
}
