export default function ModalConfirmarCierre({ procesando, onCancelar, onConfirmar }) {
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-fadeIn"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
    >
      <div 
        className="bg-white rounded-none max-w-sm w-full p-6 space-y-4 text-center transform transition-all border border-stone-300 font-sans"
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
      >
        <div 
          className="w-14 h-14 bg-stone-100 text-amber-900 rounded-none mx-auto flex items-center justify-center text-2xl mb-2 border border-stone-200"
          style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
        >
          ⚠️
        </div>
        <h3 className="text-lg font-black text-slate-900">¿Confirmar cierre de caja?</h3>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          Una vez cerrado el turno, no podrás modificar los montos ingresados y se descargará el comprobante automáticamente.
        </p>
        <div className="flex gap-3 pt-3">
          <button
            type="button"
            onClick={onCancelar}
            className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-bold rounded-none transition-colors cursor-pointer border border-stone-300"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={procesando}
            className="flex-1 py-3 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-none transition-colors cursor-pointer disabled:opacity-50"
            style={{ boxShadow: '0 10px 15px -3px rgba(120, 53, 15, 0.2)' }}
          >
            {procesando ? 'Procesando...' : 'Sí, Cerrar y Descargar'}
          </button>
        </div>
      </div>
    </div>
  );
}