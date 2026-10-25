export default function CalcLine({ label, valor, cor = 'text-white' }) {
  return (
    <div className="flex justify-between">
      <span className="text-[#94A3B8]">{label}</span>
      <span className={`font-bold ${cor}`}>{valor}</span>
    </div>
  );
}