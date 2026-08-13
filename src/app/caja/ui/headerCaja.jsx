export default function HeaderCaja({ caja }) {
  const { tasaBCV, usuario, handleIrACierre, handleLogout } = caja;

  return (
    <header className="bg-slate-900 text-white px-4 md:px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-md">
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍞</span>
          <div>
            <h1 className="text-sm font-bold tracking-wide uppercase text-amber-400">LA MILAGROSA</h1>
            <p className="text-[11px] text-slate-300">Punto de Venta e Inventario</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs w-full sm:w-auto">
        <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
          <span className="text-slate-300">💵 Tasa: </span>
          <span className="font-bold text-amber-400">Bs. {tasaBCV.toFixed(2)}</span>
        </div>

        <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 hidden md:block">
          <span className="text-slate-300">👤 Cajera: </span>
          <span className="font-bold text-white truncate max-w-[150px] inline-block align-bottom">{usuario?.email}</span>
        </div>

        <button
          onClick={handleIrACierre}
          className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shadow-md"
        >
          🔒 Cierre de Caja
        </button>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer"
        >
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
}