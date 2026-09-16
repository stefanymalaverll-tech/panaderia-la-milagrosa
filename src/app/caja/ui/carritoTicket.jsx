export default function CarritoTicket({ caja }) {
  const { numOrden, cancelarOrden, carrito, cambiarCantidad, eliminarDelCarrito, totalPagarBs, totalPagarUSD } = caja;

  const totalArticulos = carrito.reduce((total, item) => total + Number(item.cantidad), 0);

  const sumarCantidad = (id, cantidadActual) => {
    cambiarCantidad(id, Number(cantidadActual) + 1);
  };

  const restarCantidad = (id, cantidadActual) => {
    const nuevaCantidad = Number(cantidadActual) - 1;
    if (nuevaCantidad >= 0.01) {
      cambiarCantidad(id, nuevaCantidad);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 shrink-0 bg-white">
      {/* Cabecera del Ticket */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-1.5 shrink-0">
        <div>
          <h2 className="text-[11px] font-black uppercase text-slate-800 tracking-tight">Orden de Venta</h2>
          <p className="text-[9px] text-amber-600 font-bold">Ticket N° #{numOrden}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
            {totalArticulos} Productos
          </span>
          <button
            onClick={cancelarOrden}
            disabled={carrito.length === 0}
            className="px-2 py-0.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-[9px] font-bold rounded transition-all cursor-pointer disabled:opacity-40"
          >
            🚫 Cancelar
          </button>
        </div>
      </div>

      <div className="h-[120px] overflow-y-auto pr-1 custom-scrollbar">
        {carrito.length === 0 ? (
          <div className="h-full text-center flex flex-col items-center justify-center">
            <span className="text-lg mb-0.5 opacity-40">🛒</span>
            <p className="text-slate-500 text-[11px] font-medium">Ticket vacío</p>
            <p className="text-slate-400 text-[10px]">Haz clic en el producto para agregarlo al ticket</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {carrito.map((item) => {
              const subtotalUSD = item.precioUSD * item.cantidad;
              const subtotalBs = item.precioBs * item.cantidad;
              return (
                <div 
                  key={item.id_producto} 
                  className="flex items-center justify-between py-1.5 px-1 border-b border-slate-100 hover:bg-slate-50 transition-colors gap-2 group"
                >
                  {/* Nombre */}
                  <div className="flex-1 min-w-0 pr-1">
                    <p className="font-bold text-slate-800 text-[11px] truncate leading-tight" title={item.nombre}>
                      {item.nombre}
                    </p>
                  </div>

                  {/* Controles (- [num] +) */}
                  <div className="flex items-center bg-slate-100 rounded border border-slate-200 h-6 shrink-0 overflow-hidden">
                    <button
                      onClick={() => restarCantidad(item.id_producto, item.cantidad)}
                      className="w-5 h-full flex items-center justify-center text-slate-600 hover:bg-slate-200 font-bold text-xs select-none cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      step="0.01" 
                      min="0.01"
                      value={item.cantidad}
                      onChange={(e) => cambiarCantidad(item.id_producto, e.target.value)}
                      className="w-8 h-full text-center text-[11px] font-bold bg-white text-slate-800 outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none border-x border-slate-200"
                    />
                    <button
                      onClick={() => sumarCantidad(item.id_producto, item.cantidad)}
                      className="w-5 h-full flex items-center justify-center text-slate-600 hover:bg-slate-200 font-bold text-xs select-none cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal (Aumentado el ancho de w-20 a w-28 para que no ruede los controles) */}
                  <div className="text-right shrink-0 w-28 pl-1">
                    <p className="font-black text-slate-900 text-[11px] leading-tight">
                      Bs. {subtotalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight">
                      ${subtotalUSD.toFixed(2)}
                    </p>
                  </div>

                  {/* Eliminar */}
                  <button
                    onClick={() => eliminarDelCarrito(item.id_producto)}
                    className="text-slate-300 hover:text-red-500 font-bold text-xs px-1 transition-colors opacity-60 group-hover:opacity-100 cursor-pointer shrink-0"
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Total a Pagar estilo Recibo Organizado */}
      <div className="bg-amber-50/70 border-t-2 border-dashed border-amber-300/80 p-2.5 rounded-b-2xl flex justify-between items-center shrink-0 mt-1">
        <div className="flex-1">
          <p className="text-[10px] text-amber-800 font-black uppercase tracking-wider">Total a Pagar</p>
        </div>
        <div className="text-right flex flex-col items-end">
          <p className="text-[16px] font-black tracking-tight text-slate-900 leading-none mb-1">
            Bs. {totalPagarBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] font-bold text-amber-700 leading-none">
            Ref. ${totalPagarUSD.toFixed(2)} USD
          </p>
        </div>
      </div>
    </div>
  );
}