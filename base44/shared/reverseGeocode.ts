// Geocodificação reversa 100% OpenStreetMap (Nominatim) — grátis, sem chave de API.
// Roda só no backend (Deno). Retorna endereço estruturado ou null quando falha
// (sem internet, coordenadas inválidas ou sem resultado).

function fmt(rua: string, bairro: string, cidade: string, uf: string) {
  const cidadeUf = [cidade, uf].filter(Boolean).join(' - ');
  const endereco = [rua, bairro ? `${bairro}, ${cidadeUf}` : cidadeUf]
    .filter(Boolean)
    .join(' - ');
  return {
    rua: rua || '',
    bairro: bairro || '',
    cidade_uf: cidadeUf || '',
    endereco: endereco || '',
  };
}

export async function reverseGeocode(lat: number, lng: number) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=pt-BR`,
      { headers: { Accept: 'application/json' } },
    );
    if (!res.ok) throw new Error(`osm ${res.status}`);
    const a: any = (await res.json())?.address || {};
    const rua =
      [a.road, a.house_number].filter(Boolean).join(', ') ||
      a.pedestrian ||
      a.footway ||
      a.path ||
      '';
    const bairro = a.suburb || a.neighbourhood || a.city_district || a.quarter || '';
    const cidade = a.city || a.town || a.village || a.municipality || a.county || '';
    const uf = a.state ? a.state.split(' (')[0] : '';
    // Sem número? devolve pelo menos Rua + Bairro + Cidade. Sem nada? devolve null
    // (quem chamou salva Lat/Lng e mostra "Endereço não encontrado - Lat: X, Long: Y").
    if (!rua && !cidade) throw new Error('osm empty');
    return fmt(rua, bairro, cidade, uf);
  } catch {
    return null;
  }
}