import { useMemo } from 'react';

/**
 * Lightweight SVG polygon preview for GeoJSON geometries without loading full Leaflet.
 * Supports Polygon and MultiPolygon with EPSG:4326 coordinates [lng, lat].
 */
export default function GeoJsonPreview({ geometry, height = 180, className = '' }) {
  const { pathData, bounds, pointCount } = useMemo(() => {
    if (!geometry || !geometry.coordinates) return { pathData: '', bounds: null, pointCount: 0 };

    const polygons =
      geometry.type === 'Polygon'
        ? [geometry.coordinates]
        : geometry.type === 'MultiPolygon'
        ? geometry.coordinates
        : [];

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let totalPoints = 0;

    for (const poly of polygons) {
      for (const ring of poly) {
        for (const [lng, lat] of ring) {
          totalPoints += 1;
          if (lng < minX) minX = lng;
          if (lng > maxX) maxX = lng;
          if (lat < minY) minY = lat;
          if (lat > maxY) maxY = lat;
        }
      }
    }

    if (!Number.isFinite(minX) || totalPoints < 4) {
      return { pathData: '', bounds: null, pointCount: 0 };
    }

    const paddingRatio = 0.1;
    const spanX = Math.max(maxX - minX, 0.0001);
    const spanY = Math.max(maxY - minY, 0.0001);
    const padX = spanX * paddingRatio;
    const padY = spanY * paddingRatio;

    const bMinX = minX - padX;
    const bMaxX = maxX + padX;
    const bMinY = minY - padY;
    const bMaxY = maxY + padY;
    const bSpanX = bMaxX - bMinX;
    const bSpanY = bMaxY - bMinY;

    // Project [lng, lat] to SVG viewBox 0..100, invert Y because latitude grows northwards
    const project = ([lng, lat]) => {
      const x = ((lng - bMinX) / bSpanX) * 100;
      const y = (1 - (lat - bMinY) / bSpanY) * 100;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    };

    const dParts = [];
    for (const poly of polygons) {
      for (const ring of poly) {
        if (!ring.length) continue;
        const [first, ...rest] = ring;
        dParts.push(`M ${project(first)}`);
        for (const pt of rest) {
          dParts.push(`L ${project(pt)}`);
        }
        dParts.push('Z');
      }
    }

    return {
      pathData: dParts.join(' '),
      bounds: { minX, maxX, minY, maxY },
      pointCount: totalPoints,
    };
  }, [geometry]);

  if (!pathData) {
    return (
      <div className={`geojson-preview-empty ${className}`} style={{ height }}>
        <span>Pratinjau polygon tidak tersedia</span>
      </div>
    );
  }

  return (
    <div className={`geojson-preview-card ${className}`}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height, display: 'block' }}
        className="geojson-svg"
      >
        <defs>
          <pattern id="geojsonGrid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.15" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#geojsonGrid)" />
        <path
          d={pathData}
          fill="var(--primary)"
          fillOpacity="0.22"
          stroke="var(--primary)"
          strokeWidth="1.8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      {bounds && (
        <div className="geojson-meta">
          <span>{geometry.type} ({pointCount} titik)</span>
          <span>
            {bounds.minY.toFixed(4)}, {bounds.minX.toFixed(4)} s/d {bounds.maxY.toFixed(4)}, {bounds.maxX.toFixed(4)}
          </span>
        </div>
      )}
    </div>
  );
}
