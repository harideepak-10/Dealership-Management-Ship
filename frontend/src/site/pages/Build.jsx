import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import VehicleImage from '../../components/VehicleImage';
import { brand, formatINR, formatLakh } from '../../config/brand';
import { getModel, models, packages, startingPrice } from '../../data/models';

// "Build & Price" configurator: model -> variant -> colour -> options -> summary
export default function Build() {
  const { slug } = useParams();
  const model = slug && getModel(slug);
  if (!model) return <PickModel />;
  return <Configurator key={model.slug} model={model} />;
}

function PickModel() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">Build & Price</span>
            <h2>Choose a model to configure</h2>
            <p>Pick a variant, colour and options and see an indicative price instantly.</p>
          </div>
        </div>
        <div className="grid-models">
          {models.map((m) => (
            <Link key={m.slug} to={`/build/${m.slug}`} className="model-card">
              <div className="card-photo">
                <VehicleImage model={m} />
              </div>
              <span className="meta">{m.category}</span>
              <h3>{brand.name} {m.name}</h3>
              <p className="price">From <b>{formatLakh(startingPrice(m))}</b></p>
              <span className="btn-link" style={{ padding: '0 6px', marginTop: 8 }}>Configure →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Configurator({ model }) {
  const nav = useNavigate();
  const [variant, setVariant] = useState(model.variants[0]);
  const [colour, setColour] = useState(model.colours[0]);
  const [opts, setOpts] = useState([]);
  const chosen = packages.filter((p) => opts.includes(p.id));
  const optionsTotal = chosen.reduce((s, p) => s + p.price, 0);
  const total = variant.price + optionsTotal;
  const toggle = (id) => setOpts((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));

  const summary = `Configuration: ${variant.name}, ${colour.name}${chosen.length ? ', ' + chosen.map((p) => p.name).join(', ') : ''}. Configured price ${formatINR(total)} ex-showroom.`;
  const qs = `?model=${encodeURIComponent(model.name)}&variant=${encodeURIComponent(variant.name)}&colour=${encodeURIComponent(colour.name)}&config=${encodeURIComponent(summary)}`;

  return (
    <section className="section">
      <div className="wrap">
        <div className="crumbs">
          <Link to="/build">Build & Price</Link> / {model.name}
        </div>
        <div className="build-grid">
          <div className="build-visual">
            <VehicleImage model={model} colour={colour.hex} eager className="detail-photo" />
            <p className="credit-inline">Photo shows the model; selected colour: {colour.name}</p>
          </div>
          <div className="build-steps">
            <h1 className="h1">{brand.name} {model.name}</h1>

            <div className="build-step">
              <span className="step-no">1</span>
              <h3>Variant</h3>
              <div className="variant-list">
                {model.variants.map((v) => (
                  <button key={v.id} className={`variant ${v.id === variant.id ? 'on' : ''}`} onClick={() => setVariant(v)}>
                    <span>
                      {v.name}
                      <small>{v.fuel} · {v.transmission}</small>
                    </span>
                    <b>{formatINR(v.price)}</b>
                  </button>
                ))}
              </div>
            </div>

            <div className="build-step">
              <span className="step-no">2</span>
              <h3>Exterior colour</h3>
              <div className="swatch-row">
                {model.colours.map((c) => (
                  <button key={c.name} className={`swatch-lg ${c.name === colour.name ? 'on' : ''}`} onClick={() => setColour(c)}>
                    <span style={{ background: c.hex }} />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="build-step">
              <span className="step-no">3</span>
              <h3>Options</h3>
              <div className="opt-list">
                {packages.map((p) => (
                  <label key={p.id} className={`opt ${opts.includes(p.id) ? 'on' : ''}`}>
                    <input type="checkbox" checked={opts.includes(p.id)} onChange={() => toggle(p.id)} />
                    <span>{p.name}</span>
                    <b>+ {formatINR(p.price)}</b>
                  </label>
                ))}
              </div>
            </div>

            <div className="build-summary">
              <div className="row-sb"><span>{variant.name}</span><span>{formatINR(variant.price)}</span></div>
              <div className="row-sb"><span>{colour.name}</span><span>Included</span></div>
              {chosen.map((p) => (
                <div className="row-sb" key={p.id}><span><Check size={13} /> {p.name}</span><span>{formatINR(p.price)}</span></div>
              ))}
              <div className="row-sb total"><span>Configured price (ex-showroom)</span><span>{formatINR(total)}</span></div>
              <p className="small-note">Option prices are indicative for the demo. Taxes, registration and insurance are added in your quotation.</p>
              <div className="hero-cta">
                <button className="btn btn-primary" onClick={() => nav(`/quote${qs}`)}>Request quote for this build</button>
                <Link to={`/test-drive?model=${encodeURIComponent(model.name)}&variant=${encodeURIComponent(variant.name)}`} className="btn btn-ghost">Test drive</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
