import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck, FileText, MapPin, Phone, Wrench } from 'lucide-react';
import CarArt from '../../components/CarArt';
import ModelCard from '../ModelCard';
import { brand } from '../../config/brand';
import { categories, getModel, models, offers } from '../../data/models';

export default function Home() {
  const hero = getModel('terra');
  const [colour, setColour] = useState(hero.colours[0]);
  const [cat, setCat] = useState('All');
  const list = cat === 'All' ? models : models.filter((m) => m.category === cat);
  const volt = getModel('volt');

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div>
            <span className="eyebrow">New · {brand.name} Terra</span>
            <h1>{brand.tagline}</h1>
            <p className="lead">{hero.description}</p>
            <div className="hero-cta">
              <Link to="/test-drive?model=Terra" className="btn btn-primary">
                Book a Test Drive
              </Link>
              <Link to="/models/terra" className="btn btn-ghost">
                Explore Terra <ArrowRight size={16} />
              </Link>
            </div>
            <div className="hero-stats">
              <div>
                <b>175 PS</b>
                <span>2.0L turbo diesel</span>
              </div>
              <div>
                <b>AWD</b>
                <span>with terrain modes</span>
              </div>
              <div>
                <b>210 mm</b>
                <span>ground clearance</span>
              </div>
            </div>
          </div>
          <div>
            <CarArt className="hero-car" shape="suv" color={colour.hex} />
            <div className="swatches">
              {hero.colours.map((c) => (
                <button
                  key={c.name}
                  className={`swatch ${c.name === colour.name ? 'on' : ''}`}
                  style={{ background: c.hex }}
                  onClick={() => setColour(c)}
                  aria-label={c.name}
                  title={c.name}
                />
              ))}
            </div>
            <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, marginTop: 8 }}>{colour.name}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">The line-up</span>
              <h2>Find your {brand.name}</h2>
            </div>
            <div className="chips">
              {['All', ...categories].map((c) => (
                <button key={c} className={`chip ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="grid-models">
            {list.map((m) => (
              <ModelCard key={m.slug} model={m} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="wrap">
          <div className="quick">
            <Link to="/test-drive">
              <span className="ico">
                <CalendarCheck size={22} />
              </span>
              <h3>Book a test drive</h3>
              <p>Pick a model, a date and a time slot. Our team confirms your appointment within a few hours.</p>
            </Link>
            <Link to="/quote">
              <span className="ico">
                <FileText size={22} />
              </span>
              <h3>Request a quotation</h3>
              <p>Get an itemised on-road price for the exact variant and configuration you want.</p>
            </Link>
            <Link to="/enquiry">
              <span className="ico">
                <Wrench size={22} />
              </span>
              <h3>Service & support</h3>
              <p>Existing owner? Ask about servicing, warranty or anything else about your vehicle.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="promo">
            <div>
              <span className="eyebrow">Limited period</span>
              <h2>Volt Home Charger on Us</h2>
              <p>Book any {brand.name} Volt this month and get a complimentary 7.2 kW wallbox with standard installation.</p>
              <div className="hero-cta">
                <Link to="/offers" className="btn btn-primary">
                  View all offers
                </Link>
                <Link to="/models/volt" className="btn btn-ghost">
                  Explore Volt
                </Link>
              </div>
            </div>
            <CarArt shape="ev" color={volt.colours[0].hex} />
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">Offers</span>
              <h2>Current promotions</h2>
            </div>
            <Link to="/offers" className="btn-link">
              All offers <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid-offers">
            {offers.slice(0, 3).map((o) => (
              <div className="offer" key={o.id}>
                <span className="small">{o.models.join(' · ')}</span>
                <h3>{o.title}</h3>
                <span className="benefit">{o.benefit}</span>
                <p className="small">{o.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap contact-grid">
          <div>
            <span className="eyebrow">Visit us</span>
            <h2 style={{ fontSize: 32, margin: '10px 0 16px' }}>{brand.dealership}</h2>
            <div className="contact-item">
              <MapPin size={18} />
              <div>
                <small>Showroom</small>
                {brand.address}
              </div>
            </div>
            <div className="contact-item">
              <Phone size={18} />
              <div>
                <small>Call us</small>
                {brand.phone}
              </div>
            </div>
            <div className="hero-cta">
              <Link to="/contact" className="btn btn-ghost">
                Contact & hours
              </Link>
            </div>
          </div>
          <div className="map">
            <div className="pin">
              <MapPin size={30} style={{ margin: '0 auto' }} />
              <span>{brand.dealership}</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
