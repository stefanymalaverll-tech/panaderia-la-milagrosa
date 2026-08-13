export default function CarritoTicket({ caja }) {
  const { numOrden, cancelarOrden, carrito, cambiarCantidad, eliminarDelCarrito, totalPagarBs, totalPagarUSD } = caja;

  return (
    <div>
      <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
        <div>
          <h2 className="text-xs font-black uppercase text-slate-800">Orden de Venta</h2>
          <p className="text-[10px] text-amber-800 font-mono font-bold">Ticket N° #{numOrden}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={cancelarOrden}
            disabled={carrito.length === 0}
            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-[10px] font-bold rounded-xl transition-all cursor-pointer disabled:opacity-30"
          >
            🚫 Cancelar
          </button>
          <span className="text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-xl border border-slate-200">
            {carrito.length} Ítems
          </span>
        </div>
      </div>

      {/* CARRITO */}
      <div className="space-y-2 max-h-[220px] md:max-h-[260px] overflow-y-auto pr-1">
        {carrito.length === 0 ? (
          <div className="text-center py-8 md:py-12 text-slate-400 text-xs italic">
            Haz clic en los productos para agregarlos al ticket.
          </div>
        ) : (
          carrito.map((item) => {
            const subtotalUSD = item.precioUSD * item.cantidad;
            const subtotalBs = item.precioBs * item.cantidad;
            return (
              <div key={item.id_producto} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 truncate">{item.nombre}</p>
                  <p className="text-[10px] text-slate-600 font-bold">
                    Bs. {(item.precioBs).toFixed(2)} <span className="text-slate-500 font-semibold">(${item.precioUSD.toFixed(2)})</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <input
                    id="cambiocant"
                    name="cambio_cantidad"
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={item.cantidad}
                    onChange={(e) => cambiarCantidad(item.id_producto, e.target.value)}
                    className="w-12 md:w-14 text-center py-1 font-bold text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-900"
                  />
                  <div className="text-right w-20 md:w-24">
                    <p className="font-extrabold text-slate-900 truncate">Bs. {subtotalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</p>
                    <p className="text-[10px] text-slate-600 font-bold">${subtotalUSD.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => eliminarDelCarrito(item.id_producto)}
                    className="text-red-500 hover:text-red-700 font-bold px-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* TOTAL REGISTRADO EN BS */}
      <div className="mt-3 bg-slate-900 text-white p-3 md:p-3.5 rounded-2xl flex justify-between items-center shadow-xs">
        <div>
          <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">TOTAL REGISTRADO</p>
          <p className="text-lg md:text-xl font-black text-amber-400">
            Bs. {totalPagarBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-300 font-semibold">Ref. Dólares ($)</p>
          <p className="text-xs md:text-sm font-bold text-white">${totalPagarUSD.toFixed(2)} USD</p>
        </div>
      </div>
    </div>
  );
}