import React from 'react';
import { formatearMontoBancario } from '@/lib/utils/montoUtils';
import InputMontoBase from '@/componentes/ui/inputMontoBase';

export default function ItemDesglosePago({ item, contado, diferencia, icono, generandoImagen, onCambioContado }) {
  const sinMovimiento = Number(item.monto_esperado || 0) === 0;

  let valorDisplay = '';
  if (sinMovimiento) {
    valorDisplay = '0,00';
  } else if (contado !== undefined && contado !== null && contado !== '') {
    const centimos = Number(contado).toFixed(2).replace('.', '');
    valorDisplay = formatearMontoBancario(centimos);
  }

  const montoApertura = Number(item.monto_apertura || 0);
  const montoVentas = Number(item.monto_ventas || 0);
  const totalAvances = Number(item.total_avances || 0);
  const totalCompras = Number(item.total_compras || 0);
  const totalGastos = Number(item.total_gastos || 0);

  const esEfectivo = item.nombre?.toLowerCase().includes('efectivo');
  const tieneDesglose = montoApertura > 0 || totalAvances > 0 || totalCompras > 0 || totalGastos > 0;

  return (
    <div 
      className={`group flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border rounded-none transition-all gap-4 ${
        sinMovimiento ? 'bg-stone-50/80 border-stone-200' : 'bg-white border-stone-200'
      }`}
      style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
    >
      {/* Columna Izquierda: Información y Desglose (min-w-0 permite que el texto rompa línea) */}
      <div className="flex items-start gap-3.5 flex-1 min-w-0 w-full sm:w-auto">
        <span className={`text-2xl p-2 rounded-none border flex items-center justify-center shrink-0 ${
          sinMovimiento ? 'bg-stone-100 border-stone-200 opacity-60' : 'bg-stone-100 border-stone-200'
        }`}>
          {icono}
        </span>
        <div className="min-w-0 flex-1">
          <span className={`font-bold text-base block truncate ${sinMovimiento ? 'text-slate-500' : 'text-slate-900'}`}>
            {item.nombre}
          </span>
          <div className="text-xs text-slate-600 mt-1 flex flex-col gap-0.5 font-medium">
            <span>
              Esperado: <strong className={sinMovimiento ? 'text-slate-500' : 'text-slate-900'}>
                {Number(item.monto_esperado || 0).toFixed(2).replace('.', ',')} {item.moneda}
              </strong>
            </span>
            
            {/* El texto romperá líneas ordenadamente sin empujar la derecha */}
            {tieneDesglose && (
              <span className="text-[11px] text-slate-500 leading-normal mt-0.5 block break-words pr-2">
                (
                {montoApertura > 0 && `Apt: ${montoApertura.toFixed(2).replace('.', ',')}`}
                {montoApertura > 0 && montoVentas > 0 && ' + '}
                {montoVentas > 0 && `Ventas: ${montoVentas.toFixed(2).replace('.', ',')}`}
                
                {totalAvances > 0 && (
                  esEfectivo 
                    ? ` - Avance: ${totalAvances.toFixed(2).replace('.', ',')}`
                    : ` + Avance: ${totalAvances.toFixed(2).replace('.', ',')}`
                )}

                {totalCompras > 0 && ` - Compras: ${totalCompras.toFixed(2).replace('.', ',')}`}
                {totalGastos > 0 && ` - Gastos: ${totalGastos.toFixed(2).replace('.', ',')}`}
                )
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Columna Derecha: Controles de entrada (shrink-0 bloquea su posición y tamaño) */}
      <div className="flex items-center gap-4 w-full sm:w-auto justify-end shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
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
            <InputMontoBase
              placeholder="0,00"
              maxLength={12}
              disabled={sinMovimiento}
              value={valorDisplay}
              onChange={(_, numeroFlotante) => {
                if (numeroFlotante <= 99999999.99) {
                  onCambioContado(item.id_pago, numeroFlotante);
                }
              }}
              className={`w-32 px-3 py-2 border-2 rounded-none text-right font-black text-base transition-all outline-none ${
                sinMovimiento 
                  ? 'bg-stone-100 border-stone-200 text-slate-400 cursor-not-allowed select-none opacity-80' 
                  : 'bg-white border-stone-400 text-slate-900 focus:border-amber-700'
              }`}
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