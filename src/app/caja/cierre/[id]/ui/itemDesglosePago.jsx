import React from 'react';
import { formatearMontoBancario, obtenerMontoFlotante } from '@/lib/utils/montoUtils';

export default function ItemDesglosePago({ item, contado, diferencia, icono, generandoImagen, onCambioContado }) {
  const sinMovimiento = Number(item.monto_esperado || 0) === 0;

  // 1. Lógica para transformar el valor "float"
  let valorDisplay = '';
  if (sinMovimiento) {
    valorDisplay = '0,00';
  } else if (contado !== undefined && contado !== null && contado !== '') {
    const centimos = Number(contado).toFixed(2).replace('.', '');
    valorDisplay = formatearMontoBancario(centimos);
  }

  const handleMontoInputChange = (e) => {
    const valorIngresado = e.target.value;
    const valorFormateado = formatearMontoBancario(valorIngresado);
    const valorNumerico = obtenerMontoFlotante(valorFormateado);
    
    if (valorNumerico > 99999999.99) {
      return; 
    }
    
    onCambioContado(item.id_pago, valorNumerico);
  };

  return (
    <div 
      className={`group flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border rounded-none transition-all gap-4 ${
        sinMovimiento ? 'bg-stone-50/80 border-stone-200' : 'bg-white border-stone-200'
      }`}
      style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-start gap-3.5 flex-1">
        <span className={`text-2xl p-2 rounded-none border flex items-center justify-center ${
          sinMovimiento ? 'bg-stone-100 border-stone-200 opacity-60' : 'bg-stone-100 border-stone-200'
        }`}>
          {icono}
        </span>
        <div>
          <span className={`font-bold text-base ${sinMovimiento ? 'text-slate-500' : 'text-slate-900'}`}>
            {item.nombre}
          </span>
          <div className="text-xs text-slate-600 mt-1 flex flex-col gap-0.5 font-medium">
            <span>
              Esperado: <strong className={sinMovimiento ? 'text-slate-500' : 'text-slate-900'}>
                {Number(item.monto_esperado || 0).toFixed(2).replace('.', ',')} {item.moneda}
              </strong>
            </span>
            
            {/* Desglose detallado */}
            {(Number(item.monto_apertura) > 0 || Number(item.total_compras) > 0 || Number(item.total_gastos) > 0) && (
              <span className="text-[11px] text-slate-500 leading-tight">
                (Apt: {Number(item.monto_apertura || 0).toFixed(2)} + Ventas: {Number(item.monto_ventas || 0).toFixed(2)}
                {Number(item.total_compras) > 0 && ` - Compras: ${Number(item.total_compras).toFixed(2)}`}
                {Number(item.total_gastos) > 0 && ` - Gastos: ${Number(item.total_gastos).toFixed(2)}`})
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
        {/* Declarado */}
        <div className="text-right flex-1 sm:flex-none">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
            Declarado
          </label>
          {generandoImagen ? (
            <div className="w-32 py-2 px-1 font-black text-slate-900 text-right text-base"> 
              {Number(sinMovimiento ? 0 : contado || 0).toFixed(2).replace('.', ',')} <span className="text-xs font-normal text-slate-500">{item.moneda}</span>
            </div>
          ) : (
            <input
              type="text"             
              inputMode="numeric"
              placeholder="0,00"
              maxLength={12}
              disabled={sinMovimiento}
              value={valorDisplay}
              className={`w-32 px-3 py-2 border-2 rounded-none text-right font-black text-base transition-all outline-none ${
                sinMovimiento 
                  ? 'bg-stone-100 border-stone-200 text-slate-400 cursor-not-allowed select-none opacity-80' 
                  : 'bg-white border-stone-400 text-slate-900 focus:border-amber-700'
              }`}
              onChange={handleMontoInputChange}
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
              {Number(diferencia) !== 0 ? (Number(diferencia) > 0 ? `+${Number(diferencia).toFixed(2).replace('.', ',')}` : Number(diferencia).toFixed(2).replace('.', ',')) : '✨ OK'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}