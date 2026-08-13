export default function ResumenFinancieroCierre({ subtotalBs, subtotalUsd }) {
  return (
    <div className="mt-6 p-5 border border-stone-300 bg-stone-50/50 space-y-3 font-sans">
      <div className="text-xs uppercase font-black text-stone-600 tracking-wider pb-2 border-b border-stone-200">
        📊 Resumen Financiero del Cierre
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 text-sm">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-500">Subtotal Recaudado (Bs)</span>
          <strong className="text-slate-900 font-black text-base">
            {subtotalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs
          </strong>
        </div>
        <div className="flex flex-col text-right sm:text-right">
          <span className="text-[10px] uppercase font-bold text-slate-500">Subtotal Recaudado (USD)</span>
          <strong className="text-slate-900 font-black text-base">
            {subtotalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
          </strong>
        </div>
      </div>
    </div>
  );
}