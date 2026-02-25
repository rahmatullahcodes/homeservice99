import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../config/api";

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("financial");
  const [successMessage, setSuccessMessage] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    platformCommission: 15,
    gstTax: 18,
    payoutCycle: "Weekly",
    minimumPayoutAmount: 500,
    maximumPayoutAmount: 100000,
    maintenanceMode: false,
    vendorSignupEnabled: true,
    userSignupEnabled: true,
    bookingsEnabled: true,
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: true,
    pushNotificationsEnabled: true,
    emailService: "SendGrid",
    emailFromAddress: "noreply@homeservice99.com",
    smsService: "Twilio",
    minBookingAdvanceHours: 2,
    maxBookingAdvanceDays: 90,
    cancellationDeadlineHours: 2,
    cancellationRefundPercentage: 100,
    reviewAllowedDaysAfter: 1,
    minReviewLength: 10,
    maxActiveBookingsPerUser: 10,
    maxActiveListingsPerVendor: 50
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("adminToken");

      if (!token) {
        throw new Error("Admin authentication required");
      }

      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      const response = await fetch(API_ENDPOINTS.SETTINGS.GET_ALL, { headers });

      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }

      const data = await response.json();
      setFormData(data);
      setSettings(data);
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError(err.message);
      setFormData(getMockSettings());
      setSettings(getMockSettings());
    } finally {
      setLoading(false);
    }
  }

  function getMockSettings() {
    return {
      platformCommission: 15,
      gstTax: 18,
      payoutCycle: "Weekly",
      minimumPayoutAmount: 500,
      maximumPayoutAmount: 100000,
      maintenanceMode: false,
      vendorSignupEnabled: true,
      userSignupEnabled: true,
      bookingsEnabled: true,
      emailNotificationsEnabled: true,
      smsNotificationsEnabled: true,
      pushNotificationsEnabled: true,
      emailService: "SendGrid",
      emailFromAddress: "noreply@homeservice99.com",
      smsService: "Twilio",
      minBookingAdvanceHours: 2,
      maxBookingAdvanceDays: 90,
      cancellationDeadlineHours: 2,
      cancellationRefundPercentage: 100,
      reviewAllowedDaysAfter: 1,
      minReviewLength: 10,
      maxActiveBookingsPerUser: 10,
      maxActiveListingsPerVendor: 50
    };
  }

  async function handleSave() {
    try {
      setSaving(true);
      const token = localStorage.getItem("adminToken");

      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      const response = await fetch(API_ENDPOINTS.SETTINGS.UPDATE, {
        method: "PATCH",
        headers,
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Failed to save settings");

      const data = await response.json();
      setSettings(data.data || data);
      setSuccessMessage("Settings saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!confirm("Are you sure? This will reset all settings to defaults.")) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("adminToken");

      const response = await fetch(API_ENDPOINTS.SETTINGS.RESET, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) throw new Error("Failed to reset settings");

      const data = await response.json();
      const defaults = getMockSettings();
      setFormData(defaults);
      setSettings(defaults);
      setSuccessMessage("Settings reset to defaults!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleInputChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div className="admin-settings">
        <div className="admin-page-head">
          <h2>Platform Settings</h2>
          <p className="admin-subtitle">Manage configuration & preferences</p>
        </div>
        <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "financial", label: "💰 Financial", icon: "💰" },
    { id: "platform", label: "⚙️ Platform", icon: "⚙️" },
    { id: "communication", label: "📧 Communication", icon: "📧" },
    { id: "booking", label: "📅 Booking", icon: "📅" },
    { id: "system", label: "🔧 System", icon: "🔧" }
  ];

  return (
    <div className="admin-settings">
      {/* HEADER */}
      <div className="admin-page-head">
        <h2>Platform Settings</h2>
        <p className="admin-subtitle">Manage all platform configurations, pricing & controls</p>
      </div>

      {error && (
        <div style={{
          padding: "12px 16px",
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "8px",
          color: "#cc1818",
          marginBottom: "20px",
          fontSize: "14px"
        }}>
          ⚠️ {error} - Using demo data
        </div>
      )}

      {successMessage && (
        <div style={{
          padding: "12px 16px",
          backgroundColor: "#f0fdf4",
          border: "1px solid #bbeab0",
          borderRadius: "8px",
          color: "#166534",
          marginBottom: "20px",
          fontSize: "14px"
        }}>
          ✅ {successMessage}
        </div>
      )}

      {/* TABS */}
      <div style={{
        display: "flex",
        gap: "8px",
        marginBottom: "24px",
        flexWrap: "wrap",
        borderBottom: "2px solid #e5e7eb"
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "12px 16px",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.id ? "3px solid #4f46e5" : "none",
              color: activeTab === tab.id ? "#4f46e5" : "#6b7280",
              fontSize: "14px",
              fontWeight: activeTab === tab.id ? 700 : 500,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* FINANCIAL SETTINGS */}
      {activeTab === "financial" && (
        <div className="settings-section">
          <h3>Financial Configuration</h3>
          <p className="settings-description">Configure commission, taxes & payout rules</p>

          <div className="settings-grid">
            <div className="setting-card">
              <label>Platform Commission (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.platformCommission}
                onChange={(e) => handleInputChange("platformCommission", parseFloat(e.target.value))}
              />
              <small>Commission taken on each booking (0-100%)</small>
            </div>

            <div className="setting-card">
              <label>GST / Tax (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.gstTax}
                onChange={(e) => handleInputChange("gstTax", parseFloat(e.target.value))}
              />
              <small>Tax applied on each transaction</small>
            </div>

            <div className="setting-card">
              <label>Payout Cycle</label>
              <select
                value={formData.payoutCycle}
                onChange={(e) => handleInputChange("payoutCycle", e.target.value)}
              >
                <option>Daily</option>
                <option>Weekly</option>
                <option>BiWeekly</option>
                <option>Monthly</option>
              </select>
              <small>Frequency of vendor payouts</small>
            </div>

            <div className="setting-card">
              <label>Minimum Payout Amount (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.minimumPayoutAmount}
                onChange={(e) => handleInputChange("minimumPayoutAmount", parseFloat(e.target.value))}
              />
              <small>Minimum balance required for payout</small>
            </div>

            <div className="setting-card">
              <label>Maximum Payout Amount (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.maximumPayoutAmount}
                onChange={(e) => handleInputChange("maximumPayoutAmount", parseFloat(e.target.value))}
              />
              <small>Maximum per payout transaction</small>
            </div>

            <div className="setting-card">
              <label>Cancellation Refund (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.cancellationRefundPercentage}
                onChange={(e) => handleInputChange("cancellationRefundPercentage", parseFloat(e.target.value))}
              />
              <small>Refund percentage for cancellations</small>
            </div>
          </div>
        </div>
      )}

      {/* PLATFORM CONTROLS */}
      {activeTab === "platform" && (
        <div className="settings-section">
          <h3>Platform Controls</h3>
          <p className="settings-description">Enable/disable platform features</p>

          <div className="settings-toggle-grid">
            <div className="toggle-card">
              <div>
                <h4>🚨 Maintenance Mode</h4>
                <p>Restrict platform access for maintenance</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.maintenanceMode}
                  onChange={(e) => handleInputChange("maintenanceMode", e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="toggle-card">
              <div>
                <h4>👤 User Signup</h4>
                <p>Allow new user registrations</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.userSignupEnabled}
                  onChange={(e) => handleInputChange("userSignupEnabled", e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="toggle-card">
              <div>
                <h4>🏢 Vendor Signup</h4>
                <p>Allow new vendor registrations</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.vendorSignupEnabled}
                  onChange={(e) => handleInputChange("vendorSignupEnabled", e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="toggle-card">
              <div>
                <h4>📋 Bookings</h4>
                <p>Allow users to create bookings</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.bookingsEnabled}
                  onChange={(e) => handleInputChange("bookingsEnabled", e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* COMMUNICATION SETTINGS */}
      {activeTab === "communication" && (
        <div className="settings-section">
          <h3>Communication Channels</h3>
          <p className="settings-description">Configure notification channels & services</p>

          <div style={{ marginBottom: "24px" }}>
            <h4 style={{ marginTop: "20px", marginBottom: "12px", color: "#374151" }}>Notification Channels</h4>
            <div className="settings-toggle-grid">
              <div className="toggle-card">
                <div>
                  <h4>✉️ Email</h4>
                  <p>Send email notifications</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={formData.emailNotificationsEnabled}
                    onChange={(e) => handleInputChange("emailNotificationsEnabled", e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-card">
                <div>
                  <h4>📱 SMS</h4>
                  <p>Send SMS notifications</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={formData.smsNotificationsEnabled}
                    onChange={(e) => handleInputChange("smsNotificationsEnabled", e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-card">
                <div>
                  <h4>🔔 Push</h4>
                  <p>Send push notifications</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={formData.pushNotificationsEnabled}
                    onChange={(e) => handleInputChange("pushNotificationsEnabled", e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="settings-grid">
            <div className="setting-card">
              <label>Email Service Provider</label>
              <select
                value={formData.emailService}
                onChange={(e) => handleInputChange("emailService", e.target.value)}
              >
                <option>SendGrid</option>
                <option>Mailgun</option>
                <option>AWS_SES</option>
                <option>SMTP</option>
              </select>
            </div>

            <div className="setting-card">
              <label>Email From Address</label>
              <input
                type="email"
                value={formData.emailFromAddress}
                onChange={(e) => handleInputChange("emailFromAddress", e.target.value)}
              />
            </div>

            <div className="setting-card">
              <label>SMS Service Provider</label>
              <select
                value={formData.smsService}
                onChange={(e) => handleInputChange("smsService", e.target.value)}
              >
                <option>Twilio</option>
                <option>AWS_SNS</option>
                <option>MSG91</option>
                <option>Exotel</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING SETTINGS */}
      {activeTab === "booking" && (
        <div className="settings-section">
          <h3>Booking Configuration</h3>
          <p className="settings-description">Control booking advance time, cancellation & review settings</p>

          <div className="settings-grid">
            <div className="setting-card">
              <label>Min Advance Booking (Hours)</label>
              <input
                type="number"
                min="0"
                value={formData.minBookingAdvanceHours}
                onChange={(e) => handleInputChange("minBookingAdvanceHours", parseFloat(e.target.value))}
              />
              <small>Minimum hours in advance to book</small>
            </div>

            <div className="setting-card">
              <label>Max Advance Booking (Days)</label>
              <input
                type="number"
                min="0"
                value={formData.maxBookingAdvanceDays}
                onChange={(e) => handleInputChange("maxBookingAdvanceDays", parseFloat(e.target.value))}
              />
              <small>Maximum days in advance to book</small>
            </div>

            <div className="setting-card">
              <label>Cancellation Deadline (Hours)</label>
              <input
                type="number"
                min="0"
                value={formData.cancellationDeadlineHours}
                onChange={(e) => handleInputChange("cancellationDeadlineHours", parseFloat(e.target.value))}
              />
              <small>Hours before booking to cancel with refund</small>
            </div>

            <div className="setting-card">
              <label>Review Allowed After (Days)</label>
              <input
                type="number"
                min="0"
                value={formData.reviewAllowedDaysAfter}
                onChange={(e) => handleInputChange("reviewAllowedDaysAfter", parseFloat(e.target.value))}
              />
              <small>Days after booking completion to allow review</small>
            </div>

            <div className="setting-card">
              <label>Min Review Length (Characters)</label>
              <input
                type="number"
                min="0"
                value={formData.minReviewLength}
                onChange={(e) => handleInputChange("minReviewLength", parseFloat(e.target.value))}
              />
              <small>Minimum characters required for review</small>
            </div>

            <div className="setting-card">
              <label>Max Active Bookings Per User</label>
              <input
                type="number"
                min="1"
                value={formData.maxActiveBookingsPerUser}
                onChange={(e) => handleInputChange("maxActiveBookingsPerUser", parseFloat(e.target.value))}
              />
              <small>Maximum concurrent active bookings</small>
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM SETTINGS */}
      {activeTab === "system" && (
        <div className="settings-section">
          <h3>System Configuration</h3>
          <p className="settings-description">Configure system-level constraints & limits</p>

          <div className="settings-grid">
            <div className="setting-card">
              <label>Max Active Listings Per Vendor</label>
              <input
                type="number"
                min="1"
                value={formData.maxActiveListingsPerVendor}
                onChange={(e) => handleInputChange("maxActiveListingsPerVendor", parseFloat(e.target.value))}
              />
              <small>Maximum service listings per vendor</small>
            </div>
          </div>

          <div style={{
            padding: "20px",
            backgroundColor: "#f0f9ff",
            border: "1px solid #bfdbfe",
            borderRadius: "8px",
            marginTop: "20px"
          }}>
            <h4 style={{ marginTop: 0, color: "#1e40af" }}>💡 System Info</h4>
            <ul style={{ margin: "0", paddingLeft: "20px", fontSize: "14px", color: "#374151" }}>
              <li>Settings are cached globally</li>
              <li>Changes take effect immediately</li>
              <li>Admin authentication required to modify</li>
              <li>All changes are logged for audit trail</li>
            </ul>
          </div>
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div style={{
        display: "flex",
        gap: "12px",
        marginTop: "32px",
        padding: "24px",
        backgroundColor: "#f9fafb",
        borderRadius: "8px",
        borderTop: "1px solid #e5e7eb"
      }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            flex: 1,
            padding: "12px 16px",
            backgroundColor: "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.6 : 1,
            transition: "all 0.2s"
          }}
        >
          {saving ? "Saving..." : "💾 Save Settings"}
        </button>
        <button
          onClick={handleReset}
          style={{
            flex: 1,
            padding: "12px 16px",
            backgroundColor: "#f3f4f6",
            color: "#374151",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          🔄 Reset to Defaults
        </button>
      </div>
    </div>
  );
}
