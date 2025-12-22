export default function Pricing() {
  return (
    <div className="container">

      {/* HEADER */}
      <section className="fade-in">
        <h1 className="section-title">Simple, transparent pricing</h1>
        <p className="pricing-subtitle">
          Choose a package that fits your needs. No hidden charges. No surprises.
        </p>
      </section>

      {/* PACKAGE CARDS */}
      <section className="pricing-cards slide-up">

        <div className="pricing-card">
          <h3>Basic Care</h3>
          <p className="price">₹799</p>
          <span className="price-note">per visit</span>

          <ul>
            <li>✔ Light cleaning</li>
            <li>✔ Dusting & mopping</li>
            <li>✔ Standard professionals</li>
            <li>✖ Kitchen deep clean</li>
            <li>✖ Premium support</li>
          </ul>

          <button className="btn-outline">Choose Basic</button>
        </div>

        <div className="pricing-card featured">
          <span className="tag">Most popular</span>
          <h3>Deep Care</h3>
          <p className="price">₹1,999</p>
          <span className="price-note">per visit</span>

          <ul>
            <li>✔ Full home deep cleaning</li>
            <li>✔ Kitchen & bathroom</li>
            <li>✔ Premium professionals</li>
            <li>✔ Chemical-free options</li>
            <li>✔ Priority support</li>
          </ul>

          <button className="btn-primary">Choose Deep Care</button>
        </div>

        <div className="pricing-card">
          <h3>AC Service</h3>
          <p className="price">₹699</p>
          <span className="price-note">per unit</span>

          <ul>
            <li>✔ AC cleaning</li>
            <li>✔ Gas level check</li>
            <li>✔ Electrical inspection</li>
            <li>✖ Spare parts</li>
            <li>✖ Chemical wash</li>
          </ul>

          <button className="btn-outline">Choose AC</button>
        </div>

      </section>

      {/* COMPARISON */}
      <section className="pricing-compare slide-up">
        <h2>Compare plans</h2>

        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Basic</th>
              <th>Deep</th>
              <th>AC</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cleaning coverage</td>
              <td>Basic</td>
              <td>Full home</td>
              <td>Air conditioning</td>
            </tr>
            <tr>
              <td>Bathroom & kitchen</td>
              <td>❌</td>
              <td>✅</td>
              <td>❌</td>
            </tr>
            <tr>
              <td>Response priority</td>
              <td>Standard</td>
              <td>Fast</td>
              <td>Standard</td>
            </tr>
            <tr>
              <td>Customer support</td>
              <td>Email</td>
              <td>Priority</td>
              <td>Email</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* CTA */}
      <section className="pricing-cta fade-in">
        <h2>Still not sure?</h2>
        <p>Contact our team for custom pricing and bulk offers.</p>
        <button className="btn-primary">Talk to pricing expert</button>
      </section>

    </div>
  );
}
