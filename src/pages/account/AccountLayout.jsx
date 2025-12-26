import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "../../styles/account.css";

export default function AccountLayout() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('accountSidebarCollapsed') === 'true');
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 980 : false);
  const navRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    try { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('theme', theme); } catch(e){}
  }, [theme]);

  useEffect(() => {
    try { localStorage.setItem('accountSidebarCollapsed', collapsed ? 'true' : 'false'); } catch(e){}
  }, [collapsed]);

  // update isMobile on resize
  useEffect(() => {
    function onResize(){ setIsMobile(window.innerWidth <= 980); }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isMobile, open]);

  // close on Escape when mobile overlay is open
  useEffect(() => {
    function onKey(e){ if (e.key === 'Escape' && isMobile && open) setOpen(false); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobile, open]);

  // focus first link when opening on mobile
  useEffect(() => {
    if (open && isMobile) {
      setTimeout(() => {
        try { navRef.current?.querySelector('a,button')?.focus(); } catch(e){}
      }, 0);
    }
  }, [open, isMobile]);

  function toggleTheme(){ setTheme(t => (t === 'dark' ? 'light' : 'dark')); }

  function logout(){
    localStorage.removeItem('auth');
    navigate('/login');
  }

  return (
    <div className="container account-layout">

      <div className="account-topbar">
        <button
          className="btn-ghost mobile-menu-btn"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-controls="account-sidebar"
          aria-label={open ? 'Close account menu' : 'Open account menu'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>My Account</h2>
        </div>

      </div>

      {/* Mobile overlay */}
      <div className={`account-overlay ${open ? 'visible' : ''}`} onClick={() => setOpen(false)} aria-hidden={!open}></div>

      {/* SIDEBAR */}
      <aside
        id="account-sidebar"
        className={`account-sidebar ${open ? 'open' : ''} ${collapsed && !isMobile ? 'collapsed' : ''}`}
        aria-hidden={isMobile ? !open : false}
        aria-label="Account navigation"
      >
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
              <button
                className="btn-ghost collapse-toggle"
                onClick={() => setCollapsed(c => !c)}
                aria-pressed={collapsed}
                title={collapsed ? 'Expand' : 'Collapse'}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? '➤' : '≡'}
              </button>
            </div>
          </div>

         <nav ref={navRef} className="account-nav" role="navigation" aria-label="Account navigation">

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
