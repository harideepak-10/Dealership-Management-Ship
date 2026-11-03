import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, CalendarDays, Car, ClipboardList, Inbox, Target, Truck, Users, Wrench } from 'lucide-react';
import { Badge } from '../../components/ui';
import { monthlySales, recentActivity, salesExecs } from '../../data/seed';
import { models } from '../../data/models';
import { useDemo } from '../../store/DemoStore';
import { Kpi, PageHead, fmtDate, todayISO } from '../kit';
import { buildDigest } from '../../store/automation';
import { Zap } from 'lucide-react';

const palette = ['#1f2a37', '#c8102e', '#4d7cbf', '#2f8f83', '#9b6bc9', '#d07a4a', '#8a94a3'];

export default function Overview() {
  const { db, user } = useDemo();
  const today = todayISO();
  const open = (l) => !['Converted', 'Lost', 'Not Interested'].includes(l.status);

  const k = {
    customers: db.customers.length,
    newEnq: db.leads.filter((l) => l.status === 'New').length,
    pending: db.leads.filter(open).length,
    overdue: db.leads.filter((l) => open(l) && l.nextFollowUp && l.nextFollowUp < today).length,
    tdToday: db.testDrives.filter((t) => t.date === today && !['Cancelled', 'Rejected'].includes(t.status)).length,
    tdUpcoming: db.testDrives.filter((t) => t.date > today && ['Requested', 'Confirmed', 'Assigned'].includes(t.status)).length,
    tdRequested: db.testDrives.filter((t) => t.status === 'Requested').length,
    tdDone: db.testDrives.filter((t) => t.status === 'Completed').length,
    available: db.inventory.filter((v) => v.status === 'Available').length,
    reserved: db.inventory.filter((v) => v.status === 'Reserved').length,
    bookings: db.bookings.filter((b) => !['Delivered', 'Cancelled'].includes(b.status)).length,
    deliveries: db.bookings.filter((b) => b.status === 'Ready for Delivery' || b.status === 'Documentation Pending').length,
    svcUpcoming: db.services.filter((s) => s.date >= today && ['Requested', 'Confirmed'].includes(s.status)).length,
    svcProgress: db.services.filter((s) => ['Vehicle Received', 'Inspection', 'Job Card Created', 'In Progress', 'Quality Check'].includes(s.status)).length,
  };

  const bySource = Object.entries(db.leads.reduce((a, l) => ({ ...a, [l.source]: (a[l.source] || 0) + 1 }), {})).map(([name, value]) => ({ name, value }));
  const byModel = models.map((m) => ({ name: m.name, leads: db.leads.filter((l) => l.model === m.name).length }));
  const funnel = [
    { name: 'Leads', v: db.leads.length },
    { name: 'Contacted', v: db.leads.filter((l) => !['New', 'Assigned'].includes(l.status)).length },
    { name: 'Test drive', v: db.leads.filter((l) => ['Test Drive Scheduled', 'Quotation Sent', 'Negotiation', 'Converted'].includes(l.status)).length },
    { name: 'Quoted', v: db.leads.filter((l) => ['Quotation Sent', 'Negotiation', 'Converted'].includes(l.status)).length },
    { name: 'Converted', v: db.leads.filter((l) => l.status === 'Converted').length },
  ];
  const perf = salesExecs.map((e) => ({
    name: e.name,
    leads: db.leads.filter((l) => l.owner === e.name).length,
    tds: db.testDrives.filter((t) => t.executive === e.name && t.status === 'Completed').length,
    won: db.leads.filter((l) => l.owner === e.name && l.status === 'Converted').length,
  }));
  const todays = db.testDrives.filter((t) => t.date === today).sort((a, b) => a.slot.localeCompare(b.slot));
  const followUps = db.leads.filter((l) => open(l) && l.nextFollowUp && l.nextFollowUp <= today).slice(0, 6);

  return (
    <div className="page">
      <PageHead title={`Good day, ${user.name.split(' ')[0]}`} sub={`Here's what's happening at the dealership today, ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}.`}>
        <Link to="/admin/leads" className="abtn">
          View leads
        </Link>
        <Link to="/admin/test-drives" className="abtn abtn-primary">
          Review test drive requests ({k.tdRequested})
        </Link>
      </PageHead>

      <div className="card briefing">
        <div className="card-head">
          <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Zap size={15} style={{ color: '#c8102e' }} /> Today's briefing</h3>
          <Link to="/admin/automations" style={{ fontSize: 12, color: '#c8102e' }}>{(db.autoLog || []).length} automated actions · view →</Link>
        </div>
        <ul>
          {buildDigest(db).map((line) => (<li key={line}>{line}</li>))}
        </ul>
      </div>

      <div className="kpis">
        <Kpi icon={Users} label="Total customers" value={k.customers} sub="All records in CRM" />
        <Kpi icon={Inbox} label="New enquiries" value={k.newEnq} sub="Unassigned leads" tone={k.newEnq ? 'warn' : ''} />
        <Kpi icon={Target} label="Pending leads" value={k.pending} sub={`${k.overdue} overdue follow-ups`} tone={k.overdue ? 'warn' : ''} />
        <Kpi icon={CalendarDays} label="Today's test drives" value={k.tdToday} sub={`${k.tdUpcoming} upcoming · ${k.tdDone} completed`} />
        <Kpi icon={Car} label="Available vehicles" value={k.available} sub={`${k.reserved} reserved`} />
        <Kpi icon={ClipboardList} label="Active bookings" value={k.bookings} sub={`${monthlySales.at(-1).units} sold this month`} tone="good" />
        <Kpi icon={Truck} label="Pending deliveries" value={k.deliveries} sub="Docs / ready for handover" />
        <Kpi icon={Wrench} label="Service" value={k.svcProgress} sub={`in progress · ${k.svcUpcoming} upcoming`} />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head">
            <h3>Monthly vehicle sales</h3>
            <small>Units delivered · last 6 months</small>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlySales} margin={{ left: -20 }}>
              <CartesianGrid vertical={false} stroke="#eef0f3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip cursor={{ fill: '#f5f6f8' }} />
              <Bar dataKey="units" name="Units" fill="#1f2a37" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-head">
            <h3>Lead sources</h3>
            <small>{db.leads.length} leads</small>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={bySource} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2} stroke="#fff">
                {bySource.map((_, i) => (
                  <Cell key={i} fill={palette[i % palette.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', fontSize: 12, color: '#3b4452' }}>
            {bySource.map((s, i) => (
              <span key={s.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: palette[i % palette.length] }} />
                {s.name} {s.value}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-3">
        <div className="card">
          <div className="card-head">
            <h3>Lead conversion funnel</h3>
          </div>
          {funnel.map((f) => (
            <div key={f.name} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>{f.name}</span>
                <b>{f.v}</b>
              </div>
              <div style={{ height: 8, background: '#eef0f3', borderRadius: 4 }}>
                <div style={{ height: 8, width: `${(f.v / funnel[0].v) * 100}%`, background: '#c8102e', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-head">
            <h3>Model-wise enquiries</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byModel} layout="vertical" margin={{ left: 0, right: 10 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={60} tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip cursor={{ fill: '#f5f6f8' }} />
              <Bar dataKey="leads" name="Leads" fill="#4d7cbf" radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-head">
            <h3>Salesperson performance</h3>
          </div>
          <table className="atable">
            <thead>
              <tr>
                <th>Executive</th>
                <th className="num">Leads</th>
                <th className="num">TDs</th>
                <th className="num">Won</th>
              </tr>
            </thead>
            <tbody>
              {perf.map((p) => (
                <tr key={p.name}>
                  <td>{p.name}</td>
                  <td className="num">{p.leads}</td>
                  <td className="num">{p.tds}</td>
                  <td className="num">
                    <b>{p.won}</b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-3">
        <div className="card">
          <div className="card-head">
            <h3>Today's test drives</h3>
            <Link to="/admin/test-drives" style={{ fontSize: 12, color: '#c8102e' }}>
              Calendar →
            </Link>
          </div>
          {todays.length === 0 && <p style={{ color: '#6a7280', fontSize: 13 }}>No test drives today.</p>}
          {todays.map((t) => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f1f4', fontSize: 13, gap: 8 }}>
              <span>
                <b>{t.slot}</b> · {t.customer}
                <br />
                <span style={{ color: '#6a7280' }}>
                  {t.variant} · {t.executive || 'Unassigned'}
                </span>
              </span>
              <Badge>{t.status}</Badge>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-head">
            <h3>Follow-ups due</h3>
            <small>{k.overdue} overdue</small>
          </div>
          {followUps.map((l) => (
            <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f1f4', fontSize: 13, gap: 8 }}>
              <span>
                <b>{l.customer}</b>
                <br />
                <span style={{ color: '#6a7280' }}>
                  {l.model} · {l.owner || 'Unassigned'}
                </span>
              </span>
              <span className={l.nextFollowUp < today ? 'overdue' : ''} style={{ fontSize: 12, display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                {l.nextFollowUp < today && <AlertTriangle size={12} />}
                {fmtDate(l.nextFollowUp)}
              </span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-head">
            <h3>Recent activity</h3>
          </div>
          <div className="timeline">
            {[...db.notifications.filter((n) => n.when === 'Just now').map((n) => ({ who: 'Website', what: n.text, when: 'Just now' })), ...recentActivity].slice(0, 6).map((a, i) => (
              <div key={i}>
                <b>{a.who}</b> {a.what}
                <small>{a.when}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
