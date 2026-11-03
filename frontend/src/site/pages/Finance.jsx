import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { brand, formatINR, formatLakh } from '../../config/brand';
import { allVariants } from '../../data/models';

export default function Finance() {
  const [variantId, setVariantId] = useState('911-carrera');
  const v = allVariants.find((x) => x.id === variantId);
  const onRoad = Math.round(v.price * 1.3);
  const [down, setDown] = useState(25);
  const [years, setYears] = useState(5);
  const [rate, setRate] = useState(8.75);
  const loan = Math.round(onRoad * (1 - down / 100));
  const emi = useMemo(() => {
    const r = rate / 1200;
    const n = years * 12;
    return Math.round((loan * r * (1 + r) ** n) / ((1 + r) ** n - 1));
  }, [loan, rate, years]);
  const totalInterest = emi * years * 12 - loan;

  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">Finance</span>
            <h2>EMI calculator</h2>
            <p>An estimate to help you plan. Final terms depend on the lender and your eligibility.</p>
          </div>
        </div>
        <div className="split">
          <div className="form-card">
            <div className="f">
              <label>Vehicle</label>
              <select value={variantId} onChange={(e) => setVariantId(e.target.value)}>
                {allVariants.map((x) => (
                  <option key={x.id} value={x.id}>
                    {brand.name} {x.name} — {formatLakh(x.price)}
                  </option>
                ))}
              </select>
            </div>
            <Range label="Down payment" value={down} set={setDown} min={10} max={80} step={5} unit="%" />
            <Range label="Tenure" value={years} set={setYears} min={1} max={7} step={1} unit=" years" />
            <Range label="Interest rate" value={rate} set={setRate} min={7} max={14} step={0.25} unit="% p.a." />
          </div>
          <div className="stat-panel emi">
            <div className="big">
              <small>Estimated monthly EMI</small>
              <b>{formatINR(emi)}</b>
            </div>
            <div><small>Approx. on-road price</small><b>{formatINR(onRoad)}</b></div>
            <div><small>Down payment</small><b>{formatINR(onRoad - loan)}</b></div>
            <div><small>Loan amount</small><b>{formatINR(loan)}</b></div>
            <div><small>Total interest</small><b>{formatINR(totalInterest)}</b></div>
            <div className="hero-cta" style={{ marginTop: 6 }}>
              <Link to={`/quote?model=${encodeURIComponent(v.model)}&variant=${encodeURIComponent(v.name)}&finance=Yes`} className="btn btn-primary">
                Get an exact quote
              </Link>
            </div>
          </div>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 18 }}>On-road price is estimated at ex-showroom + ~30% for taxes, registration and insurance. Illustrative only.</p>
      </div>
    </section>
  );
}

function Range({ label, value, set, min, max, step, unit }) {
  return (
    <div className="f range">
      <label>
        {label} <b>{value}{unit}</b>
      </label>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} />
    </div>
  );
}
