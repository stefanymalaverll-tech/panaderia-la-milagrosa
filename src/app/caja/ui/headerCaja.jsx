import { useState } from 'react';
import { Banknote, ClipboardList, Lock, LogOut, ChevronDown, Store, HandCoins, AlertTriangle } from 'lucide-react';

export default function HeaderCaja({ caja }) {
  const { tasaBCV, usuario, handleIrACierre, handleLogout, handleAbrirMisVentas, setModalAvanceAbierto } = caja;
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const [modalConfirmCierre, setModalConfirmCierre] = useState(false);

  const obtenerIniciales = (email) => {
    if (!email) return 'CJ';
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  const confirmarCierre = () => {
    setModalConfirmCierre(false);
    handleIrACierre();
  };

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 text-slate-200 px-3 md:px-5 py-2 flex items-center justify-between gap-2 shadow-md">
        {/* Identificación del Punto de Venta */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="p-1.5 bg-slate-800 border border-slate-700 rounded-lg">
            <Store className="w-4 h-4 text-amber-500" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-wide text-white uppercase leading-none">LA MILAGROSA</h1>
            <p className="text-[10px] text-slate-400 leading-tight hidden sm:block mt-0.5">Punto de Venta e Inventario</p>
          </div>
        </div>

        {/* Controles y Operaciones de Caja */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 text-xs">
          
          {/* Tasa BCV */}
          <div className="bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg flex items-center gap-1.5 shadow-sm shrink-0">
            <Banknote className="w-3.5 h-3.5 text-amber-400 sm:text-slate-400 shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="text-[8px] text-slate-400 uppercase tracking-wider hidden sm:inline">Tasa BCV</span>
              <span className="font-bold text-amber-400 text-[11px] sm:text-xs">Bs. {tasaBCV?.toFixed(2)}</span>
            </div>
          </div>

          {/* Acciones de Caja */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
             <button
              onClick={() => setModalAvanceAbierto(true)}
              title="Avance de Efectivo"
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer text-xs shrink-0"
            >
              <HandCoins className="w-4 h-4" />
              <span className="hidden md:inline">Avance de Efectivo</span>
            </button>

            {/* 2. Ver Ventas del Día */}
            <button
              onClick={handleAbrirMisVentas}
              title="Mis Ventas del Día"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg transition-colors cursor-pointer shadow-sm shrink-0"
            >
              <ClipboardList className="w-4 h-4" strokeWidth={2} />
            </button>

            {/* 3. Cierre de Caja */}
            <button
              onClick={() => setModalConfirmCierre(true)}
              title="Cierre de Caja"
              className="p-1.5 bg-amber-600/20 text-amber-400 hover:bg-amber-600 hover:text-white border border-amber-600/30 rounded-lg transition-colors cursor-pointer shadow-sm shrink-0"
            >
              <Lock className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          {/* Menú Dropdown del Usuario */}
          <div className="relative border-l border-slate-800 pl-1.5 sm:pl-2 ml-0.5 shrink-0">
            <button
              onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
              className="flex items-center gap-1 hover:bg-slate-800 p-1 rounded-lg transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
                {obtenerIniciales(usuario?.email)}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {menuUsuarioAbierto && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setMenuUsuarioAbierto(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden text-slate-700 text-xs flex flex-col py-1">
                  <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                      {obtenerIniciales(usuario?.email)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Cajero Activo</p>
                      <p className="font-bold text-slate-800 truncate text-xs" title={usuario?.email}>
                        {usuario?.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => { setMenuUsuarioAbierto(false); handleLogout(); }}
                    className="w-full text-left px-3 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600 font-semibold transition-colors cursor-pointer border-t border-slate-100 text-xs"
                  >
                    <LogOut className="w-4 h-4" strokeWidth={2} />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </header>

      {/* MODAL CONFIRMACIÓN DE CIERRE */}
      {modalConfirmCierre && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xs w-full p-5 shadow-2xl text-slate-700 flex flex-col items-center text-center space-y-4">
            
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-900">¿Ir al Cierre de Caja?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Estás a punto de salir del punto de venta para iniciar el proceso de arqueo diario.
              </p>
            </div>

            <div className="flex gap-2 w-full pt-1">
              <button
                onClick={() => setModalConfirmCierre(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-3 rounded-lg text-xs transition-colors cursor-pointer border border-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarCierre}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-2 px-3 rounded-lg text-xs transition-colors cursor-pointer shadow-sm shadow-amber-500/30"
              >
                Sí, continuar
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}