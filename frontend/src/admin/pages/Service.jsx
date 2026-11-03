import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Badge } from '../../components/ui';
import { formatINR } from '../../config/brand';
import { serviceStatuses } from '../../data/seed';
import { useDemo } from '../../store/DemoStore';
import { DataTable, Drawer, FormDrawer, Guard, Kpi, PageHead, Toast, fmtDate } from '../kit';
import { employees } from '../../data/seed';

export default function Service() {
  const { db, update, create } = useDemo();
  const [sel, setSel] = useState(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState('');
  const s = sel && db.services.find((x) => x.id === sel);
  const n = (list) => db.services.filter((x) => list.includes(x.status)).length;

  return (
    <Guard module="service">
      <div className="page">
        <PageHead title="Service & Job Cards" sub="Appointments, job cards and service history for every customer vehicle.">
          <button className="abtn abtn-primary" onClick={() => setAdding(true)}>
            <Plus size={15} /> New appointment
          </button>
        </PageHead>
        <div className="kpis">
          <Kpi label="Requested" value={n(['Requested'])} />
          <Kpi label="Confirmed" value={n(['Confirmed'])} />
          <Kpi label="In workshop" value={n(['Vehicle Received', 'Inspection', 'Job Card Created', 'In Progress', 'Quality Check'])} />
          <Kpi label="Payment pending" value={n(['Payment Pending'])} />
          <Kpi label="Completed" value={n(['Completed', 'Vehicle Delivered'])} tone="good" />
        </div>
        <DataTable
          rows={db.services}
          search={['id', 'customer', 'vehicle', 'jobCard']}
          filters={[
            { key: 'status', label: 'Status', options: serviceStatuses },
            { key: 'type', label: 'Type', options: ['Periodic service', 'Repair', 'Warranty', 'Accident repair', 'Inspection'] },
          ]}
          onRow={(r) => setSel(r.id)}
          columns={[
            { label: 'Appt', render: (r) => <span className="mono">{r.id}</span> },
            { label: 'Job card', render: (r) => (r.jobCard ? <span className="mono">{r.jobCard}</span> : '—') },
            { label: 'Customer', render: (r) => <b>{r.customer}</b> },
            { label: 'Vehicle', key: 'vehicle' },
            { label: 'Type', key: 'type' },
            { label: 'Complaint', key: 'complaint', cls: 'muted' },
            { label: 'Date', render: (r) => fmtDate(r.date) },
            { label: 'Estimate', render: (r) => formatINR(r.estimate), num: true },
            { label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
          ]}
        />
        {adding && (
          <FormDrawer
            title="New service appointment"
            fields={[
              { key: 'customerId', label: 'Customer', type: 'select', required: true, full: true, options: db.customerVehicles.map((v) => ({ value: v.id, label: `${v.customer} · ${v.model} · ${v.registration}` })) },
              { key: 'type', label: 'Service type', type: 'select', options: ['Periodic service', 'Repair', 'Warranty', 'Accident repair', 'Inspection'], required: true },
              { key: 'date', label: 'Date', type: 'date', required: true },
              { key: 'complaint', label: 'Customer complaint', type: 'textarea', full: true },
            ]}
            submitLabel="Create appointment"
            onClose={() => setAdding(false)}
            onSubmit={(f) => {
              const v = db.customerVehicles.find((x) => x.id === f.customerId);
              const id = create('services', 'SV', { jobCard: null, customerId: v.customerId, customer: v.customer, vehicle: `${v.model} · ${v.registration}`, type: f.type, date: f.date, advisor: 'Rahul Krishnan', complaint: f.complaint || f.type, estimate: 0, status: 'Confirmed' }, 'Created service appointment');
              setAdding(false);
              setToast(`Appointment ${id} created`);
            }}
          />
        )}
        <Toast msg={toast} onDone={() => setToast('')} />
        {s && (
          <Drawer title={s.jobCard ? `Job card ${s.jobCard}` : `Appointment ${s.id}`} sub={`${s.customer} · ${s.vehicle}`} onClose={() => setSel(null)}>
            <dl className="dl">
              <dt>Service type</dt>
              <dd>{s.type}</dd>
              <dt>Complaint</dt>
              <dd>{s.complaint}</dd>
              <dt>Advisor</dt>
              <dd>
                <select className="aselect" value={s.advisor} onChange={(e) => update('services', s.id, { advisor: e.target.value })}>
                  <option>Unassigned</option>
                  {employees.filter((e) => e.dept === 'Service').map((e) => (<option key={e.id}>{e.name}</option>))}
                </select>
              </dd>
              <dt>Technician</dt>
              <dd>
                <select className="aselect" value={s.technician || ''} onChange={(e) => update('services', s.id, { technician: e.target.value })}>
                  <option value="">Not assigned</option>
                  {['Ravi (Bay 1)', 'Imran (Bay 2)', 'Selvam (EV bay)'].map((x) => (<option key={x}>{x}</option>))}
                </select>
              </dd>
              <dt>Appointment</dt>
              <dd>{fmtDate(s.date)}</dd>
            </dl>
            <div className="section-title">Estimate</div>
            <table className="atable">
              <tbody>
                <tr><td>Labour</td><td className="num">{formatINR(Math.round(s.estimate * 0.4))}</td></tr>
                <tr><td>Parts & consumables</td><td className="num">{formatINR(Math.round(s.estimate * 0.6))}</td></tr>
                <tr><td><b>Total</b></td><td className="num"><b>{formatINR(s.estimate)}</b></td></tr>
              </tbody>
            </table>
            <div className="form-row" style={{ marginTop: 10 }}>
              <div>
                <label>Update estimate (₹)</label>
                <input className="ainput" type="number" defaultValue={s.estimate} onBlur={(e) => Number(e.target.value) !== s.estimate && update('services', s.id, { estimate: Number(e.target.value) }, 'Updated service estimate')} />
              </div>
              <div>
                <label>Customer approval</label>
                <select className="aselect" value={s.approval || 'Pending'} onChange={(e) => update('services', s.id, { approval: e.target.value })}>
                  {['Pending', 'Approved by customer', 'Declined'].map((x) => (<option key={x}>{x}</option>))}
                </select>
              </div>
            </div>
            <div className="form-row" style={{ marginTop: 14 }}>
              <div>
                <label>Status</label>
                <select className="aselect" value={s.status} onChange={(e) => update('services', s.id, { status: e.target.value, jobCard: s.jobCard || (e.target.value === 'Job Card Created' ? `JC-${s.id.slice(3)}` : null) })}>
                  {serviceStatuses.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="section-title">Service history for this customer</div>
            <div className="timeline">
              {db.services.filter((x) => x.customerId === s.customerId && x.id !== s.id).map((x) => (
                <div key={x.id}>{x.type} · {x.status}<small>{fmtDate(x.date)} · {x.id}</small></div>
              ))}
              {db.customerVehicles.filter((v) => v.customerId === s.customerId).map((v) => (
                <div key={v.id}>{v.model} purchased<small>{fmtDate(v.purchased)}</small></div>
              ))}
            </div>
          </Drawer>
        )}
      </div>
    </Guard>
  );
}
