import { useState } from 'react';
import { verificarEsPanaderia } from '@/lib/utils';

const getPrecios = (precioUSD, precioBs, monedaBase, valorTasa) => {
  const esBaseBs = monedaBase === 'Bs' || monedaBase === 'BS';
  if (esBaseBs && Number(precioBs) > 0) {
    return {
      principal: `Bs. ${Number(precioBs).toFixed(2)}`,
      secundario: `$ ${(Number(precioBs) / valorTasa).toFixed(2)}`
    };
  } else {
    const usd = Number(precioUSD || 0);
    return {
      principal: `Bs. ${(usd * valorTasa).toFixed(2)}`,
      secundario: `$ ${usd.toFixed(2)}`
    };
  }
};

export default function InventarioView({
  productos, categorias, filtroCategoria, setFiltroCategoria,
  busquedaProducto, setBusquedaProducto, setShowModalProducto,
  setProdEditando, setMonedaPreciosEdit, setShowModalEditarProd,
  handleArchivarProducto, tasa
}) {
  const [menuAbierto, setMenuAbierto] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('activos'); // 'activos' | 'archivados' | 'todos'

  const toggleMenu = (id) => {
    setMenuAbierto(prev => (prev === id ? null : id));
  };

  const valorTasa = Number(tasa) || 1;

  // Filtrar productos según el Estado, Categoría y Búsqueda de Texto
  const productosFiltradosVista = productos.filter(p => {
    const esActivo = p.activo !== false && p.activo !== 0;
    let cumpleEstado = true;
    if (filtroEstado === 'activos') cumpleEstado = esActivo;
    if (filtroEstado === 'archivados') cumpleEstado = !esActivo;

    const cumpleCategoria = filtroCategoria === 'todos' || String(p.id_categoria) === String(filtroCategoria);
    const cumpleBusqueda = p.nombre.toLowerCase().includes((busquedaProducto || '').toLowerCase());

    return cumpleEstado && cumpleCategoria && cumpleBusqueda;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">🥖 Catálogo e Inventario de Productos</h2>
          {filtroEstado !== 'activos' && (
            <p className="text-xs text-blue-600 font-medium mt-0.5">
              ⚠️ Productos Archivados (fuera de Ventas)
            </p>
          )}
        </div>

        <button 
          onClick={() => setShowModalProducto(true)} 
          className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
        >
          + Nuevo Producto
        </button>
      </div>

      {/* 🔍 Controles de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input 
          type="text" 
          placeholder="Buscar producto por nombre..." 
          value={busquedaProducto} 
          onChange={(e) => setBusquedaProducto(e.target.value)} 
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" 
        />
        
        <select 
          value={filtroEstado} 
          onChange={(e) => setFiltroEstado(e.target.value)} 
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-slate-700"
        >
          <option value="activos">Estado: Activos</option>
          <option value="archivados">Estado: Archivados</option>
          <option value="todos">Estado: Todos</option>
        </select>

        <select 
          value={filtroCategoria} 
          onChange={(e) => setFiltroCategoria(e.target.value)} 
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="todos">Todas las Categorías</option>
          {categorias.map(cat => (
            <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto pb-24">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700 uppercase text-xs">
            <tr>
              <th className="p-3 w-12 rounded-l-lg text-center"></th> 
              <th className="p-3">Producto</th>
              <th className="p-3">Inversión</th>
              <th className="p-3">Detal</th>
              <th className="p-3">Mayor</th>
              <th className="p-3 rounded-r-lg">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {productosFiltradosVista.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400 text-xs font-medium">
                  No se encontraron productos con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              productosFiltradosVista.map((prod) => {
                const inv = getPrecios(prod.precio_inversion, 0, prod.moneda_base, valorTasa);
                const detal = getPrecios(prod.precio_detal, prod.precio_detal_bs, prod.moneda_base, valorTasa);
                const mayor = getPrecios(prod.precio_mayor, prod.precio_mayor_bs, prod.moneda_base, valorTasa);
                const esActivo = prod.activo !== false && prod.activo !== 0;

                // Detectar si es Panadería
                const catObj = categorias.find(c => Number(c.id_categoria) === Number(prod.id_categoria));
                const nombreCat = (catObj?.nombre || '').toLowerCase();
                const esPanaderia = verificarEsPanaderia(nombreCat);
                return (
                  <tr key={prod.id_producto} className={`hover:bg-slate-50 transition-colors ${!esActivo ? 'bg-slate-50/50' : ''}`}>
                    <td className="p-3 text-center">
                      <div className="relative inline-block text-left">
                        <button 
                          onClick={() => toggleMenu(prod.id_producto)}
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-all cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                          </svg>
                        </button>

                        {menuAbierto === prod.id_producto && (
                          <div className="absolute left-0 top-full mt-1 z-50 w-36 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
                            <button 
                              onClick={() => { 
                                setMenuAbierto(null);
                                const esBs = prod.moneda_base === 'Bs' || prod.moneda_base === 'BS';
                                setProdEditando({ 
                                  ...prod,
                                  precio_detal: esBs ? (prod.precio_detal_bs || prod.precio_detal) : prod.precio_detal,
                                  precio_mayor: esBs ? (prod.precio_mayor_bs || prod.precio_mayor) : prod.precio_mayor
                                }); 
                                setMonedaPreciosEdit({ 
                                  inversion: 'USD', 
                                  detal: esBs ? 'BS' : 'USD', 
                                  mayor: esBs ? 'BS' : 'USD' 
                                }); 
                                setShowModalEditarProd(true); 
                              }} 
                              className="text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-amber-600 transition-colors cursor-pointer"
                            >
                              ✏️ Editar
                            </button>
                            
                            <div className="border-t border-slate-100"></div>

                            <button 
                              onClick={() => { 
                                setMenuAbierto(null);
                                handleArchivarProducto(prod.id_producto, prod.activo); 
                              }} 
                              className={`text-left px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                                esActivo ? 'text-slate-700 hover:bg-slate-50 hover:text-red-600' : 'text-blue-600 hover:bg-blue-50'
                              }`}
                            >
                              {esActivo ? '📁 Archivar' : '📂 Restaurar'}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-3 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg ${!esActivo ? 'opacity-50' : ''}`}>{prod.icono_producto?.simbolo || '📦'}</span>
                        <span className={!esActivo ? 'line-through text-slate-400' : ''}>
                          {prod.nombre}
                        </span>
                        {!esActivo && (
                          <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Archivado
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="p-3">
                      <div className={`font-semibold ${!esActivo ? 'text-slate-400' : 'text-slate-800'}`}>{inv.principal}</div>
                      <div className="text-xs text-slate-400">{inv.secundario}</div>
                    </td>
                    
                    <td className="p-3">
                      <div className={`font-semibold ${!esActivo ? 'text-slate-400' : 'text-slate-800'}`}>{detal.principal}</div>
                      <div className="text-xs text-slate-400">{detal.secundario}</div>
                    </td>
                    
                    <td className="p-3">
                      <div className={`font-semibold ${!esActivo ? 'text-slate-400' : 'text-slate-800'}`}>{mayor.principal}</div>
                      <div className="text-xs text-slate-400">{mayor.secundario}</div>
                    </td>
                    
                    <td className={`p-3 font-bold ${esPanaderia ? 'text-slate-400 text-xs italic font-normal' : Number(prod.stock) < 5 ? (!esActivo ? 'text-red-400' : 'text-red-600') : (!esActivo ? 'text-amber-400' : 'text-amber-600')}`}>
                      {esPanaderia ? 'No aplica' : `${prod.stock} unids.`}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}