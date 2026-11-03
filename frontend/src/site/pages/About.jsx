import { Link } from 'react-router-dom';
import { Award, Car, Wrench, Users } from 'lucide-react';
import { brand } from '../../config/brand';

const pillars = [
  { icon: Car, title: 'Showroom', text: 'The full current line-up on display, with dedicated consultation lounges and a configurator studio.' },
  { icon: Wrench, title: 'Service centre', text: 'Factory-trained technicians, genuine parts, EV battery diagnostics and pick-up & drop for owners.' },
  { icon: Users, title: 'Sales consultants', text: 'A named consultant from first enquiry to delivery day, and beyond.' },
  { icon: Award, title: 'Handover', text: 'A private delivery bay where your car is presented and every feature walked through.' },
];

export default function About() {
  return (
    <>
      <section className="section">
        <div className="wrap split">
          <div>
            <span className="eyebrow">The dealership</span>
            <h1 className="h1">{brand.dealership}</h1>
            <p className="muted-p" style={{ marginTop: 16 }}>
              Sales, test drives, finance and after-sales service for {brand.name} owners in {brand.city}. One team looks after you — from your first question to every service visit after delivery.
            </p>
            <div className="hero-cta">
              <Link to="/test-drive" className="btn btn-primary">Book a test drive</Link>
              <Link to="/contact" className="btn btn-ghost">Contact & directions</Link>
            </div>
          </div>
          <div className="stat-panel">
            <div><small>Address</small><b style={{ fontSize: 16 }}>{brand.address}</b></div>
            {brand.hours.map((h) => (
              <div key={h.day}><small>{h.day}</small><b>{h.time}</b></div>
            ))}
            <div><small>Phone</small><b>{brand.phone}</b></div>
          </div>
        </div>
      </section>
      <section className="section section-alt">
        <div className="wrap">
          <div className="quick four">
            {pillars.map((p) => (
              <div className="quick-item" key={p.title}>
                <span className="ico"><p.icon size={22} /></span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
