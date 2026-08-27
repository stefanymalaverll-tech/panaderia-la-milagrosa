export default function ItemDesglosePago({ item, contado, diferencia, icono, generandoImagen, onCambioContado }) {
  return (
    <div 
      className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white border border-stone-200 rounded-none transition-all gap-4"
      style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-start gap-3.5 flex-1">
        <span className="text-2xl p-2 bg-stone-100 rounded-none border border-stone-200 flex items-center justify-center">
          {icono}
        </span>
        <div>
          <span className="font-bold text-slate-900 text-base">{item.nombre}</span>
          <div className="text-xs text-slate-600 mt-1 flex flex-col gap-0.5 font-medium">
            <span>Esperado: <strong className="text-slate-900">{Number(item.monto_esperado || 0).toFixed(2)} {item.moneda}</strong></span>
            {Number(item.monto_apertura) > 0 && (
              <span className="text-[11px] text-slate-500">
                (Apertura: {Number(item.monto_apertura).toFixed(2)} + Ventas: {Number(item.monto_ventas).toFixed(2)})
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
        {/* Declarado */}
        <div className="text-right flex-1 sm:flex-none">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Declarado</label>
          {generandoImagen ? (
            <div className="w-32 py-2 px-1 font-black text-slate-900 text-right text-base"> 
              {Number(contado || 0).toFixed(2)} <span className="text-xs font-normal text-slate-500">{item.moneda}</span>
            </div>
          ) : (
            <input
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={contado !== undefined && contado !== 0 && contado !== '' ? contado : ''}
              className="w-32 px-3 py-2 bg-white border-2 border-stone-400 rounded-none text-right font-black text-slate-900 text-base focus:outline-none focus:border-amber-700 transition-all"
              style={{ 
                color: '#0f172a', 
                backgroundColor: '#ffffff',
                boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.05)'
              }}
              onChange={(e) => onCambioContado(item.id_pago, e.target.value)}
            />
          )}
        </div>

        {/* Diferencia */}
        {(!generandoImagen || Number(diferencia) !== 0) && (
          <div className="flex items-center justify-center min-w-[75px]">
            <span 
              className={`px-3 py-1.5 rounded-none text-xs font-black tracking-wide ${
                Number(diferencia) < 0 ? 'bg-rose-100 text-rose-900 border border-rose-300' : 
                Number(diferencia) > 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 
                'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}
              style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
            >
              {Number(diferencia) !== 0 ? (Number(diferencia) > 0 ? `+${Number(diferencia).toFixed(2)}` : Number(diferencia).toFixed(2)) : '✨ OK'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}