'use client';

import { useCaja } from '@/app/caja/useCaja';
import HeaderCaja from './ui/headerCaja';
import CatalogoProductos from './ui/catalogoProductos';
import CarritoTicket from './ui/carritoTicket';
import ModuloPagos from './ui/moduloPagos';
import BalanceVuelto from './ui/balanceVuelto';
import ModalApertura from './modals/modalApertura';
import ModalDetallesC from '../../componentes/modals/modalDetallesC';
import SmsNotificacion from '@/componentes/ui/smsnotificacion'; 
import ModalAvanceEfectivo from '../../componentes/modals/modalAvanceEfectivo';

export default function CajaPage() {
  const caja = useCaja();
  
  if (caja.cargando) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center font-bold text-slate-800">
        Cargando datos de la caja...
      </div>
    );
  }

  const handleProcesarVenta = async () => {
    await caja.procesarVentaReal();
  };

  // La orden está cubierta si el faltante en USD o Bs es prácticamente cero
  const isOrdenCubierta = caja.faltanteBs <= 0.05 || caja.faltanteUSD <= 0.01;
  
  // Solo se exige método de vuelto si hay un vuelto REAL en divisas (mayor o igual a $0.01)
  const hayVueltoReal = caja.vueltoUSD >= 0.01;

  const isBotonDeshabilitado = 
    caja.carrito.length === 0 || 
    !isOrdenCubierta || 
    caja.procesando || 
    (hayVueltoReal && !caja.idMetodoVuelto);

  const metodosVueltoPermitidos = caja.metodosPagoBD?.filter(
    m => !m.nombre.toLowerCase().includes('punto') && 
         m.moneda !== 'USD' && 
         !m.nombre.toLowerCase().includes('dólares')
  ) || [];

  return (
    <div className="min-h-screen lg:h-screen bg-slate-100 flex flex-col font-sans text-slate-800 relative lg:overflow-hidden">
      
      <SmsNotificacion notificacion={caja.notificacion} />
      <ModalApertura caja={caja} />
      <ModalDetallesC
        show={caja.showModalDetallesCaja} 
        onClose={() => caja.setShowModalDetallesCaja(false)} 
        cajaSeleccionada={caja.cajaSeleccionada} 
        ordenesCaja={caja.ordenesCaja} 
        cargandoOrdenes={caja.cargandoOrdenes} 
      />
      {caja.modalAvanceAbierto && (
        <ModalAvanceEfectivo 
          idCaja={caja.cajaSeleccionada?.id_caja} 
          onClose={() => caja.setModalAvanceAbierto(false)}
          onExito={() => {
            caja.setModalAvanceAbierto(false); 
            caja.mostrarMensaje('💸 Avance de efectivo registrado con éxito'); 
          }}
        />
      )}
      
      <HeaderCaja caja={caja} />

      <main className="flex-1 p-2 md:p-3 flex flex-col lg:flex-row gap-3 max-w-[1600px] mx-auto w-full lg:overflow-hidden">
        
        {/* Catálogo Central */}
        <CatalogoProductos caja={caja} />
        
        {/* PANEL DERECHO */}
        <section className="w-full lg:w-[450px] shrink-0 bg-white p-2.5 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:h-full lg:overflow-hidden justify-between gap-2">
          
          {caja.notificacion?.show && (
            <div className={`p-1.5 rounded-xl border text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm shrink-0 ${
              caja.notificacion.tipo === 'error'
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              <span>{caja.notificacion.mensaje}</span>
            </div>
          )}

          {/* Ticket y Total */}
          <div className="shrink-0 flex flex-col gap-2">
            <CarritoTicket caja={caja} />
            <BalanceVuelto caja={caja} />
          </div>

          {/* Zona de Métodos de Pago y Balance */}
          <div className="flex-1 min-h-0 bg-slate-50 rounded-2xl p-2 border border-slate-100 flex flex-col gap-2 shadow-inner">
            
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-2 custom-scrollbar">
              <ModuloPagos caja={caja} />
            </div>

            <div className="shrink-0 flex flex-col pt-2 border-t border-slate-200 gap-1.5">              
              
              {/* SELECTOR DE VUELTO (CON TAMAÑOS ORIGINALES) */}
              {hayVueltoReal && (
                <div className="pt-1 pb-1 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[9.5px] font-bold text-indigo-800 uppercase tracking-tight">
                      ¿Cómo se entregará el vuelto?
                    </span>
                    <span className="text-[7.5px] text-amber-700 font-extrabold bg-amber-100 px-1.5 py-0.5 rounded-sm">
                      Requerido
                    </span>
                  </div>
                  
                  <div className="flex gap-1.5 w-full">
                    {metodosVueltoPermitidos.map(m => (
                      <button
                        key={m.id_pago}
                        onClick={() => caja.setIdMetodoVuelto(m.id_pago)}
                        type="button"
                        className={`flex-1 py-1 px-1 text-[10px] font-bold rounded-lg transition-all text-center cursor-pointer active:scale-95 ${
                        caja.idMetodoVuelto == m.id_pago 
                          ? 'bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400'
                          : 'bg-white text-slate-700 border border-slate-300 shadow-sm hover:bg-slate-50 hover:border-indigo-400'
                        }`}
                      >
                        {m.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* BOTÓN PROCESAR ORDEN */}
              <button
                disabled={isBotonDeshabilitado}
                onClick={handleProcesarVenta}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:bg-slate-300 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {caja.procesando ? 'Procesando...' : '✅ Procesar Orden'}
              </button>
            </div>

          </div>

        </section>
      </main>
    </div>
  );
}