export default function ModalEditarProducto({
  show, onClose, onSubmit, prodEditando, setProdEditando, categorias, iconosDisponibles, monedaPreciosEdit, setMonedaPreciosEdit
}) {
  if (!show || !prodEditando) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-slate-800">✏️ Ajustar / Editar Producto</h3>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">Nombre del Producto</label>
            <input type="text" required value={prodEditando.nombre} onChange={e => setProdEditando({...prodEditando, nombre: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">Categoría</label>
              <select value={prodEditando.id_categoria} onChange={e => setProdEditando({...prodEditando, id_categoria: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1">
                {categorias.map(cat => (<option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Ícono</label>
              <select value={prodEditando.id_icono} onChange={e => setProdEditando({...prodEditando, id_icono: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-base mt-1 text-center">
                {iconosDisponibles.map((ico) => (<option key={ico.id_icono} value={ico.id_icono}>{ico.simbolo}</option>))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-semibold text-slate-600">Precio Inversión</label>
              <div className="flex bg-slate-200 p-0.5 rounded-lg text-[10px] font-bold">
                <button type="button" onClick={() => setMonedaPreciosEdit({...monedaPreciosEdit, inversion: 'BS'})} className={`px-2 py-0.5 rounded-md ${monedaPreciosEdit.inversion === 'BS' ? 'bg-amber-500 text-white' : 'text-slate-600'}`}>Bs.</button>
                <button type="button" onClick={() => setMonedaPreciosEdit({...monedaPreciosEdit, inversion: 'USD'})} className={`px-2 py-0.5 rounded-md ${monedaPreciosEdit.inversion === 'USD' ? 'bg-amber-500 text-white' : 'text-slate-600'}`}>$</button>
              </div>
            </div>
            <input type="number" step="0.01" min="0" required value={prodEditando.precio_inversion} onChange={e => setProdEditando({...prodEditando, precio_inversion: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1" />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-semibold text-slate-600">Precio Detal</label>
              <div className="flex bg-slate-200 p-0.5 rounded-lg text-[10px] font-bold">
                <button type="button" onClick={() => setMonedaPreciosEdit({...monedaPreciosEdit, detal: 'BS'})} className={`px-2 py-0.5 rounded-md ${monedaPreciosEdit.detal === 'BS' ? 'bg-amber-500 text-white' : 'text-slate-600'}`}>Bs.</button>
                <button type="button" onClick={() => setMonedaPreciosEdit({...monedaPreciosEdit, detal: 'USD'})} className={`px-2 py-0.5 rounded-md ${monedaPreciosEdit.detal === 'USD' ? 'bg-amber-500 text-white' : 'text-slate-600'}`}>$</button>
              </div>
            </div>
            <input type="number" step="0.01" min="0" required value={prodEditando.precio_detal} onChange={e => setProdEditando({...prodEditando, precio_detal: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1" />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-semibold text-slate-600">Precio Mayor</label>
              <div className="flex bg-slate-200 p-0.5 rounded-lg text-[10px] font-bold">
                <button type="button" onClick={() => setMonedaPreciosEdit({...monedaPreciosEdit, mayor: 'BS'})} className={`px-2 py-0.5 rounded-md ${monedaPreciosEdit.mayor === 'BS' ? 'bg-amber-500 text-white' : 'text-slate-600'}`}>Bs.</button>
                <button type="button" onClick={() => setMonedaPreciosEdit({...monedaPreciosEdit, mayor: 'USD'})} className={`px-2 py-0.5 rounded-md ${monedaPreciosEdit.mayor === 'USD' ? 'bg-amber-500 text-white' : 'text-slate-600'}`}>$</button>
              </div>
            </div>
            <input type="number" step="0.01" min="0" required value={prodEditando.precio_mayor} onChange={e => setProdEditando({...prodEditando, precio_mayor: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">Stock Actual</label>
              <input type="number" step="0.001" min="0" required value={prodEditando.stock} onChange={e => setProdEditando({...prodEditando, stock: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Mínimo para Mayor</label>
              <input type="number" step="0.001" min="1" required value={prodEditando.cant_min_mayor} onChange={e => setProdEditando({...prodEditando, cant_min_mayor: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1" />
            </div>
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