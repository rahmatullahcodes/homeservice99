import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../config/api.js";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    // Validation
    if (!email || !pass) {
      setError("Both email and password are required");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (pass.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_AUTH.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: pass,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid admin credentials");
        setLoading(false);
        return;
      }

      // Store token and admin info
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.admin));
      navigate("/admin");
    } catch (err) {
      setError("Connection error. Please check if backend is running on port 5000.");
      console.error("Admin login error:", err);
      setLoading(false);
    }
  }

  function handleKeyPress(e) {
    if (e.key === "Enter") {
      login();
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "420px"
      }}>
        {/* Main Card */}
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "40px 32px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          animation: "slideUp 0.5s ease-out"
        }}>
          {/* Logo/Header */}
          <div style={{
            textAlign: "center",
            marginBottom: "32px"
          }}>
            <div style={{
              width: "56px",
              height: "56px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: "28px"
            }}>
              🔐
            </div>
            <h1 style={{
              margin: "0 0 8px 0",
              fontSize: "28px",
              fontWeight: "700",
              color: "#111827",
              letterSpacing: "-0.5px"
            }}>
              Admin Login
            </h1>
            <p style={{
              margin: "0",
              fontSize: "14px",
              color: "#6b7280",
              fontWeight: "500"
            }}>
              Access your admin dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: "12px 16px",
              background: "#fee2e2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              marginBottom: "20px",
              animation: "fadeIn 0.3s ease-out"
            }}>
              <p style={{
                margin: "0",
                fontSize: "13px",
                color: "#991b1b",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span>⚠️</span>
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Email Field */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Admin Email
              </label>
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                onKeyPress={handleKeyPress}
                disabled={loading}
                style={{
                  padding: "12px 16px",
                  border: "1.5px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  transition: "all 0.2s ease",
                  outline: "none",
                  background: "#f9fafb",
                  cursor: loading ? "not-allowed" : "text",
                  opacity: loading ? 0.6 : 1
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#667eea";
                  e.target.style.background = "white";
                  e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d1d5db";
                  e.target.style.background = "#f9fafb";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password Field */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Password
              </label>
              <div style={{
                position: "relative",
                display: "flex",
                alignItems: "center"
              }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={pass}
                  onChange={(e) => {
                    setPass(e.target.value);
                    setError("");
                  }}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 16px",
                    border: "1.5px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    transition: "all 0.2s ease",
                    outline: "none",
                    background: "#f9fafb",
                    cursor: loading ? "not-allowed" : "text",
                    opacity: loading ? 0.6 : 1
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.background = "white";
                    e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                    e.target.style.background = "#f9fafb";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  style={{
                    position: "absolute",
                    right: "12px",
                    background: "none",
                    border: "none",
                    fontSize: "18px",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: 0.6,
                    transition: "opacity 0.2s",
                    padding: "4px"
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = "1"}
                  onMouseLeave={(e) => e.target.style.opacity = "0.6"}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={login}
              disabled={loading}
              style={{
                padding: "12px 16px",
                background: loading ? "#d1d5db" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                marginTop: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                height: "44px",
                boxShadow: loading ? "none" : "0 4px 12px rgba(102, 126, 234, 0.4)"
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(102, 126, 234, 0.5)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
                }
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    borderTop: "2px solid white",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite"
                  }} />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>🔓</span>
                  <span>Login to Dashboard</span>
                </>
              )}
            </button>
          </div>

          {/* Footer Note */}
          <p style={{
            textAlign: "center",
            margin: "24px 0 0 0",
            fontSize: "12px",
            color: "#9ca3af",
            lineHeight: "1.6"
          }}>
            Secure admin access required. Unauthorized access attempts are logged.
          </p>
        </div>

        {/* Demo Credentials Note */}
        <div style={{
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          padding: "16px",
          marginTop: "20px",
          border: "1px solid rgba(255, 255, 255, 0.2)"
        }}>
          <p style={{
            margin: "0",
            fontSize: "12px",
            color: "rgba(255, 255, 255, 0.9)",
            fontWeight: "500",
            textAlign: "center"
          }}>
            💡 Demo: Use admin credentials from backend
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Mobile Styles */
        @media (max-width: 480px) {
          body {
            padding: 12px;
          }
        }

        /* Prevent autofill background color */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px white inset !important;
          box-shadow: 0 0 0 30px white inset !important;
        }

        input:-webkit-autofill {
          -webkit-text-fill-color: #111827 !important;
        }
      `}</style>
    </div>
  );
}