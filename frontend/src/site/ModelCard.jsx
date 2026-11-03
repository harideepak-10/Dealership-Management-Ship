import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import VehicleImage from '../components/VehicleImage';
import { brand, formatLakh } from '../config/brand';
import { startingPrice } from '../data/models';

export default function ModelCard({ model, compare, onCompare }) {
  return (
    <div className="model-card">
      {model.isNew && <span className="tag-new">NEW</span>}
      <Link to={`/models/${model.slug}`} className="card-photo">
        <VehicleImage model={model} />
      </Link>
      <span className="meta">{model.category}</span>
      <h3>
        {brand.name} {model.name}
      </h3>
      <p className="meta">{model.tagline}</p>
      <p className="price">
        Starting <b>{formatLakh(startingPrice(model))}</b> <span style={{ fontSize: 12 }}>ex-showroom</span>
      </p>
      <div className="row">
        {onCompare ? (
          <label className="compare-toggle">
            <input type="checkbox" checked={compare} onChange={() => onCompare(model.slug)} /> Compare
          </label>
        ) : (
          <span className="meta">{model.variants.length} variants</span>
        )}
        <Link to={`/models/${model.slug}`} className="btn-link">
          Explore <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
