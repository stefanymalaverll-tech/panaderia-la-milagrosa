export default function InventarioView({
  productos, categorias, filtroCategoria, setFiltroCategoria,
  busquedaProducto, setBusquedaProducto, setShowModalProducto,
  setProdEditando, setMonedaPreciosEdit, setShowModalEditarProd,
  handleEliminarProducto
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-bold text-slate-800">🥖 Catálogo e Inventario de Productos</h2>
        <button onClick={() => setShowModalProducto(true)} className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm">
          + Nuevo Producto
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input type="text" placeholder="Buscar producto por nombre..." value={busquedaProducto} onChange={(e) => setBusquedaProducto(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
          <option value="todos">Todas las Categorías</option>
          {categorias.map(cat => (
            <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700 uppercase text-xs">
            <tr>
              <th className="p-3 rounded-l-lg">Producto</th>
              <th className="p-3">Inversión ($)</th>
              <th className="p-3">Detal ($)</th>
              <th className="p-3">Mayor ($)</th>
              <th className="p-3">Stock</th>
              <th className="p-3 rounded-r-lg">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {productos.map((prod) => (
              <tr key={prod.id_producto} className="hover:bg-slate-50">
                <td className="p-3 font-medium text-slate-800">
                  <span className="mr-2 text-lg">{prod.icono_producto?.simbolo || '📦'}</span>
                  {prod.nombre}
                </td>
                <td className="p-3 text-slate-600">${Number(prod.precio_inversion || 0).toFixed(2)}</td>
                <td className="p-3 text-slate-800">${Number(prod.precio_detal || 0).toFixed(2)}</td>
                <td className="p-3 text-slate-800">${Number(prod.precio_mayor || 0).toFixed(2)}</td>
                <td className={`p-3 font-bold ${Number(prod.stock) < 5 ? 'text-red-600' : 'text-amber-600'}`}>{prod.stock} unids.</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setProdEditando({ ...prod }); setMonedaPreciosEdit({ inversion: 'USD', detal: 'USD', mayor: 'USD' }); setShowModalEditarProd(true); }} className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 rounded-lg font-bold cursor-pointer transition-all">✏️ Ajustar</button>
                    <button onClick={() => handleEliminarProducto(prod.id_producto)} className="text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1 rounded-lg font-bold cursor-pointer transition-all">🗑️ Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}