import { useState } from 'react';
import CarArt from './CarArt';

// Real photo when available; falls back to the SVG illustration if the model has
// no photo or the image fails to load.
export default function VehicleImage({ model, className = '', colour, eager = false, src }) {
  const [failed, setFailed] = useState(false);
  const url = src || model.image;
  if (!url || failed) {
    return (
      <div className={`veh-img veh-fallback ${className}`}>
        <CarArt shape={model.shape} color={colour || model.colours[0].hex} />
      </div>
    );
  }
  return (
    <div className={`veh-img ${className}`}>
      <img src={url} alt={`Porsche ${model.name}`} loading={eager ? 'eager' : 'lazy'} onError={() => setFailed(true)} />
    </div>
  );
}
