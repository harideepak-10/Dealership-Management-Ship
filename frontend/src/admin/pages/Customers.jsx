import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Plus } from 'lucide-react';
import { Badge } from '../../components/ui';
import { formatINR } from '../../config/brand';
import { salesExecs } from '../../data/seed';
import { useDemo } from '../../store/DemoStore';
import { DataTable, Drawer, Guard, PageHead, fmtDate } from '../kit';

export default function Customers() {
  const { db } = useDemo();
  const [p] = useSearchParams();
  const [sel, setSel] = useState(null);
  const c = sel && db.customers.find((x) => x.id === sel);

  // Possible duplicates: same name appearing more than once
  const dupNames = new Set(db.customers.map((x) => x.name).filter((n, i, a) => a.indexOf(n) !== i));

  return (
    <Guard module="customers">
      <div className="page">
        <PageHead title="Customers" sub="One profile per customer, shared across leads, test drives, quotations, bookings and service.">
          <button className="abtn">
            <Download size={15} /> Export
          </button>
          <button className="abtn abtn-primary">
            <Plus size={15} /> New customer
          </button>
        </PageHead>
        {dupNames.size > 0 && (
          <div className="alert alert-info">
            {dupNames.size} possible duplicate name{dupNames.size > 1 ? 's' : ''} detected ({[...dupNames].slice(0, 3).join(', ')}). In the full build these are matched on mobile/email and offered for merge.
          </div>
        )}
        <DataTable
          key={p.get('q') || ''}
          initialQuery={p.get('q') || ''}
          rows={db.customers}
          search={['id', 'name', 'mobile', 'email']}
          filters={[
            { key: 'status', label: 'Status', options: ['Prospect', 'Active', 'Customer', 'Inactive'] },
            { key: 'owner', label: 'Owner', options: salesExecs.map((e) => e.name) },
            { key: 'contactPref', label: 'Contact via', options: ['Phone', 'WhatsApp', 'Email'] },
          ]}
          onRow={(r) => setSel(r.id)}
          columns={[
            { label: 'ID', render: (r) => <span className="mono">{r.id}</span> },
            { label: 'Name', render: (r) => <><b>{r.name}</b>{dupNames.has(r.name) && <span className="badge badge-amber" style={{ marginLeft: 6 }}>Possible duplicate</span>}</> },
            { label: 'Mobile', key: 'mobile' },
            { label: 'Email', key: 'email', cls: 'muted' },
            { label: 'Interested in', render: (r) => r.interested.join(', ') },
            { label: 'Budget', key: 'budget' },
            { label: 'Owner', render: (r) => r.owner || '—' },
            { label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
            { label: 'Since', render: (r) => fmtDate(r.registered) },
          ]}
        />
        {c && <CustomerDrawer c={c} onClose={() => setSel(null)} />}
      </div>
    </Guard>
  );
}

function CustomerDrawer({ c, onClose }) {
  const { db } = useDemo();
  const leads = db.leads.filter((x) => x.customerId === c.id);
  const tds = db.testDrives.filter((x) => x.customerId === c.id);
  const qts = db.quotations.filter((x) => x.customerId === c.id);
  const bks = db.bookings.filter((x) => x.customerId === c.id);
  const svc = db.services.filter((x) => x.customerId === c.id);
  const Row = ({ items, render }) =>
    items.length ? items.map((x) => <div key={x.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f1f4', fontSize: 13, gap: 8 }}>{render(x)}</div>) : <p style={{ fontSize: 13, color: '#6a7280' }}>None yet.</p>;

  return (
    <Drawer title={c.name} sub={`${c.id} · customer since ${fmtDate(c.registered)}`} onClose={onClose}>
      <dl className="dl">
        <dt>Mobile</dt>
        <dd>{c.mobile}</dd>
        <dt>Email</dt>
        <dd>{c.email || '—'}</dd>
        <dt>Address</dt>
        <dd>{c.address}</dd>
        <dt>Contact via</dt>
        <dd>{c.contactPref}</dd>
        <dt>Budget / timeline</dt>
        <dd>
          {c.budget} · {c.timeline}
        </dd>
        <dt>Owner</dt>
        <dd>{c.owner || 'Unassigned'}</dd>
        <dt>Status</dt>
        <dd>
          <Badge>{c.status}</Badge>
        </dd>
      </dl>
      <div className="section-title">Leads ({leads.length})</div>
      <Row items={leads} render={(x) => <><span>{x.id} · {x.model} · {x.source}</span><Badge>{x.status}</Badge></>} />
      <div className="section-title">Test drives ({tds.length})</div>
      <Row items={tds} render={(x) => <><span>{x.id} · {x.variant} · {fmtDate(x.date)}</span><Badge>{x.status}</Badge></>} />
      <div className="section-title">Quotations ({qts.length})</div>
      <Row items={qts} render={(x) => <><span>{x.id} · {x.variant} · {formatINR(x.total)}</span><Badge>{x.status}</Badge></>} />
      <div className="section-title">Bookings ({bks.length})</div>
      <Row items={bks} render={(x) => <><span>{x.id} · {x.variant}</span><Badge>{x.status}</Badge></>} />
      <div className="section-title">Service ({svc.length})</div>
      <Row items={svc} render={(x) => <><span>{x.id} · {x.type}</span><Badge>{x.status}</Badge></>} />
    </Drawer>
  );
}
