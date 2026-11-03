import { Link } from 'react-router-dom';
import { BatteryCharging, Gauge, Home as HomeIcon, Zap } from 'lucide-react';
import ModelCard from '../ModelCard';
import { brand } from '../../config/brand';
import { getModel, models } from '../../data/models';

const facts = [
  { icon: Zap, value: '800 V', label: 'architecture for fast DC charging' },
  { icon: BatteryCharging, value: '10–80%', label: 'in about 21–33 minutes on a fast charger' },
  { icon: Gauge, value: 'Up to 705 km', label: 'certified range (Taycan)' },
  { icon: HomeIcon, value: '22 kW', label: 'home wallbox offer this quarter' },
];

export default function Electric() {
  const evs = models.filter((m) => m.category === 'Electric');
  const taycan = getModel('taycan');
  return (
    <>
      <section className="hero-photo hero-short">
        {taycan.image && <img src={taycan.image} alt={`${brand.name} Taycan`} onError={(e) => (e.currentTarget.style.display = 'none')} />}
        <div className="hero-shade" />
        <div className="wrap hero-content">
          <span className="eyebrow">E-Performance</span>
          <h1>Electric, with every bit of the character.</h1>
          <p className="lead">Three fully electric model lines — Taycan, Macan Electric and Cayenne Electric — with instant torque, 800-volt charging and everyday range.</p>
          <div className="hero-cta">
            <Link to="/test-drive?model=Taycan" className="btn btn-primary">
              Test drive an EV
            </Link>
            <Link to="/finance" className="btn btn-ghost">
              Calculate EMI
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="fact-grid">
            {facts.map((f) => (
              <div className="fact" key={f.value}>
                <f.icon size={22} />
                <b>{f.value}</b>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">The electric line-up</span>
              <h2>Choose your electric {brand.name}</h2>
            </div>
          </div>
          <div className="grid-models">
            {evs.map((m) => (
              <ModelCard key={m.slug} model={m} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap split">
          <div>
            <span className="eyebrow">Charging</span>
            <h2 className="h2">Charging made simple</h2>
            <p className="muted-p">At home, an 11 kW AC wallbox charges a Taycan overnight. On the road, 800-volt DC fast chargers take you from 10% to 80% in roughly the time of a coffee stop. Our team surveys your home and handles installation.</p>
            <ul className="ticks">
              <li>Home wallbox survey and installation</li>
              <li>Public charging network guidance</li>
              <li>Battery warranty and health checks at our service centre</li>
            </ul>
            <div className="hero-cta">
              <Link to="/enquiry?model=Taycan" className="btn btn-ghost">
                Ask about charging
              </Link>
            </div>
          </div>
          <div className="stat-panel">
            <div><small>AC home charging (11 kW)</small><b>~9–10 h</b></div>
            <div><small>DC fast charging, 10–80%</small><b>~21–33 min</b></div>
            <div><small>Range, Macan Electric</small><b>Up to 624 km</b></div>
            <div><small>Range, Taycan</small><b>Up to 705 km</b></div>
          </div>
        </div>
      </section>
    </>
  );
}
