import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Badge } from '../../components/ui';
import { leadSources, leadStatuses, salesExecs } from '../../data/seed';
import { models } from '../../data/models';
import { useDemo } from '../../store/DemoStore';
import { DataTable, Drawer, Guard, PageHead, fmtDate, todayISO } from '../kit';

const closed = ['Converted', 'Lost', 'Not Interested'];

export default function Leads() {
  const { db } = useDemo();
  const [tab, setTab] = useState('list');
  const [sel, setSel] = useState(null);
  const today = todayISO();
  const lead = sel && db.leads.find((l) => l.id === sel);

  return (
    <Guard module="leads">
      <div className="page">
        <PageHead title="Leads" sub="Capture, assign and follow up every enquiry until it converts or is closed.">
          <div className="tabs">
            <button className={tab === 'list' ? 'on' : ''} onClick={() => setTab('list')}>
              List
            </button>
            <button className={tab === 'pipeline' ? 'on' : ''} onClick={() => setTab('pipeline')}>
              Pipeline
            </button>
          </div>
          <button className="abtn abtn-primary" title="Opens the new-lead form (walk-in / phone / WhatsApp / referral) in the full build">
            <Plus size={15} /> New lead
          </button>
        </PageHead>

        {tab === 'list' ? (
          <DataTable
            rows={db.leads}
            search={['id', 'customer', 'mobile', 'model']}
            filters={[
              { key: 'status', label: 'Status', options: leadStatuses },
              { key: 'source', label: 'Source', options: leadSources },
              { key: 'owner', label: 'Owner', options: salesExecs.map((e) => e.name) },
              { key: 'priority', label: 'Priority', options: ['High', 'Medium', 'Low'] },
            ]}
            onRow={(r) => setSel(r.id)}
            columns={[
              { label: 'Lead', render: (r) => <span className="mono">{r.id}</span> },
              { label: 'Customer', render: (r) => <><b>{r.customer}</b><div className="muted" style={{ fontSize: 12 }}>{r.mobile}</div></> },
              { label: 'Interest', render: (r) => `${r.model} · ${r.variant}` },
              { label: 'Source', key: 'source', cls: 'muted' },
              { label: 'Owner', render: (r) => r.owner || <span className="overdue">Unassigned</span> },
              { label: 'Priority', render: (r) => <Badge>{r.priority}</Badge> },
              { label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
              {
                label: 'Next follow-up',
                render: (r) => (r.nextFollowUp ? <span className={r.nextFollowUp < today && !closed.includes(r.status) ? 'overdue' : ''}>{fmtDate(r.nextFollowUp)}</span> : '—'),
              },
            ]}
          />
        ) : (
          <div className="pipeline">
            {leadStatuses.filter((s) => s !== 'Not Interested').map((s) => {
              const items = db.leads.filter((l) => l.status === s);
              return (
                <div className="lane" key={s}>
                  <div className="lane-head">
                    <span>{s}</span>
                    <span>{items.length}</span>
                  </div>
                  {items.map((l) => (
                    <div className="lcard" key={l.id} onClick={() => setSel(l.id)}>
                      <b>{l.customer}</b>
                      <small>
                        {l.model} · {l.variant}
                      </small>
                      <div className="foot">
                        <small>{l.owner || 'Unassigned'}</small>
                        <Badge>{l.priority}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {lead && <LeadDrawer lead={lead} onClose={() => setSel(null)} />}
      </div>
    </Guard>
  );
}

function LeadDrawer({ lead, onClose }) {
  const { update, db } = useDemo();
  const [note, setNote] = useState('');
  const history = [
    ...db.testDrives.filter((t) => t.customerId === lead.customerId).map((t) => ({ when: t.date, text: `Test drive ${t.id} · ${t.variant} — ${t.status}` })),
    ...db.quotations.filter((q) => q.customerId === lead.customerId).map((q) => ({ when: q.validTill, text: `Quotation ${q.id} · ${q.variant} — ${q.status}` })),
    { when: lead.created, text: `Lead created from ${lead.source}` },
  ];
  const set = (patch) => update('leads', lead.id, patch);

  return (
    <Drawer title={lead.customer} sub={`${lead.id} · ${lead.source} · created ${fmtDate(lead.created)}`} onClose={onClose}>
      {!lead.owner && <div className="alert alert-warn">Every active lead needs an owner. Assign a sales executive below.</div>}
      <div className="form-row">
        <div>
          <label>Assigned to</label>
          <select className="aselect" value={lead.owner || ''} onChange={(e) => set({ owner: e.target.value || null, status: lead.status === 'New' && e.target.value ? 'Assigned' : lead.status })}>
            <option value="">Unassigned</option>
            {salesExecs.map((e) => (
              <option key={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Status</label>
          <select className="aselect" value={lead.status} onChange={(e) => set({ status: e.target.value })}>
            {leadStatuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Priority</label>
          <select className="aselect" value={lead.priority} onChange={(e) => set({ priority: e.target.value })}>
            {['High', 'Medium', 'Low'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Next follow-up</label>
          <input className="ainput" type="date" value={lead.nextFollowUp || ''} onChange={(e) => set({ nextFollowUp: e.target.value })} />
        </div>
        <div>
          <label>Interested model</label>
          <select className="aselect" value={lead.model} onChange={(e) => set({ model: e.target.value })}>
            {models.map((m) => (
              <option key={m.slug}>{m.name}</option>
            ))}
          </select>
        </div>
        {lead.status === 'Lost' && (
          <div>
            <label>Lost reason</label>
            <select className="aselect" value={lead.lostReason || ''} onChange={(e) => set({ lostReason: e.target.value })}>
              <option value="">Select reason</option>
              {['Bought competitor', 'Budget constraint', 'Delayed purchase', 'Not reachable', 'Other'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <dl className="dl">
        <dt>Mobile</dt>
        <dd>{lead.mobile}</dd>
        <dt>Variant</dt>
        <dd>{lead.variant}</dd>
        <dt>Budget</dt>
        <dd>{lead.budget}</dd>
        <dt>Timeline</dt>
        <dd>{lead.timeline}</dd>
        {lead.notes && (
          <>
            <dt>Notes</dt>
            <dd>{lead.notes}</dd>
          </>
        )}
      </dl>

      <div className="section-title">Log an interaction</div>
      <textarea className="ainput" style={{ width: '100%', height: 70, padding: 10 }} placeholder="Called customer, discussed finance options…" value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="actions">
        <button
          className="abtn abtn-primary"
          disabled={!note}
          onClick={() => {
            set({ notes: (lead.notes ? lead.notes + '\n' : '') + `${fmtDate(todayISO())}: ${note}`, status: ['New', 'Assigned'].includes(lead.status) ? 'Contacted' : lead.status });
            setNote('');
          }}
        >
          Save note
        </button>
        <button className="abtn" onClick={() => set({ status: 'Test Drive Scheduled' })}>
          Schedule test drive
        </button>
        <button className="abtn abtn-ok" onClick={() => set({ status: 'Converted', nextFollowUp: null })}>
          Convert to opportunity
        </button>
      </div>

      <div className="section-title">History</div>
      <div className="timeline">
        {history.map((h, i) => (
          <div key={i}>
            {h.text}
            <small>{fmtDate(h.when)}</small>
          </div>
        ))}
      </div>
    </Drawer>
  );
}
