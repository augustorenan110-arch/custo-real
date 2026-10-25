import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { calcularBeneficio, calcularHoraExtra, calcularVT } from '@/lib/payroll';

const num = (valor, padrao) => (Number.isFinite(Number(valor)) ? Number(valor) : padrao);

/**
 * Estado das calculadoras de benefícios (VT, VA/VR PAT e horas extras), com
 * salvamento automático dos benefícios na ficha do colaborador.
 */
export function useBeneficios(employee) {
  const queryClient = useQueryClient();
  const salario = num(employee?.salary, 0);

  const [vtAtivo, setVtAtivo] = useState(!!employee?.vt_ativo);
  const [valorPassagem, setValorPassagem] = useState(num(employee?.vt_valor_passagem, 4.5));
  const [diasVt, setDiasVt] = useState(num(employee?.vt_dias_uteis, 22));
  const [doisVales, setDoisVales] = useState(employee?.vt_dois_vales !== false);

  const [vaAtivo, setVaAtivo] = useState(!!employee?.va_ativo);
  const [vrAtivo, setVrAtivo] = useState(!!employee?.vr_ativo);
  const [valorDiarioVA, setValorDiarioVA] = useState(num(employee?.va_valor_diario, 25));
  const [valorDiarioVR, setValorDiarioVR] = useState(num(employee?.vr_valor_diario, 25));
  const [diasBeneficio, setDiasBeneficio] = useState(num(employee?.va_dias_uteis, 22));
  const [descontoPAT, setDescontoPAT] = useState(num(employee?.va_desconto_pat, 20));

  const [horas50, setHoras50] = useState(num(employee?.horas_extras_50, 10));
  const [horas100, setHoras100] = useState(num(employee?.horas_extras_100, 4));

  const vt = calcularVT({ valorPassagem, diasUteis: diasVt, doisVales, salario });
  const va = calcularBeneficio({ valorDiario: valorDiarioVA, dias: diasBeneficio, descontoPercent: descontoPAT });
  const vr = calcularBeneficio({ valorDiario: valorDiarioVR, dias: diasBeneficio, descontoPercent: descontoPAT });
  const horaExtra = calcularHoraExtra({ salario, horas50, horas100 });

  const selecionarPat = (tipo) => {
    setVaAtivo(tipo === 'va' ? !vaAtivo : false);
    setVrAtivo(tipo === 'vr' ? !vrAtivo : false);
  };

  const assinatura = [
    vtAtivo, valorPassagem, diasVt, doisVales,
    vaAtivo, vrAtivo, valorDiarioVA, valorDiarioVR, diasBeneficio, descontoPAT,
  ].join('|');
  const salvo = useRef(assinatura);

  useEffect(() => {
    if (assinatura === salvo.current) return undefined;
    const timer = setTimeout(async () => {
      salvo.current = assinatura;
      try {
        await base44.entities.Employee.update(employee.id, {
          vt_ativo: vtAtivo,
          vt_valor_passagem: valorPassagem,
          vt_dias_uteis: diasVt,
          vt_dois_vales: doisVales,
          vt_custo_empresa: vtAtivo ? vt.custoEmpresa : 0,
          vt_custo_total: vtAtivo ? vt.custoTotal : 0,
          va_ativo: vaAtivo,
          va_valor_diario: valorDiarioVA,
          va_dias_uteis: diasBeneficio,
          va_desconto_pat: descontoPAT,
          va_custo_empresa: vaAtivo ? va.custoEmpresa : 0,
          va_custo_total: vaAtivo ? va.custoTotal : 0,
          vr_ativo: vrAtivo,
          vr_valor_diario: valorDiarioVR,
          vr_custo_empresa: vrAtivo ? vr.custoEmpresa : 0,
          vr_custo_total: vrAtivo ? vr.custoTotal : 0,
        });
        queryClient.invalidateQueries({ queryKey: ['employees'] });
      } catch (e) {
        console.error('Não foi possível salvar os benefícios', e);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [assinatura]);

  const salvarHoraExtra = () =>
    base44.entities.Employee.update(employee.id, {
      horas_extras_50: horas50,
      horas_extras_100: horas100,
      custo_hora_extra: horaExtra.custoComFgts,
    });

  return {
    vt: {
      ativo: vtAtivo,
      setAtivo: setVtAtivo,
      doisVales,
      setDoisVales,
      valorPassagem,
      setValorPassagem,
      diasUteis: diasVt,
      setDiasUteis: setDiasVt,
      calc: vt,
    },
    pat: {
      tipo: vaAtivo ? 'va' : vrAtivo ? 'vr' : null,
      selecionar: selecionarPat,
      valorVA: valorDiarioVA,
      setValorVA: setValorDiarioVA,
      valorVR: valorDiarioVR,
      setValorVR: setValorDiarioVR,
      dias: diasBeneficio,
      setDias: setDiasBeneficio,
      descontoPAT,
      setDescontoPAT,
      calcVA: va,
      calcVR: vr,
    },
    horaExtra: {
      horas50,
      setHoras50,
      horas100,
      setHoras100,
      salario,
      calc: horaExtra,
      salvar: salvarHoraExtra,
    },
    extras: {
      vt: vtAtivo ? vt.custoEmpresa : 0,
      vtAtivo,
      vtCustoTotal: vt.custoTotal,
      vtDescontoFuncionario: vt.descontoFuncionario,
      va: vaAtivo ? va.custoEmpresa : 0,
      vr: vrAtivo ? vr.custoEmpresa : 0,
      horaExtra: horaExtra.custoComFgts,
    },
  };
}