import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { carregarFiscal, getFiscal, salvarTabelaFiscal } from '@/lib/fiscal';

/** Tabelas oficiais em vigor, já carregadas da base na primeira tela. */
export function useFiscalVigente() {
  const [, setVersao] = useState(0);

  useEffect(() => {
    let vivo = true;
    carregarFiscal()
      .then(() => vivo && setVersao((v) => v + 1))
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);

  return getFiscal();
}

/** Linhas cruas da ConfigFiscal, para a tela administrativa. */
export function useTabelasFiscais() {
  const [rows, setRows] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    const page = await base44.entities.ConfigFiscal.list({ sort: 'nome_tabela', limit: 200 });
    setRows(Array.isArray(page) ? page : page?.items || []);
  }, []);

  useEffect(() => {
    carregar()
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, [carregar]);

  const salvar = useCallback(
    async (id, patch) => {
      await salvarTabelaFiscal(id, patch);
      await carregar();
    },
    [carregar],
  );

  return { rows, carregando, salvar, recarregar: carregar };
}