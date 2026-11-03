import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, MessageCircle, X } from 'lucide-react';
import { Logo } from '../components/ui';
import { brand } from '../config/brand';
import { models } from '../data/models';

export default function SiteLayout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    setOpen(false);
  }, [pathname]);

  return (
    <div className="site">
      <div className="demo-ribbon">
        {brand.disclaimer} · sample data · <Link to="/admin/login">Open the employee dashboard →</Link>
      </div>
      <header className="site-header">
        <div className="wrap">
          <Link to="/" aria-label={`${brand.name} home`}>
            <Logo />
          </Link>
          <nav className={`site-nav ${open ? 'open' : ''}`}>
            <NavLink to="/models">Models</NavLink>
            <NavLink to="/compare">Compare</NavLink>
            <NavLink to="/offers">Offers</NavLink>
            <NavLink to="/quote">Get a Quote</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </nav>
          <div className="header-actions">
            <Link to="/enquiry" className="btn btn-ghost btn-sm">
              Enquire
            </Link>
            <Link to="/test-drive" className="btn btn-primary btn-sm">
              Book a Test Drive
            </Link>
            <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <Logo />
              <p style={{ marginTop: 16, color: 'var(--muted)', maxWidth: 300 }}>
                {brand.dealership} — {brand.name} sales, test drives and after-sales service in {brand.city}, under one roof.
              </p>
            </div>
            <div>
              <h4>Models</h4>
              {models.map((m) => (
                <Link key={m.slug} to={`/models/${m.slug}`}>
                  {brand.name} {m.name}
                </Link>
              ))}
            </div>
            <div>
              <h4>Shop</h4>
              <Link to="/test-drive">Book a test drive</Link>
              <Link to="/quote">Request a quotation</Link>
              <Link to="/offers">Offers</Link>
              <Link to="/enquiry">Service enquiry</Link>
            </div>
            <div>
              <h4>Showroom</h4>
              <p>{brand.address}</p>
              <p>{brand.phone}</p>
              <p>{brand.email}</p>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 {brand.dealership}. {brand.disclaimer}. Vehicle photos via Unsplash.</span>
            <span>
              <Link to="/privacy">Privacy Policy</Link> · <Link to="/terms">Terms & Conditions</Link>
            </span>
          </div>
        </div>
      </footer>

      <a className="wa-float" href={`https://wa.me/${brand.whatsapp}`} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">
        <MessageCircle size={24} />
      </a>
    </div>
  );
}
