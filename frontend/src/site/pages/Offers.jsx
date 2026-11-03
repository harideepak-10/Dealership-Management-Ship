import { Link } from 'react-router-dom';
import { offers } from '../../data/models';

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function Offers() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">Offers & promotions</span>
            <h2>This month at the showroom</h2>
            <p>Offers are subject to stock and eligibility. Ask our team for the exact benefit on your chosen variant.</p>
          </div>
        </div>
        <div className="grid-offers">
          {offers.map((o) => (
            <div className="offer" key={o.id}>
              <span className="small">Applies to {o.models.join(', ')}</span>
              <h3>{o.title}</h3>
              <span className="benefit">{o.benefit}</span>
              <p className="small">{o.description}</p>
              <p className="small">Valid till {fmt(o.validTill)}</p>
              <Link to={`/enquiry?model=${o.models[0]}&offer=${encodeURIComponent(o.title)}`} className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>
                Enquire about this offer
              </Link>
              <p className="terms">T&C: {o.terms}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
