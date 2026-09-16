import { useState, useEffect } from 'react';

export default function BalanceVuelto({ caja }) {
  const {
    vueltoUSD, vueltoBs, faltanteUSD, faltanteBs, totalPagarBs,
    carrito, pagosRegistrados = []
  } = caja;

  const esVuelto = vueltoUSD >= 0.01;
  const esCubierta = (faltanteBs <= 0.05 || faltanteUSD <= 0.01) && totalPagarBs > 0;

  const hayPagos = Boolean(pagosRegistrados && pagosRegistrados.length > 0);
  const hayCarrito = Boolean(carrito && carrito.length > 0);

  const isVisible = hayCarrito && hayPagos;

  // Estado congelado para mantener los valores visuales durante el desvanecimiento
  const [ultimoEstadoValido, setUltimoEstadoValido] = useState(null);

  useEffect(() => {
    if (isVisible) {
      setUltimoEstadoValido({
        esVuelto,
        esCubierta,
        montoBs: esVuelto ? vueltoBs : (esCubierta ? 0 : faltanteBs),
        montoUSD: esVuelto ? vueltoUSD : (esCubierta ? 0 : faltanteUSD)
      });
    }
  }, [isVisible, esVuelto, esCubierta, vueltoBs, vueltoUSD, faltanteBs, faltanteUSD]);

  // Usamos los datos actuales o los congelados de la última vez que fue visible
  const datosAMostrar = isVisible ? {
    esVuelto,
    esCubierta,
    montoBs: esVuelto ? vueltoBs : (esCubierta ? 0 : faltanteBs),
    montoUSD: esVuelto ? vueltoUSD : (esCubierta ? 0 : faltanteUSD)
  } : ultimoEstadoValido;

  const { esVuelto: ev, esCubierta: ec, montoBs, montoUSD } = datosAMostrar || {};

  return (
    /* El contenedor externo SIEMPRE se renderiza en el DOM reservando sus 28px */
    <div className="h-[28px] flex flex-col justify-center shrink-0 bg-transparent overflow-hidden">
      
      <div className={`transition-opacity duration-300 ease-in-out flex items-center justify-between px-1 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        
        {/* TEXTO DE ESTADO */}
        <span className={`text-[10px] font-bold uppercase tracking-wider ${
          ev ? 'text-indigo-500' : ec ? 'text-emerald-500' : 'text-rose-500'
        }`}>
          {ev ? '💵 Vuelto a entregar:' : ec ? '✅ Orden cubierta:' : '🔴 Faltante por pagar:'}
        </span>
        
        <div className="flex items-baseline gap-1.5">
          {/* MONTO PRINCIPAL EN BS */}
          <span className={`text-base font-black leading-none ${
            ev ? 'text-indigo-600' : ec ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            Bs. {Number(montoBs || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          
          {/* MONTO REF */}
          <span className={`text-[10px] font-bold leading-none ${
            ev ? 'text-indigo-400' : ec ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            Ref. ${Number(montoUSD || 0).toFixed(2)}
          </span>

        </div>
      </div>
    </div>
  );
}