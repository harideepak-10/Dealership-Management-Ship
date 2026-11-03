import { useState } from 'react';
import { Check } from 'lucide-react';
import { Badge } from '../../components/ui';
import { formatINR } from '../../config/brand';
import { bookingStatuses } from '../../data/seed';
import { useDemo } from '../../store/DemoStore';
import { DataTable, Drawer, Guard, PageHead, fmtDate } from '../kit';

const checklist = ['Payment verification', 'Vehicle inspection', 'Registration documentation', 'Insurance documentation', 'Accessories fitted', 'Owner manual', 'Key handover', 'Customer acknowledgement'];

export default function Bookings() {
  const { db, update } = useDemo();
  const [sel, setSel] = useState(null);
  const [done, setDone] = useState({});
  const b = sel && db.bookings.find((x) => x.id === sel);

  return (
    <Guard module="bookings">
      <div className="page">
        <PageHead title="Bookings & Delivery" sub="Track each purchase from booking advance to vehicle handover." />
        <DataTable
          rows={db.bookings}
          search={['id', 'customer', 'vin']}
          filters={[{ key: 'status', label: 'Status', options: bookingStatuses }]}
          onRow={(r) => setSel(r.id)}
          columns={[
            { label: 'Booking', render: (r) => <span className="mono">{r.id}</span> },
            { label: 'Customer', render: (r) => <b>{r.customer}</b> },
            { label: 'Vehicle', render: (r) => <>{r.variant}<div className="mono muted" style={{ fontSize: 11 }}>{r.vin}</div></> },
            { label: 'Paid', render: (r) => <PayBar paid={r.paid} total={r.total} /> },
            { label: 'Balance', render: (r) => formatINR(r.total - r.paid), num: true },
            { label: 'Documents', key: 'docs', cls: 'muted' },
            { label: 'Expected delivery', render: (r) => fmtDate(r.expectedDelivery) },
            { label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
          ]}
        />
        {b && (
          <Drawer title={`Booking ${b.id}`} sub={`${b.customer} · ${b.variant} · ${b.executive}`} onClose={() => setSel(null)}>
            <div style={{ marginBottom: 14 }}>
              <Badge>{b.status}</Badge>
            </div>
            <dl className="dl">
              <dt>Allocated vehicle</dt>
              <dd className="mono">{b.vehicleId} · {b.vin}</dd>
              <dt>Booking amount</dt>
              <dd>{formatINR(b.bookingAmount)}</dd>
              <dt>On-road total</dt>
              <dd>{formatINR(b.total)}</dd>
              <dt>Paid so far</dt>
              <dd>{formatINR(b.paid)}</dd>
              <dt>Outstanding</dt>
              <dd className={b.total - b.paid > 0 ? 'overdue' : ''}>{formatINR(b.total - b.paid)}</dd>
              <dt>Documents</dt>
              <dd>{b.docs}</dd>
              <dt>Expected delivery</dt>
              <dd>{fmtDate(b.expectedDelivery)}</dd>
            </dl>
            <div className="section-title">Payments</div>
            <table className="atable" style={{ marginBottom: 8 }}>
              <tbody>
                <tr><td>Booking advance · UPI</td><td className="mono muted">UTR 4820…19</td><td className="num">{formatINR(b.bookingAmount)}</td></tr>
                {b.paid > b.bookingAmount && <tr><td>Part payment · Bank transfer</td><td className="mono muted">NEFT 9931…02</td><td className="num">{formatINR(b.paid - b.bookingAmount)}</td></tr>}
              </tbody>
            </table>
            <div className="section-title">Delivery checklist</div>
            {checklist.map((c) => {
              const key = b.id + c;
              const on = done[key] || b.status === 'Delivered';
              return (
                <label key={c} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13.5, padding: '6px 0' }}>
                  <input type="checkbox" checked={!!on} onChange={() => setDone({ ...done, [key]: !done[key] })} /> {c}
                </label>
              );
            })}
            {b.total - b.paid > 0 && <div className="alert alert-warn" style={{ marginTop: 10 }}>Outstanding balance must be cleared (or an authorised exception recorded) before delivery.</div>}
            <div className="actions">
              <button
                className="abtn abtn-ok"
                disabled={b.status === 'Delivered' || b.total - b.paid > 0 || !checklist.every((c) => done[b.id + c])}
                onClick={() => update('bookings', b.id, { status: 'Delivered' })}
              >
                <Check size={14} /> Mark delivered
              </button>
              <button className="abtn abtn-danger" onClick={() => update('bookings', b.id, { status: 'Cancelled' })}>
                Cancel booking
              </button>
            </div>
          </Drawer>
        )}
      </div>
    </Guard>
  );
}

function PayBar({ paid, total }) {
  const pct = Math.round((paid / total) * 100);
  return (
    <div style={{ minWidth: 120 }}>
      <div style={{ fontSize: 12 }}>
        {formatINR(paid)} <span className="muted">· {pct}%</span>
      </div>
      <div style={{ height: 5, background: '#eef0f3', borderRadius: 3, marginTop: 3 }}>
        <div style={{ height: 5, width: `${pct}%`, background: pct === 100 ? '#1d7a3a' : '#c8102e', borderRadius: 3 }} />
      </div>
    </div>
  );
}
