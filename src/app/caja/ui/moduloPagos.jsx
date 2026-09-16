import React, { useRef, useEffect } from 'react';
import { formatearMontoBancario, obtenerMontoFlotante } from '@/lib/utils/montoUtils';

export default function ModuloPagos({ caja }) {
  const {
    esPagoMovil, metodoSeleccionado, setMetodoSeleccionado, metodosPagoBD,
    montoAbonoInput, setMontoAbonoInput, agregarPago,
    numReferencia, setNumReferencia, handleSoloNumeros,
    pagosRegistrados, eliminarPago, 
    faltanteBs, faltanteUSD 
  } = caja;
  
  const metodoActualObj = metodosPagoBD.find(m => m.id_pago == metodoSeleccionado);
  const ordenCubierta = faltanteBs <= 0.05 || faltanteUSD <= 0.01;
  const inputMontoRef = useRef(null);

  // Focus automático en el monto sin sombrear el texto
  useEffect(() => {
    if (metodoSeleccionado && inputMontoRef.current) {
      setTimeout(() => {
        inputMontoRef.current?.focus();
      }, 10);
    }
  }, [metodoSeleccionado]);

  const seleccionarMetodoYAutocompletar = (metodo) => {
    if (ordenCubierta) return;

    const yaRegistrado = pagosRegistrados.some(p => 
      p.id_pago == metodo.id_pago || p.metodo_id == metodo.id_pago || p.idMetodo == metodo.id_pago || p.nombreMetodo?.toLowerCase() === metodo.nombre?.toLowerCase()
    );
    if (yaRegistrado) return;

    setMetodoSeleccionado(metodo.id_pago);
    const monto = metodo.moneda === 'USD' ? faltanteUSD : faltanteBs;
    
    // Autocompleta usando la misma máscara bancaria para cualquier moneda
    setMontoAbonoInput(formatearMontoBancario(monto.toFixed(2)));
    setNumReferencia('');
  };

  const handleMontoInputChange = (e) => {
    const valorIngresado = e.target.value;
    
    // Reutilizamos la máscara bancaria exactamente igual para USD y Bs
    const valorFormateado = formatearMontoBancario(valorIngresado);
    const valorNumerico = obtenerMontoFlotante(valorFormateado);
    
    if (valorNumerico > 99999999.99) {
      return; 
    }
    setMontoAbonoInput(valorFormateado);
  };

  const handleAgregarYLimpiar = () => {
    agregarPago();
    setMetodoSeleccionado(null);
    setMontoAbonoInput('');
    setNumReferencia('');
  };

  return (
    <div className="bg-white p-1.5 rounded-xl border border-slate-200 space-y-1 shadow-sm shrink-0 w-full overflow-hidden">
      
      {/* 1. SELECCIÓN DE MÉTODO */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider">
            Registrar Método de Pago
          </span>
          {esPagoMovil && metodoSeleccionado && (
            <span className="text-[8px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded uppercase">
              Requiere N° Ref.
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {metodosPagoBD.map(m => {
            const indexPago = pagosRegistrados.findIndex(p => 
              p.id_pago == m.id_pago || p.metodo_id == m.id_pago || p.idMetodo == m.id_pago || p.nombreMetodo?.toLowerCase() === m.nombre?.toLowerCase()
            );
            const pago = indexPago !== -1 ? pagosRegistrados[indexPago] : null;
            const estaSeleccionado = metodoSeleccionado == m.id_pago;
            const isDisabled = !!pago || (ordenCubierta && !pago);

            return (
              <div key={m.id_pago} className="relative">
                <button
                  onClick={() => !isDisabled && seleccionarMetodoYAutocompletar(m)}
                  type="button"
                  disabled={isDisabled}
                  className={`w-full h-[34px] px-1 rounded-lg border transition-all flex flex-col items-center justify-center leading-tight
                    ${pago
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-inner cursor-default'
                      : estaSeleccionado
                        ? 'bg-white text-slate-800 border-slate-400 shadow-md scale-[1.01] ring-1 ring-slate-300 cursor-pointer font-extrabold'
                        : isDisabled
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                          : 'bg-slate-50/80 text-slate-700 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300 cursor-pointer shadow-sm'
                    }`}
                >
                  <span className={`${pago ? 'text-[11px] font-bold opacity-80' : 'text-[11px] font-bold'}`}>
                    {m.nombre}
                  </span>
                  
                  {pago && (
                    <span className="text-[12px] font-black tracking-tight">
                      {pago.monedaIngresada === 'Bs' ? 'Bs.' : '$'} {Number(pago.montoIngresado || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </button>

                {pago && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      eliminarPago(indexPago);
                    }}
                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-black shadow-md cursor-pointer transition-transform hover:scale-110 z-10"
                    title="Eliminar este pago"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. ENTRADA DE MONTO Y REFERENCIA */}
      {metodoSeleccionado && metodoActualObj && (
        <div className="flex gap-1.5 items-end pt-1 animate-fadeIn w-full">
          
          {/* Campo Monto con Máscara Bancaria */}
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <label htmlFor="monto-pago" className="text-[8.5px] font-black text-amber-500 uppercase tracking-tight select-none">
              Monto
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-2 text-[11px] font-bold text-slate-400 select-none pointer-events-none">
                {metodoActualObj?.moneda === 'USD' ? '$' : 'Bs.'}
              </span>
              <input
                id="monto-pago"
                ref={inputMontoRef}
                name="monto_pago"
                type="text"
                inputMode="numeric"
                placeholder="0,00"
                maxLength={10} 
                value={montoAbonoInput}
                onChange={handleMontoInputChange}
                disabled={ordenCubierta}
                className="w-full h-8 pl-7 pr-2 bg-white border border-slate-300 rounded-md font-black text-slate-900 text-md focus:ring-2 focus:ring-amber-500/80 focus:border-amber-500 outline-none placeholder:text-slate-300 disabled:text-slate-400 text-right"
              />
            </div>
          </div>

          {/* Campo N° Ref (Solo Pago Móvil) */}
          {esPagoMovil && (
            <div className="w-20 shrink-0 flex flex-col gap-0.5">
              <label htmlFor="ref-pago" className="text-[8.5px] font-black text-slate-500 uppercase tracking-tight select-none">
                N° Ref
              </label>
              <input
                id="ref-pago"
                type="text"
                inputMode="numeric"
                placeholder="Últimos 4"
                value={numReferencia}
                onChange={(e) => handleSoloNumeros(e.target.value, (val) => setNumReferencia(val), 4)}
                disabled={ordenCubierta}
                className="w-full h-8 px-1 text-center text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500/80 focus:border-amber-500 outline-none placeholder:text-slate-300 disabled:text-slate-400"
              />
            </div>
          )}

          {/* Botón Añadir */}
          <button
            onClick={handleAgregarYLimpiar}
            type="button"
            disabled={ordenCubierta}
            className="bg-amber-500 hover:bg-amber-600 text-white px-3 rounded-md font-black text-[10px] cursor-pointer transition-all shrink-0 shadow-sm shadow-amber-500/30 h-8 flex items-center justify-center uppercase active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Añadir
          </button>
        </div>
      )}
    </div>
  );
}