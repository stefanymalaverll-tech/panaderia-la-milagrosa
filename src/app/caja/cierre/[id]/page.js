'use client';

import { useCierre } from './useCierre';
import SmsNotificacion from '@/componentes/ui/smsnotificacion';
import HeaderCierre from './ui/headerCierre';
import ItemDesglosePago from './ui/itemDesglosePago';
import ResumenFinancieroCierre from './ui/resumenFinancieroCierre';
import ModalConfirmarCierre from './modals/modalConfirmarCierre';

export default function CierreDeCaja() {
  const {
    id,
    cargando,
    desglosePagos,
    montosContados,
    totalOrdenes,
    procesando,
    cierreCaja,
    setCierreCaja,
    generandoImagen,
    ticketRef,
    notificacion,
    handleCambioContado,
    obtenerIconoPago,
    subtotalBs,
    subtotalUsd,
    procesarArqueoCierre
  } = useCierre();

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="font-semibold text-slate-200 animate-pulse tracking-wide text-sm">Calculando arqueo de caja...</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen w-full py-10 px-4 sm:px-6 flex flex-col items-center justify-center relative bg-amber-50 overflow-hidden font-sans"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(217, 119, 6, 0.09) 15px, transparent 2px),
          linear-gradient(to bottom, rgba(217, 119, 6, 0.10) 15px, transparent 2px)
        `,
        backgroundSize: '40px 40px'
      }}
    >
      <SmsNotificacion notificacion={notificacion} />

      <div 
        ref={ticketRef} 
        className="bg-white p-8 sm:p-10 rounded-none border border-amber-200 w-full max-w-2xl text-slate-900 font-sans"
        style={{ 
          backgroundColor: '#ffffff', 
          color: '#0f172a',
          boxShadow: generandoImagen ? 'none' : '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
        }}
      >
        <HeaderCierre id={id} totalOrdenes={totalOrdenes} />

        <div className="space-y-4">
          {desglosePagos.map((item) => {
            const contado = montosContados[item.id_pago] || 0;
            const esperado = Number(item.monto_esperado) || 0;
            const diferencia = contado - esperado;
    
            return (
              <ItemDesglosePago
                key={item.id_pago}
                item={item}
                contado={contado}
                diferencia={diferencia}
                icono={obtenerIconoPago(item.nombre, item.moneda)}
                generandoImagen={generandoImagen}
                onCambioContado={handleCambioContado}
              />
            );
          })}
        </div>

        <ResumenFinancieroCierre subtotalBs={subtotalBs} subtotalUsd={subtotalUsd} />

        {generandoImagen && (
          <div className="mt-8 pt-4 border-t border-stone-200 text-center text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            Comprobante Cierre de Caja • Panadería La Milagrosa
          </div>
        )}

        {!generandoImagen && (
          <button
            onClick={() => setCierreCaja(true)}
            disabled={procesando}
            className="mt-8 w-full bg-slate-900 hover:bg-black text-white font-bold py-4 px-6 rounded-none transition-all transform active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 text-sm tracking-wide cursor-pointer"
            style={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
          >
            <span>Confirmar Cierre y Descargar Ticket 📥</span>
          </button>
        )}
      </div>

      {cierreCaja && (
        <ModalConfirmarCierre 
          procesando={procesando}
          onCancelar={() => setCierreCaja(false)}
          onConfirmar={procesarArqueoCierre}
        />
      )}
    </div>
  );
}