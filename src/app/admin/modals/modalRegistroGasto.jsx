import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  convertirMoneda, 
  parseNum, 
  manejarCambioNumero 
} from '@/lib/utils/montoUtils';

export default function ModalRegistroGasto({ 
  isOpen, 
  onClose, 
  tasaBcv, 
  idUsuario, 
  idCajaActual 
}) {
  const [descripcion, setDescripcion] = useState('');
  const [idCategoriaGasto, setIdCategoriaGasto] = useState('');
  const [montoIngresado, setMontoIngresado] = useState('');
  const [moneda, setMoneda] = useState('USD');
  const [pagadoDeCaja, setPagadoDeCaja] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categoriasLista, setCategoriasLista] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const fetchCategorias = async () => {
        const { data, error } = await supabase
          .from('categoria_gasto')
          .select('id_categoria_gasto, tipo_categoria');
        
        if (data && !error) {
          setCategoriasLista(data);
        } else {
          console.error("Error cargando categorías:", error);
        }
      };
      fetchCategorias();
      setPagadoDeCaja(false); // Reiniciar toggle al abrir
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const montoNum = parseNum(montoIngresado, 0);
    let montoUsd = 0;
    let montoBs = 0;

    if (moneda === 'USD') {
      montoUsd = montoNum;
      montoBs = convertirMoneda(montoNum, 'USD', 'BS', tasaBcv);
    } else {
      montoBs = montoNum;
      montoUsd = convertirMoneda(montoNum, 'BS', 'USD', tasaBcv);
    }

    try {
      const { error } = await supabase
        .from('gasto_operativo')
        .insert([
          {
            descripcion: descripcion.trim(),
            id_categoria_gasto: Number(idCategoriaGasto),
            monto_usd: Number(montoUsd.toFixed(2)),
            monto_bs: Number(montoBs.toFixed(2)),
            tasa_bcv_aplicada: parseNum(tasaBcv, 1),
            id_usuario: idUsuario,
            // Si está activo el switch, asigna la caja actual; de lo contrario, queda null (gasto general/externo)
            id_caja: pagadoDeCaja ? idCajaActual : null 
          }
        ]);

      if (error) throw error;

      // Reseteo y cierre
      setDescripcion('');
      setIdCategoriaGasto('');
      setMontoIngresado('');
      setPagadoDeCaja(false);
      onClose(); 
      
    } catch (error) {
      console.error('Error al registrar el gasto:', error);
      alert('Ocurrió un problema al guardar. Revisa la consola.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Cabecera idéntica */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-sm font-bold text-slate-800">💸 Registrar Gasto Operativo</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Descripción</label>
            <input 
              type="text" 
              required
              placeholder="Ej. Pago de luz, bolsas..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          {/* Categoría Dinámica de la BD */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Categoría</label>
            <select 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              value={idCategoriaGasto}
              onChange={(e) => setIdCategoriaGasto(e.target.value)}
            >
              <option value="" disabled>Selecciona una categoría</option>
              {categoriasLista.map((cat) => (
                <option key={cat.id_categoria_gasto} value={cat.id_categoria_gasto}>
                  {cat.tipo_categoria}
                </option>
              ))}
            </select>
          </div>

          {/* Monto y Toggle de Moneda */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Monto</label>
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <input 
                  type="number" 
                  step="0.01"
                  required
                  min="0.01"
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={montoIngresado}
                  onChange={(e) => setMontoIngresado(manejarCambioNumero(e))} 
                  onKeyDown={e => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                />
              </div>
              
              <select 
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={moneda}
                onChange={(e) => setMoneda(e.target.value)}
              >
                <option value="USD">USD ($)</option>
                <option value="BS">Bs. (Bs)</option>
              </select>
            </div>
          </div>
          
          {/* Vista previa de la conversión */}
          {montoIngresado && (
            <div className="text-xs text-slate-500 text-right font-medium">
              Equivalente: {moneda === 'USD' 
                ? `${convertirMoneda(montoIngresado, 'USD', 'BS', tasaBcv).toFixed(2)} Bs.` 
                : `${convertirMoneda(montoIngresado, 'BS', 'USD', tasaBcv).toFixed(2)} $`}
            </div>
          )}

          {/* PAGO POR CAJA (Switch estilo ModalRegistroCompra) */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between mt-2">
            <div>
              <span className="text-xs font-bold text-slate-700 block">¿Pagado con efectivo de la caja?</span>
              <span className="text-[10px] text-slate-500">Descontará este monto del efectivo de la caja activa</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={pagadoDeCaja} 
                onChange={(e) => setPagadoDeCaja(e.target.checked)} 
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm disabled:opacity-50 transition-colors"
            >
              {loading ? 'Guardando...' : 'Guardar Gasto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}