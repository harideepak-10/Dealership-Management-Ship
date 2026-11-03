// Small shared building blocks for dashboard pages.
import { useEffect, useMemo, useState } from 'react';
import { Lock, X } from 'lucide-react';
import { useDemo } from '../store/DemoStore';

export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—');
export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function PageHead({ title, sub, children }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{children}</div>
    </div>
  );
}

export function Kpi({ icon: Icon, label, value, sub, tone }) {
  return (
    <div className="kpi">
      <span className="label">
        {Icon && (
          <span className="ic">
            <Icon size={14} />
          </span>
        )}
        {label}
      </span>
      <span className="value">{value}</span>
      {sub && <span className={`sub ${tone || ''}`}>{sub}</span>}
    </div>
  );
}

// Generic table with text search, column filters and pagination.
export function DataTable({ rows, columns, search = [], filters = [], onRow, pageSize = 12, extra, initialQuery = '' }) {
  const [q, setQ] = useState(initialQuery);
  const [f, setF] = useState({});
  const [page, setPage] = useState(0);
  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (q && !search.some((k) => String(r[k] ?? '').toLowerCase().includes(q.toLowerCase()))) return false;
        return Object.entries(f).every(([k, v]) => !v || r[k] === v);
      }),
    [rows, q, f, search],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const p = Math.min(page, pages - 1);
  const view = filtered.slice(p * pageSize, (p + 1) * pageSize);

  return (
    <>
      <div className="toolbar">
        {search.length > 0 && (
          <input className="ainput" style={{ minWidth: 240 }} placeholder="Search…" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} />
        )}
        {filters.map((fl) => (
          <select key={fl.key} className="aselect" value={f[fl.key] || ''} onChange={(e) => { setF({ ...f, [fl.key]: e.target.value }); setPage(0); }}>
            <option value="">{fl.label}: All</option>
            {fl.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ))}
        {extra}
      </div>
      <div className="table-wrap">
        <table className="atable">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.label} className={c.num ? 'num' : ''}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.map((r) => (
              <tr key={r.id} className={`${onRow ? 'clickable' : ''} ${r.fresh ? 'fresh' : ''}`} onClick={() => onRow?.(r)}>
                {columns.map((c) => (
                  <td key={c.label} className={`${c.num ? 'num' : ''} ${c.cls || ''}`}>
                    {c.render ? c.render(r) : r[c.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
            {view.length === 0 && (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: 30, color: '#6a7280' }}>
                  No records match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="pager">
          <span>
            {filtered.length === 0 ? 0 : p * pageSize + 1}–{Math.min((p + 1) * pageSize, filtered.length)} of {filtered.length}
          </span>
          <div>
            <button className="abtn abtn-xs" disabled={p === 0} onClick={() => setPage(p - 1)}>
              Prev
            </button>
            <button className="abtn abtn-xs" disabled={p >= pages - 1} onClick={() => setPage(p + 1)}>
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export function Drawer({ title, sub, onClose, children }) {
  return (
    <div className="drawer-bg" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <h2>{title}</h2>
            {sub && <p>{sub}</p>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Guard({ module, children }) {
  const { can, user } = useDemo();
  if (can(module)) return children;
  return (
    <div className="page">
      <div className="card" style={{ textAlign: 'center', padding: 48 }}>
        <Lock size={28} style={{ margin: '0 auto 12px', color: '#6a7280' }} />
        <h3>Access restricted</h3>
        <p style={{ color: '#6a7280', marginTop: 6 }}>The {user?.role} role does not have permission to view this module.</p>
      </div>
    </div>
  );
}

// Download rows as a CSV file (used by "Export" buttons)
export function exportCSV(filename, rows, cols) {
  const keys = cols || Object.keys(rows[0] || {}).filter((k) => k !== 'fresh');
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [keys.join(','), ...rows.map((r) => keys.map((k) => esc(Array.isArray(r[k]) ? r[k].join('; ') : r[k])).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Simple form drawer: fields = [{ key, label, type, options, required, full }]
export function FormDrawer({ title, sub, fields, initial = {}, submitLabel = 'Save', onSubmit, onClose, note }) {
  const [form, setForm] = useState(() => Object.fromEntries(fields.map((f) => [f.key, initial[f.key] ?? f.default ?? ''])));
  const [err, setErr] = useState({});
  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    fields.forEach((f) => {
      const v = form[f.key];
      if (f.required && (v === '' || v == null)) errs[f.key] = 'Required';
      if (f.key === 'mobile' && v && !/^[6-9]\d{9}$/.test(String(v))) errs[f.key] = '10-digit mobile';
    });
    setErr(errs);
    if (Object.keys(errs).length) return;
    onSubmit(form);
  };
  return (
    <Drawer title={title} sub={sub} onClose={onClose}>
      {note && <div className="alert alert-info">{note}</div>}
      <form onSubmit={submit} noValidate>
        <div className="form-row">
          {fields.map((f) => (
            <div key={f.key} style={f.full ? { gridColumn: '1 / -1' } : undefined}>
              <label>
                {f.label}
                {f.required && ' *'}
              </label>
              {f.type === 'select' ? (
                <select className="aselect" value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}>
                  <option value="">Select…</option>
                  {f.options.map((o) => (typeof o === 'string' ? <option key={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea className="ainput" style={{ width: '100%', height: 70, padding: 10 }} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
              ) : (
                <input className="ainput" type={f.type || 'text'} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })} />
              )}
              {err[f.key] && <div style={{ color: '#b3261e', fontSize: 12, marginTop: 3 }}>{err[f.key]}</div>}
            </div>
          ))}
        </div>
        <div className="actions">
          <button className="abtn abtn-primary">{submitLabel}</button>
          <button type="button" className="abtn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Drawer>
  );
}

export function Toast({ msg, onDone }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [msg, onDone]);
  return msg ? <div className="toast">{msg}</div> : null;
}
