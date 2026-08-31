export default function DashboardView({ 
  stats, 
  productosStockBajo, 
  productosMasVendidos, 
  onVerFacturasClick,
  filtroMasVendidos,
  setFiltroMasVendidos 
}) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ventas Totales del Día</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">${stats.ventasHoy.toFixed(2)}</h3>
          </div>
          <div className="bg-amber-100 p-3 rounded-xl text-2xl">💰</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Volumen de Facturas</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{stats.totalFacturas}</h3>
          </div>
          <button 
            onClick={onVerFacturasClick}
            title="Ver las Facturas de Hoy"
            className="bg-amber-100 hover:bg-amber-200 p-3 rounded-xl text-2xl transition-all cursor-pointer shadow-sm hover:shadow active:scale-95 flex items-center justify-center"
          >
            📄
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Stock Bajo Alerta</p>
            <h3 className="text-2xl font-extrabold text-red-600 mt-1">{stats.productosBajoStock}</h3>
          </div>
          <div className="bg-red-50 p-3 rounded-xl text-2xl">⚠️</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>⚠️</span> Productos con Stock Bajo
          </h2>
          {productosStockBajo.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No hay productos con stock crítico.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-700 uppercase text-xs">
                  <tr>
                    <th className="p-3 rounded-l-lg">Producto</th>
                    <th className="p-3">Stock Actual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productosStockBajo.map((prod) => (
                    <tr key={prod.id_producto} className="hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-800">
                        <span className="mr-2">{prod.icono_producto?.simbolo || '📦'}</span>
                        {prod.nombre}
                      </td>
                      <td className="p-3 text-red-600 font-bold">{prod.stock} unids.</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tarjeta de Productos Más Vendidos con Pestañas de Filtro */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span>🔥</span> Productos Más Vendidos
            </h2>
            
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
              <button
                onClick={() => setFiltroMasVendidos('turno')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filtroMasVendidos === 'turno'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Turno Activo
              </button>
              <button
                onClick={() => setFiltroMasVendidos('general')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filtroMasVendidos === 'general'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                General
              </button>
            </div>
          </div>

          {productosMasVendidos.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">
              {filtroMasVendidos === 'turno' 
                ? 'No hay ventas registradas.' 
                : 'No hay registros de ventas suficientes.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-700 uppercase text-xs">
                  <tr>
                    <th className="p-3 rounded-l-lg">Producto</th>
                    <th className="p-3 rounded-r-lg text-right">Cantidad Vendida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productosMasVendidos.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-800">
                        <span className="mr-2 text-lg">{prod.simbolo}</span>
                        {prod.nombre}
                      </td>
                      <td className="p-3 text-right font-bold text-amber-600">
                        {Number(prod.totalCantidad || 0).toFixed(0)} unids.
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}