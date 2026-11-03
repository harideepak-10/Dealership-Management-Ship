import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, MessageCircle, X } from 'lucide-react';
import { Logo } from '../components/ui';
import VehicleImage from '../components/VehicleImage';
import { brand, formatLakh } from '../config/brand';
import { families, models, startingPrice } from '../data/models';

export default function SiteLayout() {
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const [fam, setFam] = useState(families[0]);
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    setOpen(false);
    setMega(false);
  }, [pathname]);
  const famModels = models.filter((m) => m.family === fam);

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
            <button className={`nav-mega-btn ${mega ? 'on' : ''}`} onClick={() => setMega(!mega)} aria-expanded={mega}>
              Models <ChevronDown size={14} />
            </button>
            <NavLink to="/electric">E-Performance</NavLink>
            <NavLink to="/build">Build & Price</NavLink>
            <NavLink to="/service">Service</NavLink>
            <NavLink to="/finance">Finance</NavLink>
            <NavLink to="/offers">Offers</NavLink>
            <NavLink to="/about">Dealership</NavLink>
          </nav>
          <div className="header-actions">
            <Link to="/test-drive" className="btn btn-primary btn-sm">
              Book a Test Drive
            </Link>
            <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {mega && (
          <div className="mega" onMouseLeave={() => setMega(false)}>
            <div className="wrap mega-inner">
              <div className="mega-fams">
                {families.map((f) => (
                  <button key={f} className={f === fam ? 'on' : ''} onMouseEnter={() => setFam(f)} onClick={() => setFam(f)}>
                    {f}
                  </button>
                ))}
                <Link to="/models" className="mega-all">All models →</Link>
                <Link to="/finder" className="mega-all">Help me choose →</Link>
                <Link to="/compare" className="mega-all">Compare models →</Link>
              </div>
              <div className="mega-models">
                {famModels.map((m) => (
                  <Link key={m.slug} to={`/models/${m.slug}`} className="mega-card">
                    <VehicleImage model={m} />
                    <b>{brand.name} {m.name}</b>
                    <small>
                      {m.category} · from {formatLakh(startingPrice(m))}
                    </small>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
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
              <Link to="/finder">Help me choose</Link>
              <Link to="/build">Build & price</Link>
              <Link to="/quote">Request a quotation</Link>
              <Link to="/finance">Finance calculator</Link>
              <Link to="/service">Book a service</Link>
              <Link to="/offers">Offers</Link>
              <Link to="/compare">Compare models</Link>
              <Link to="/contact">Contact</Link>
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
