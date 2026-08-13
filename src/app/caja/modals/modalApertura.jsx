export default function ModalApertura({ caja }) {
  const { 
    modalAperturaVisible, 
    montoAperturaBs, 
    setMontoAperturaBs, 
    procesandoApertura, 
    handleAbrirCaja,
    handleLogout
  } = caja;

  if (!modalAperturaVisible) return null;

  // Validar si ya se ha ingresado un monto de apertura
  const sinMonto = !montoAperturaBs || montoAperturaBs.toString().trim() === '';

  return (
    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-6">
          <span className="text-5xl block mb-2">💰</span>
          <h2 className="text-xl font-black text-slate-800">Apertura de Caja</h2>
          <p className="text-xs text-slate-500 mt-1">Ingresa el fondo inicial para tu turno.</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Fondo de Apertura (Bs)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Ej: 50.00"
              value={montoAperturaBs}
              onChange={(e) => setMontoAperturaBs(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-lg font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 text-center"
            />
          </div>
          
          <div className="space-y-2">
            <button
              onClick={handleAbrirCaja}
              disabled={procesandoApertura || sinMonto}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              {procesandoApertura ? 'Abriendo...' : 'Abrir Caja'}
            </button>

            {/* Botón para cancelar y cerrar sesión */}
            <button
              onClick={handleLogout}
              disabled={procesandoApertura}
              className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              Cancelar y Salir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}