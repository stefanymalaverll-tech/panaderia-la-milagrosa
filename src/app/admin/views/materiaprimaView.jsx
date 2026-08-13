export default function MateriaPrimaView({ materiaPrima, setShowModalMP, setMpEditando, setMonedaMPEdit, setShowModalEditarMP }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">🌾 Gestión de Materia Prima e Insumos</h2>
          <p className="text-xs text-slate-500 mt-1">Control de existencias para procesos de producción.</p>
        </div>
        <button onClick={() => setShowModalMP(true)} className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm">
          + Nueva Materia Prima
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700 uppercase text-xs">
            <tr>
              <th className="p-3 rounded-l-lg">Insumo</th>
              <th className="p-3">Unidad de Medida</th>
              <th className="p-3">Costo Unitario ($)</th>
              <th className="p-3">Stock Disponible</th>
              <th className="p-3 rounded-r-lg">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {materiaPrima.map((mp) => (
              <tr key={mp.id_materiaprima} className="hover:bg-slate-50">
                <td className="p-3 font-medium text-slate-800">{mp.nombre}</td>
                <td className="p-3 text-slate-600 uppercase text-xs font-semibold">{mp.unidad}</td>
                <td className="p-3 text-slate-800">${Number(mp.costo || 0).toFixed(2)}</td>
                <td className="p-3 font-bold text-amber-600">{mp.stock}</td>
                <td className="p-3">
                  <button onClick={() => { setMpEditando({ ...mp }); setMonedaMPEdit('USD'); setShowModalEditarMP(true); }} className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 rounded-lg font-bold cursor-pointer transition-all">✏️ Ajustar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}