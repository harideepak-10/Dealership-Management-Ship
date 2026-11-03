import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitCompare } from 'lucide-react';
import ModelCard from '../ModelCard';
import { categories, models, startingPrice } from '../../data/models';

export default function Catalogue() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [fuel, setFuel] = useState('All');
  const [budget, setBudget] = useState('All');
  const [sel, setSel] = useState([]);
  const nav = useNavigate();

  const fuels = ['All', ...new Set(models.flatMap((m) => m.variants.map((v) => v.fuel)))];
  const list = models.filter((m) => {
    if (cat !== 'All' && m.category !== cat) return false;
    if (fuel !== 'All' && !m.variants.some((v) => v.fuel === fuel)) return false;
    if (budget !== 'All' && startingPrice(m) > Number(budget)) return false;
    if (q && !`${m.name} ${m.category} ${m.tagline}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  const toggle = (slug) => setSel((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : s.length < 3 ? [...s, slug] : s));

  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">Vehicle catalogue</span>
            <h2>All models</h2>
            <p>Browse the full line-up. Select up to three models to compare side by side.</p>
          </div>
        </div>
        <div className="filters">
          <input className="field-dark" placeholder="Search models…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="field-dark" value={cat} onChange={(e) => setCat(e.target.value)}>
            {['All', ...categories].map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All categories' : c}
              </option>
            ))}
          </select>
          <select className="field-dark" value={fuel} onChange={(e) => setFuel(e.target.value)}>
            {fuels.map((f) => (
              <option key={f} value={f}>
                {f === 'All' ? 'All fuel types' : f}
              </option>
            ))}
          </select>
          <select className="field-dark" value={budget} onChange={(e) => setBudget(e.target.value)}>
            <option value="All">Any budget</option>
            <option value="15000000">Under ₹1.5 Cr</option>
            <option value="20000000">Under ₹2 Cr</option>
            <option value="30000000">Under ₹3 Cr</option>
          </select>
        </div>
        <div className="grid-models">
          {list.map((m) => (
            <ModelCard key={m.slug} model={m} compare={sel.includes(m.slug)} onCompare={toggle} />
          ))}
        </div>
        {list.length === 0 && <p style={{ color: 'var(--muted)' }}>No models match these filters.</p>}
        {sel.length > 0 && (
          <div className="compare-bar">
            <span>
              {sel.length} selected {sel.length < 2 && <span style={{ color: 'var(--muted)' }}>· pick at least 2</span>}
            </span>
            <button className="btn btn-primary btn-sm" disabled={sel.length < 2} onClick={() => nav(`/compare?m=${sel.join(',')}`)}>
              <GitCompare size={16} /> Compare
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
