import { verificarEsPanaderia } from '@/lib/utils';

export default function modalCrearProducto({
  show, onClose, onSubmit, nuevoProd, setNuevoProd, categorias, iconosDisponibles, monedaPrecios, setMonedaPrecios
}) {
  if (!show) return null;

  // Detectar si la categoría seleccionada es Panadería
  const categoriaActual = categorias.find(c => c.id_categoria === Number(nuevoProd.id_categoria));
  const nombreCat = categoriaActual?.nombre?.toLowerCase() || '';
  const esPanaderia = verificarEsPanaderia(nombreCat);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-slate-800">Registrar Nuevo Producto</h3>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">Nombre del Producto</label>
            <input 
              type="text" 
              required 
              placeholder={esPanaderia ? "Ej. Pan Canilla" : "Ej. Refresco 2L"} 
              value={nuevoProd.nombre} 
              onChange={e => setNuevoProd({...nuevoProd, nombre: e.target.value})} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">Categoría</label>
              <select 
                value={nuevoProd.id_categoria} 
                onChange={e => setNuevoProd({...nuevoProd, id_categoria: Number(e.target.value)})} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1"
              >
                {categorias.map(cat => (<option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Ícono</label>
              <select 
                value={nuevoProd.id_icono} 
                onChange={e => setNuevoProd({...nuevoProd, id_icono: Number(e.target.value)})} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-base mt-1 text-center"
              >
                {iconosDisponibles.map((ico) => (<option key={ico.id_icono} value={ico.id_icono}>{ico.simbolo}</option>))}
              </select>
            </div>
          </div>

          {!esPanaderia ? (
            <div>
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-semibold text-slate-600">Precio Inversión</label>
                <div className="flex bg-slate-200 p-0.5 rounded-lg text-[10px] font-bold">
                  <button type="button" onClick={() => setMonedaPrecios({...monedaPrecios, inversion: 'BS'})} className={`px-2 py-0.5 rounded-md ${monedaPrecios.inversion === 'BS' ? 'bg-amber-500 text-white' : 'text-slate-600'}`}>Bs.</button>
                  <button type="button" onClick={() => setMonedaPrecios({...monedaPrecios, inversion: 'USD'})} className={`px-2 py-0.5 rounded-md ${monedaPrecios.inversion === 'USD' ? 'bg-amber-500 text-white' : 'text-slate-600'}`}>$</button>
                </div>
              </div>
              <input 
                id="precio_inversion"
                name="precio_inversion"
                type="number" 
                step="0.01" 
                min="0" 
                max="999999.99"
                required 
                value={nuevoProd.precio_inversion} 
                onChange={e => {
                  const val = e.target.value;
                  if (val === '') {
                    setNuevoProd({...nuevoProd, precio_inversion: ''});
                    return;
                  }
                  const num = parseFloat(val);
                  if (!isNaN(num) && !val.toLowerCase().includes('e') && num <= 999999.99) {
                    setNuevoProd({...nuevoProd, precio_inversion: val});
                  }
                }} 
                onKeyDown={e => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1" 
              />
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-slate-400">Precio Inversión</label>
              <input id="inversion_no" name="inversion_no" type="text" disabled value="No Aplica" className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500 mt-1 cursor-not-allowed" />
            </div>
          )}

          {/* Precio Detal */}
          <div>
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-semibold text-slate-600">Precio Detal</label>
              <div className="flex bg-slate-200 p-0.5 rounded-lg text-[10px] font-bold">
                <button type="button" onClick={() => setMonedaPrecios({...monedaPrecios, detal: 'BS'})} className={`px-2 py-0.5 rounded-md ${monedaPrecios.detal === 'BS' ? 'bg-amber-500 text-white' : 'text-slate-600'}`}>Bs.</button>
                <button type="button" onClick={() => setMonedaPrecios({...monedaPrecios, detal: 'USD'})} className={`px-2 py-0.5 rounded-md ${monedaPrecios.detal === 'USD' ? 'bg-amber-500 text-white' : 'text-slate-600'}`}>$</button>
              </div>
            </div>
            <input id="precio_detal" name="precio_detal" type="number" step="0.01" min="0" max="999999.99"
              required 
              value={nuevoProd.precio_detal} 
              onChange={e => {
                const val = e.target.value;
                if (val === '') {
                  setNuevoProd({...nuevoProd, precio_detal: ''});
                  return;
                }
                const num = parseFloat(val);
                if (!isNaN(num) && !val.toLowerCase().includes('e') && num <= 999999.99) {
                  setNuevoProd({...nuevoProd, precio_detal: val});
                }
              }} 
              onKeyDown={e => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1" />
          </div>

          {/* Precio Mayor */}
          <div>
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-semibold text-slate-600">Precio Mayor</label>
              <div className="flex bg-slate-200 p-0.5 rounded-lg text-[10px] font-bold">
                <button type="button" onClick={() => setMonedaPrecios({...monedaPrecios, mayor: 'BS'})} className={`px-2 py-0.5 rounded-md ${monedaPrecios.mayor === 'BS' ? 'bg-amber-500 text-white' : 'text-slate-600'}`}>Bs.</button>
                <button type="button" onClick={() => setMonedaPrecios({...monedaPrecios, mayor: 'USD'})} className={`px-2 py-0.5 rounded-md ${monedaPrecios.mayor === 'USD' ? 'bg-amber-500 text-white' : 'text-slate-600'}`}>$</button>
              </div>
            </div>
            <input id="precio_mayor" name="precio_mayor" type="number" step="0.01" min="0" max="999999.99"
              required 
              value={nuevoProd.precio_mayor} 
              onChange={e => {
                const val = e.target.value;
                if (val === '') {
                  setNuevoProd({...nuevoProd, precio_mayor: ''});
                  return;
                }
                const num = parseFloat(val);
                if (!isNaN(num) && !val.toLowerCase().includes('e') && num <= 999999.99) {
                  setNuevoProd({...nuevoProd, precio_mayor: val});
                }
              }} 
              onKeyDown={e => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1" />
          </div>

          {/* Stock Inicial (Desactivado visualmente si es Panadería) */}
          <div className="grid grid-cols-2 gap-3">
            {!esPanaderia ? (
              <div>
                <label className="text-xs font-semibold text-slate-600">Stock Inicial</label>
                <input id="stock" name="stock" type="number" step="1" min="0" max="999999" required value={nuevoProd.stock} 
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '') {
                      setNuevoProd({...nuevoProd, stock: ''});
                      return;
                    }
                    const num = parseInt(val, 10);
                    if (!isNaN(num) && !val.toLowerCase().includes('e') && num <= 999999) {
                      setNuevoProd({...nuevoProd, stock: num});
                    }
                  }} 
                  onKeyDown={e => ['e', 'E', '+', '-', '.', ','].includes(e.key) && e.preventDefault()} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1" />
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-slate-400">Stock Inicial</label>
                <input id="stock_no" name="stock_no" type="text" disabled value="No Aplica" className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500 mt-1 cursor-not-allowed" />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-slate-600">Mínimo para Mayor</label>
              <input id="min_mayor" name="min_mayor" type="number" step="1" min="0" max="999999" required value={nuevoProd.cant_min_mayor} 
                onChange={e => {
                  const val = e.target.value;
                  if (val === '') {
                    setNuevoProd({...nuevoProd, cant_min_mayor: ''});
                    return;
                  }
                  const num = parseInt(val, 10);
                  if (!isNaN(num) && !val.toLowerCase().includes('e') && num <= 99999) {
                    setNuevoProd({...nuevoProd, cant_min_mayor: num});
                  }
                }} 
                onKeyDown={e => ['e', 'E', '+', '-', '.', ','].includes(e.key) && e.preventDefault()} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1" 
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl cursor-pointer">Guardar Producto</button>
          </div>
        </form>
      </div>
    </div>
  );
}