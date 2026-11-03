import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FileDown, Plus, Send } from 'lucide-react';
import { Badge } from '../../components/ui';
import { brand, formatINR } from '../../config/brand';
import { quotationStatuses, dayOffset } from '../../data/seed';
import { allVariants, packages } from '../../data/models';
import { useDemo } from '../../store/DemoStore';
import { DataTable, Drawer, Guard, PageHead, Toast, fmtDate } from '../kit';

const managers = ['Sales Manager', 'Dealership Manager', 'Super Admin'];

// ---------------- List ----------------
export default function Quotations() {
  const { db, update, user, convertQuote } = useDemo();
  const nav = useNavigate();
  const [sel, setSel] = useState(null);
  const [toast, setToast] = useState('');
  const q = sel && db.quotations.find((x) => x.id === sel);
  const limit = db.settings.discountLimit;
  const canApprove = managers.includes(user.role);

  return (
    <Guard module="quotations">
      <div className="page">
        <PageHead title="Quotations" sub={`Prepare, approve and send itemised quotations. Discounts above ${formatINR(limit)} need manager approval.`}>
          <button className="abtn abtn-primary" onClick={() => nav('/admin/quotations/new')}>
            <Plus size={15} /> New quotation
          </button>
        </PageHead>
        <DataTable
          rows={db.quotations}
          search={['id', 'customer', 'variant']}
          filters={[{ key: 'status', label: 'Status', options: quotationStatuses }]}
          onRow={(r) => setSel(r.id)}
          columns={[
            { label: 'Quote', render: (r) => <span className="mono">{r.id} <span className="muted">v{r.version}</span></span> },
            { label: 'Customer', render: (r) => <b>{r.customer}</b> },
            { label: 'Vehicle', key: 'variant' },
            { label: 'Discount', render: (r) => (r.discount ? formatINR(r.discount) : '—'), num: true },
            { label: 'Total', render: (r) => <b>{formatINR(r.total)}</b>, num: true },
            { label: 'Valid till', render: (r) => fmtDate(r.validTill) },
            { label: 'Prepared by', key: 'preparedBy', cls: 'muted' },
            { label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
          ]}
        />
        {q && (
          <Drawer title={`Quotation ${q.id}`} sub={`${q.customer} · version ${q.version} · prepared by ${q.preparedBy}`} onClose={() => setSel(null)}>
            <div style={{ marginBottom: 14 }}>
              <Badge>{q.status}</Badge>
              {q.bookingId && <span className="badge badge-green" style={{ marginLeft: 6 }}>Booking {q.bookingId}</span>}
            </div>
            {q.discount > limit && q.status === 'Pending Approval' && <div className="alert alert-warn">Discount of {formatINR(q.discount)} exceeds the {formatINR(limit)} limit and needs manager approval.</div>}
            <QuoteTable q={q} />
            <div className="actions">
              {q.status === 'Pending Approval' && (
                <button className="abtn abtn-ok" disabled={!canApprove} onClick={() => update('quotations', q.id, { status: 'Approved' }, 'Approved quotation discount')}>
                  Approve discount
                </button>
              )}
              {q.status === 'Draft' && q.discount > limit && (
                <button className="abtn" onClick={() => update('quotations', q.id, { status: 'Pending Approval' })}>Request approval</button>
              )}
              {(q.status === 'Approved' || (q.status === 'Draft' && q.discount <= limit)) && (
                <button className="abtn abtn-primary" onClick={() => { update('quotations', q.id, { status: 'Sent' }, 'Sent quotation to customer'); setToast('Quotation sent by email & WhatsApp (simulated)'); }}>
                  <Send size={14} /> Send to customer
                </button>
              )}
              {['Sent', 'Viewed'].includes(q.status) && (
                <>
                  <button className="abtn abtn-ok" onClick={() => update('quotations', q.id, { status: 'Accepted' })}>Mark accepted</button>
                  <button className="abtn abtn-danger" onClick={() => update('quotations', q.id, { status: 'Rejected' })}>Mark rejected</button>
                </>
              )}
              {q.status === 'Accepted' && !q.bookingId && (
                <button className="abtn abtn-primary" onClick={() => { const id = convertQuote(q); setToast(`Booking ${id} created`); setSel(null); nav('/admin/bookings'); }}>
                  Convert to booking
                </button>
              )}
              <button className="abtn" onClick={() => window.open(`#/quote-print/${q.id}`, '_blank')}>
                <FileDown size={14} /> PDF
              </button>
              {['Draft', 'Rejected', 'Sent'].includes(q.status) && (
                <button className="abtn" onClick={() => nav(`/admin/quotations/new?from=${q.id}`)}>New version</button>
              )}
            </div>
            {!canApprove && q.status === 'Pending Approval' && <p style={{ fontSize: 12, color: '#6a7280', marginTop: 8 }}>Sign in as a Sales Manager to approve.</p>}
          </Drawer>
        )}
        <Toast msg={toast} onDone={() => setToast('')} />
      </div>
    </Guard>
  );
}

function QuoteTable({ q }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <b>{brand.name} {q.variant}</b>
        <small style={{ color: '#6a7280' }}>Valid till {fmtDate(q.validTill)}</small>
      </div>
      <table className="atable">
        <tbody>
          <tr><td>Ex-showroom price</td><td className="num">{formatINR(q.base)}</td></tr>
          {(q.options || []).map((o) => (<tr key={o.id}><td className="muted">+ {o.name}</td><td className="num">{formatINR(o.price)}</td></tr>))}
          <tr><td>GST & compensation cess</td><td className="num">{formatINR(q.tax)}</td></tr>
          <tr><td>Registration, insurance & handling</td><td className="num">{formatINR(q.charges)}</td></tr>
          <tr><td>Accessories</td><td className="num">{formatINR(q.accessories)}</td></tr>
          <tr><td>Discount</td><td className="num" style={{ color: '#1d7a3a' }}>− {formatINR(q.discount)}</td></tr>
          <tr><td><b>On-road total</b></td><td className="num"><b>{formatINR(q.total)}</b></td></tr>
        </tbody>
      </table>
    </div>
  );
}

// ---------------- Builder ----------------
export function QuotationBuilder() {
  const { db, create, user } = useDemo();
  const nav = useNavigate();
  const [p] = useSearchParams();
  const from = p.get('from') && db.quotations.find((x) => x.id === p.get('from'));
  const s = db.settings;
  const [customerId, setCustomerId] = useState(from?.customerId || p.get('customer') || '');
  const [variantId, setVariantId] = useState(allVariants.find((v) => v.name === from?.variant)?.id || allVariants[0].id);
  const [opts, setOpts] = useState((from?.options || []).map((o) => o.id));
  const [accessories, setAccessories] = useState(from?.accessories || 0);
  const [discount, setDiscount] = useState(from?.discount || 0);
  const [notes, setNotes] = useState(from?.notes || '');
  const v = allVariants.find((x) => x.id === variantId);
  const customer = db.customers.find((c) => c.id === customerId);

  const calc = useMemo(() => {
    const options = packages.filter((x) => opts.includes(x.id));
    const base = v.price;
    const taxable = base + options.reduce((a, b) => a + b.price, 0);
    const tax = Math.round(taxable * (s.gstRate + s.cessRate));
    const total = taxable + tax + s.registrationCharges + Number(accessories) - Number(discount);
    return { options, base, tax, total };
  }, [v, opts, accessories, discount, s]);

  const needsApproval = Number(discount) > s.discountLimit;
  const save = (status) => {
    if (!customer) return;
    const id = create(
      'quotations',
      'QT',
      {
        customerId, customer: customer.name, model: v.model, variant: v.name, base: calc.base, options: calc.options, tax: calc.tax, charges: s.registrationCharges,
        accessories: Number(accessories), discount: Number(discount), total: calc.total, validTill: dayOffset(s.quoteValidityDays), preparedBy: user.name,
        status, version: from ? from.version + 1 : 1, notes, previous: from?.id || null,
      },
      from ? `Created version ${from.version + 1} of ${from.id}` : 'Created quotation',
    );
    nav(`/admin/quotations?created=${id}`);
  };

  return (
    <Guard module="quotations">
      <div className="page">
        <PageHead title={from ? `New version of ${from.id}` : 'Quotation builder'} sub="Totals are calculated automatically from the settings (taxes, registration charges, discount limit)." />
        <div className="grid-2">
          <div className="card">
            <div className="form-row">
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Customer *</label>
                <select className="aselect" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                  <option value="">Select customer…</option>
                  {db.customers.map((c) => (<option key={c.id} value={c.id}>{c.name} · {c.mobile} ({c.id})</option>))}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Model / variant</label>
                <select className="aselect" value={variantId} onChange={(e) => setVariantId(e.target.value)}>
                  {allVariants.map((x) => (<option key={x.id} value={x.id}>{x.name} — {formatINR(x.price)}</option>))}
                </select>
              </div>
              <div>
                <label>Accessories (₹)</label>
                <input className="ainput" type="number" min="0" value={accessories} onChange={(e) => setAccessories(e.target.value)} />
              </div>
              <div>
                <label>Discount (₹)</label>
                <input className="ainput" type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} />
              </div>
            </div>
            <div className="section-title">Factory options</div>
            {packages.map((x) => (
              <label key={x.id} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13.5, padding: '5px 0' }}>
                <input type="checkbox" checked={opts.includes(x.id)} onChange={() => setOpts((o) => (o.includes(x.id) ? o.filter((i) => i !== x.id) : [...o, x.id]))} />
                <span style={{ flex: 1 }}>{x.name}</span>
                <span className="muted">{formatINR(x.price)}</span>
              </label>
            ))}
            <div className="section-title">Negotiation notes</div>
            <textarea className="ainput" style={{ width: '100%', height: 70, padding: 10 }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal notes (not shown to the customer)" />
          </div>
          <div>
            <QuoteTable q={{ variant: v.name, base: calc.base, options: calc.options, tax: calc.tax, charges: s.registrationCharges, accessories: Number(accessories), discount: Number(discount), total: calc.total, validTill: dayOffset(s.quoteValidityDays) }} />
            {needsApproval && <div className="alert alert-warn" style={{ marginTop: 12 }}>Discount is above the {formatINR(s.discountLimit)} limit — this quotation will go for manager approval before it can be sent.</div>}
            {!customer && <div className="alert alert-info" style={{ marginTop: 12 }}>Select a customer to save the quotation.</div>}
            <div className="actions">
              <button className="abtn" disabled={!customer} onClick={() => save('Draft')}>Save draft</button>
              <button className="abtn abtn-primary" disabled={!customer} onClick={() => save(needsApproval ? 'Pending Approval' : 'Approved')}>
                {needsApproval ? 'Submit for approval' : 'Save & approve'}
              </button>
              <button className="abtn" onClick={() => nav('/admin/quotations')}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </Guard>
  );
}

// ---------------- Printable quotation (PDF via browser print) ----------------
export function QuotationPrint() {
  const { id } = useParams();
  const { db } = useDemo();
  const q = db.quotations.find((x) => x.id === id);
  const c = q && db.customers.find((x) => x.id === q.customerId);
  if (!q) return <p style={{ padding: 40 }}>Quotation not found.</p>;
  return (
    <div className="print-page">
      <div className="no-print" style={{ marginBottom: 20, display: 'flex', gap: 8 }}>
        <button className="abtn abtn-primary" onClick={() => window.print()}>Save as PDF / Print</button>
        <button className="abtn" onClick={() => window.close()}>Close</button>
      </div>
      <div className="print-head">
        <div>
          <div className="print-logo">{brand.name.toUpperCase()}</div>
          <div>{brand.dealership}</div>
          <small>{brand.address} · {brand.phone}</small>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2>Quotation</h2>
          <div><b>{q.id}</b> · v{q.version}</div>
          <small>Valid till {fmtDate(q.validTill)}</small>
        </div>
      </div>
      <div className="print-to">
        <small>Prepared for</small>
        <b>{q.customer}</b>
        <div>{c?.mobile} · {c?.email}</div>
      </div>
      <QuoteTable q={q} />
      <p className="print-foot">Prices are indicative and subject to change at the time of invoicing. Prepared by {q.preparedBy}. {brand.disclaimer}.</p>
    </div>
  );
}
