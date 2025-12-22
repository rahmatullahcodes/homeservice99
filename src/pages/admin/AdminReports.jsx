import { useState } from "react";

export default function AdminReports() {

  const [range, setRange] = useState("month");

  const reportData = {
    today: { revenue: 12400, bookings: 18, vendors: 6 },
    week: { revenue: 68200, bookings: 92, vendors: 21 },
    month: { revenue: 245000, bookings: 512, vendors: 38 }
  };

  const current = reportData[range];

  const services = [
    { name: "AC Repair", bookings: 180, revenue: 89000 },
    { name: "Cleaning", bookings: 220, revenue: 112000 },
    { name: "Plumbing", bookings: 112, revenue: 44000 }
  ];

  return (
    <div className="admin-reports">

      {/* HEADER */}
      <div className="admin-page-head">
        <h2>Reports</h2>
        <p className="admin-subtitle">
          Analytics & performance insights
        </p>
      </div>

      {/* FILTER */}
      <div className="report-filter">
        <label>Time Range:</label>
        <select value={range} onChange={e => setRange(e.target.value)}>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">This Month</option>
        </select>

        <button className="btn-outline">Export CSV</button>
      </div>

      {/* KPI CARDS */}
      <div className="grid-3">
        <div className="detail-box">
          <strong>Total Revenue</strong>
          <h3>₹{current.revenue}</h3>
        </div>

        <div className="detail-box">
          <strong>Total Bookings</strong>
          <h3>{current.bookings}</h3>
        </div>

        <div className="detail-box">
          <strong>Active Vendors</strong>
          <h3>{current.vendors}</h3>
        </div>
      </div>

      {/* SERVICE BREAKDOWN */}
      <section style={{ marginTop: 20 }}>
        <h3>Service Performance</h3>

        <div className="admin-table">
          <div className="table-row head">
            <span>Service</span>
            <span>Bookings</span>
            <span>Revenue</span>
          </div>

          {services.map(s => (
            <div className="table-row" key={s.name}>
              <span>{s.name}</span>
              <span>{s.bookings}</span>
              <span>₹{s.revenue}</span>
            </div>
          ))}
        </div>
      </section>

      {/* TOP VENDORS */}
      <section style={{ marginTop: 20 }}>
        <h3>Top Vendors</h3>

        <div className="detail-box">
          <strong>AC Experts</strong>
          <p>Bookings: 84 • Revenue: ₹48,000</p>
        </div>

        <div className="detail-box">
          <strong>CleanPro</strong>
          <p>Bookings: 76 • Revenue: ₹52,000</p>
        </div>
      </section>

    </div>
  );
}
