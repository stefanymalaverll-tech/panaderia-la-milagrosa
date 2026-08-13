export default function ModalEditarMateriaPrima({
  show, onClose, onSubmit, mpEditando, setMpEditando, monedaMPEdit, setMonedaMPEdit
}) {
  if (!show || !mpEditando) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-slate-800">✏️ Ajustar / Editar Materia Prima</h3>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">Nombre del Insumo</label>
            <input type="text" required value={mpEditando.nombre} onChange={e => setMpEditando({...mpEditando, nombre: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">Unidad de Medida</label>
              <select value={mpEditando.unidad} onChange={e => setMpEditando({...mpEditando, unidad: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1">
                <option value="kg">Kilogramos (kg)</option>
                <option value="gr">Gramos (gr)</option>
                <option value="lt">Litros (lt)</option>
                <option value="unidad">Unidades</option>
                <option value="sacos">Sacos</option>
              </select>
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-semibold text-slate-600">Costo</label>
                <div className="flex bg-slate-200 p-0.5 rounded-lg text-[10px] font-bold">
                  <button type="button" onClick={() => setMonedaMPEdit('BS')} className={`px-2 py-0.5 rounded-md ${monedaMPEdit === 'BS' ? 'bg-amber-500 text-white' : 'text-slate-600'}`}>Bs.</button>
                  <button type="button" onClick={() => setMonedaMPEdit('USD')} className={`px-2 py-0.5 rounded-md ${monedaMPEdit === 'USD' ? 'bg-amber-500 text-white' : 'text-slate-600'}`}>$</button>
                </div>
              </div>
              <input type="number" step="0.01" min="0" required value={mpEditando.costo} onChange={e => setMpEditando({...mpEditando, costo: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Stock Actual</label>
            <input type="number" step="0.001" min="0" required value={mpEditando.stock} onChange={e => setMpEditando({...mpEditando, stock: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1" />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl cursor-pointer">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
}