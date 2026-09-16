'use client';

import { useAdmin } from '@/app/admin/useAdmin';
import SmsNotificacion from '@/componentes/ui/smsnotificacion';
import DashboardView from '@/app/admin/views/dashboardView';
import CajaView from '@/app/admin/views/cajaView';
import InventarioView from '@/app/admin/views/inventarioView';
import MateriaPrimaView from '@/app/admin/views/materiaprimaView';
import UsuarioView from '@/app/admin/views/usuarioView';
import ModalCrearProducto from '@/app/admin/modals/modalCrearProducto';
import ModalRegistroCompra from '@/app/admin/modals/modalRegistroCompra';
import ModalEditarProducto from '@/app/admin/modals/modalEditarProducto';
import ModalCrearMateriaPrima from '@/app/admin/modals/modalCrearMateriaPrima';
import ModalEditarMateriaPrima from '@/app/admin/modals/modalEditarMateriaPrima';
import ModalParametrosGenerales from '@/app/admin/modals/modalParametrosGenerales';
import ModalDetallesC from '../../componentes/modals/modalDetallesC';
import ModalRegistroGasto from '@/app/admin/modals/modalRegistroGasto';
import ModalAvanceEfectivo from '@/componentes/modals/modalAvanceEfectivo';
import { useState } from 'react';
import { LogOut, Plus, ChevronDown, PackagePlus, Receipt, Store, Banknote } from 'lucide-react';

export default function AdminDashboardPage() {
  const h = useAdmin();

  const [menuOperacionAbierto, setMenuOperacionAbierto] = useState(false);
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const [showModalGasto, setShowModalGasto] = useState(false);
  const [modalAvanceAbierto, setModalAvanceAbierto] = useState(false);

  if (h.loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center font-bold text-white">
        Cargando Panel de Administración...
      </div>
    );
  }

  // Buscamos la caja activa actual para pasársela al modal de gastos
  const cajaActivaActual = h.historialCaja?.find(c => c.status?.toLowerCase() !== 'cerrado');

  // Obtener iniciales del correo para el avatar
  const obtenerIniciales = (email) => {
    if (!email) return 'AD';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-10 relative">
      <SmsNotificacion notificacion={h.notificacion} />

      {/* HEADER REDISEÑADO */}
<header className="bg-slate-900 border-b border-slate-800 text-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
  <div className="flex items-center gap-3">
    <div className="p-2 bg-slate-800 border border-slate-700 rounded-md">
      <Store className="w-5 h-5 text-amber-500" strokeWidth={2} />
    </div>
    <div>
      <h1 className="text-base font-bold tracking-wide text-white">LA MILAGROSA</h1>
      <p className="text-xs text-slate-400">Sistema Administrativo - Panel de Control</p>
    </div>
  </div>

  <div className="flex items-center gap-3">
    {/* Botón de Parámetros Generales (Tasa y Comisión) */}
    <button 
      onClick={() => h.setShowModalTasa(true)}
      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-md transition-colors flex items-center gap-2 text-xs shadow-sm"
    >
      <Banknote className="w-4 h-4 text-slate-400" />
      <div className="flex flex-col items-start leading-none">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Tasa BCV</span>
        <span className="font-bold text-amber-400">Bs. {h.tasaBCV.toFixed(2)}</span>
      </div>
    </button>

    {/* Menú de Operaciones */}
    <div className="relative">
      <button
        onClick={() => setMenuOperacionAbierto(!menuOperacionAbierto)}
        className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-md font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm"
      >
        <Plus className="w-4 h-4" strokeWidth={2} />
        <span>Registrar</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${menuOperacionAbierto ? 'rotate-180' : ''}`} />
      </button>

      {menuOperacionAbierto && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOperacionAbierto(false)}></div>
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-slate-200 z-50 text-slate-700 text-xs flex flex-col">
            <div className="px-3 py-2 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100 bg-slate-50">Registros</div>
            <button onClick={() => { h.setShowModalRegistroCompra(true); setMenuOperacionAbierto(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100">
              <PackagePlus className="w-4 h-4 text-slate-500" /> Entrada de Mercancía
            </button>
            <button onClick={() => { setModalAvanceAbierto(true); setMenuOperacionAbierto(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100">
              <Banknote className="w-4 h-4 text-slate-500" /> Avance de Efectivo
            </button>
            <button onClick={() => { setShowModalGasto(true); setMenuOperacionAbierto(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100">
              <Receipt className="w-4 h-4 text-slate-500" /> Gasto Operativo
            </button>
            <button onClick={() => { h.setShowModalProducto(true); setMenuOperacionAbierto(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2">
              <Store className="w-4 h-4 text-slate-500" /> Nuevo Producto
            </button>
          </div>
        </>
      )}
    </div>

    {/* Menú de Usuario */}
    <div className="relative border-l border-slate-700 pl-3">
      <button
        onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
        className="flex items-center gap-2 hover:bg-slate-800 p-1.5 rounded-md transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-md bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs border border-slate-600">
          {obtenerIniciales(h.usuario?.email)}
        </div>
        <ChevronDown className="w-3 h-3 text-slate-500" />
      </button>

      {menuUsuarioAbierto && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setMenuUsuarioAbierto(false)}
          ></div>
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden text-slate-700 text-xs flex flex-col py-1.5">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                      {obtenerIniciales(h.usuario?.email)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Conectado como</p>
                      <p className="font-bold text-slate-800 truncate mt-0.5" title={h.usuario?.email}>{h.usuario?.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => { setMenuUsuarioAbierto(false); h.handleLogout(); }}
                    className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-3 text-red-600 font-semibold transition-colors cursor-pointer mt-1 border-t border-slate-100"
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

      {/* PESTAÑAS MÁS SOBRIAS */}
      <nav className="bg-white border-b border-slate-200 px-6 flex gap-1 overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Inicio' },
          { id: 'caja', label: 'Control de Caja' },
          { id: 'inventario', label: 'Inventario de Ventas' },
          { id: 'materiaprima', label: 'Materia Prima' },
          { id: 'usuarios', label: 'Control de Accesos' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => h.setPestanaActiva(tab.id)} 
            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${h.pestanaActiva === tab.id ? 'border-amber-600 text-amber-700 bg-amber-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {h.pestanaActiva === 'dashboard' && (
          <DashboardView 
            stats={h.stats} 
            productosStockBajo={h.productosStockBajo} 
            productosMasVendidos={h.productosMasVendidos} 
            onVerFacturasClick={() => {
              if (cajaActivaActual) {
                h.handleVerDetallesCaja(cajaActivaActual); 
              } else {
                alert("No hay un turno de caja abierto en este momento.");
              }
            }}
            filtroMasVendidos={h.filtroMasVendidos}
            setFiltroMasVendidos={h.setFiltroMasVendidos}
          />
        )}

        {h.pestanaActiva === 'caja' && (
          <CajaView
            tipoFiltro={h.tipoFiltro} setTipoFiltro={h.setTipoFiltro}
            fechaInicio={h.fechaInicio} setFechaInicio={h.setFechaInicio}
            fechaFin={h.fechaFin} setFechaFin={h.setFechaFin}
            statsCaja={h.statsCaja} historialCaja={h.historialCaja}
            handleVerDetallesCaja={h.handleVerDetallesCaja} tasa={h.tasaBCV}
          />
        )}

        {h.pestanaActiva === 'inventario' && (
          <InventarioView
            productos={h.productos} categorias={h.categorias}
            filtroCategoria={h.filtroCategoria} setFiltroCategoria={h.setFiltroCategoria}
            busquedaProducto={h.busquedaProducto} setBusquedaProducto={h.setBusquedaProducto}
            setShowModalProducto={h.setShowModalProducto} setShowModalRegistroCompra={h.setShowModalRegistroCompra} setProdEditando={h.setProdEditando}
            setMonedaPreciosEdit={h.setMonedaPreciosEdit} setShowModalEditarProd={h.setShowModalEditarProd}
            handleArchivarProducto={h.handleArchivarProducto} tasa={h.tasaBCV}
          />
        )}

        {h.pestanaActiva === 'materiaprima' && (
          <MateriaPrimaView
            materiaPrima={h.materiaPrima} setShowModalMP={h.setShowModalMP}
            setMpEditando={h.setMpEditando} setMonedaMPEdit={h.setMonedaMPEdit}
            setShowModalEditarMP={h.setShowModalEditarMP} handleArchivarMateriaPrima={h.handleArchivarMateriaPrima} tasa={h.tasaBCV}
          />
        )}

        {h.pestanaActiva === 'usuarios' && (
          <UsuarioView usuariosSistema={h.usuariosSistema} />
        )}
      </main>

      {/* MODALES */}
      <ModalCrearProducto 
        show={h.showModalProducto} 
        onClose={() => h.setShowModalProducto(false)} 
        onSubmit={(e) => h.handleGuardarProducto(e, false)} 
        nuevoProd={h.nuevoProd} 
        setNuevoProd={h.setNuevoProd} 
        categorias={h.categorias} 
        iconosDisponibles={h.iconosDisponibles} 
        monedaPrecios={h.monedaPrecios} 
        setMonedaPrecios={h.setMonedaPrecios} 
        tasa={h.tasaBCV} 
      />
      
      <ModalRegistroCompra 
        show={h.showModalRegistroCompra} 
        onClose={() => h.setShowModalRegistroCompra(false)} 
        usuarioActual={h.usuario} 
        tasaBcv={h.tasaBCV} 
        onCompraExitosa={() => {
          h.cargarDatos?.();
        }} 
      />

      <ModalRegistroGasto 
        isOpen={showModalGasto}
        onClose={() => setShowModalGasto(false)}
        tasaBcv={h.tasaBCV}
        idUsuario={h.usuario?.id_usuario}
        idCajaActual={cajaActivaActual?.id_caja || null}
      />

      {modalAvanceAbierto && (
        <ModalAvanceEfectivo 
          idCaja={cajaActivaActual?.id_caja} 
          onClose={() => setModalAvanceAbierto(false)}
          onExito={() => {
            setModalAvanceAbierto(false);
            h.cargarDatos?.();
          }}
        />
      )}

      <ModalEditarProducto 
        show={h.showModalEditarProd} 
        onClose={() => h.setShowModalEditarProd(false)} 
        onSubmit={(e) => h.handleGuardarProducto(e, true)} 
        prodEditando={h.prodEditando} 
        setProdEditando={h.setProdEditando} 
        categorias={h.categorias} 
        iconosDisponibles={h.iconosDisponibles} 
        monedaPreciosEdit={h.monedaPreciosEdit} 
        setMonedaPreciosEdit={h.setMonedaPreciosEdit} 
        tasa={h.tasaBCV} 
      />

      <ModalCrearMateriaPrima 
        show={h.showModalMP} 
        onClose={() => h.setShowModalMP(false)} 
        onSubmit={(e) => h.handleGuardarMateriaPrima(e, false)} 
        nuevaMP={h.nuevaMP} 
        setNuevaMP={h.setNuevaMP} 
        monedaMP={h.monedaMP} 
        setMonedaMP={h.setMonedaMP} 
        tasa={h.tasaBCV}
      />

      <ModalEditarMateriaPrima 
        show={h.showModalEditarMP} 
        onClose={() => h.setShowModalEditarMP(false)} 
        onSubmit={(e) => h.handleGuardarMateriaPrima(e, true)} 
        mpEditando={h.mpEditando} 
        setMpEditando={h.setMpEditando} 
        monedaMPEdit={h.monedaMPEdit} 
        setMonedaMPEdit={h.setMonedaMPEdit} 
        tasa={h.tasaBCV} 
      />

      {/* MODAL PARÁMETROS GENERALES */}
      <ModalParametrosGenerales 
        show={h.showModalTasa} 
        onClose={() => h.setShowModalTasa(false)} 
        onSubmit={h.handleActualizarParametros} 
        nuevaTasaInput={h.nuevaTasaInput} 
        setNuevaTasaInput={h.setNuevaTasaInput}
        nuevaComisionInput={h.nuevaComisionInput}
        setNuevaComisionInput={h.setNuevaComisionInput}
      />

      <ModalDetallesC 
        show={h.showModalDetallesCaja} 
        onClose={() => h.setShowModalDetallesCaja(false)} 
        cajaSeleccionada={h.cajaSeleccionada} 
        ordenesCaja={h.ordenesCaja} 
        cargandoOrdenes={h.cargandoOrdenes} 
        onEliminarOrden={h.setOrdenAEliminar} 
      />

      {/* MODAL CONFIRMAR ELIMINACIÓN DE ORDEN */}
      {h.ordenAEliminar && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4 text-center transform transition-all">
            <div className="text-5xl mb-2">🗑️</div>
            <h3 className="text-lg font-bold text-slate-800">¿Eliminar Orden #{h.ordenAEliminar.num_ticket}?</h3>
            <p className="text-sm text-slate-600">Esta acción borrará la venta, sus pagos registrados y devolverá los productos al inventario.</p>
            <div className="flex justify-center gap-3 pt-4">
              <button type="button" onClick={() => h.setOrdenAEliminar(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors">Cancelar</button>
              <button type="button" onClick={h.eliminarOrden} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-sm">Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}