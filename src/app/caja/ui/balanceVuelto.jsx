export default function BalanceVuelto({ caja }) {
  const {
    vueltoUSD, vueltoBs, faltanteUSD, faltanteBs, totalPagarUSD,
    idMetodoVuelto, setIdMetodoVuelto, metodosPagoBD
  } = caja;

  return (
    <div className={`p-3 rounded-2xl border text-xs flex flex-col gap-2 transition-all ${
      vueltoUSD > 0.001 
        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
        : faltanteUSD === 0 && totalPagarUSD > 0
        ? 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold'
        : 'bg-amber-50 border-amber-300 text-amber-950'
    }`}>
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10px] font-extrabold uppercase block">
            {vueltoUSD > 0.001 
              ? '🟢 Vuelto a entregar:' 
              : faltanteUSD === 0 
              ? '✅ Orden Cubierta' 
              : '🟡 Restante por cobrar:'}
          </span>
          <p className="text-sm md:text-base font-black">
            Bs. {(vueltoUSD > 0.001 ? vueltoBs : faltanteBs).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-700">
            ${(vueltoUSD > 0.001 ? vueltoUSD : faltanteUSD).toFixed(2)} USD
          </p>
        </div>
      </div>

      {vueltoUSD > 0.001 && (
        <div className="pt-2 border-t border-emerald-200 flex flex-col gap-1">
          <label className="text-[10px] font-bold text-emerald-900 uppercase">
            ¿De qué caja/método entregas el vuelto?
          </label>
          <select
            value={idMetodoVuelto}
            onChange={(e) => setIdMetodoVuelto(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">-- Seleccionar origen del vuelto --</option>
            {metodosPagoBD.map(m => (
              <option key={m.id_pago} value={m.id_pago}>
                {m.nombre} ({m.moneda})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}