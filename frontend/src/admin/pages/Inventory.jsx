import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Badge } from '../../components/ui';
import CarArt from '../../components/CarArt';
import { formatINR } from '../../config/brand';
import { models } from '../../data/models';
import { useDemo } from '../../store/DemoStore';
import { DataTable, Drawer, Guard, Kpi, PageHead, fmtDate } from '../kit';

const statuses = ['Available', 'Reserved', 'Allocated', 'In Transit', 'Sold', 'Delivered'];

export default function Inventory() {
  const { db, update } = useDemo();
  const [sel, setSel] = useState(null);
  const v = sel && db.inventory.find((x) => x.id === sel);
  const age = (d) => Math.round((Date.now() - new Date(d)) / 86400000);
  const count = (s) => db.inventory.filter((x) => x.status === s).length;

  return (
    <Guard module="inventory">
      <div className="page">
        <PageHead title="Inventory" sub="Every physical vehicle tracked by VIN, from stockyard to delivery.">
          <button className="abtn abtn-primary">
            <Plus size={15} /> Add vehicle
          </button>
        </PageHead>
        <div className="kpis">
          {statuses.slice(0, 5).map((s) => (
            <Kpi key={s} label={s} value={count(s)} />
          ))}
          <Kpi label="Test drive fleet" value={db.inventory.filter((x) => x.testDrive).length} />
        </div>
        <DataTable
          rows={db.inventory}
          search={['vin', 'id', 'variant']}
          filters={[
            { key: 'model', label: 'Model', options: models.map((m) => m.name) },
            { key: 'status', label: 'Status', options: statuses },
            { key: 'location', label: 'Location', options: ['Showroom Floor', 'Stockyard A', 'Stockyard B', 'Test Drive Fleet'] },
          ]}
          onRow={(r) => setSel(r.id)}
          columns={[
            { label: 'Vehicle ID', render: (r) => <span className="mono">{r.id}</span> },
            { label: 'VIN', render: (r) => <span className="mono">{r.vin}</span> },
            { label: 'Model / variant', render: (r) => <><b>{r.model}</b> · {r.variant}</> },
            { label: 'Colour', key: 'colour' },
            { label: 'Location', key: 'location', cls: 'muted' },
            { label: 'Age', render: (r) => <span className={age(r.acquired) > 90 ? 'overdue' : ''}>{age(r.acquired)} d</span>, num: true },
            { label: 'Price', render: (r) => formatINR(r.price), num: true },
            { label: 'Status', render: (r) => <><Badge>{r.status}</Badge>{r.testDrive && <span className="badge badge-teal" style={{ marginLeft: 4 }}>TD fleet</span>}</> },
          ]}
        />
        {v && (
          <Drawer title={`${v.model} ${v.variant}`} sub={`${v.id} · VIN ${v.vin}`} onClose={() => setSel(null)}>
            <div style={{ background: '#0f1216', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <CarArt shape={models.find((m) => m.name === v.model).shape} color={models.find((m) => m.name === v.model).colours.find((c) => c.name === v.colour)?.hex} />
            </div>
            <dl className="dl">
              <dt>Colour</dt>
              <dd>{v.colour}</dd>
              <dt>Year</dt>
              <dd>{v.year}</dd>
              <dt>Acquired</dt>
              <dd>
                {fmtDate(v.acquired)} · {v.source}
              </dd>
              <dt>Stock cost</dt>
              <dd>{formatINR(v.cost)}</dd>
              <dt>Selling price</dt>
              <dd>{formatINR(v.price)}</dd>
              <dt>Location</dt>
              <dd>{v.location}</dd>
            </dl>
            <div className="form-row">
              <div>
                <label>Status</label>
                <select className="aselect" value={v.status} onChange={(e) => update('inventory', v.id, { status: e.target.value })}>
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Location</label>
                <select className="aselect" value={v.location} onChange={(e) => update('inventory', v.id, { location: e.target.value })}>
                  {['Showroom Floor', 'Stockyard A', 'Stockyard B', 'Test Drive Fleet'].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="section-title">Movement history</div>
            <div className="timeline">
              <div>
                Moved to {v.location}
                <small>{fmtDate(v.acquired)}</small>
              </div>
              <div>
                Received from {v.source.toLowerCase()}
                <small>{fmtDate(v.acquired)}</small>
              </div>
            </div>
          </Drawer>
        )}
      </div>
    </Guard>
  );
}
