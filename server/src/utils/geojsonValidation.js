export function validateGeoJSON(input) {
  if (!input) {
    return { valid: false, message: 'Data GeoJSON tidak boleh kosong.' };
  }

  let geojson = input;
  if (typeof geojson === 'string') {
    try {
      geojson = JSON.parse(geojson);
    } catch {
      return { valid: false, message: 'Format file bukan JSON yang valid.' };
    }
  }

  if (typeof geojson !== 'object' || geojson === null || Array.isArray(geojson)) {
    return { valid: false, message: 'GeoJSON harus berupa objek valid.' };
  }

  let geometry = geojson;
  if (geojson.type === 'FeatureCollection') {
    if (!Array.isArray(geojson.features)) {
      return { valid: false, message: 'FeatureCollection harus memiliki array features.' };
    }
    if (geojson.features.length === 0) {
      return { valid: false, message: 'FeatureCollection tidak berisi fitur apapun.' };
    }
    if (geojson.features.length > 1) {
      return { valid: false, message: 'FeatureCollection berisi lebih dari satu fitur. Hanya mendukung 1 fitur polygon untuk batas blok.' };
    }
    geometry = geojson.features[0]?.geometry;
  } else if (geojson.type === 'Feature') {
    geometry = geojson.geometry;
  }

  if (!geometry || typeof geometry !== 'object') {
    return { valid: false, message: 'Geometri GeoJSON tidak ditemukan.' };
  }

  const { type, coordinates } = geometry;
  if (type !== 'Polygon' && type !== 'MultiPolygon') {
    return {
      valid: false,
      message: `Tipe geometri '${type}' belum didukung. Hanya mendukung Polygon atau MultiPolygon.`,
    };
  }

  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    return { valid: false, message: 'Koordinat polygon tidak boleh kosong.' };
  }

  function validateRing(ring) {
    if (!Array.isArray(ring)) {
      return { valid: false, message: 'Linear ring polygon harus berupa array koordinat.' };
    }
    if (ring.length < 4) {
      return { valid: false, message: 'Polygon minimal harus memiliki 4 titik koordinat (ring tertutup).' };
    }

    for (let i = 0; i < ring.length; i++) {
      const pt = ring[i];
      if (!Array.isArray(pt) || pt.length < 2) {
        return { valid: false, message: `Titik koordinat pada indeks ${i} tidak valid.` };
      }
      const [lng, lat] = pt;
      if (typeof lng !== 'number' || typeof lat !== 'number' || !Number.isFinite(lng) || !Number.isFinite(lat)) {
        return { valid: false, message: `Koordinat harus berupa angka desimal valid.` };
      }
      if (lng < -180 || lng > 180) {
        return { valid: false, message: `Longitude ${lng} di luar rentang valid (-180 sampai 180).` };
      }
      if (lat < -90 || lat > 90) {
        return { valid: false, message: `Latitude ${lat} di luar rentang valid (-90 sampai 90).` };
      }
    }

    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      return { valid: false, message: 'Ring polygon harus tertutup (titik awal dan akhir harus sama).' };
    }

    return { valid: true };
  }

  if (type === 'Polygon') {
    for (let r = 0; r < coordinates.length; r++) {
      const ringCheck = validateRing(coordinates[r]);
      if (!ringCheck.valid) return ringCheck;
    }
  } else if (type === 'MultiPolygon') {
    for (let p = 0; p < coordinates.length; p++) {
      const poly = coordinates[p];
      if (!Array.isArray(poly) || poly.length === 0) {
        return { valid: false, message: 'Elemen MultiPolygon harus berupa array polygon.' };
      }
      for (let r = 0; r < poly.length; r++) {
        const ringCheck = validateRing(poly[r]);
        if (!ringCheck.valid) return ringCheck;
      }
    }
  }

  return { valid: true, normalized: geometry };
}
