export default function ModalTasaBCV({ show, onClose, onSubmit, nuevaTasaInput, setNuevaTasaInput }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-xs w-full p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-slate-800">💵 Actualizar Tasa BCV</h3>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">Nueva Tasa Oficial (Bs.)</label>
            <input type="number" step="0.01" min="0" required value={nuevaTasaInput} onChange={e => setNuevaTasaInput(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-base font-bold mt-1" />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={onClose} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">Cancelar</button>
            <button type="submit" className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl cursor-pointer">Actualizar Tasa</button>
          </div>
        </form>
      </div>
    </div>
  );
}