'use client';

import { useCaja } from '@/app/caja/useCaja';
import HeaderCaja from './ui/headerCaja';
import CatalogoProductos from './ui/catalogoProductos';
import CarritoTicket from './ui/carritoTicket';
import ModuloPagos from './ui/moduloPagos';
import BalanceVuelto from './ui/balanceVuelto';
import ModalApertura from './modals/modalApertura';
import ModalDetallesC from './modals/modalDetallesC';
import SmsNotificacion from '@/componentes/ui/smsnotificacion'; 

export default function CajaPage() {
  const caja = useCaja();

  if (caja.cargando) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center font-bold text-slate-800">
        Cargando datos de la caja...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 relative">
      <SmsNotificacion notificacion={caja.notificacion} />
      <ModalApertura caja={caja} />
      <ModalDetallesC
        show={caja.showModalDetallesCaja} 
        onClose={() => caja.setShowModalDetallesCaja(false)} 
        cajaSeleccionada={caja.cajaSeleccionada} 
        ordenesCaja={caja.ordenesCaja} 
        cargandoOrdenes={caja.cargandoOrdenes} 
      />
      <HeaderCaja caja={caja} />

      <main className="flex-1 p-3 md:p-4 flex flex-col lg:flex-row gap-4 max-w-[1600px] mx-auto w-full">
        <CatalogoProductos caja={caja} />

        <section className="w-full lg:max-w-[550px] bg-white p-3 md:p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <CarritoTicket caja={caja} />
          </div>

          <div className="border-t border-slate-200 pt-3 mt-3 space-y-3">
            <ModuloPagos caja={caja} />
            <BalanceVuelto caja={caja} />

            <button
              disabled={caja.carrito.length === 0 || caja.faltanteUSD > 0.01 || caja.procesando || (caja.vueltoUSD > 0.01 && !caja.idMetodoVuelto)}
              onClick={caja.procesarVentaReal}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer active:scale-98"
            >
              {caja.procesando ? 'Procesando Venta...' : '✅ Procesar Orden'}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}