export function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function nearestUnit(
  units: Array<{ name: string; lat: number; lng: number; radius_m?: number }>,
  lat: number,
  lng: number,
) {
  let best: { name: string; inside: boolean } | null = null;
  let bestDist = Infinity;
  for (const u of units || []) {
    if (typeof u.lat !== 'number' || typeof u.lng !== 'number') continue;
    const d = distanceMeters(lat, lng, u.lat, u.lng);
    if (d < bestDist) {
      bestDist = d;
      best = { name: u.name, inside: d <= (u.radius_m || 150) };
    }
  }
  return best;
}