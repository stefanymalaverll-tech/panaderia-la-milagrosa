'use client';

import { useCaja } from '@/app/caja/useCaja';
import HeaderCaja from './ui/headerCaja';
import CatalogoProductos from './ui/catalogoProductos';
import CarritoTicket from './ui/carritoTicket';
import ModuloPagos from './ui/moduloPagos';
import BalanceVuelto from './ui/balanceVuelto';
import ModalApertura from './modals/modalApertura';
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
      {/* TOAST DE NOTIFICACIÓN FLOTANTE GLOBAL */}
      <SmsNotificacion notificacion={caja.notificacion} />

      {/* MODAL DE APERTURA */}
      <ModalApertura caja={caja} />

      {/* HEADER RESPONSIVO */}
      <HeaderCaja caja={caja} />

      {/* ÁREA DE TRABAJO */}
      <main className="flex-1 p-3 md:p-4 flex flex-col lg:flex-row gap-4 max-w-[1600px] mx-auto w-full">
        {/* CATÁLOGO DE PRODUCTOS */}
        <CatalogoProductos caja={caja} />

        {/* COLUMNA TICKET / ORDEN DE VENTA */}
        <section className="w-full lg:max-w-[550px] bg-white p-3 md:p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <CarritoTicket caja={caja} />
          </div>

          {/* TOTALES Y MÓDULO DE PAGO */}
          <div className="border-t border-slate-200 pt-3 mt-3 space-y-3">
            <ModuloPagos caja={caja} />
            <BalanceVuelto caja={caja} />

            {/* BOTÓN REGISTRAR Y PROCESAR */}
            <button
              disabled={caja.carrito.length === 0 || caja.faltanteUSD > 0.001 || caja.procesando || (caja.vueltoUSD > 0.001 && !caja.idMetodoVuelto)}
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