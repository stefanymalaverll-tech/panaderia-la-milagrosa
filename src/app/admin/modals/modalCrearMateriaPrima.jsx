import { 
  convertirMoneda, 
  parseNum 
} from '@/lib/utils/montoUtils';

export default function ModalCrearMateriaPrima({
  show, onClose, onSubmit, nuevaMP, setNuevaMP, monedaMP, setMonedaMP, tasa = 1
}) {
  if (!show) return null;

  const tasaNum = parseNum(tasa, 1);

  // Maneja el cambio de moneda convirtiendo automáticamente el costo actual si ya tiene un valor
  const handleCambioMoneda = (nuevaMoneda) => {
    if (monedaMP === nuevaMoneda) return;

    if (nuevaMP.costo !== '' && nuevaMP.costo !== undefined) {
      const costoConvertido = convertirMoneda(nuevaMP.costo, monedaMP, nuevaMoneda, tasaNum);
      setNuevaMP(prev => ({
        ...prev,
        costo: costoConvertido === 0 ? '' : Number(costoConvertido).toFixed(2)
      }));
    }
    setMonedaMP(nuevaMoneda);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-slate-800">🌾 Registrar Nueva Materia Prima</h3>
        <form onSubmit={onSubmit} className="space-y-3">
          
          <div>
            <label className="text-xs font-semibold text-slate-600">Nombre del Insumo</label>
            <input 
              type="text" required 
              placeholder="Ej. Harina de Trigo" 
              value={nuevaMP.nombre || ''} 
              onChange={e => setNuevaMP({...nuevaMP, nombre: e.target.value})} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">Unidad de Medida</label>
              <select 
                value={nuevaMP.unidad || 'kg'} 
                onChange={e => setNuevaMP({...nuevaMP, unidad: e.target.value})} 
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
                    onClick={() => handleCambioMoneda('BS')} 
                    className={`px-2 py-0.5 rounded-md transition-colors ${monedaMP === 'BS' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-300'}`}
                  >
                    Bs.
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleCambioMoneda('USD')} 
                    className={`px-2 py-0.5 rounded-md transition-colors ${monedaMP === 'USD' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-300'}`}
                  >
                    $
                  </button>
                </div>
              </div>
              <div className="relative mt-1">
                <input 
                  type="number" step="0.01" min="0" max="999999.99" placeholder="0.00" required 
                  value={nuevaMP.costo ?? ''} 
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '') {
                      setNuevaMP({...nuevaMP, costo: ''});
                      return;
                    }
                    if (!val.toLowerCase().includes('e')) {
                      setNuevaMP({...nuevaMP, costo: val});
                    }
                  }} 
                  onKeyDown={e => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-500" 
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                  {monedaMP === 'BS' ? 'Bs.' : '$'}
                </span>
              </div>
              
              {/* Equivalencia en tiempo real */}
              <div className="mt-2 text-right">
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                  Equivale a: {monedaMP === 'BS' 
                    ? `USD ${(Number(nuevaMP.costo || 0) / tasaNum).toFixed(2)}` 
                    : `Bs. ${(Number(nuevaMP.costo || 0) * tasaNum).toFixed(2)}`}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Stock Inicial</label>
            <input 
              type="number" step="0.001" min="0" max="999999.999" placeholder="0.000" required 
              value={nuevaMP.stock ?? ''} 
              onChange={e => {
                const val = e.target.value;
                if (val === '') {
                  setNuevaMP({...nuevaMP, stock: ''});
                  return;
                }
                if (!val.toLowerCase().includes('e')) {
                  setNuevaMP({...nuevaMP, stock: val});
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
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}