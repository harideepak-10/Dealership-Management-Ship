import { useEffect, useState } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3, Bell, Car, CalendarDays, ClipboardList, CreditCard, FileText, Gauge, LogOut, Menu, RotateCcw, Search,
  Settings, ShieldCheck, Truck, UserCog, Users, Wrench, ListChecks, Target,
} from 'lucide-react';
import { Logo } from '../components/ui';
import { brand } from '../config/brand';
import { useDemo } from '../store/DemoStore';

const nav = [
  { group: 'Main', items: [{ to: '/admin', key: 'overview', label: 'Dashboard', icon: Gauge, end: true }] },
  {
    group: 'Sales',
    items: [
      { to: '/admin/leads', key: 'leads', label: 'Leads', icon: Target, badge: 'leads' },
      { to: '/admin/customers', key: 'customers', label: 'Customers', icon: Users },
      { to: '/admin/test-drives', key: 'testdrives', label: 'Test Drives', icon: CalendarDays, badge: 'testDrives' },
      { to: '/admin/quotations', key: 'quotations', label: 'Quotations', icon: FileText },
      { to: '/admin/bookings', key: 'bookings', label: 'Bookings & Delivery', icon: ClipboardList },
    ],
  },
  {
    group: 'Operations',
    items: [
      { to: '/admin/inventory', key: 'inventory', label: 'Inventory', icon: Car },
      { to: '/admin/payments', key: 'payments', label: 'Payments', icon: CreditCard },
      { to: '/admin/deliveries', key: 'bookings', label: 'Deliveries', icon: Truck },
      { to: '/admin/service', key: 'service', label: 'Service & Job Cards', icon: Wrench },
    ],
  },
  {
    group: 'Admin',
    items: [
      { to: '/admin/tasks', key: 'overview', label: 'Tasks', icon: ListChecks },
      { to: '/admin/reports', key: 'reports', label: 'Reports', icon: BarChart3 },
      { to: '/admin/employees', key: 'employees', label: 'Employees & Roles', icon: UserCog },
      { to: '/admin/audit', key: 'employees', label: 'Audit Logs', icon: ShieldCheck },
      { to: '/admin/settings', key: 'employees', label: 'Settings', icon: Settings },
    ],
  },
];

export default function AdminLayout() {
  const { user, can, db, logout, reset, markAllRead } = useDemo();
  const [open, setOpen] = useState(false);
  const [pop, setPop] = useState(false);
  const loc = useLocation();
  const navTo = useNavigate();
  useEffect(() => {
    setOpen(false);
    setPop(false);
    window.scrollTo(0, 0);
  }, [loc.pathname]);

  if (!user) return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />;

  const badges = {
    leads: db.leads.filter((l) => l.status === 'New').length,
    testDrives: db.testDrives.filter((t) => t.status === 'Requested').length,
  };
  const unread = db.notifications.filter((n) => !n.read).length;
  const initials = user.name.split(' ').map((x) => x[0]).join('').slice(0, 2);

  return (
    <div className="admin">
      <aside className={`admin-side ${open ? 'open' : ''}`}>
        <div className="brand">
          <Logo />
          <small>{brand.dealership} · Dealer Management</small>
        </div>
        {nav.map((g) => (
          <div key={g.group}>
            <div className="side-group">{g.group}</div>
            {g.items.map((it) => {
              const Icon = it.icon;
              const allowed = can(it.key);
              return (
                <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => `side-link ${isActive ? 'active' : ''} ${allowed ? '' : 'locked'}`}>
                  <Icon size={17} /> {it.label}
                  {it.badge && badges[it.badge] > 0 && allowed && <span className="count">{badges[it.badge]}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
        <div className="side-foot">
          Concept demo with sample data. <br />
          <Link to="/">← Back to public website</Link>
        </div>
      </aside>

      <div className="admin-main">
        <header className="topbar">
          <button className="icon-btn menu-toggle" onClick={() => setOpen(!open)} aria-label="Menu">
            <Menu size={18} />
          </button>
          <div className="search">
            <Search size={16} />
            <input
              placeholder="Search customers, leads, VIN…"
              onKeyDown={(e) => e.key === 'Enter' && navTo(`/admin/customers?q=${encodeURIComponent(e.target.value)}`)}
            />
          </div>
          <div className="spacer" />
          <button className="abtn reset-btn" onClick={reset} title="Restore the original sample data">
            <RotateCcw size={14} /> <span>Reset demo data</span>
          </button>
          <div style={{ position: 'relative' }}>
            <button className="icon-btn" onClick={() => setPop(!pop)} aria-label="Notifications">
              <Bell size={18} />
              {unread > 0 && <span className="dot" />}
            </button>
            {pop && (
              <div className="notif-pop">
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px 8px', fontSize: 13 }}>
                  <b>Notifications</b>
                  <button className="abtn abtn-xs" onClick={markAllRead}>
                    Mark all read
                  </button>
                </div>
                {db.notifications.slice(0, 6).map((n) => (
                  <div key={n.id} className={`n ${n.read ? '' : 'unread'}`}>
                    <Bell size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      {n.text}
                      <small>{n.when}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="user-chip">
            <div className="avatar">{initials}</div>
            <span>
              <b>{user.name}</b>
              <small>{user.role}</small>
            </span>
          </div>
          <button
            className="icon-btn"
            title="Sign out"
            onClick={() => {
              logout();
              navTo('/admin/login');
            }}
          >
            <LogOut size={16} />
          </button>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
