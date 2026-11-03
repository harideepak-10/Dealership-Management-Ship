import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Badge } from '../../components/ui';
import { formatINR } from '../../config/brand';
import { serviceStatuses } from '../../data/seed';
import { useDemo } from '../../store/DemoStore';
import { DataTable, Drawer, Guard, Kpi, PageHead, fmtDate } from '../kit';

export default function Service() {
  const { db, update } = useDemo();
  const [sel, setSel] = useState(null);
  const s = sel && db.services.find((x) => x.id === sel);
  const n = (list) => db.services.filter((x) => list.includes(x.status)).length;

  return (
    <Guard module="service">
      <div className="page">
        <PageHead title="Service & Job Cards" sub="Appointments, job cards and service history for every customer vehicle.">
          <button className="abtn abtn-primary">
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
        {s && (
          <Drawer title={s.jobCard ? `Job card ${s.jobCard}` : `Appointment ${s.id}`} sub={`${s.customer} · ${s.vehicle}`} onClose={() => setSel(null)}>
            <dl className="dl">
              <dt>Service type</dt>
              <dd>{s.type}</dd>
              <dt>Complaint</dt>
              <dd>{s.complaint}</dd>
              <dt>Advisor</dt>
              <dd>{s.advisor}</dd>
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
            <div className="section-title">Service history</div>
            <div className="timeline">
              <div>
                Periodic service · 10,000 km
                <small>6 months ago</small>
              </div>
              <div>
                Vehicle delivered
                <small>1 year ago</small>
              </div>
            </div>
          </Drawer>
        )}
      </div>
    </Guard>
  );
}
