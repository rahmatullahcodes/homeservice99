import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../config/api";

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
          token: token ? `✅ Present (${token.slice(0, 20)}...)` : "❌ Missing",
          adminUser: adminUser ? `✅ Present` : "❌ Missing",
        },
        apiEndpoints: {
          baseUrl: API_ENDPOINTS.ADMIN?.GET_DASHBOARD?.replace("/dashboard", ""),
          dashboard: API_ENDPOINTS.ADMIN?.GET_DASHBOARD,
          bookings: API_ENDPOINTS.ADMIN?.GET_BOOKINGS,
          payments: API_ENDPOINTS.ADMIN?.GET_PAYMENTS,
        },
        backend: { status: "Testing..." }
      };

      // Test health
      try {
        const healthResponse = await fetch("http://localhost:5000/api/health");
        if (healthResponse.ok) {
          diagnosticsData.backend.status = "✅ Running";
        } else {
          diagnosticsData.backend.status = "❌ Error";
        }
      } catch (err) {
        diagnosticsData.backend.status = "❌ Not reachable";
      }

      // Test dashboard if token exists
      if (token) {
        try {
          const dashResponse = await fetch(API_ENDPOINTS.ADMIN.GET_DASHBOARD, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          diagnosticsData.backend.dashboardAPI = dashResponse.ok ? "✅ Working" : `❌ ${dashResponse.status}`;
        } catch (err) {
          diagnosticsData.backend.dashboardAPI = "❌ " + err.message;
        }
      }

      setDiagnostics(diagnosticsData);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Running diagnostics...</div>;
  }

  return (
    <div style={{ padding: "40px", fontFamily: "monospace", fontSize: "13px" }}>
      <h2>Admin Diagnostics</h2>
      
      <div style={{ background: "#f5f5f5", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
        <h3>localStorage</h3>
        <pre style={{ margin: 0 }}>{JSON.stringify(diagnostics?.localStorage, null, 2)}</pre>
      </div>

      <div style={{ background: "#f5f5f5", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
        <h3>API Endpoints</h3>
        <pre style={{ margin: 0 }}>{JSON.stringify(diagnostics?.apiEndpoints, null, 2)}</pre>
      </div>

      <div style={{ background: "#f5f5f5", padding: "20px", borderRadius: "8px" }}>
        <h3>Backend Status</h3>
        <pre style={{ margin: 0 }}>{JSON.stringify(diagnostics?.backend, null, 2)}</pre>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={runDiagnostics} style={{ padding: "10px 20px" }}>Re-run Diagnostics</button>
        <button onClick={() => window.location.href = "/admin"} style={{ padding: "10px 20px", marginLeft: "10px" }}>Back to Dashboard</button>
      </div>
    </div>
  );
}
