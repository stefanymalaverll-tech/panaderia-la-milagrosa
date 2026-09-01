import { useState, useMemo } from 'react';

export default function MateriaPrimaView({ 
  materiaPrima = [], 
  setShowModalMP, 
  setMpEditando, 
  setMonedaMPEdit, 
  setShowModalEditarMP,
  handleArchivarMateriaPrima,
  tasa = 1
}) {
  const [menuAbierto, setMenuAbierto] = useState(null);
  const [busquedaMP, setBusquedaMP] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('activos'); // 'activos' | 'archivados' | 'todos'

  const toggleMenu = (id) => {
    setMenuAbierto(prev => (prev === id ? null : id));
  };

  const valorTasa = Number(tasa) || 1;

  const metricas = useMemo(() => {
    let totalUSD = 0;
    let totalBs = 0;
    let stockCritico = 0;

    materiaPrima.forEach(mp => {
      if (mp.activo === false || mp.activo === 0) return;

      if (mp.stock < 5) stockCritico += 1;

      const esBs = mp.moneda_base === 'Bs' || mp.moneda_base === 'BS';
      const stock = Number(mp.stock) || 0;
      
      if (esBs) {
        const costoEnBs = Number(mp.costo_bs || mp.costo);
        totalBs += (costoEnBs * stock);
        totalUSD += ((costoEnBs / valorTasa) * stock);
      } else {
        const costoEnUsd = Number(mp.costo);
        totalUSD += (costoEnUsd * stock);
        totalBs += ((costoEnUsd * valorTasa) * stock);
      }
    });

    return { totalUSD, totalBs, stockCritico };
  }, [materiaPrima, valorTasa]);

  const getCostoPrecios = (costoUSD, costoBs, monedaBase, valorTasa) => {
    const esBaseBs = monedaBase === 'Bs' || monedaBase === 'BS';
    if (esBaseBs && Number(costoBs) > 0) {
      return {
        principal: `Bs. ${Number(costoBs).toFixed(2)}`,
        secundario: `$ ${(Number(costoBs) / valorTasa).toFixed(2)}`
      };
    } else {
      const usd = Number(costoUSD || 0);
      return {
        principal: `Bs. ${(usd * valorTasa).toFixed(2)}`,
        secundario: `$ ${usd.toFixed(2)}`
      };
    }
  };

  // Filtrar materia prima según Estado y Búsqueda de Texto
  const materiaPrimaFiltrada = materiaPrima.filter(mp => {
    const esActivo = mp.activo !== false && mp.activo !== 0;
    let cumpleEstado = true;
    if (filtroEstado === 'activos') cumpleEstado = esActivo;
    if (filtroEstado === 'archivados') cumpleEstado = !esActivo;

    const cumpleBusqueda = mp.nombre.toLowerCase().includes((busquedaMP || '').toLowerCase());

    return cumpleEstado && cumpleBusqueda;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Capital Invertido (USD)</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">USD {metricas.totalUSD.toFixed(2)}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Capital Invertido (Bs)</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">Bs. {metricas.totalBs.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
          <p className="text-xs text-red-500 font-semibold uppercase tracking-wider">Insumos Críticos</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{metricas.stockCritico} ítems</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">🌾 Gestión de Materia Prima e Insumos</h2>
          <p className="text-xs text-slate-500 mt-1">Control de existencias para procesos de producción.</p>
          {filtroEstado !== 'activos' && (
            <p className="text-xs text-blue-600 font-medium mt-0.5">
              ⚠️ Insumos Archivados (fuera de procesos activos)
            </p>
          )}
        </div>
        <button 
          onClick={() => setShowModalMP(true)} 
          className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
        >
          + Nueva Materia Prima
        </button>
      </div>

      {/* 🔍 Controles de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input 
          type="text" 
          placeholder="Buscar insumo por nombre..." 
          value={busquedaMP} 
          onChange={(e) => setBusquedaMP(e.target.value)} 
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
      </div>

      <div className="overflow-x-auto pb-24">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700 uppercase text-xs">
            <tr>
              <th className="p-3 w-12 rounded-l-lg text-center"></th> 
              <th className="p-3">Insumo</th>
              <th className="p-3">Unidad de Medida</th>
              <th className="p-3">Costo Unitario</th>
              <th className="p-3 rounded-r-lg">Stock Disponible</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {materiaPrimaFiltrada.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-slate-400 text-xs font-medium">
                  No se encontraron insumos con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              materiaPrimaFiltrada.map((mp) => {
                const costoInfo = getCostoPrecios(mp.costo, mp.costo_bs, mp.moneda_base, valorTasa);
                const esActivo = mp.activo !== false && mp.activo !== 0;

                return (
                  <tr key={mp.id_materiaprima} className={`hover:bg-slate-50 transition-colors ${!esActivo ? 'bg-slate-50/50' : ''}`}>
                    <td className="p-3 text-center">
                      <div className="relative inline-block text-left">
                        <button 
                          onClick={() => toggleMenu(mp.id_materiaprima)}
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-all cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                          </svg>
                        </button>

                        {menuAbierto === mp.id_materiaprima && (
                          <div className="absolute left-0 top-full mt-1 z-50 w-36 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
                            <button 
                              onClick={() => { 
                                setMenuAbierto(null);
                                const esBs = mp.moneda_base === 'Bs' || mp.moneda_base === 'BS';
                                setMpEditando({ 
                                  ...mp,
                                  costo: esBs ? (mp.costo_bs || mp.costo) : mp.costo
                                }); 
                                setMonedaMPEdit(esBs ? 'BS' : 'USD'); 
                                setShowModalEditarMP(true); 
                              }} 
                              className="text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-amber-600 transition-colors cursor-pointer"
                            >
                              ✏️ Ajustar
                            </button>
                            
                            {handleArchivarMateriaPrima && (
                              <>
                                <div className="border-t border-slate-100"></div>
                                <button 
                                  onClick={() => { 
                                    setMenuAbierto(null);
                                    handleArchivarMateriaPrima(mp.id_materiaprima, mp.activo); 
                                  }} 
                                  className={`text-left px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                                    esActivo ? 'text-slate-700 hover:bg-slate-50 hover:text-red-600' : 'text-blue-600 hover:bg-blue-50'
                                  }`}
                                >
                                  {esActivo ? '📁 Archivar' : '📂 Restaurar'}
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-3 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <span className={!esActivo ? 'line-through text-slate-400' : ''}>
                          {mp.nombre}
                        </span>
                        {!esActivo && (
                          <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Archivado
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3 text-slate-600 uppercase text-xs font-semibold">{mp.unidad}</td>
                    
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className={`font-semibold ${!esActivo ? 'text-slate-400' : 'text-slate-800'}`}>
                            {costoInfo.principal}
                          </div>
                          <div className="text-xs text-slate-400">
                            {costoInfo.secundario}
                          </div>
                        </div>
                        {mp.huboAumento && (
                          <span title="El costo subió desde la última compra" className="text-red-500 text-xs bg-red-50 p-1 rounded-full">
                            📈
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className={`p-3 font-bold ${!esActivo ? 'text-slate-400' : 'text-amber-600'}`}>
                      {mp.stock}
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