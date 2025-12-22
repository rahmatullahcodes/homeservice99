export default function Compare() {
  const features = [
    { name: "Warranty", cleaning: "48 hours", ac: "30 days", electrician: "15 days" },
    { name: "Duration", cleaning: "4–5 hrs", ac: "60–90 min", electrician: "30–60 min" },
    { name: "Materials", cleaning: "Included", ac: "Extra", electrician: "Extra" },
    { name: "Support", cleaning: "Priority", ac: "Normal", electrician: "Normal" },
    { name: "Cost", cleaning: "₹1,999", ac: "₹699", electrician: "₹249" },
    { name: "Minimum Booking", cleaning: "1–3 BHK", ac: "All models", electrician: "All types" }
  ];

  return (
    <div className="container">
      <section className="compare-header fade-in">
        <h1 className="section-title">Compare Services</h1>
        <p className="compare-subtitle">Choose the right service for your needs</p>
      </section>

      {/* Desktop Table View */}
      <div className="compare-desktop">
        <table className="compare-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>🧹 Cleaning</th>
              <th>❄️ AC Service</th>
              <th>⚡ Electrician</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, i) => (
              <tr key={i} className={i % 2 === 0 ? 'even' : 'odd'}>
                <td className="feature-name">{feature.name}</td>
                <td>{feature.cleaning}</td>
                <td>{feature.ac}</td>
                <td>{feature.electrician}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="compare-mobile">
        <div className="compare-card service-card-compare fade-in">
          <div className="service-header">
            <span className="service-icon">🧹</span>
            <h3>Cleaning Service</h3>
          </div>
          <div className="service-details">
            {features.map((feature, i) => (
              <div key={i} className="detail-row">
                <span className="detail-label">{feature.name}</span>
                <span className="detail-value">{feature.cleaning}</span>
              </div>
            ))}
          </div>
          <button className="btn-primary" style={{ width: '100%', marginTop: 12 }}>
            Book Service
          </button>
        </div>

        <div className="compare-card service-card-compare fade-in">
          <div className="service-header">
            <span className="service-icon">❄️</span>
            <h3>AC Service</h3>
          </div>
          <div className="service-details">
            {features.map((feature, i) => (
              <div key={i} className="detail-row">
                <span className="detail-label">{feature.name}</span>
                <span className="detail-value">{feature.ac}</span>
              </div>
            ))}
          </div>
          <button className="btn-primary" style={{ width: '100%', marginTop: 12 }}>
            Book Service
          </button>
        </div>

        <div className="compare-card service-card-compare fade-in">
          <div className="service-header">
            <span className="service-icon">⚡</span>
            <h3>Electrician</h3>
          </div>
          <div className="service-details">
            {features.map((feature, i) => (
              <div key={i} className="detail-row">
                <span className="detail-label">{feature.name}</span>
                <span className="detail-value">{feature.electrician}</span>
              </div>
            ))}
          </div>
          <button className="btn-primary" style={{ width: '100%', marginTop: 12 }}>
            Book Service
          </button>
        </div>
      </div>
    </div>
  );
}
