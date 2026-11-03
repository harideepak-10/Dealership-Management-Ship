import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '../../components/ui';
import { dayOffset, salesExecs, testDriveStatuses, timeSlots } from '../../data/seed';
import { useDemo } from '../../store/DemoStore';
import { DataTable, Drawer, Guard, PageHead, fmtDate, todayISO } from '../kit';

export default function TestDrives() {
  const { db } = useDemo();
  const [tab, setTab] = useState('calendar');
  const [sel, setSel] = useState(null);
  const [week, setWeek] = useState(0);
  const td = sel && db.testDrives.find((t) => t.id === sel);
  const requested = db.testDrives.filter((t) => t.status === 'Requested');
  const today = todayISO();
  const days = Array.from({ length: 7 }, (_, i) => dayOffset(week * 7 + i - 1));

  return (
    <Guard module="testdrives">
      <div className="page">
        <PageHead title="Test Drives" sub="Review website requests, assign a vehicle and executive, and track every appointment.">
          <div className="tabs">
            <button className={tab === 'calendar' ? 'on' : ''} onClick={() => setTab('calendar')}>
              Calendar
            </button>
            <button className={tab === 'list' ? 'on' : ''} onClick={() => setTab('list')}>
              List
            </button>
          </div>
        </PageHead>

        {requested.length > 0 && (
          <div className="card" style={{ marginBottom: 18 }}>
            <div className="card-head">
              <h3>Awaiting approval ({requested.length})</h3>
              <small>Requests are not confirmed until approved here</small>
            </div>
            <div className="table-wrap" style={{ border: 0 }}>
              <table className="atable">
                <tbody>
                  {requested.map((t) => (
                    <tr key={t.id} className={t.fresh ? 'fresh' : ''}>
                      <td className="mono">{t.id}</td>
                      <td>
                        <b>{t.customer}</b>
                        <div className="muted" style={{ fontSize: 12 }}>
                          {t.mobile}
                        </div>
                      </td>
                      <td>
                        {t.model} · {t.variant || 'Any variant'}
                      </td>
                      <td>
                        {fmtDate(t.date)} · {t.slot}
                      </td>
                      <td>{t.fresh && <span className="badge badge-amber">New from website</span>}</td>
                      <td className="num">
                        <button className="abtn abtn-xs abtn-primary" onClick={() => setSel(t.id)}>
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'calendar' ? (
          <>
            <div className="toolbar">
              <button className="abtn abtn-xs" onClick={() => setWeek(week - 1)}>
                <ChevronLeft size={14} />
              </button>
              <button className="abtn abtn-xs" onClick={() => setWeek(0)}>
                This week
              </button>
              <button className="abtn abtn-xs" onClick={() => setWeek(week + 1)}>
                <ChevronRight size={14} />
              </button>
              <span style={{ fontSize: 13, color: '#6a7280' }}>
                {fmtDate(days[0])} – {fmtDate(days[6])}
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <div className="week">
                <div className="h" style={{ borderLeft: 0 }} />
                {days.map((d) => (
                  <div key={d} className={`h ${d === today ? 'today' : ''}`}>
                    {new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })}
                  </div>
                ))}
                {timeSlots.map((s) => (
                  <Slot key={s} slot={s} days={days} rows={db.testDrives} onPick={setSel} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <DataTable
            rows={db.testDrives}
            search={['id', 'customer', 'model', 'variant']}
            filters={[
              { key: 'status', label: 'Status', options: testDriveStatuses },
              { key: 'executive', label: 'Executive', options: salesExecs.map((e) => e.name) },
            ]}
            onRow={(r) => setSel(r.id)}
            columns={[
              { label: 'ID', render: (r) => <span className="mono">{r.id}</span> },
              { label: 'Customer', render: (r) => <b>{r.customer}</b> },
              { label: 'Vehicle', render: (r) => r.variant || r.model },
              { label: 'Date', render: (r) => `${fmtDate(r.date)} · ${r.slot}` },
              { label: 'Car', render: (r) => (r.vehicleId ? <span className="mono">{r.vehicleId}</span> : '—') },
              { label: 'Executive', render: (r) => r.executive || '—' },
              { label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
              { label: 'Feedback', key: 'feedback', cls: 'muted' },
            ]}
          />
        )}
        {td && <TDDrawer td={td} onClose={() => setSel(null)} />}
      </div>
    </Guard>
  );
}

function Slot({ slot, days, rows, onPick }) {
  return (
    <>
      <div className="t">{slot}</div>
      {days.map((d) => (
        <div className="c" key={d}>
          {rows
            .filter((t) => t.date === d && t.slot === slot)
            .map((t) => (
              <div key={t.id} className={`ev ev-${t.status}`} onClick={() => onPick(t.id)}>
                <b>{t.customer}</b>
                {t.model} · {t.status}
              </div>
            ))}
        </div>
      ))}
    </>
  );
}

function TDDrawer({ td, onClose }) {
  const { db, update, testDriveConflict } = useDemo();
  const fleet = db.inventory.filter((v) => v.testDrive);
  const [vehicleId, setVehicleId] = useState(td.vehicleId || fleet.find((v) => v.model === td.model)?.id || '');
  const [exec, setExec] = useState(td.executive || '');
  const [date, setDate] = useState(td.date);
  const [slot, setSlot] = useState(td.slot);
  const [feedback, setFeedback] = useState(td.feedback || '');
  const [msg, setMsg] = useState(null);

  const conflict = vehicleId || exec ? testDriveConflict({ ...td, date, slot }, vehicleId, exec) : null;
  const canConfirm = vehicleId && exec && !conflict;
  const save = (patch, text) => {
    update('testDrives', td.id, patch);
    setMsg(text);
  };

  return (
    <Drawer title={`${td.customer}`} sub={`${td.id} · ${td.model} ${td.variant ? '· ' + td.variant : ''} · ${td.source}`} onClose={onClose}>
      <div style={{ marginBottom: 14 }}>
        <Badge>{td.status}</Badge>
      </div>
      {msg && <div className="alert alert-ok">{msg}</div>}
      {td.message && <div className="alert alert-info">Customer note: “{td.message}”</div>}

      <div className="form-row">
        <div>
          <label>Date</label>
          <input className="ainput" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label>Time slot</label>
          <select className="aselect" value={slot} onChange={(e) => setSlot(e.target.value)}>
            {timeSlots.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Test drive vehicle</label>
          <select className="aselect" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
            <option value="">Select vehicle</option>
            {fleet.map((v) => (
              <option key={v.id} value={v.id}>
                {v.variant} · {v.colour} ({v.id})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Sales executive</label>
          <select className="aselect" value={exec} onChange={(e) => setExec(e.target.value)}>
            <option value="">Select executive</option>
            {salesExecs.map((e) => (
              <option key={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
      </div>
      {conflict && (
        <div className="alert alert-warn">
          Conflict: {conflict.vehicleId === vehicleId ? 'this vehicle' : exec} is already booked for {conflict.id} ({conflict.customer}) at {conflict.slot} on {fmtDate(conflict.date)}. Pick another slot, vehicle or executive.
        </div>
      )}

      {td.status === 'Requested' && (
        <div className="actions">
          <button className="abtn abtn-ok" disabled={!canConfirm} onClick={() => save({ status: 'Confirmed', vehicleId, executive: exec, date, slot }, 'Confirmed. Customer notified by SMS and WhatsApp (simulated).')}>
            Approve & confirm
          </button>
          <button className="abtn abtn-danger" onClick={() => save({ status: 'Rejected' }, 'Request rejected. Customer notified (simulated).')}>
            Reject
          </button>
        </div>
      )}
      {['Confirmed', 'Assigned'].includes(td.status) && (
        <div className="actions">
          <button className="abtn" disabled={!!conflict} onClick={() => save({ date, slot, vehicleId, executive: exec }, 'Rescheduled. Customer notified (simulated).')}>
            Save / reschedule
          </button>
          <button className="abtn abtn-primary" onClick={() => save({ status: 'In Progress' }, 'Marked as in progress.')}>
            Start test drive
          </button>
          <button className="abtn" onClick={() => save({ status: 'No Show' }, 'Marked as no-show.')}>
            No show
          </button>
          <button className="abtn abtn-danger" onClick={() => save({ status: 'Cancelled' }, 'Cancelled.')}>
            Cancel
          </button>
        </div>
      )}
      {['In Progress', 'Completed'].includes(td.status) && (
        <>
          <div className="section-title">Feedback & next step</div>
          <textarea className="ainput" style={{ width: '100%', height: 70, padding: 10 }} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="How did it go? What's the next step?" />
          <div className="actions">
            <button className="abtn abtn-ok" onClick={() => save({ status: 'Completed', feedback }, 'Completed. Follow-up task created for the executive (simulated).')}>
              {td.status === 'Completed' ? 'Update feedback' : 'Complete test drive'}
            </button>
          </div>
        </>
      )}
    </Drawer>
  );
}
