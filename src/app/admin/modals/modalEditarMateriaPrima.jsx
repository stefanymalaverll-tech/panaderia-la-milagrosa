import React, { useState } from 'react';
import { prepararDatosMateriaPrima } from '@/lib/utils/negocioUtils';

export default function ModalEditarMateriaPrima({
  show, onClose, onSubmit, mpEditando, setMpEditando, monedaMPEdit, setMonedaMPEdit, tasa
}) {
  const [errorDetalle, setErrorDetalle] = useState(null);
  const [cargando, setCargando] = useState(false);

  if (!show || !mpEditando) return null;

  // Cambio de moneda limpio: solo actualiza la vista activa sin forzar conversiones matemáticas duplicadas previas
  const handleCambioMonedaEdit = (nuevaMoneda) => {
    if (monedaMPEdit === nuevaMoneda) return;
    setMonedaMPEdit(nuevaMoneda);
  };

  // Manejador de costo simplificado y reactivo
  const handleCostoChange = (e) => {
    const val = e.target.value;
    const esBs = monedaMPEdit === 'BS' || monedaMPEdit === 'Bs';

    setMpEditando((prev) => ({
      ...prev,
      [esBs ? 'costo_bs' : 'costo']: val
    }));
  };

  // Envío optimizado sin mutaciones directas de objetos por referencia
  const handleSubmitWrapper = async (e) => {
    e.preventDefault();
    setErrorDetalle(null);
    setCargando(true);

    try {
      if (!mpEditando.id_materiaprima) {
        throw new Error("El objeto de materia prima no contiene el campo 'id_materiaprima'. Verifica que el registro tenga un identificador válido.");
      }

      const monedaNormalizada = (monedaMPEdit === 'BS' || monedaMPEdit === 'Bs') ? 'Bs' : 'USD';

      // Procesar los datos una sola vez con la utilidad centralizada
      const mpPreparada = prepararDatosMateriaPrima(
        mpEditando,
        monedaNormalizada,
        tasa
      );

      // Actualizar el estado de forma inmutable en lugar de usar Object.assign
      setMpEditando((prev) => ({ ...prev, ...mpPreparada }));

      const resultado = await onSubmit(e);

      if (resultado && resultado.success === false) {
        throw new Error(resultado.error?.message || resultado.mensaje || "La operación falló en el servidor.");
      }
    } catch (err) {
      console.error("❌ Error detallado al guardar Materia Prima:", err);
      setErrorDetalle(
        err?.message || 
        err?.error_description || 
        err?.details || 
        JSON.stringify(err, null, 2)
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-slate-800">✏️ Ajustar / Editar Materia Prima</h3>
        
        {errorDetalle && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs space-y-1">
            <p className="font-bold flex items-center gap-1">
              <span>⚠️</span> Detalle exacto de la falla:
            </p>
            <p className="font-mono bg-red-100/60 p-2 rounded text-[11px] overflow-x-auto whitespace-pre-wrap">
              {errorDetalle}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmitWrapper} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">Nombre del Insumo</label>
            <input 
              type="text" 
              required 
              value={mpEditando.nombre || ''} 
              onChange={e => setMpEditando(prev => ({...prev, nombre: e.target.value}))} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">Unidad de Medida</label>
              <select 
                value={mpEditando.unidad || ''} 
                onChange={e => setMpEditando(prev => ({...prev, unidad: e.target.value}))} 
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
                    onClick={() => handleCambioMonedaEdit('BS')} 
                    className={`px-2 py-0.5 rounded-md transition-colors ${monedaMPEdit === 'BS' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-300'}`}
                  >
                    Bs.
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleCambioMonedaEdit('USD')} 
                    className={`px-2 py-0.5 rounded-md transition-colors ${monedaMPEdit === 'USD' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-300'}`}
                  >
                    $
                  </button>
                </div>
              </div>
              <div className="relative mt-1">
                <input 
                  id="costo_mp" 
                  name="costo_mp"
                  type="number" 
                  step="0.01" 
                  min="0" 
                  max="999999.99" 
                  placeholder="0.00" 
                  required 
                  value={
                    (monedaMPEdit === 'BS' || monedaMPEdit === 'Bs')
                      ? (mpEditando.costo_bs ?? '')
                      : (mpEditando.costo ?? '')
                  } 
                  onChange={handleCostoChange} 
                  onKeyDown={e => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-500" 
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                  {monedaMPEdit === 'BS' ? 'Bs.' : '$'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Stock Actual</label>
            <input 
              id="stock_mp" 
              name="stock_mp"
              type="number" 
              step="0.01" 
              min="0" 
              max="999999.99" 
              placeholder="0.00" 
              required 
              value={mpEditando.stock ?? ''} 
              onChange={e => setMpEditando(prev => ({...prev, stock: e.target.value}))} 
              onKeyDown={e => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-center mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500" 
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={cargando}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={cargando}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold py-2.5 rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {cargando ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}