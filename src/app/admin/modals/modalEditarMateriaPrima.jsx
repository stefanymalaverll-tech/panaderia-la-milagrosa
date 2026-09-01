export default function ModalEditarMateriaPrima({
  show, onClose, onSubmit, mpEditando, setMpEditando, monedaMPEdit, setMonedaMPEdit, tasa
}) {
  if (!show || !mpEditando) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-slate-800">✏️ Ajustar / Editar Materia Prima</h3>
        <form onSubmit={onSubmit} className="space-y-3">
          
          <div>
            <label className="text-xs font-semibold text-slate-600">Nombre del Insumo</label>
            <input 
              type="text" required 
              value={mpEditando.nombre || ''} 
              onChange={e => setMpEditando({...mpEditando, nombre: e.target.value})} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">Unidad de Medida</label>
              <select 
                value={mpEditando.unidad} 
                onChange={e => setMpEditando({...mpEditando, unidad: e.target.value})} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="kg">Kilogramos (kg)</option>
                <option value="gr">Gramos (gr)</option>
                <option value="lt">Litros (lt)</option>
                <option value="unidad">Unidades</option>
                <option value="sacos">Sacos</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-600">Costo</label>
                <div className="flex bg-slate-200 p-0.5 rounded-lg text-[10px] font-bold">
                  <button 
                    type="button" 
                    onClick={() => setMonedaMPEdit('BS')} 
                    className={`px-2 py-0.5 rounded-md transition-colors ${monedaMPEdit === 'BS' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-300'}`}
                  >
                    Bs.
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setMonedaMPEdit('USD')} 
                    className={`px-2 py-0.5 rounded-md transition-colors ${monedaMPEdit === 'USD' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-300'}`}
                  >
                    $
                  </button>
                </div>
              </div>
              <div className="relative mt-1">
                <input 
                  type="number" step="0.01" min="0" max="999999.99" placeholder="0.00" required 
                  value={mpEditando.costo ?? ''} 
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '') return setMpEditando({...mpEditando, costo: ''});
                    const num = parseFloat(val);
                    if (!isNaN(num) && !val.toLowerCase().includes('e') && num <= 999999.99) {
                      setMpEditando({...mpEditando, costo: val});
                    }
                  }} 
                  onKeyDown={e => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-500" 
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                  {monedaMPEdit === 'BS' ? 'Bs.' : '$'}
                </span>
              </div>
              {/* Debajo del input de costo en el Modal */}
              <div className="mt-2 text-right">
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                  Equivale a: {monedaMPEdit === 'BS' 
                    ? `USD ${(Number(mpEditando.costo || 0) / tasa).toFixed(2)}` 
                    : `Bs. ${(Number(mpEditando.costo || 0) * tasa).toFixed(2)}`}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Stock Actual</label>
            <input 
              type="number" step="0.001" min="0" max="999999.999" placeholder="0.000" required 
              value={mpEditando.stock ?? ''} 
              onChange={e => {
                const val = e.target.value;
                if (val === '') return setMpEditando({...mpEditando, stock: ''});
                const num = parseFloat(val);
                if (!isNaN(num) && !val.toLowerCase().includes('e') && num <= 999999.999) {
                  setMpEditando({...mpEditando, stock: val});
                }
              }} 
              onKeyDown={e => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-center mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500" 
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold py-2.5 rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}