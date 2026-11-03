import { useState } from 'react';
import { Check } from 'lucide-react';
import { Badge } from '../../components/ui';
import { formatINR } from '../../config/brand';
import { bookingStatuses, employees } from '../../data/seed';
import { useDemo } from '../../store/DemoStore';
import { DataTable, Drawer, FormDrawer, Guard, PageHead, Toast, fmtDate } from '../kit';

const checklist = ['Payment verification', 'Vehicle inspection', 'Registration documentation', 'Insurance documentation', 'Accessories fitted', 'Owner manual', 'Key handover', 'Customer acknowledgement'];
const deliveryStatuses = ['Vehicle Allocated', 'Documentation Pending', 'Ready for Delivery', 'Delivered'];

export default function Bookings({ mode = 'bookings' }) {
  const { db } = useDemo();
  const [sel, setSel] = useState(null);
  const [toast, setToast] = useState('');
  const b = sel && db.bookings.find((x) => x.id === sel);
  const rows = mode === 'deliveries' ? db.bookings.filter((x) => deliveryStatuses.includes(x.status)) : db.bookings;

  return (
    <Guard module="bookings">
      <div className="page">
        <PageHead
          title={mode === 'deliveries' ? 'Deliveries' : 'Bookings'}
          sub={mode === 'deliveries' ? 'Allocated vehicles moving through documents, checklist and handover.' : 'Track each purchase from booking advance to vehicle handover.'}
        />
        <DataTable
          rows={rows}
          search={['id', 'customer', 'vin']}
          filters={[{ key: 'status', label: 'Status', options: mode === 'deliveries' ? deliveryStatuses : bookingStatuses }]}
          onRow={(r) => setSel(r.id)}
          columns={[
            { label: 'Booking', render: (r) => <span className="mono">{r.id}</span> },
            { label: 'Customer', render: (r) => <b>{r.customer}</b> },
            { label: 'Vehicle', render: (r) => <>{r.variant}<div className="mono muted" style={{ fontSize: 11 }}>{r.vin}</div></> },
            { label: 'Paid', render: (r) => <PayBar paid={r.paid} total={r.total} /> },
            { label: 'Balance', render: (r) => formatINR(r.total - r.paid), num: true },
            { label: 'Documents', key: 'docs', cls: 'muted' },
            { label: mode === 'deliveries' ? 'Delivery date' : 'Expected delivery', render: (r) => fmtDate(r.expectedDelivery) },
            { label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
          ]}
        />
        {b && <BookingDrawer b={b} onClose={() => setSel(null)} toast={setToast} />}
        <Toast msg={toast} onDone={() => setToast('')} />
      </div>
    </Guard>
  );
}

function BookingDrawer({ b, onClose, toast }) {
  const { db, update, addPayment, cancelBooking, deliver, user } = useDemo();
  const [done, setDone] = useState({});
  const [paying, setPaying] = useState(false);
  const pays = db.payments.filter((p) => p.bookingId === b.id);
  const balance = b.total - b.paid;
  const allChecked = checklist.every((c) => done[c]);
  const canException = ['Dealership Manager', 'Super Admin'].includes(user.role);
  const freeVehicles = db.inventory.filter((v) => v.variant === b.variant && v.status === 'Available' && !v.testDrive);

  return (
    <Drawer title={`Booking ${b.id}`} sub={`${b.customer} · ${b.variant} · ${b.executive}`} onClose={onClose}>
      <div style={{ marginBottom: 14 }}>
        <Badge>{b.status}</Badge>
        {b.quotationId && <span className="badge badge-grey" style={{ marginLeft: 6 }}>From {b.quotationId}</span>}
      </div>
      <div className="form-row">
        <div>
          <label>Status</label>
          <select className="aselect" value={b.status} disabled={['Delivered', 'Cancelled'].includes(b.status)} onChange={(e) => update('bookings', b.id, { status: e.target.value })}>
            {bookingStatuses.filter((s) => !['Delivered', 'Cancelled'].includes(s) || s === b.status).map((s) => (<option key={s}>{s}</option>))}
          </select>
        </div>
        <div>
          <label>Documents</label>
          <select className="aselect" value={b.docs} onChange={(e) => update('bookings', b.id, { docs: e.target.value })}>
            {['Pending KYC', 'Pending insurance', 'Pending registration', 'Complete'].map((s) => (<option key={s}>{s}</option>))}
          </select>
        </div>
        <div>
          <label>Delivery date</label>
          <input className="ainput" type="date" value={b.expectedDelivery} onChange={(e) => update('bookings', b.id, { expectedDelivery: e.target.value })} />
        </div>
        <div>
          <label>Delivery executive</label>
          <select className="aselect" value={b.deliveryBy || ''} onChange={(e) => update('bookings', b.id, { deliveryBy: e.target.value })}>
            <option value="">Select</option>
            {employees.filter((e) => e.dept === 'Sales').map((e) => (<option key={e.id}>{e.name}</option>))}
          </select>
        </div>
      </div>

      <dl className="dl">
        <dt>Allocated vehicle</dt>
        <dd className="mono">{b.vehicleId ? `${b.vehicleId} · ${b.vin}` : 'Not allocated'}</dd>
        <dt>On-road total</dt>
        <dd>{formatINR(b.total)}</dd>
        <dt>Paid so far</dt>
        <dd>{formatINR(b.paid)}</dd>
        <dt>Outstanding</dt>
        <dd className={balance > 0 ? 'overdue' : ''}>{formatINR(balance)}</dd>
      </dl>
      {!b.vehicleId && b.status !== 'Cancelled' && (
        <div className="alert alert-info">
          {freeVehicles.length ? (
            <>
              {freeVehicles.length} matching vehicle(s) in stock.{' '}
              <button className="abtn abtn-xs" onClick={() => { update('bookings', b.id, { vehicleId: freeVehicles[0].id, vin: freeVehicles[0].vin, status: 'Vehicle Allocated' }, `Allocated ${freeVehicles[0].id}`); update('inventory', freeVehicles[0].id, { status: 'Allocated' }); }}>
                Allocate {freeVehicles[0].id}
              </button>
            </>
          ) : 'No matching vehicle in stock — awaiting factory allocation.'}
        </div>
      )}

      <div className="section-title">Payments</div>
      <table className="atable" style={{ marginBottom: 8 }}>
        <tbody>
          {pays.map((p) => (
            <tr key={p.id}>
              <td>{p.type} · {p.method}<div className="muted" style={{ fontSize: 11 }}>{fmtDate(p.date)} · {p.ref}</div></td>
              <td>{p.verified ? <Badge>Completed</Badge> : <span className="badge badge-amber">Unverified</span>}</td>
              <td className="num" style={{ color: p.amount < 0 ? '#b3261e' : undefined }}>{formatINR(p.amount)}</td>
            </tr>
          ))}
          {pays.length === 0 && <tr><td className="muted">No payments yet.</td></tr>}
        </tbody>
      </table>
      {!['Delivered', 'Cancelled'].includes(b.status) && <button className="abtn abtn-xs" onClick={() => setPaying(true)}>+ Record payment</button>}

      <div className="section-title">Delivery checklist</div>
      {checklist.map((c) => (
        <label key={c} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13.5, padding: '6px 0' }}>
          <input type="checkbox" checked={!!done[c] || b.status === 'Delivered'} disabled={b.status === 'Delivered'} onChange={() => setDone({ ...done, [c]: !done[c] })} /> {c}
        </label>
      ))}
      {balance > 0 && b.status !== 'Delivered' && <div className="alert alert-warn" style={{ marginTop: 10 }}>Outstanding balance must be cleared (or an authorised exception recorded) before delivery.</div>}
      <div className="actions">
        <button
          className="abtn abtn-ok"
          disabled={b.status === 'Delivered' || b.status === 'Cancelled' || !b.vehicleId || !allChecked || (balance > 0 && !b.exception)}
          onClick={() => { deliver(b); toast('Delivered — vehicle added to customer ownership records'); onClose(); }}
        >
          <Check size={14} /> Mark delivered
        </button>
        {balance > 0 && canException && !b.exception && b.status !== 'Cancelled' && (
          <button className="abtn" onClick={() => update('bookings', b.id, { exception: true }, 'Recorded authorised delivery exception')}>Record exception</button>
        )}
        {!['Delivered', 'Cancelled'].includes(b.status) && (
          <button className="abtn abtn-danger" onClick={() => { cancelBooking(b); toast(`Booking cancelled${b.vehicleId ? ', vehicle released to stock' : ''}`); onClose(); }}>
            Cancel booking
          </button>
        )}
      </div>

      {paying && (
        <FormDrawer
          title="Record payment"
          sub={`${b.id} · outstanding ${formatINR(balance)}`}
          fields={[
            { key: 'type', label: 'Type', type: 'select', options: ['Part payment', 'Final payment', 'Loan disbursement', 'Refund'], required: true, default: 'Part payment' },
            { key: 'amount', label: 'Amount (₹)', type: 'number', required: true },
            { key: 'method', label: 'Method', type: 'select', options: ['Bank transfer', 'UPI', 'Card', 'Cash', 'Cheque'], required: true, default: 'Bank transfer' },
            { key: 'ref', label: 'Transaction reference', required: true },
          ]}
          note="Notifications are not proof of payment — the accountant verifies each entry."
          submitLabel="Record"
          onClose={() => setPaying(false)}
          onSubmit={(f) => {
            if (f.type === 'Refund' && !['Accountant', 'Dealership Manager', 'Super Admin'].includes(user.role)) return toast('Refunds need Accountant or Manager authorisation');
            addPayment(b.id, f);
            setPaying(false);
            toast('Payment recorded');
          }}
        />
      )}
    </Drawer>
  );
}

function PayBar({ paid, total }) {
  const pct = Math.max(0, Math.min(100, Math.round((paid / total) * 100)));
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
