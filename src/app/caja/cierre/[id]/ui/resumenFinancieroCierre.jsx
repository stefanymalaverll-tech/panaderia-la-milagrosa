export default function ResumenFinancieroCierre({ subtotalBs, subtotalUsd, tasa }) {
  // Convertimos el subtotal en Bs a USD usando la tasa y lo sumamos al subtotal en USD
  const subtotalBsConvertidoUSD = (tasa && tasa > 0) ? subtotalBs / tasa : 0;
  const totalGeneralUsd = subtotalUsd + subtotalBsConvertidoUSD;

  return (
    <div className="mt-6 p-5 border border-stone-300 bg-stone-50/50 space-y-4 font-sans rounded-xl shadow-sm">
      <div className="text-xs uppercase font-black text-stone-600 tracking-wider pb-2 border-b border-stone-200 flex justify-between items-center">
        <span>📊 Resumen Financiero del Cierre</span>
        {tasa && <span className="text-[10px] text-slate-400 font-normal">Tasa aplicada: Bs. {tasa.toFixed(2)}</span>}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        {/* Subtotal en Bolívares */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-500">Subtotal Recaudado (Bs)</span>
          <strong className="text-slate-900 font-black text-base mt-0.5">
            {subtotalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs
          </strong>
        </div>

        {/* Subtotal en USD */}
        <div className="flex flex-col sm:border-x sm:border-stone-200 sm:px-4">
          <span className="text-[10px] uppercase font-bold text-slate-500">Subtotal Recaudado (USD)</span>
          <strong className="text-slate-900 font-black text-base mt-0.5">
            {subtotalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
          </strong>
        </div>

        {/* Total General Unificado en USD */}
        <div className="flex flex-col sm:text-right">
          <span className="text-[10px] uppercase font-bold text-indigo-600">Total General ($)</span>
          <strong className="text-indigo-700 font-black text-lg mt-0.5">
            ${totalGeneralUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </div>
      </div>
    </div>
  );
}