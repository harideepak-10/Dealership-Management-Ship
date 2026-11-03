// Remaining dashboard modules: payments, customer vehicles, tasks, reports,
// employees & roles, audit logs, settings and notifications.
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Bell, Check, Download, Plus } from 'lucide-react';
import { Badge } from '../../components/ui';
import { brand, formatINR } from '../../config/brand';
import { employees, monthlySales } from '../../data/seed';
import { models } from '../../data/models';
import { modules, roles, useDemo } from '../../store/DemoStore';
import { DataTable, FormDrawer, Guard, Kpi, PageHead, Toast, exportCSV, fmtDate, todayISO } from '../kit';

const sum = (a, f) => a.reduce((s, x) => s + f(x), 0);

// ---------------- Payments ----------------
export function Payments() {
  const { db, update, user } = useDemo();
  const [toast, setToast] = useState('');
  const canVerify = ['Accountant', 'Dealership Manager', 'Super Admin'].includes(user.role);
  const received = sum(db.payments.filter((p) => p.amount > 0), (p) => p.amount);
  const refunds = sum(db.payments.filter((p) => p.amount < 0), (p) => -p.amount);
  const outstanding = sum(db.bookings.filter((b) => b.status !== 'Cancelled'), (b) => Math.max(0, b.total - b.paid));

  return (
    <Guard module="payments">
      <div className="page">
        <PageHead title="Payments" sub="Booking advances, part payments, refunds and verification. Record new payments from a booking.">
          <button className="abtn" onClick={() => exportCSV('payments.csv', db.payments)}>
            <Download size={15} /> Export
          </button>
        </PageHead>
        <div className="kpis">
          <Kpi label="Received" value={formatINR(received)} tone="good" sub={`${db.payments.filter((p) => p.amount > 0).length} entries`} />
          <Kpi label="Outstanding balances" value={formatINR(outstanding)} sub="Across active bookings" tone="warn" />
          <Kpi label="Refunds" value={formatINR(refunds)} />
          <Kpi label="Awaiting verification" value={db.payments.filter((p) => !p.verified).length} />
        </div>
        <DataTable
          rows={db.payments}
          search={['id', 'bookingId', 'customer', 'ref']}
          filters={[
            { key: 'method', label: 'Method', options: ['UPI', 'Bank transfer', 'Card', 'Cash', 'Cheque'] },
            { key: 'type', label: 'Type', options: ['Booking advance', 'Part payment', 'Final payment', 'Loan disbursement', 'Refund'] },
          ]}
          columns={[
            { label: 'Receipt', render: (r) => <span className="mono">{r.id}</span> },
            { label: 'Date', render: (r) => fmtDate(r.date) },
            { label: 'Booking', render: (r) => <span className="mono">{r.bookingId}</span> },
            { label: 'Customer', render: (r) => <b>{r.customer}</b> },
            { label: 'Type', key: 'type' },
            { label: 'Method', key: 'method', cls: 'muted' },
            { label: 'Reference', render: (r) => <span className="mono">{r.ref}</span> },
            { label: 'Amount', render: (r) => <b style={{ color: r.amount < 0 ? '#b3261e' : undefined }}>{formatINR(r.amount)}</b>, num: true },
            {
              label: 'Verification',
              render: (r) =>
                r.verified ? (
                  <Badge>Completed</Badge>
                ) : (
                  <button className="abtn abtn-xs" disabled={!canVerify} onClick={(e) => { e.stopPropagation(); update('payments', r.id, { verified: true }, 'Verified payment'); setToast(`${r.id} verified`); }}>
                    Verify
                  </button>
                ),
            },
            { label: '', render: (r) => <button className="abtn abtn-xs" onClick={(e) => { e.stopPropagation(); window.open(`#/receipt/${r.id}`, '_blank'); }}>Receipt</button> },
          ]}
        />
        <Toast msg={toast} onDone={() => setToast('')} />
      </div>
    </Guard>
  );
}

export function ReceiptPrint({ id }) {
  const { db } = useDemo();
  const p = db.payments.find((x) => x.id === id);
  if (!p) return <p style={{ padding: 40 }}>Receipt not found.</p>;
  return (
    <div className="print-page">
      <div className="no-print" style={{ marginBottom: 20 }}>
        <button className="abtn abtn-primary" onClick={() => window.print()}>Save as PDF / Print</button>
      </div>
      <div className="print-head">
        <div>
          <div className="print-logo">{brand.name.toUpperCase()}</div>
          <div>{brand.dealership}</div>
          <small>{brand.address}</small>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2>{p.amount < 0 ? 'Refund voucher' : 'Payment receipt'}</h2>
          <b>{p.id}</b>
          <div><small>{fmtDate(p.date)}</small></div>
        </div>
      </div>
      <table className="atable">
        <tbody>
          <tr><td>Received from</td><td>{p.customer}</td></tr>
          <tr><td>Against booking</td><td>{p.bookingId}</td></tr>
          <tr><td>Payment type</td><td>{p.type}</td></tr>
          <tr><td>Method / reference</td><td>{p.method} · {p.ref}</td></tr>
          <tr><td><b>Amount</b></td><td><b>{formatINR(p.amount)}</b></td></tr>
        </tbody>
      </table>
      <p className="print-foot">{p.verified ? 'Verified by accounts.' : 'Subject to verification by accounts.'} {brand.disclaimer}.</p>
    </div>
  );
}

// ---------------- Customer vehicles ----------------
export function CustomerVehicles() {
  const { db } = useDemo();
  const today = todayISO();
  return (
    <Guard module="service">
      <div className="page">
        <PageHead title="Customer Vehicles" sub="Sold and delivered vehicles linked to their owners, with warranty and last service." />
        <DataTable
          rows={db.customerVehicles}
          search={['customer', 'registration', 'vin', 'model']}
          filters={[{ key: 'model', label: 'Model', options: models.map((m) => m.name) }]}
          columns={[
            { label: 'ID', render: (r) => <span className="mono">{r.id}</span> },
            { label: 'Owner', render: (r) => <b>{r.customer}</b> },
            { label: 'Model', key: 'model' },
            { label: 'Registration', key: 'registration' },
            { label: 'VIN', render: (r) => <span className="mono">{r.vin}</span> },
            { label: 'Purchased', render: (r) => fmtDate(r.purchased) },
            { label: 'Warranty', render: (r) => (r.warrantyTill >= today ? <Badge>Active</Badge> : <Badge>Expired</Badge>) },
            { label: 'Last service', render: (r) => fmtDate(r.lastService) },
          ]}
        />
      </div>
    </Guard>
  );
}

// ---------------- Tasks ----------------
export function Tasks() {
  const { db, create, update, user } = useDemo();
  const [adding, setAdding] = useState(false);
  const [mine, setMine] = useState(false);
  const today = todayISO();
  const rows = db.tasks
    .map((t) => ({ ...t, status: t.status !== 'Completed' && t.status !== 'Cancelled' && t.due < today ? 'Overdue' : t.status }))
    .filter((t) => !mine || t.owner === user.name);

  return (
    <Guard module="tasks">
      <div className="page">
        <PageHead title="Tasks & Follow-ups" sub="Assign work, set due dates and track what's overdue.">
          <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13 }}>
            <input type="checkbox" checked={mine} onChange={() => setMine(!mine)} /> My tasks
          </label>
          <button className="abtn abtn-primary" onClick={() => setAdding(true)}>
            <Plus size={15} /> New task
          </button>
        </PageHead>
        <div className="kpis">
          {['Pending', 'In Progress', 'Overdue', 'Completed'].map((s) => (
            <Kpi key={s} label={s} value={rows.filter((t) => t.status === s).length} tone={s === 'Overdue' ? 'warn' : ''} />
          ))}
        </div>
        <DataTable
          rows={rows}
          search={['title', 'linkedTo', 'owner']}
          filters={[
            { key: 'status', label: 'Status', options: ['Pending', 'In Progress', 'Overdue', 'Completed', 'Cancelled'] },
            { key: 'owner', label: 'Owner', options: employees.map((e) => e.name) },
          ]}
          columns={[
            { label: 'Task', render: (r) => <b>{r.title}</b> },
            { label: 'Linked to', render: (r) => <span className="mono">{r.linkedTo}</span> },
            { label: 'Owner', key: 'owner' },
            { label: 'Due', render: (r) => <span className={r.status === 'Overdue' ? 'overdue' : ''}>{fmtDate(r.due)}</span> },
            { label: 'Priority', render: (r) => <Badge>{r.priority}</Badge> },
            { label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
            {
              label: '',
              render: (r) =>
                r.status !== 'Completed' && (
                  <button className="abtn abtn-xs" onClick={() => update('tasks', r.id, { status: 'Completed' }, 'Completed task')}>
                    <Check size={12} /> Done
                  </button>
                ),
            },
          ]}
        />
        {adding && (
          <FormDrawer
            title="New task"
            fields={[
              { key: 'title', label: 'Task', required: true, full: true },
              { key: 'linkedTo', label: 'Linked record (lead, test drive, booking…)', type: 'select', options: ['—', ...db.leads.slice(0, 15).map((l) => l.id), ...db.testDrives.slice(0, 10).map((t) => t.id), ...db.bookings.map((b) => b.id)], default: '—' },
              { key: 'owner', label: 'Assign to', type: 'select', options: employees.map((e) => e.name), required: true, default: user.name },
              { key: 'due', label: 'Due date', type: 'date', required: true, default: today },
              { key: 'priority', label: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'], default: 'Medium' },
            ]}
            submitLabel="Create task"
            onClose={() => setAdding(false)}
            onSubmit={(f) => {
              create('tasks', 'TSK', { ...f, status: 'Pending' }, 'Created task');
              setAdding(false);
            }}
          />
        )}
      </div>
    </Guard>
  );
}

// ---------------- Reports ----------------
const tabs = ['Sales', 'Leads', 'Test drives', 'Inventory', 'Service'];

export function Reports() {
  const { db } = useDemo();
  const [tab, setTab] = useState('Sales');
  const age = (d) => Math.round((Date.now() - new Date(d)) / 86400000);

  const salesByModel = models.map((m) => ({ name: m.name, value: db.bookings.filter((b) => b.model === m.name && b.status !== 'Cancelled').length }));
  const quoteConv = db.quotations.length ? Math.round((db.quotations.filter((q) => q.status === 'Accepted').length / db.quotations.length) * 100) : 0;
  const sources = [...new Set(db.leads.map((l) => l.source))].map((s) => {
    const all = db.leads.filter((l) => l.source === s);
    return { name: s, leads: all.length, converted: all.filter((l) => l.status === 'Converted').length, lost: all.filter((l) => l.status === 'Lost').length };
  });
  const tdStatus = ['Requested', 'Confirmed', 'Completed', 'Cancelled', 'No Show', 'Rejected'].map((s) => ({ name: s, value: db.testDrives.filter((t) => t.status === s).length }));
  const ageing = [
    { name: '0–30 d', value: db.inventory.filter((v) => !['Sold', 'Delivered'].includes(v.status) && age(v.acquired) <= 30).length },
    { name: '31–60 d', value: db.inventory.filter((v) => !['Sold', 'Delivered'].includes(v.status) && age(v.acquired) > 30 && age(v.acquired) <= 60).length },
    { name: '61–90 d', value: db.inventory.filter((v) => !['Sold', 'Delivered'].includes(v.status) && age(v.acquired) > 60 && age(v.acquired) <= 90).length },
    { name: '90+ d', value: db.inventory.filter((v) => !['Sold', 'Delivered'].includes(v.status) && age(v.acquired) > 90).length },
  ];
  const invByModel = models.map((m) => ({ name: m.name, value: db.inventory.filter((v) => v.model === m.name && v.status === 'Available').length }));
  const svcByType = [...new Set(db.services.map((s) => s.type))].map((t) => ({ name: t, value: sum(db.services.filter((s) => s.type === t), (s) => s.estimate) / 100000 }));

  const views = {
    Sales: {
      kpis: [
        ['Units (6 months)', sum(monthlySales, (m) => m.units)],
        ['Revenue (6 months)', `₹${sum(monthlySales, (m) => m.revenue).toFixed(1)} Cr`],
        ['Active bookings', db.bookings.filter((b) => !['Delivered', 'Cancelled'].includes(b.status)).length],
        ['Quotation conversion', `${quoteConv}%`],
      ],
      charts: [
        ['Monthly units', monthlySales.map((m) => ({ name: m.month, value: m.units }))],
        ['Bookings by model', salesByModel],
      ],
      table: db.bookings,
      file: 'sales-report.csv',
    },
    Leads: {
      kpis: [
        ['Total leads', db.leads.length],
        ['Converted', db.leads.filter((l) => l.status === 'Converted').length],
        ['Lost', db.leads.filter((l) => l.status === 'Lost').length],
        ['Unassigned', db.leads.filter((l) => !l.owner).length],
      ],
      charts: [
        ['Leads by source', sources.map((s) => ({ name: s.name, value: s.leads }))],
        ['Leads by model', models.map((m) => ({ name: m.name, value: db.leads.filter((l) => l.model === m.name).length }))],
      ],
      table: sources,
      file: 'lead-sources.csv',
    },
    'Test drives': {
      kpis: [
        ['Total requests', db.testDrives.length],
        ['Completed', db.testDrives.filter((t) => t.status === 'Completed').length],
        ['No-shows', db.testDrives.filter((t) => t.status === 'No Show').length],
        ['Cancelled', db.testDrives.filter((t) => t.status === 'Cancelled').length],
      ],
      charts: [['By status', tdStatus]],
      table: db.testDrives,
      file: 'test-drives.csv',
    },
    Inventory: {
      kpis: [
        ['Available', db.inventory.filter((v) => v.status === 'Available').length],
        ['Reserved', db.inventory.filter((v) => v.status === 'Reserved').length],
        ['Allocated', db.inventory.filter((v) => v.status === 'Allocated').length],
        ['Stock value', formatINR(sum(db.inventory.filter((v) => !['Sold', 'Delivered'].includes(v.status)), (v) => v.cost))],
      ],
      charts: [
        ['Inventory ageing', ageing],
        ['Available by model', invByModel],
      ],
      table: db.inventory,
      file: 'inventory.csv',
    },
    Service: {
      kpis: [
        ['Appointments', db.services.length],
        ['Completed', db.services.filter((s) => ['Completed', 'Vehicle Delivered'].includes(s.status)).length],
        ['Pending', db.services.filter((s) => ['Requested', 'Confirmed'].includes(s.status)).length],
        ['Estimated revenue', formatINR(sum(db.services, (s) => s.estimate))],
      ],
      charts: [['Revenue by service type (₹ lakh)', svcByType]],
      table: db.services,
      file: 'service.csv',
    },
  };
  const v = views[tab];

  return (
    <Guard module="reports">
      <div className="page">
        <PageHead title="Reports" sub="Figures are calculated live from the records in the system.">
          <div className="tabs">
            {tabs.map((t) => (
              <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
          <button className="abtn" onClick={() => exportCSV(v.file, v.table)}>
            <Download size={15} /> Export CSV
          </button>
        </PageHead>
        <div className="kpis">
          {v.kpis.map(([l, val]) => (<Kpi key={l} label={l} value={val} />))}
        </div>
        <div className={v.charts.length > 1 ? 'grid-half' : ''}>
          {v.charts.map(([title, data]) => (
            <div className="card" key={title} style={{ marginBottom: 18 }}>
              <div className="card-head"><h3>{title}</h3></div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data} margin={{ left: -16 }}>
                  <CartesianGrid vertical={false} stroke="#eef0f3" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} interval={0} angle={data.length > 6 ? -25 : 0} textAnchor={data.length > 6 ? 'end' : 'middle'} height={data.length > 6 ? 60 : 30} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#f5f6f8' }} />
                  <Bar dataKey="value" name={title} fill="#1f2a37" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
        {tab === 'Leads' && (
          <div className="table-wrap">
            <table className="atable">
              <thead><tr><th>Source</th><th className="num">Leads</th><th className="num">Converted</th><th className="num">Lost</th><th className="num">Conversion</th></tr></thead>
              <tbody>
                {sources.map((s) => (
                  <tr key={s.name}><td>{s.name}</td><td className="num">{s.leads}</td><td className="num">{s.converted}</td><td className="num">{s.lost}</td><td className="num">{Math.round((s.converted / s.leads) * 100)}%</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Guard>
  );
}

// ---------------- Employees & roles ----------------
const moduleLabels = { overview: 'Dashboard', leads: 'Leads', customers: 'Customers', testdrives: 'Test drives', inventory: 'Inventory', quotations: 'Quotations', bookings: 'Bookings', payments: 'Payments', service: 'Service', tasks: 'Tasks', reports: 'Reports', automations: 'Automations', employees: 'Employees', settings: 'Settings' };

export function Employees() {
  const { db } = useDemo();
  const [tab, setTab] = useState('people');
  const [active, setActive] = useState(() => Object.fromEntries(employees.map((e) => [e.id, true])));
  return (
    <Guard module="employees">
      <div className="page">
        <PageHead title="Employees & Roles" sub="Each role sees only the modules it is permitted to.">
          <div className="tabs">
            <button className={tab === 'people' ? 'on' : ''} onClick={() => setTab('people')}>Employees</button>
            <button className={tab === 'roles' ? 'on' : ''} onClick={() => setTab('roles')}>Role permissions</button>
          </div>
        </PageHead>
        {tab === 'people' ? (
          <div className="table-wrap">
            <table className="atable">
              <thead><tr><th>ID</th><th>Name</th><th>Role</th><th>Department</th><th className="num">Leads</th><th className="num">Open tasks</th><th>Account</th></tr></thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.id}>
                    <td className="mono">{e.id}</td>
                    <td><b>{e.name}</b></td>
                    <td>{e.role}</td>
                    <td className="muted">{e.dept}</td>
                    <td className="num">{db.leads.filter((l) => l.owner === e.name).length}</td>
                    <td className="num">{db.tasks.filter((t) => t.owner === e.name && t.status !== 'Completed').length}</td>
                    <td>
                      <button className="abtn abtn-xs" onClick={() => setActive({ ...active, [e.id]: !active[e.id] })}>
                        {active[e.id] ? 'Active · Deactivate' : 'Inactive · Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="atable">
              <thead>
                <tr><th>Role</th>{modules.map((m) => (<th key={m} style={{ textAlign: 'center' }}>{moduleLabels[m]}</th>))}</tr>
              </thead>
              <tbody>
                {Object.entries(roles).map(([r, mods]) => (
                  <tr key={r}>
                    <td><b>{r}</b></td>
                    {modules.map((m) => (<td key={m} style={{ textAlign: 'center', color: mods.includes(m) ? '#1d7a3a' : '#c4c8ce' }}>{mods.includes(m) ? '✓' : '—'}</td>))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Guard>
  );
}

// ---------------- Audit logs ----------------
export function Audit() {
  const { db } = useDemo();
  return (
    <Guard module="employees">
      <div className="page">
        <PageHead title="Audit Logs" sub="Every important change, who made it and when.">
          <button className="abtn" onClick={() => exportCSV('audit-log.csv', db.audit)}><Download size={15} /> Export</button>
        </PageHead>
        <DataTable
          rows={db.audit}
          search={['who', 'action', 'record']}
          filters={[{ key: 'who', label: 'User', options: [...new Set(db.audit.map((a) => a.who))] }]}
          pageSize={20}
          columns={[
            { label: 'When', key: 'when', cls: 'mono' },
            { label: 'User', render: (r) => <b>{r.who}</b> },
            { label: 'Action', key: 'action' },
            { label: 'Record', render: (r) => <span className="mono">{r.record}</span> },
          ]}
        />
      </div>
    </Guard>
  );
}

// ---------------- Settings ----------------
export function Settings() {
  const { db, saveSettings } = useDemo();
  const [s, setS] = useState(db.settings);
  const [toast, setToast] = useState('');
  const num = (k) => (e) => setS({ ...s, [k]: Number(e.target.value) });
  return (
    <Guard module="settings">
      <div className="page">
        <PageHead title="Settings" sub="Business rules used across quotations, bookings and notifications." />
        <div className="grid-half">
          <div className="card">
            <h3 style={{ marginBottom: 14 }}>Dealership & brand</h3>
            <dl className="dl">
              <dt>Brand</dt><dd>{brand.name}</dd>
              <dt>Dealership</dt><dd>{brand.dealership}</dd>
              <dt>Address</dt><dd>{brand.address}</dd>
              <dt>Phone</dt><dd>{brand.phone}</dd>
              <dt>Email</dt><dd>{brand.email}</dd>
            </dl>
            <p style={{ fontSize: 12, color: '#6a7280' }}>Brand details come from <code>src/config/brand.js</code> in this demo; in the full build they are edited here.</p>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 14 }}>Sales rules</h3>
            <div className="form-row">
              <div><label>Discount approval limit (₹)</label><input className="ainput" type="number" value={s.discountLimit} onChange={num('discountLimit')} /></div>
              <div><label>Quotation validity (days)</label><input className="ainput" type="number" value={s.quoteValidityDays} onChange={num('quoteValidityDays')} /></div>
              <div><label>GST rate</label><input className="ainput" type="number" step="0.01" value={s.gstRate} onChange={num('gstRate')} /></div>
              <div><label>Compensation cess</label><input className="ainput" type="number" step="0.01" value={s.cessRate} onChange={num('cessRate')} /></div>
              <div><label>Registration & handling (₹)</label><input className="ainput" type="number" value={s.registrationCharges} onChange={num('registrationCharges')} /></div>
              <div><label>Default booking amount (₹)</label><input className="ainput" type="number" value={s.bookingAmount} onChange={num('bookingAmount')} /></div>
            </div>
            <div className="section-title">Notification channels</div>
            {Object.keys(s.channels).map((c) => (
              <label key={c} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13.5, padding: '4px 0', textTransform: 'capitalize' }}>
                <input type="checkbox" checked={s.channels[c]} onChange={() => setS({ ...s, channels: { ...s.channels, [c]: !s.channels[c] } })} /> {c === 'sms' ? 'SMS' : c}
              </label>
            ))}
            <div className="actions">
              <button className="abtn abtn-primary" onClick={() => { saveSettings(s); setToast('Settings saved'); }}>Save settings</button>
            </div>
          </div>
        </div>
        <Toast msg={toast} onDone={() => setToast('')} />
      </div>
    </Guard>
  );
}

// ---------------- Notifications ----------------
export function Notifications() {
  const { db, markAllRead } = useDemo();
  return (
    <div className="page">
      <PageHead title="Notifications" sub="System alerts. Email / SMS / WhatsApp delivery is simulated in this demo.">
        <button className="abtn" onClick={markAllRead}>Mark all read</button>
      </PageHead>
      <div className="card" style={{ padding: 8 }}>
        {db.notifications.map((n) => (
          <div key={n.id} style={{ display: 'flex', gap: 12, padding: '12px 12px', borderBottom: '1px solid #f0f1f4', background: n.read ? 'transparent' : '#f7f8fb', borderRadius: 8, fontSize: 14 }}>
            <Bell size={16} style={{ marginTop: 2, flexShrink: 0, color: n.read ? '#9aa1ab' : '#c8102e' }} />
            <div style={{ flex: 1 }}>{n.text}</div>
            <small style={{ color: '#6a7280' }}>{n.when}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
