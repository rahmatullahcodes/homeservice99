export default function Compare() {
  return (
    <div className="container">
      <h1 className="section-title">Compare Services</h1>

      <table className="pricing-compare">
        <tbody>
          <tr>
            <th>Feature</th>
            <th>Cleaning</th>
            <th>AC</th>
            <th>Electrician</th>
          </tr>

          <tr><td>Warranty</td><td>48 hours</td><td>30 days</td><td>15 days</td></tr>
          <tr><td>Time</td><td>4 hrs</td><td>1 hr</td><td>30 min</td></tr>
          <tr><td>Materials</td><td>Included</td><td>Extra</td><td>Extra</td></tr>
          <tr><td>Support</td><td>Priority</td><td>Normal</td><td>Normal</td></tr>
        </tbody>
      </table>
    </div>
  );
}
