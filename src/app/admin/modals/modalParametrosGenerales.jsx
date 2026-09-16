import { X } from 'lucide-react';

export default function ModalParametrosGenerales({ 
  show, onClose, onSubmit, 
  nuevaTasaInput, setNuevaTasaInput, 
  nuevaComisionInput, setNuevaComisionInput 
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-md w-full max-w-sm shadow-2xl overflow-hidden">
        
        {/* Cabecera del Modal */}
        <div className="bg-slate-800 px-4 py-3 flex justify-between items-center">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Parámetros Generales</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          
          {/* Tasa BCV */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase">Tasa BCV Oficial (Bs.)</label>
            <input 
              type="number" 
              step="0.01" 
              min="0"
              max="1000000" 
              required 
              value={nuevaTasaInput} 
              onChange={e => setNuevaTasaInput(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-300 rounded focus:border-amber-500 focus:ring-1 focus:ring-amber-500 px-3 py-2 text-sm font-medium outline-none transition-all" 
            />
          </div>

          {/* Comisión de Avance */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase">Comisión Avance de Efectivo (%)</label>
            <input 
              type="number" 
              step="0.01" 
              min="0" 
              max="100"
              required 
              value={nuevaComisionInput} 
              onChange={e => setNuevaComisionInput(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-300 rounded focus:border-amber-500 focus:ring-1 focus:ring-amber-500 px-3 py-2 text-sm font-medium outline-none transition-all" 
            />
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded shadow-sm">
              Guardar Cambios
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}