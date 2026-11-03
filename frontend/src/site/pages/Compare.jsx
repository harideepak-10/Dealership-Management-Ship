import { Link, useSearchParams } from 'react-router-dom';
import VehicleImage from '../../components/VehicleImage';
import { brand, formatLakh } from '../../config/brand';
import { models, startingPrice } from '../../data/models';

export default function Compare() {
  const [params, setParams] = useSearchParams();
  const selected = (params.get('m') || '911,taycan,cayenne').split(',').filter((s) => models.some((m) => m.slug === s));
  const list = selected.map((s) => models.find((m) => m.slug === s));
  const rows = [...new Set(list.flatMap((m) => Object.keys(m.specs)))];

  const setSlot = (i, slug) => {
    const next = [...selected];
    next[i] = slug;
    setParams({ m: [...new Set(next)].join(',') });
  };

  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">Compare</span>
            <h2>Side-by-side comparison</h2>
            <p>Change any column to compare a different model.</p>
          </div>
        </div>
        <div className="table-scroll panel" style={{ padding: 0 }}>
          <table className="compare-table">
            <thead>
              <tr>
                <th />
                {list.map((m, i) => (
                  <td key={m.slug}>
                    <select className="field-dark" style={{ minWidth: 0, width: '100%' }} value={m.slug} onChange={(e) => setSlot(i, e.target.value)}>
                      {models.map((x) => (
                        <option key={x.slug} value={x.slug}>
                          {brand.name} {x.name}
                        </option>
                      ))}
                    </select>
                    <VehicleImage model={m} className="compare-img" />
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Category</th>
                {list.map((m) => (
                  <td key={m.slug}>{m.category}</td>
                ))}
              </tr>
              <tr>
                <th>Starting price</th>
                {list.map((m) => (
                  <td key={m.slug}>
                    <b>{formatLakh(startingPrice(m))}</b>
                  </td>
                ))}
              </tr>
              <tr>
                <th>Variants</th>
                {list.map((m) => (
                  <td key={m.slug}>{m.variants.map((v) => v.name).join(', ')}</td>
                ))}
              </tr>
              {rows.map((r) => (
                <tr key={r}>
                  <th>{r}</th>
                  {list.map((m) => (
                    <td key={m.slug}>{m.specs[r] || '—'}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <th>Highlights</th>
                {list.map((m) => (
                  <td key={m.slug} style={{ color: 'var(--muted)', fontSize: 14 }}>
                    {m.features.slice(0, 4).join(' · ')}
                  </td>
                ))}
              </tr>
              <tr>
                <th />
                {list.map((m) => (
                  <td key={m.slug}>
                    <Link to={`/test-drive?model=${encodeURIComponent(m.name)}`} className="btn btn-primary btn-sm">
                      Test drive
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
