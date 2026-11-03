import { useState } from 'react';
import { MessageSquare, Mail, Play, Smartphone, Zap } from 'lucide-react';
import { ruleDefs, templates } from '../../store/automation';
import { useDemo } from '../../store/DemoStore';
import { DataTable, Guard, Kpi, PageHead, Toast, exportCSV } from '../kit';

const groups = [...new Set(ruleDefs.map((r) => r.group))];

export function Automations() {
  const { db, toggleAutomation, runAutomationsNow } = useDemo();
  const [tab, setTab] = useState('rules');
  const [toast, setToast] = useState('');
  const log = db.autoLog || [];
  const count = (key) => log.filter((l) => l.rule === key).length;
  const enabled = ruleDefs.filter((r) => db.automations?.[r.key] !== false).length;

  return (
    <Guard module="automations">
      <div className="page">
        <PageHead title="Automations" sub="Rules that run on their own. Approvals always stay with a person — automation prepares, reminds and notifies.">
          <div className="tabs">
            <button className={tab === 'rules' ? 'on' : ''} onClick={() => setTab('rules')}>Rules</button>
            <button className={tab === 'log' ? 'on' : ''} onClick={() => setTab('log')}>Activity log</button>
          </div>
          <button className="abtn abtn-primary" onClick={() => { runAutomationsNow(); setToast('Scheduled rules run now'); }}>
            <Play size={14} /> Run scheduled rules now
          </button>
        </PageHead>
        <div className="kpis">
          <Kpi icon={Zap} label="Rules enabled" value={`${enabled} / ${ruleDefs.length}`} />
          <Kpi label="Actions performed" value={log.length} sub="Since demo data was reset" />
          <Kpi label="Messages sent" value={(db.messages || []).length} sub="Simulated email / SMS / WhatsApp" />
          <Kpi label="Tasks created" value={db.tasks.filter((t) => t.auto).length} />
          <Kpi label="Last scheduled run" value={<span style={{ fontSize: 16 }}>{db.lastScheduledRun?.slice(11) || '—'}</span>} sub="Runs every minute in the demo" />
        </div>

        {tab === 'rules' ? (
          groups.map((g) => (
            <div className="card" key={g} style={{ marginBottom: 16 }}>
              <div className="card-head"><h3>{g}</h3></div>
              {ruleDefs.filter((r) => r.group === g).map((r) => {
                const on = db.automations?.[r.key] !== false;
                return (
                  <div className="rule" key={r.key}>
                    <div style={{ flex: 1 }}>
                      <b>{r.name}</b> <span className={`badge ${r.scheduled ? 'badge-violet' : 'badge-blue'}`}>{r.scheduled ? 'Scheduled' : 'On event'}</span>
                      <p>{r.desc}</p>
                    </div>
                    <span className="rule-count">{count(r.key)} {count(r.key) === 1 ? 'run' : 'runs'}</span>
                    <button className={`switch ${on ? 'on' : ''}`} onClick={() => toggleAutomation(r.key)} aria-label={`${on ? 'Disable' : 'Enable'} ${r.name}`}>
                      <span />
                    </button>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <DataTable
            rows={log}
            search={['text', 'record', 'rule']}
            filters={[{ key: 'rule', label: 'Rule', options: ruleDefs.map((r) => r.key) }]}
            pageSize={20}
            extra={<button className="abtn" onClick={() => exportCSV('automation-log.csv', log)}>Export</button>}
            columns={[
              { label: 'When', key: 'when', cls: 'mono' },
              { label: 'Rule', render: (r) => ruleDefs.find((x) => x.key === r.rule)?.name || r.rule },
              { label: 'What happened', key: 'text' },
              { label: 'Record', render: (r) => <span className="mono">{r.record || '—'}</span> },
            ]}
          />
        )}
        <Toast msg={toast} onDone={() => setToast('')} />
      </div>
    </Guard>
  );
}

const chIcon = { WhatsApp: MessageSquare, SMS: Smartphone, Email: Mail };

export function Communications() {
  const { db } = useDemo();
  const [tab, setTab] = useState('outbox');
  const msgs = db.messages || [];
  return (
    <Guard module="leads">
      <div className="page">
        <PageHead title="Communications" sub="Every message sent to customers, by channel. Sending is simulated in the demo; the backend will use email, SMS and WhatsApp providers.">
          <div className="tabs">
            <button className={tab === 'outbox' ? 'on' : ''} onClick={() => setTab('outbox')}>Sent messages</button>
            <button className={tab === 'templates' ? 'on' : ''} onClick={() => setTab('templates')}>Templates</button>
          </div>
        </PageHead>
        <div className="kpis">
          {['WhatsApp', 'SMS', 'Email'].map((c) => (
            <Kpi key={c} icon={chIcon[c]} label={c} value={msgs.filter((m) => m.channel === c).length} sub={`Channel ${db.settings.channels[c.toLowerCase()] ? 'enabled' : 'disabled'}`} />
          ))}
        </div>
        {tab === 'outbox' ? (
          <DataTable
            rows={msgs}
            search={['customer', 'text', 'to']}
            filters={[
              { key: 'channel', label: 'Channel', options: ['WhatsApp', 'SMS', 'Email'] },
              { key: 'template', label: 'Template', options: Object.keys(templates) },
            ]}
            pageSize={15}
            columns={[
              { label: 'When', key: 'when', cls: 'mono' },
              { label: 'Customer', render: (r) => <><b>{r.customer}</b><div className="muted" style={{ fontSize: 12 }}>{r.to}</div></> },
              { label: 'Channel', key: 'channel' },
              { label: 'Message', render: (r) => <span style={{ whiteSpace: 'normal', display: 'block', maxWidth: 520 }}>{r.text}</span> },
              { label: 'Status', render: (r) => <span className="badge badge-green">{r.status}</span> },
            ]}
          />
        ) : (
          <div className="table-wrap">
            <table className="atable">
              <thead><tr><th>Template</th><th>Text</th></tr></thead>
              <tbody>
                {Object.entries(templates).map(([k, v]) => (
                  <tr key={k}><td className="mono">{k}</td><td style={{ whiteSpace: 'normal' }}>{v}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Guard>
  );
}

// Small panel used in customer / lead drawers
export function MessageHistory({ customerId }) {
  const { db } = useDemo();
  const msgs = (db.messages || []).filter((m) => m.customerId === customerId);
  if (!msgs.length) return <p style={{ fontSize: 13, color: '#6a7280' }}>No messages yet.</p>;
  return (
    <div className="timeline">
      {msgs.slice(0, 8).map((m) => (
        <div key={m.id}>
          <b>{m.channel}</b> · {m.text}
          <small>{m.when}</small>
        </div>
      ))}
    </div>
  );
}
