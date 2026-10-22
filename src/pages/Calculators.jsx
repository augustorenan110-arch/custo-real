import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { brl } from '@/lib/format';
import { calcInss, calcIrrf } from '@/lib/payroll';

const num = (v) => Number(v) || 0;

function Row({ label, value, strong }) {
  return (
    <div className={`flex justify-between text-sm ${strong ? 'font-semibold text-primary' : ''}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Field({ id, label, value, onChange, step }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="number" inputMode="decimal" step={step} value={value} onChange={(e) => onChange(e.target.value)} className="field" />
    </div>
  );
}

function CltPj() {
  const [gross, setGross] = useState(5000);
  const g = num(gross);
  const benefits = g * 0.08 + g / 12 + g / 12 / 3 * 1 + g / 12; // FGTS + 13º + 1/3 férias + férias
  const inss = calcInss(g);
  const net = g - inss - calcIrrf(g, inss);
  const totalCost = g * 1.7;
  const pjEquivalent = g + benefits;
  return (
    <div className="space-y-3">
      <Field id="g" label="Salário bruto CLT (R$)" value={gross} onChange={setGross} />
      <div className="glass space-y-1.5 rounded-xl p-4">
        <Row label="Líquido CLT (estimado)" value={brl(net)} />
        <Row label="Benefícios mensais (FGTS, 13º, férias)" value={brl(benefits)} />
        <Row label="PJ equivalente" value={brl(pjEquivalent)} strong />
        <Row label="Custo da empresa no CLT (~70% de encargos)" value={brl(totalCost)} />
        <Row label="Economia da empresa com PJ" value={brl(Math.max(0, totalCost - pjEquivalent))} strong />
      </div>
    </div>
  );
}

function Termination() {
  const [salary, setSalary] = useState(3000);
  const [months, setMonths] = useState(24);
  const [kind, setKind] = useState('sem_justa_causa');
  const s = num(salary);
  const m = num(months);
  const years = Math.floor(m / 12);
  const noticeDays = Math.min(90, 30 + years * 3);
  const fgtsBalance = s * 0.08 * m;
  const monthsThisYear = (m % 12) || 12;
  const thirteenth = (s / 12) * Math.min(12, monthsThisYear);
  const vacation = (s / 12) * Math.min(12, monthsThisYear) * (4 / 3);
  const notice = kind === 'sem_justa_causa' ? (s / 30) * noticeDays : 0;
  const fine = kind === 'sem_justa_causa' ? fgtsBalance * 0.4 : kind === 'acordo' ? fgtsBalance * 0.2 : 0;
  const rows = {
    sem_justa_causa: thirteenth + vacation + notice + fine,
    acordo: (thirteenth + vacation + (s / 30) * noticeDays * 0.5) + fine,
    pedido: thirteenth + vacation,
    justa_causa: 0,
  };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field id="s" label="Salário (R$)" value={salary} onChange={setSalary} />
        <Field id="mo" label="Meses de casa" value={months} onChange={setMonths} />
      </div>
      <select value={kind} onChange={(e) => setKind(e.target.value)} className="field h-10 w-full rounded-md px-3 text-sm">
        <option value="sem_justa_causa">Dispensa sem justa causa</option>
        <option value="acordo">Acordo (comum acordo)</option>
        <option value="pedido">Pedido de demissão</option>
        <option value="justa_causa">Justa causa</option>
      </select>
      <div className="glass space-y-1.5 rounded-xl p-4">
        <Row label={`Aviso prévio (${noticeDays} dias)`} value={brl(kind === 'sem_justa_causa' ? notice : kind === 'acordo' ? (s / 30) * noticeDays * 0.5 : 0)} />
        <Row label="13º proporcional" value={brl(kind === 'justa_causa' ? 0 : thirteenth)} />
        <Row label="Férias + 1/3" value={brl(kind === 'justa_causa' ? 0 : vacation)} />
        <Row label="Multa do FGTS" value={brl(fine)} />
        <Row label="Total estimado" value={brl(rows[kind])} strong />
      </div>
    </div>
  );
}

function ThirteenthVacation() {
  const [salary, setSalary] = useState(3000);
  const [months, setMonths] = useState(12);
  const [sell, setSell] = useState(false);
  const s = num(salary);
  const thirteenth = (s / 12) * Math.min(12, num(months));
  const vac = s + s / 3;
  const sold = sell ? (s / 30) * 10 * (4 / 3) : 0;
  const vacTotal = sell ? ((s / 30) * 20) * (4 / 3) + sold : vac;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field id="s2" label="Salário (R$)" value={salary} onChange={setSalary} />
        <Field id="m2" label="Meses trabalhados no ano" value={months} onChange={setMonths} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={sell} onChange={(e) => setSell(e.target.checked)} /> Vender 10 dias de férias
      </label>
      <div className="glass space-y-1.5 rounded-xl p-4">
        <Row label="13º salário" value={brl(thirteenth)} />
        <Row label={sell ? 'Férias (20 dias) + abono (10 dias), com 1/3' : 'Férias + 1/3'} value={brl(vacTotal)} />
        <Row label="Total bruto" value={brl(thirteenth + vacTotal)} strong />
      </div>
    </div>
  );
}

export default function Calculators() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <Calculator className="h-6 w-6 text-primary" /> Calculadoras
        </h1>
        <p className="text-sm text-muted-foreground">Estimativas de referência, sem valor de cálculo oficial.</p>
      </div>
      <Tabs defaultValue="clt">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clt">CLT x PJ</TabsTrigger>
          <TabsTrigger value="resc">Rescisão</TabsTrigger>
          <TabsTrigger value="ferias">13º e férias</TabsTrigger>
        </TabsList>
        <TabsContent value="clt"><CltPj /></TabsContent>
        <TabsContent value="resc"><Termination /></TabsContent>
        <TabsContent value="ferias"><ThirteenthVacation /></TabsContent>
      </Tabs>
    </div>
  );
}