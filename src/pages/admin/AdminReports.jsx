import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../config/api";
import { BOOKING_STATUS_COLORS } from "../../data/adminReportsData";

export default function AdminReports() {
  const [range, setRange] = useState("month");
  const [dashStats, setDashStats] = useState(null);
  const [servicePerf, setServicePerf] = useState([]);
  const [topVendors, setTopVendors] = useState([]);
  const [categoryPerf, setCategoryPerf] = useState([]);
  const [bookingStatus, setBookingStatus] = useState([]);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Fetch all reports data
  useEffect(() => {
    fetchAllReports();
  }, [range]);

  async function fetchAllReports() {
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

      const response = await fetch(`${API_ENDPOINTS.REPORTS.COMPLETE_REPORT}?range=${range}`, { headers });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || payload.message || `Failed to fetch reports (${response.status})`);
      }

      setDashStats(payload?.stats || null);
      setServicePerf(Array.isArray(payload?.services) ? payload.services : []);
      setTopVendors(Array.isArray(payload?.vendors) ? payload.vendors.slice(0, 8) : []);
      setCategoryPerf(Array.isArray(payload?.categories) ? payload.categories : []);
      setBookingStatus(Array.isArray(payload?.bookingStatus) ? payload.bookingStatus : []);
      setUserAnalytics(payload?.userAnalytics || null);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError(err.message);
      setDashStats(null);
      setServicePerf([]);
      setTopVendors([]);
      setCategoryPerf([]);
      setBookingStatus([]);
      setUserAnalytics(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleExportCSV() {
    try {
      setExporting(true);
      const token = localStorage.getItem("adminToken");

      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      const response = await fetch(`${API_ENDPOINTS.REPORTS.COMPLETE_REPORT}?range=${range}`, { headers });
      if (!response.ok) throw new Error("Export failed");

      const data = await response.json();
      const csv = generateCSV(data);
      downloadCSV(csv, `reports-${range}-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (err) {
      alert("Export failed: " + err.message);
    } finally {
      setExporting(false);
    }
  }

  function generateCSV(data) {
    let csv = "Home Service Reports\n";
    csv += `Generated: ${new Date().toLocaleString()}\n`;
    csv += `Period: ${range}\n\n`;

    if (data.stats) {
      csv += "DASHBOARD STATISTICS\n";
      csv += `Total Revenue,₹${data.stats.totalRevenue}\n`;
      csv += `Total Bookings,${data.stats.totalBookings}\n`;
      csv += `Completed Bookings,${data.stats.completedBookings}\n`;
      csv += `Active Vendors,${data.stats.activeVendors}\n`;
      csv += `New Users,${data.stats.newUsers}\n`;
      csv += `Conversion Rate,${data.stats.conversionRate}%\n\n`;
    }

    if (data.services && data.services.length > 0) {
      csv += "SERVICE PERFORMANCE\n";
      csv += "Service,Category,Bookings,Revenue,Avg Rating,Reviews\n";
      data.services.forEach(s => {
        csv += `${s.serviceName || 'N/A'},${s.category || 'N/A'},${s.totalBookings},₹${s.totalRevenue},${s.averageRating},${s.totalReviews}\n`;
      });
      csv += "\n";
    }

    if (data.vendors && data.vendors.length > 0) {
      csv += "TOP VENDORS\n";
      csv += "Vendor,Bookings,Revenue,Rating,Reviews\n";
      data.vendors.forEach(v => {
        csv += `${v.vendorName},${v.totalBookings},₹${v.totalRevenue},${v.rating},${v.totalReviews}\n`;
      });
    }

    return csv;
  }

  function downloadCSV(csv, filename) {
    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    link.download = filename;
    link.click();
  }
  if (loading) {
    return (
      <div className="admin-reports">
        <div className="admin-page-head">
          <h2>Reports</h2>
          <p className="admin-subtitle">Analytics & performance insights</p>
        </div>
        <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-reports">
      {/* HEADER */}
      <div className="admin-page-head">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
          <div>
            <h2 style={{ marginBottom: "6px" }}>Reports & Analytics</h2>
            <p className="admin-subtitle">Comprehensive business intelligence & performance metrics</p>
          </div>
          <button 
            className="btn-primary" 
            onClick={handleExportCSV}
            disabled={exporting}
            style={{ whiteSpace: "nowrap" }}
          >
            {exporting ? "Exporting..." : "📥 Export CSV"}
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE */}
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
          {error}
        </div>
      )}

      {/* TIME RANGE FILTER */}
      <div style={{
        display: "flex",
        gap: "12px",
        marginBottom: "24px",
        flexWrap: "wrap",
        alignItems: "center"
      }}>
        <label style={{ fontWeight: 600, color: "#374151" }}>Time Range:</label>
        <select 
          value={range} 
          onChange={e => setRange(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
            cursor: "pointer",
            backgroundColor: "#ffffff",
            color: "#374151"
          }}
        >
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* KPI CARDS - Dashboard Stats */}
      {dashStats && (
        <div className="grid-4-reports">
          <div className="report-kpi-card">
            <div className="kpi-icon" style={{ backgroundColor: "#dbeafe" }}>💰</div>
            <p className="kpi-label">Total Revenue</p>
            <h3 className="kpi-value">₹{dashStats.totalRevenue?.toLocaleString()}</h3>
            <p className="kpi-meta">from {dashStats.totalBookings} bookings</p>
          </div>

          <div className="report-kpi-card">
            <div className="kpi-icon" style={{ backgroundColor: "#dbeafe" }}>📋</div>
            <p className="kpi-label">Total Bookings</p>
            <h3 className="kpi-value">{dashStats.totalBookings}</h3>
            <p className="kpi-meta">{dashStats.completedBookings} completed</p>
          </div>

          <div className="report-kpi-card">
            <div className="kpi-icon" style={{ backgroundColor: "#dcfce7" }}>🏪</div>
            <p className="kpi-label">Active Vendors</p>
            <h3 className="kpi-value">{dashStats.activeVendors}</h3>
            <p className="kpi-meta">Partner merchants</p>
          </div>

          <div className="report-kpi-card">
            <div className="kpi-icon" style={{ backgroundColor: "#fef3c7" }}>👥</div>
            <p className="kpi-label">New Users</p>
            <h3 className="kpi-value">{dashStats.newUsers}</h3>
            <p className="kpi-meta">{dashStats.conversionRate}% conversion</p>
          </div>
        </div>
      )}

      {/* SERVICE PERFORMANCE & BOOKING STATUS - Two Column */}
      <div className="grid-2-reports">
        {/* Service Performance */}
        <section className="report-section">
          <h3 style={{ marginBottom: "16px", color: "#1f2937", fontSize: "18px", fontWeight: 600 }}>
            🏢 Service Performance
          </h3>
          <div className="report-table">
            <div className="report-table-header">
              <span style={{ flex: 2 }}>Service</span>
              <span>Bookings</span>
              <span>Revenue</span>
              <span>Rating</span>
            </div>
            {servicePerf.length > 0 ? (
              servicePerf.slice(0, 8).map((s, i) => (
                <div key={i} className="report-table-row">
                  <span style={{ flex: 2, fontWeight: 500 }}>{s.serviceName || "N/A"}</span>
                  <span>{s.totalBookings}</span>
                  <span style={{ fontWeight: 600, color: "#059669" }}>₹{s.totalRevenue?.toLocaleString()}</span>
                  <span>⭐ {s.averageRating}</span>
                </div>
              ))
            ) : (
              <div className="report-table-row">
                <span>No data available</span>
              </div>
            )}
          </div>
        </section>

        {/* Booking Status Breakdown */}
        <section className="report-section">
          <h3 style={{ marginBottom: "16px", color: "#1f2937", fontSize: "18px", fontWeight: 600 }}>
            ✅ Booking Status Breakdown
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {bookingStatus.length > 0 ? (
              bookingStatus.map((item, i) => {
                const percentage = dashStats?.totalBookings ? (item.count / dashStats.totalBookings * 100).toFixed(1) : 0;
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontWeight: 500, color: "#374151" }}>{item.status}</span>
                      <span style={{ fontSize: "14px", color: "#666" }}>{item.count} ({percentage}%)</span>
                    </div>
                    <div style={{
                      width: "100%",
                      height: "8px",
                      backgroundColor: "#e5e7eb",
                      borderRadius: "4px",
                      overflow: "hidden"
                    }}>
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: "100%",
                          backgroundColor: BOOKING_STATUS_COLORS[item.status] || "#6b7280"
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: "#999" }}>No data available</p>
            )}
          </div>
        </section>
      </div>

      {/* TOP VENDORS & USER ANALYTICS - Two Column */}
      <div className="grid-2-reports">
        {/* Top Vendors */}
        <section className="report-section">
          <h3 style={{ marginBottom: "16px", color: "#1f2937", fontSize: "18px", fontWeight: 600 }}>
            🌟 Top Vendors
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {topVendors.length > 0 ? (
              topVendors.slice(0, 6).map((vendor, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px 14px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: "4px", color: "#1f2937" }}>
                      #{i + 1} {vendor.vendorName}
                    </p>
                    <p style={{ fontSize: "13px", color: "#666" }}>
                      ⭐ {vendor.rating} • {vendor.totalBookings} bookings
                    </p>
                  </div>
                  <div style={{ textAlign: "right", fontWeight: 600, color: "#059669" }}>
                    ₹{vendor.totalRevenue?.toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: "#999" }}>No data available</p>
            )}
          </div>
        </section>

        {/* User Analytics */}
        <section className="report-section">
          <h3 style={{ marginBottom: "16px", color: "#1f2937", fontSize: "18px", fontWeight: 600 }}>
            👥 User Analytics
          </h3>
          {userAnalytics ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{
                padding: "14px",
                backgroundColor: "#eff6ff",
                borderRadius: "8px",
                borderLeft: "4px solid #3b82f6"
              }}>
                <p style={{ fontSize: "13px", color: "#666", marginBottom: "4px" }}>Total Users</p>
                <h4 style={{ fontSize: "24px", fontWeight: 700, color: "#1f2937" }}>
                  {userAnalytics.totalUsers?.toLocaleString()}
                </h4>
              </div>
              <div style={{
                padding: "14px",
                backgroundColor: "#f0fdf4",
                borderRadius: "8px",
                borderLeft: "4px solid #10b981"
              }}>
                <p style={{ fontSize: "13px", color: "#666", marginBottom: "4px" }}>Active Users</p>
                <h4 style={{ fontSize: "24px", fontWeight: 700, color: "#1f2937" }}>
                  {userAnalytics.activeUsers?.toLocaleString()}
                </h4>
              </div>
              <div style={{
                padding: "14px",
                backgroundColor: "#fef3c7",
                borderRadius: "8px",
                borderLeft: "4px solid #f59e0b"
              }}>
                <p style={{ fontSize: "13px", color: "#666", marginBottom: "4px" }}>New Users (Period)</p>
                <h4 style={{ fontSize: "24px", fontWeight: 700, color: "#1f2937" }}>
                  {userAnalytics.newUsers?.toLocaleString()}
                </h4>
              </div>
            </div>
          ) : (
            <p style={{ color: "#999" }}>No data available</p>
          )}
        </section>
      </div>

      {/* CATEGORY PERFORMANCE - Full Width */}
      <section className="report-section" style={{ marginTop: "24px" }}>
        <h3 style={{ marginBottom: "16px", color: "#1f2937", fontSize: "18px", fontWeight: 600 }}>
          📊 Category Performance
        </h3>
        <div className="report-table">
          <div className="report-table-header">
            <span style={{ flex: 2 }}>Category</span>
            <span>Bookings</span>
            <span>Revenue</span>
            <span>Avg Rating</span>
          </div>
          {categoryPerf.length > 0 ? (
            categoryPerf.map((cat, i) => (
              <div key={i} className="report-table-row">
                <span style={{ flex: 2, fontWeight: 500 }}>{cat.category}</span>
                <span>{cat.bookings}</span>
                <span style={{ fontWeight: 600, color: "#059669" }}>₹{cat.revenue?.toLocaleString()}</span>
                <span>⭐ {cat.rating}</span>
              </div>
            ))
          ) : (
            <div className="report-table-row">
              <span>No data available</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}


