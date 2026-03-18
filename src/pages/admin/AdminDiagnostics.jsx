import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../../config/api";

function getAuthPreview(token) {
  if (!token) return "Missing";
  if (token.length <= 16) return token;
  return `${token.slice(0, 12)}...${token.slice(-4)}`;
}

export default function AdminDiagnostics() {
  const [diagnostics, setDiagnostics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runDiagnostics();
  }, []);

  async function runDiagnostics() {
    try {
      setLoading(true);

      const token = localStorage.getItem("adminToken");
      const adminUser = localStorage.getItem("adminUser");
      const diagnosticsData = {
        timestamp: new Date().toISOString(),
        localStorage: {
          adminToken: token ? `Present (${getAuthPreview(token)})` : "Missing",
          adminUser: adminUser ? "Present" : "Missing"
        },
        apiEndpoints: {
          dashboard: API_ENDPOINTS.ADMIN.GET_DASHBOARD,
          bookings: API_ENDPOINTS.ADMIN.GET_BOOKINGS,
          payments: API_ENDPOINTS.ADMIN.GET_PAYMENTS,
          paymentMethods: API_ENDPOINTS.PAYMENT_GATEWAYS.ADMIN_GET
        },
        backend: {
          health: "Checking...",
          dashboardAPI: token ? "Checking..." : "Skipped (No token)"
        }
      };

      const healthUrl = API_ENDPOINTS.ADMIN.GET_DASHBOARD.replace("/admin/dashboard", "/health");

      try {
        const healthResponse = await fetch(healthUrl);
        diagnosticsData.backend.health = healthResponse.ok ? "Running" : `Error (${healthResponse.status})`;
      } catch (error) {
        diagnosticsData.backend.health = `Not reachable (${error.message})`;
      }

      if (token) {
        try {
          const dashboardResponse = await fetch(API_ENDPOINTS.ADMIN.GET_DASHBOARD, {
            headers: { Authorization: `Bearer ${token}` }
          });
          diagnosticsData.backend.dashboardAPI = dashboardResponse.ok
            ? "Working"
            : `Failed (${dashboardResponse.status})`;
        } catch (error) {
          diagnosticsData.backend.dashboardAPI = `Error (${error.message})`;
        }
      }

      setDiagnostics(diagnosticsData);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page-head">
          <h2>Diagnostics</h2>
          <p className="admin-subtitle">Running platform checks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h2>Diagnostics</h2>
        <p className="admin-subtitle">Quick health checks for admin auth and backend routes</p>
      </div>

      <div className="admin-section">
        <div className="admin-table card-mobile">
          <div className="table-row head">
            <span>Check</span>
            <span>Value</span>
            <span>Check</span>
            <span>Value</span>
          </div>
          <div className="table-row">
            <span data-label="Check">Timestamp</span>
            <span data-label="Value">{diagnostics?.timestamp || "-"}</span>
            <span data-label="Check">Backend Health</span>
            <span data-label="Value">{diagnostics?.backend?.health || "-"}</span>
          </div>
          <div className="table-row">
            <span data-label="Check">Admin Token</span>
            <span data-label="Value">{diagnostics?.localStorage?.adminToken || "-"}</span>
            <span data-label="Check">Dashboard API</span>
            <span data-label="Value">{diagnostics?.backend?.dashboardAPI || "-"}</span>
          </div>
          <div className="table-row">
            <span data-label="Check">Dashboard Endpoint</span>
            <span data-label="Value">{diagnostics?.apiEndpoints?.dashboard || "-"}</span>
            <span data-label="Check">Payment Methods Endpoint</span>
            <span data-label="Value">{diagnostics?.apiEndpoints?.paymentMethods || "-"}</span>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <button className="btn-sm" onClick={runDiagnostics}>Re-run Diagnostics</button>
        <button className="btn-sm outline" onClick={() => window.location.assign("/admin")}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
