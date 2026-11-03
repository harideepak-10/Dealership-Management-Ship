import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Check, CircleDot } from 'lucide-react';
import CarArt from '../../components/CarArt';
import { brand, formatINR } from '../../config/brand';
import { getModel } from '../../data/models';
import { useDemo } from '../../store/DemoStore';

export default function ModelDetail() {
  const { slug } = useParams();
  const model = getModel(slug);
  const { db } = useDemo();
  const [variant, setVariant] = useState(model?.variants[0]);
  const [colour, setColour] = useState(model?.colours[0]);
  const [view, setView] = useState('Exterior');
  if (!model) return <Navigate to="/models" replace />;

  const stock = db.inventory.filter((v) => v.model === model.name && v.status === 'Available' && !v.testDrive).length;
  const qs = `?model=${encodeURIComponent(model.name)}&variant=${encodeURIComponent(variant.name)}`;

  return (
    <>
      <section className="detail-hero">
        <div className="wrap">
          <div className="crumbs">
            <Link to="/">Home</Link> / <Link to="/models">Models</Link> / {model.name}
          </div>
          <div className="detail-grid">
            <div>
              {view === 'Exterior' ? (
                <CarArt shape={model.shape} color={colour.hex} className="hero-car" />
              ) : (
                <div className="interior">Interior gallery — brand photography goes here</div>
              )}
              <div className="swatches">
                {model.colours.map((c) => (
                  <button key={c.name} className={`swatch ${c.name === colour.name ? 'on' : ''}`} style={{ background: c.hex }} onClick={() => setColour(c)} title={c.name} aria-label={c.name} />
                ))}
              </div>
              <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, marginTop: 8 }}>{colour.name}</p>
              <div className="view-toggle">
                {['Exterior', 'Interior'].map((v) => (
                  <button key={v} className={`chip ${view === v ? 'on' : ''}`} onClick={() => setView(v)}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="eyebrow">{model.category}</span>
              <h1>
                {brand.name} {model.name}
              </h1>
              <p className="lead">{model.description}</p>
              <div className="panel">
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>Choose a variant</p>
                <div className="variant-list">
                  {model.variants.map((v) => (
                    <button key={v.id} className={`variant ${v.id === variant.id ? 'on' : ''}`} onClick={() => setVariant(v)}>
                      <span>
                        {v.name}
                        <small>
                          {v.fuel} · {v.transmission}
                        </small>
                      </span>
                      <b>{formatINR(v.price)}</b>
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: '#727a85', marginTop: 10 }}>Ex-showroom prices, {brand.city}. On-road price provided with quotation.</p>
                <div className={`stock-note ${stock <= 2 ? 'low' : ''}`}>
                  <CircleDot size={14} /> {stock > 2 ? 'In stock at our showroom' : stock > 0 ? 'Limited stock available' : 'Available to order'}
                </div>
                <div className="hero-cta" style={{ marginTop: 18 }}>
                  <Link to={`/test-drive${qs}`} className="btn btn-primary">
                    Book a Test Drive
                  </Link>
                  <Link to={`/quote${qs}`} className="btn btn-ghost">
                    Request a Quote
                  </Link>
                </div>
                <div style={{ marginTop: 14, display: 'flex', gap: 18, fontSize: 14 }}>
                  <Link to={`/enquiry${qs}`} className="btn-link">
                    Submit an enquiry
                  </Link>
                  <Link to="/contact" className="btn-link">
                    Contact dealership
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">Specifications</span>
              <h2>Engine & performance</h2>
            </div>
          </div>
          <div className="specs">
            {Object.entries(model.specs).map(([k, v]) => (
              <div key={k}>
                <small>{k}</small>
                <b>{v}</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">Features & equipment</span>
              <h2>What comes with it</h2>
            </div>
          </div>
          <div className="feature-list">
            {model.features.map((f) => (
              <div key={f}>
                <Check size={18} /> {f}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
