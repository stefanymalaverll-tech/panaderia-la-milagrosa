export default function ModalDetallesC({ show, onClose, cajaSeleccionada, ordenesCaja, cargandoOrdenes }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
          <div>
            <h3 className="text-lg font-bold text-slate-800">🧾 Desglose del Turno #{cajaSeleccionada?.id_caja}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer">✕</button>
        </div>

        <div className="p-6 overflow-y-auto bg-slate-100/50 flex-1">
          {cargandoOrdenes ? (
            <div className="text-center py-10 font-bold text-slate-500 animate-pulse">Cargando facturas...</div>
          ) : ordenesCaja.length === 0 ? (
            <div className="text-center py-10 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">No se registraron ventas en este turno.</div>
          ) : (
            <div className="space-y-4">
              {ordenesCaja.map((orden) => (
                <div key={orden.id_orden} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Ticket #{orden.num_ticket}</span>
                      <span className="text-xs text-slate-500 font-medium">
                        {new Date(orden.hora_orden.replace(' ', 'T')).toLocaleTimeString('es-VE', { 
                          timeZone: 'America/Caracas',
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-slate-800">${Number(orden.total_usd).toFixed(2)}</div>
                      <div className="text-[10px] font-bold text-slate-500">Bs. {Number(orden.total_bs).toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Productos</p>
                    <ul className="space-y-2">
                      {orden.detalle_orden?.map((detalle, idx) => (
                        <li key={idx} className="flex justify-between text-xs items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-bold">{Number(detalle.cantidad)}x</span>
                            <span className="font-medium text-slate-700">{detalle.producto?.icono_producto?.simbolo || '📦'} {detalle.producto?.nombre}</span>
                          </div>
                          <span className="text-slate-600 font-semibold">${Number(detalle.subtotal_usd).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-slate-100 bg-slate-50/50 -mx-4 px-4 pb-2 rounded-b-xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pagos registrados</p>
                    <ul className="space-y-1.5">
                      {orden.pago_orden?.map((pagoLinea, idx) => (
                        <li key={idx} className="flex justify-between text-[11px] items-center">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${pagoLinea.es_vuelto ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
                            <span className={`font-medium ${pagoLinea.es_vuelto ? 'text-red-600' : 'text-slate-600'}`}>{pagoLinea.pago?.nombre}{pagoLinea.es_vuelto && ' (Vuelto)'}</span>
                            {pagoLinea.numero_referencia && (<span className="text-slate-400">Ref: {pagoLinea.numero_referencia}</span>)}
                          </div>
                          <span className={`font-semibold ${pagoLinea.es_vuelto ? 'text-red-600' : 'text-slate-700'}`}>
                            {pagoLinea.pago?.moneda === 'Bs' ? `Bs. ${Number(pagoLinea.monto_bs).toFixed(2)}` : `$${Number(pagoLinea.monto_usd).toFixed(2)}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-white rounded-b-2xl flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all">Cerrar</button>
        </div>
      </div>
    </div>
  );
}