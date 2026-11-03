import { Link, useSearchParams } from 'react-router-dom';
import { Check, Info } from 'lucide-react';

const copy = {
  testdrive: {
    title: 'Test drive request received',
    body: 'Thanks for choosing us. Your request has been sent to our sales team.',
    note: 'This is not yet a confirmed appointment. We will check vehicle and staff availability and confirm your slot by SMS / WhatsApp shortly.',
  },
  enquiry: {
    title: 'Enquiry received',
    body: 'Your message has reached our team.',
    note: 'A member of our team will contact you on your preferred channel, usually within 2 business hours.',
  },
  quote: {
    title: 'Quotation request received',
    body: 'Our sales team will prepare an itemised quotation for you.',
    note: 'Quotations are reviewed and approved by the dealership before they are sent. Prices may vary with offers and stock.',
  },
};

export default function Confirmation() {
  const [p] = useSearchParams();
  const c = copy[p.get('kind')] || copy.enquiry;
  return (
    <div className="confirm">
      <div className="ok">
        <Check size={30} />
      </div>
      <h1>{c.title}</h1>
      <p>
        {p.get('name') ? `${p.get('name')}, ` : ''}
        {c.body}
      </p>
      <div className="ref">
        <small>Reference number</small>
        <b>{p.get('ref') || '—'}</b>
      </div>
      <div className="note">
        <Info size={18} style={{ flexShrink: 0, color: 'var(--accent)' }} />
        <span>{c.note}</span>
      </div>
      <div className="hero-cta" style={{ justifyContent: 'center' }}>
        <Link to="/models" className="btn btn-ghost">
          Keep exploring
        </Link>
        <Link to="/admin/test-drives" className="btn btn-primary">
          See it in the dashboard (demo)
        </Link>
      </div>
    </div>
  );
}
