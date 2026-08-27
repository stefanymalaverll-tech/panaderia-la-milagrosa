export default function CatalogoProductos({ caja }) {
  const {
    tipoPrecio, setTipoPrecio,
    busqueda, setBusqueda,
    categoriasBD, categoriaSeleccionada, setCategoriaSeleccionada,
    productos, tasaBCV, agregarAlCarrito
  } = caja;

  return (
    <section className="w-full lg:flex-1 bg-white p-3 md:p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-3">
      
      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
        <span className="text-xs md:text-sm font-black text-slate-800 uppercase">📦 Catálogo</span>
        <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 text-[11px] font-bold">
          <button onClick={() => setTipoPrecio('detal')} className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${tipoPrecio === 'detal' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>Detal</button>
          <button onClick={() => setTipoPrecio('mayor')} className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${tipoPrecio === 'mayor' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>Al Mayor</button>
        </div>
      </div>

      <input id="buscar-producto" name="buscarProducto" type="text" placeholder="🔍 Buscar producto..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full px-3 py-2.5 rounded-2xl border border-slate-300 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-slate-800 placeholder:text-slate-400" />

      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        {categoriasBD.map((cat) => (
          <button key={cat} onClick={() => setCategoriaSeleccionada(cat)} className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${categoriaSeleccionada === cat ? 'bg-slate-900 text-amber-400' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2.5 md:gap-3 overflow-y-auto max-h-[50vh] lg:max-h-[calc(100vh-250px)] pr-1">
        {productos
          .filter(p => 
            p.activo &&
            (categoriaSeleccionada === 'Todas' || p.categoria?.nombre === categoriaSeleccionada) &&
            p.nombre.toLowerCase().includes(busqueda.toLowerCase())
          )
          .map((prod) => {
            let precioMostrarUSD, precioMostrarBs;
            if (prod.moneda_base === 'Bs') {
              precioMostrarBs = tipoPrecio === 'detal' ? Number(prod.precio_detal_bs || 0) : Number(prod.precio_mayor_bs || 0);
              precioMostrarUSD = precioMostrarBs / tasaBCV;
            } else {
              precioMostrarUSD = tipoPrecio === 'detal' ? Number(prod.precio_detal || 0) : Number(prod.precio_mayor || 0);
              precioMostrarBs = precioMostrarUSD * tasaBCV;
            }

            const itemEnCarrito = caja.carrito.find(item => item.id_producto === prod.id_producto);
            const cantidadEnCarrito = itemEnCarrito ? Number(itemEnCarrito.cantidad) : 0;
            const stockRestante = Number((Number(prod.stock) - cantidadEnCarrito).toFixed(2)); 
            const sinStock = stockRestante <= 0;

            return (
              <button
                key={prod.id_producto}
                onClick={() => {
                  if (!sinStock) agregarAlCarrito(prod);
                }}
                disabled={sinStock}
                // Si no hay stock, opacamos el botón y evitamos clicks
                className={`border bg-slate-50 rounded-2xl text-left flex flex-col justify-between p-2.5 md:p-3 transition-all ${
                  sinStock 
                    ? 'opacity-40 border-slate-200 cursor-not-allowed grayscale' 
                    : 'border-slate-200 hover:bg-amber-50/40 hover:border-amber-400 hover:shadow-md cursor-pointer group active:scale-95'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xl md:text-2xl bg-white p-1.5 rounded-xl border border-slate-200/80">
                      {prod.icono_producto?.simbolo || '📦'}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-lg border transition-colors ${
                      stockRestante <= 5 
                        ? 'bg-red-50 text-red-700 border-red-200' 
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {sinStock ? 'Agotado' : `Stock: ${stockRestante}`}
                    </span>
                  </div>
                  <h3 className={`font-bold text-xs leading-snug line-clamp-2 ${sinStock ? 'text-slate-600' : 'text-slate-900 group-hover:text-amber-700'}`}>
                    {prod.nombre}
                  </h3>
                </div>

                <div className="mt-3 flex justify-between items-end border-t border-slate-200 pt-2">
                  <span className="text-[10px] text-slate-500 font-bold capitalize">{tipoPrecio}</span>
                  <div className="text-right">
                    <p className="text-xs font-black text-amber-800">Bs. {precioMostrarBs.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-600 font-extrabold">${precioMostrarUSD.toFixed(2)}</p>
                  </div>
                </div>
              </button>
            );
          })}
      </div>
    </section>
  );
}