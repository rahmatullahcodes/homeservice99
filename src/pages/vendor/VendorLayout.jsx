import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function VendorLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("vendor");
    navigate("/vendor-login");
  }

  return (
    <div className="vendor-shell">

      {/* MOBILE HEADER */}
      <header className="vendor-mobile-header">
        <button className="vendor-toggle" onClick={() => setOpen(!open)}>☰</button>
        <span>Partner Panel</span>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </header>

      {/* SIDEBAR */}
      <aside className={`vendor-sidebar ${open ? "open" : ""}`}>

        <div className="vendor-header">
          <h3>👨‍🔧 Partner Panel</h3>
        </div>

        <nav className="vendor-links">

          <NavLink to="/vendor" end>📊 Dashboard</NavLink>
          <NavLink to="/vendor/bookings">📋 Bookings</NavLink>
          <NavLink to="/vendor/services">🧰 My Services</NavLink>
          <NavLink to="/vendor/earnings">💰 Earnings</NavLink>
          <NavLink to="/vendor/wallet">👛 Wallet</NavLink>
          <NavLink to="/vendor/transactions">🧾 Transactions</NavLink>
          <NavLink to="/vendor/reviews">⭐ Reviews</NavLink>
          <NavLink to="/vendor/profile">⚙ Profile</NavLink>

        </nav>

        <button className="vendor-logout" onClick={logout}>
          Logout
        </button>

      </aside>

      {/* OVERLAY FOR MOBILE */}
      {open && <div className="vendor-overlay" onClick={() => setOpen(false)}></div>}

      {/* CONTENT */}
      <main className="vendor-content">
        <Outlet />
      </main>

    </div>
  );
}
