import { ClipboardList, Lock, LogOut } from 'lucide-react';

export default function HeaderCaja({ caja }) {
  const { tasaBCV, usuario, handleIrACierre, handleLogout, handleAbrirMisVentas } = caja;

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
          <span className="font-bold text-white truncate max-w-[150px] inline-block align-bottom">
            {usuario?.email}
          </span>
        </div>

        <div className="flex items-center gap-2 border-l border-slate-700 pl-2 sm:pl-4 ml-1">
          <button
            onClick={handleAbrirMisVentas}
            title="Mis Ventas del Día"
            className="p-2 bg-slate-800 text-slate-300 hover:text-blue-400 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all cursor-pointer shadow-sm group"
          >
            <ClipboardList className="w-5 h-5 transition-transform group-hover:scale-110" strokeWidth={1.5} />
          </button>

          <button
            onClick={handleIrACierre}
            title="Cierre de Caja"
            className="p-2 bg-amber-600/20 text-amber-400 hover:bg-amber-600 hover:text-white border border-amber-600/30 rounded-xl transition-all cursor-pointer shadow-sm group"
          >
            <Lock className="w-5 h-5 transition-transform group-hover:scale-110" strokeWidth={1.5} />
          </button>

          {/* Botón: Cerrar Sesión */}
          <button
            onClick={handleLogout}
            title="Cerrar Sesión"
            className="p-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-600/30 rounded-xl transition-all cursor-pointer shadow-sm group"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" strokeWidth={1.5}/>
          </button>
        </div>
      </div>
    </header>
  );
}