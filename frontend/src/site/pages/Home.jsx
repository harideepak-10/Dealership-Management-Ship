import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck, FileText, MapPin, Phone, Wrench } from 'lucide-react';
import VehicleImage from '../../components/VehicleImage';
import ModelCard from '../ModelCard';
import { brand, formatLakh } from '../../config/brand';
import { categories, getModel, models, offers, startingPrice } from '../../data/models';

export default function Home() {
  const hero = getModel('911');
  const taycan = getModel('taycan');
  const [cat, setCat] = useState('All');
  const list = cat === 'All' ? models : models.filter((m) => m.category === cat);

  return (
    <>
      <section className="hero-photo">
        <img src={hero.image} alt={`${brand.name} ${hero.name}`} onError={(e) => (e.currentTarget.style.display = 'none')} />
        <div className="hero-shade" />
        <div className="wrap hero-content">
          <span className="eyebrow">{brand.name} 911</span>
          <h1>{brand.tagline}</h1>
          <p className="lead">{hero.description}</p>
          <div className="hero-cta">
            <Link to="/test-drive?model=911" className="btn btn-primary">
              Book a Test Drive
            </Link>
            <Link to="/models/911" className="btn btn-ghost">
              Explore 911 <ArrowRight size={16} />
            </Link>
          </div>
          <div className="hero-stats">
            <div>
              <b>650 PS</b>
              <span>911 Turbo S</span>
            </div>
            <div>
              <b>2.7 s</b>
              <span>0–100 km/h</span>
            </div>
            <div>
              <b>{formatLakh(startingPrice(hero))}</b>
              <span>starting ex-showroom</span>
            </div>
          </div>
        </div>
        {hero.photoCredit && <span className="credit">Photo: {hero.photoCredit}</span>}
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
              <span className="eyebrow">Electric</span>
              <h2>Taycan. Up to 705 km of range.</h2>
              <p>Book a Taycan or Macan Electric this quarter and get a 22 kW home wallbox with standard installation.</p>
              <div className="hero-cta">
                <Link to="/offers" className="btn btn-primary">
                  View all offers
                </Link>
                <Link to="/models/taycan" className="btn btn-ghost">
                  Explore Taycan
                </Link>
              </div>
            </div>
            <VehicleImage model={taycan} className="promo-img" />
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
