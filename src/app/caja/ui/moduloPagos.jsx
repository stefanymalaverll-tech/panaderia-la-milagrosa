export default function ModuloPagos({ caja }) {
  const {
    esPagoMovil, metodoSeleccionado, setMetodoSeleccionado, metodosPagoBD,
    montoAbonoInput, setMontoAbonoInput, metodoActualObj, agregarPago,
    numReferencia, setNumReferencia, handleSoloNumeros,
    pagosRegistrados, eliminarPago
  } = caja;

  return (
    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2.5">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-slate-700 uppercase block">
          Registrar Método de Pago
        </span>
        {esPagoMovil && (
          <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full">
            Pago Móvil
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            id="metodo-pago"
            name="metodopago"
            value={metodoSeleccionado}
            onChange={(e) => setMetodoSeleccionado(e.target.value)}
            className="w-full sm:flex-1 px-2.5 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-amber-500"
          >
            {metodosPagoBD.map(m => (
              <option key={m.id_pago} value={m.id_pago}>
                {m.nombre} ({m.moneda})
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <input
              id="monto-pago"
              name="monto_pago"
              type="number"
              min="0"
              placeholder={`Monto (${metodoActualObj?.moneda || 'Bs'})`}
              value={montoAbonoInput}
              onChange={(e) => setMontoAbonoInput(e.target.value)}
              className="w-full sm:w-28 px-2.5 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-amber-500 placeholder:text-slate-400"
            />
            <button
              onClick={agregarPago}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-colors shrink-0"
            >
              + Añadir
            </button>
          </div>
        </div>

        {/* CAMPO DINÁMICO PAGO MÓVIL (Solo Referencia) */}
        {esPagoMovil && (
          <div className="pt-2 border-t border-slate-200 animate-in fade-in duration-200">
            <label className="text-[9px] font-bold text-slate-500 block mb-0.5">N° REFERENCIA (*)</label>
            <input
              id="Referencia"
              name="Referencia"
              type="text"
              placeholder="Ej: 8492"
              value={numReferencia}
              onChange={(e) => handleSoloNumeros(e.target.value, setNumReferencia, 5)}
              className="w-full sm:w-1/2 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500"
            />
          </div>
        )}
      </div>

      {/* LISTA DE ABONOS APLICADOS */}
      {pagosRegistrados.length > 0 && (
        <div className="mt-2 space-y-1.5 max-h-28 overflow-y-auto pr-1">
          {pagosRegistrados.map((pago, index) => (
            <div key={index} className="flex justify-between items-center text-xs bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex flex-col">
                <span className="font-bold text-slate-800">{pago.nombreMetodo}</span>
                {pago.numero_referencia && (
                  <span className="text-[10px] text-slate-500 font-mono">
                    Ref: #{pago.numero_referencia}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">
                  {pago.monedaIngresada === 'Bs' 
                    ? `Bs. ${pago.montoIngresado.toLocaleString('es-VE')} ($${pago.montoUSD.toFixed(2)})`
                    : `$${pago.montoIngresado.toFixed(2)} (Bs. ${pago.montoBs.toLocaleString('es-VE')})`}
                </span>
                <button
                  onClick={() => eliminarPago(index)}
                  className="text-red-500 font-bold hover:text-red-700 text-xs cursor-pointer p-0.5"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}