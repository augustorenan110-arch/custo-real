// Geocodificação reversa: Google Maps Geocoding API (se GOOGLE_MAPS_API_KEY configurada)
// com fallback OpenStreetMap Nominatim (100% grátis). Roda só no backend (Deno).
// Retorna endereço estruturado ou null quando ambos falham.

function fmt(rua: string, bairro: string, cidade: string, uf: string) {
  const cidadeUf = [cidade, uf].filter(Boolean).join(' - ');
  const endereco = [rua, bairro ? `${bairro}, ${cidadeUf}` : cidadeUf]
    .filter(Boolean)
    .join(' - ');
  return {
    rua: rua || '—',
    bairro: bairro || '—',
    cidade_uf: cidadeUf || '—',
    endereco: endereco || `Lat ${Number(rua).toFixed(5)}, Lng`,
  };
}

async function googleReverse(lat: number, lng: number, key: string) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=pt-BR&key=${key}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`google ${res.status}`);
  const data: any = await res.json();
  const comps: any[] = data?.results?.[0]?.address_components;
  if (!comps?.length) throw new Error('google no results');
  const get = (types: string[]) => {
    for (const t of types) {
      const c = comps.find((c) => c.types?.includes(t));
      if (c) return c;
    }
    return null;
  };
  const route = get(['route'])?.long_name || '';
  const number = get(['street_number'])?.long_name || '';
  const rua = [route, number].filter(Boolean).join(', ');
  const bairro =
    get(['sublocality', 'sublocality_level_1', 'neighborhood', 'administrative_area_level_4'])
      ?.long_name || '';
  const cidade =
    get(['administrative_area_level_2'])?.long_name || get(['locality'])?.long_name || '';
  const uf = get(['administrative_area_level_1'])?.short_name || '';
  if (!rua && !cidade) throw new Error('google empty');
  return fmt(rua, bairro, cidade, uf);
}

async function osmReverse(lat: number, lng: number) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=pt-BR&zoom=18`,
    { headers: { Accept: 'application/json' } },
  );
  if (!res.ok) throw new Error(`osm ${res.status}`);
  const a: any = (await res.json())?.address || {};
  const rua =
    [a.road, a.house_number].filter(Boolean).join(', ') || a.pedestrian || a.footway || '';
  const bairro = a.suburb || a.neighbourhood || a.city_district || '';
  const cidade = a.city || a.town || a.village || a.municipality || '';
  const uf = a.state ? a.state.split(' (')[0] : '';
  if (!rua && !cidade) throw new Error('osm empty');
  return fmt(rua, bairro, cidade, uf);
}

export async function reverseGeocode(lat: number, lng: number) {
  const key = Deno.env.get('GOOGLE_MAPS_API_KEY');
  if (key) {
    try {
      return await googleReverse(lat, lng, key);
    } catch {
      /* cai para o fallback grátis */
    }
  }
  try {
    return await osmReverse(lat, lng);
  } catch {
    return null;
  }
}