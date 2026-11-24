// Geolocalização e endereço reverso para o registro de ponto facial.

/** Captura a posição atual do navegador/celular (lat, lng, precisão em metros). */
export function getPosition() {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) =>
        resolve({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          accuracy: Math.round(p.coords.accuracy || 0),
        }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  });
}

/** Dispara o pedido de permissão de localização. Retorna 'granted' | 'denied' | 'unavailable'. */
export function requestGeoPermission() {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) return resolve('unavailable');
    navigator.geolocation.getCurrentPosition(
      () => resolve('granted'),
      (err) => resolve(err && err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}

/** Endereço reverso (reverse geocoding) via OpenStreetMap Nominatim. */
export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=pt-BR&zoom=18`,
      { headers: { Accept: 'application/json' } },
    );
    if (!res.ok) throw new Error('geocode');
    const a = (await res.json())?.address || {};
    const rua = [a.road, a.house_number].filter(Boolean).join(', ') || a.pedestrian || a.footway || '';
    const bairro = a.suburb || a.neighbourhood || a.city_district || '';
    const cidade = a.city || a.town || a.village || a.municipality || '';
    const uf = a.state ? a.state.split(' (')[0] : '';
    const cidadeUf = [cidade, uf].filter(Boolean).join('/');
    const endereco = [rua, bairro, cidadeUf].filter(Boolean).join(' - ');
    return {
      rua: rua || '—',
      bairro: bairro || '—',
      cidade_uf: cidadeUf || '—',
      endereco: endereco || `Lat ${Number(lat).toFixed(5)}, Lng ${Number(lng).toFixed(5)}`,
    };
  } catch {
    return {
      rua: '—',
      bairro: '—',
      cidade_uf: '—',
      endereco: `Lat ${Number(lat).toFixed(5)}, Lng ${Number(lng).toFixed(5)}`,
    };
  }
}

export const mapsUrl = (lat, lng) => `https://www.google.com/maps?q=${lat},${lng}`;