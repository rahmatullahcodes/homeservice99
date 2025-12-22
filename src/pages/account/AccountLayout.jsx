import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function AccountLayout() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('accountSidebarCollapsed') === 'true');
  const navigate = useNavigate();

  useEffect(() => {
    try { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('theme', theme); } catch(e){}
  }, [theme]);

  useEffect(() => {
    try { localStorage.setItem('accountSidebarCollapsed', collapsed ? 'true' : 'false'); } catch(e){}
  }, [collapsed]);

  function toggleTheme(){ setTheme(t => (t === 'dark' ? 'light' : 'dark')); }

  function logout(){
    localStorage.removeItem('auth');
    navigate('/login');
  }

  return (
    <div className="container account-layout">

      <div className="account-topbar">
        <button className="btn-ghost mobile-menu-btn" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label="Open menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>My Account</h2>
        </div>

      </div>

      {/* Mobile overlay */}
      <div className={`account-overlay ${open ? 'visible' : ''}`} onClick={() => setOpen(false)} aria-hidden={!open}></div>

      {/* SIDEBAR */}
      <aside className={`account-sidebar ${open ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`} aria-hidden={!open} aria-label="Account navigation">
        <div className="account-sidebar-inner">

          <div className="account-sidebar-header" style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="logo-circle">HS</div>
              {!collapsed && <div>
                <strong>HomeService99</strong>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Member since 2024</div>
              </div>}
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn-ghost collapse-toggle" onClick={() => setCollapsed(c => !c)} aria-pressed={collapsed} title={collapsed ? 'Expand' : 'Collapse'}>
                {collapsed ? '➤' : '≡'}
              </button>
            </div>
          </div>

         <nav className="account-nav" role="navigation" aria-label="Account navigation">

      <NavLink to="/account/dashboard" title="Dashboard" className={({isActive}) => isActive ? 'active' : ''}>
        <span className="nav-ico">📊</span> <span className="label">Dashboard</span>
      </NavLink>

      <NavLink to="/account/bookings" title="Bookings" className={({isActive}) => isActive ? 'active' : ''}>
        <span className="nav-ico">📅</span> <span className="label">My Bookings</span>
      </NavLink>

      <NavLink to="/account/reviews" title="Reviews" className={({isActive}) => isActive ? 'active' : ''}>
        <span className="nav-ico">⭐</span> <span className="label">Reviews</span>
      </NavLink>

      <NavLink to="/account/payments" title="Payment Methods" className={({isActive}) => isActive ? 'active' : ''}>
        <span className="nav-ico">💳</span> <span className="label">Payment Methods</span>
      </NavLink>

      <NavLink to="/account/wallet" title="Wallet" className={({isActive}) => isActive ? 'active' : ''}>
        <span className="nav-ico">👛</span> <span className="label">Wallet</span>
      </NavLink>

      <NavLink to="/account/referral" title="Referral" className={({isActive}) => isActive ? 'active' : ''}>
        <span className="nav-ico">🔗</span> <span className="label">Referral</span>
      </NavLink>

      <NavLink to="/account/coupons" title="Coupons" className={({isActive}) => isActive ? 'active' : ''}>
        <span className="nav-ico">🎟</span> <span className="label">Coupons</span>
      </NavLink>

      <NavLink to="/account/settings" title="Settings" className={({isActive}) => isActive ? 'active' : ''}>
        <span className="nav-ico">⚙️</span> <span className="label">Settings</span>
      </NavLink>

      <button className="btn-outline logout" onClick={logout} title="Logout">
        <span className="nav-ico">🚪</span><span className="label">Logout</span>
      </button>
    </nav>

        </div>
      </aside>

      {/* CONTENT */}
      <section className="account-content">
        <Outlet />
      </section>
    </div>
  );
}
