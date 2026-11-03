import { useState } from 'react';
import { Link } from 'react-router-dom';
import ModelCard from '../ModelCard';
import { brand } from '../../config/brand';
import { models, startingPrice } from '../../data/models';

// "Help me choose": a rule-based recommender (an AI consultant replaces this in Phase 5)
const questions = [
  { key: 'use', q: 'How will you mostly use it?', options: ['Weekend driving & track days', 'Daily commute', 'Family & long trips', 'Business / chauffeur'] },
  { key: 'seats', q: 'How many seats do you need?', options: ['2–4 is fine', '4', '5'] },
  { key: 'power', q: 'Which powertrain?', options: ['Electric', 'Petrol / hybrid', 'No preference'] },
  { key: 'budget', q: 'Budget (ex-showroom)?', options: ['Under ₹1.5 Cr', '₹1.5 – 2 Cr', '₹2 – 3 Cr', 'Above ₹3 Cr'] },
];
const budgetMax = { 'Under ₹1.5 Cr': 15000000, '₹1.5 – 2 Cr': 20000000, '₹2 – 3 Cr': 30000000, 'Above ₹3 Cr': Infinity };

function rank(a) {
  return models
    .map((m) => {
      let s = 0;
      const isEV = m.category === 'Electric';
      if (a.power === 'Electric') s += isEV ? 30 : -30;
      if (a.power === 'Petrol / hybrid') s += isEV ? -30 : 15;
      if (a.use === 'Weekend driving & track days') s += m.family === '911' ? 40 : m.family === 'Taycan' ? 15 : 0;
      if (a.use === 'Daily commute') s += ['Macan', 'Taycan'].includes(m.family) ? 25 : 5;
      if (a.use === 'Family & long trips') s += m.category === 'SUV' || m.family === 'Cayenne' ? 35 : m.family === 'Macan' ? 20 : 0;
      if (a.use === 'Business / chauffeur') s += m.family === 'Panamera' ? 40 : m.family === 'Cayenne' ? 15 : 0;
      if (a.seats === '5') s += /5/.test(m.specs.Seating || '') ? 20 : -25;
      if (a.seats === '4') s += /4|5/.test(m.specs.Seating || '') ? 10 : -15;
      if (a.budget) s += startingPrice(m) <= budgetMax[a.budget] ? 20 : -40;
      return { m, s };
    })
    .sort((x, y) => y.s - x.s)
    .slice(0, 3)
    .map((x) => x.m);
}

export default function Finder() {
  const [a, setA] = useState({});
  const done = questions.every((q) => a[q.key]);
  const picks = done ? rank(a) : [];
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">Help me choose</span>
            <h2>Find the right {brand.name} for you</h2>
            <p>Answer four quick questions and we'll recommend models to explore and test drive.</p>
          </div>
        </div>
        <div className="finder">
          {questions.map((q, i) => (
            <div className="build-step" key={q.key}>
              <span className="step-no">{i + 1}</span>
              <h3>{q.q}</h3>
              <div className="chips">
                {q.options.map((o) => (
                  <button key={o} className={`chip ${a[q.key] === o ? 'on' : ''}`} onClick={() => setA({ ...a, [q.key]: o })}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {done && (
          <>
            <div className="section-head" style={{ marginTop: 40 }}>
              <div>
                <span className="eyebrow">Our recommendations</span>
                <h2>Best matches for you</h2>
              </div>
              <Link to={`/test-drive?model=${encodeURIComponent(picks[0].name)}`} className="btn btn-primary">Test drive the {picks[0].name}</Link>
            </div>
            <div className="grid-models">
              {picks.map((m) => (<ModelCard key={m.slug} model={m} />))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
