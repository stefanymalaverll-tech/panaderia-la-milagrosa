'use client';

import { useAdmin } from '@/app/admin/useAdmin';
import SmsNotificacion from '@/componentes/ui/smsnotificacion';
import DashboardView from '@/app/admin/views/dashboardView';
import CajaView from '@/app/admin/views/cajaView';
import InventarioView from '@/app/admin/views/inventarioView';
import MateriaPrimaView from '@/app/admin/views/materiaprimaView';
import UsuarioView from '@/app/admin/views/usuarioView';
import ModalCrearProducto from '@/app/admin/modals/modalCrearProducto';
import ModalEditarProducto from '@/app/admin/modals/modalEditarProducto';
import ModalCrearMateriaPrima from '@/app/admin/modals/modalCrearMateriaPrima';
import ModalEditarMateriaPrima from '@/app/admin/modals/modalEditarMateriaPrima';
import ModalTasaBCV from '@/app/admin/modals/modalTasaBCV';
import ModalDetallesCaja from '@/app/admin/modals/modalDetallesCaja';
import { LogOut } from 'lucide-react'; 

export default function AdminDashboardPage() {
  const h = useAdmin();

  if (h.loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center font-bold text-white">
        Cargando Panel de Administración...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-10 relative">
      <SmsNotificacion notificacion={h.notificacion} />

      {/* HEADER */}
      <header className="bg-slate-900 text-white px-4 md:px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-md">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍞</span>
            <div>
              <h1 className="text-sm font-bold tracking-wide uppercase text-amber-400">LA MILAGROSA</h1>
              <p className="text-[11px] text-slate-300">Panel de Administración</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs w-full sm:w-auto">
          <button 
            onClick={() => h.setShowModalTasa(true)}
            className="bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <span className="text-slate-300">💵 Tasa:</span>
            <span className="font-bold text-amber-400">Bs. {h.tasaBCV.toFixed(2)} ✏️</span>
          </button>

          <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 hidden md:block">
            <span className="text-slate-300">👤 Admin: </span>
            <span className="font-bold text-white truncate max-w-[150px] inline-block align-bottom">{h.usuario?.email}</span>
          </div>

          {/* Botón: Cerrar Sesión Estilizado */}
          <button
            onClick={h.handleLogout}
            title="Cerrar Sesión"
            className="p-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-600/30 rounded-xl transition-all cursor-pointer shadow-sm group flex items-center justify-center"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" strokeWidth={1.5}/>
          </button>
        </div>
      </header>

      {/* MENÚ DE PESTAÑAS */}
      <nav className="bg-white border-b border-slate-200 px-4 md:px-6 py-2 flex gap-2 overflow-x-auto shadow-sm">
        <button onClick={() => h.setPestanaActiva('dashboard')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${h.pestanaActiva === 'dashboard' ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>📊 Inicio</button>
        <button onClick={() => h.setPestanaActiva('caja')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${h.pestanaActiva === 'caja' ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>💵 Control de Caja</button>
        <button onClick={() => h.setPestanaActiva('inventario')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${h.pestanaActiva === 'inventario' ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>🥖 Productos y Stock</button>
        <button onClick={() => h.setPestanaActiva('materiaprima')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${h.pestanaActiva === 'materiaprima' ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>🌾 Materia Prima (Producción)</button>
        <button onClick={() => h.setPestanaActiva('usuarios')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${h.pestanaActiva === 'usuarios' ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>👥 Control de Accesos</button>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {h.pestanaActiva === 'dashboard' && (
          <DashboardView 
            stats={h.stats} 
            productosStockBajo={h.productosStockBajo} 
            productosMasVendidos={h.productosMasVendidos} 
            onVerFacturasClick={() => {
              const cajaActiva = h.historialCaja.find(c => c.status?.toLowerCase() !== 'cerrado'); 
              
              if (cajaActiva) {
                h.handleVerDetallesCaja(cajaActiva); 
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
            setShowModalProducto={h.setShowModalProducto} setProdEditando={h.setProdEditando}
            setMonedaPreciosEdit={h.setMonedaPreciosEdit} setShowModalEditarProd={h.setShowModalEditarProd}
            handleArchivarProducto={h.handleArchivarProducto} tasa={h.tasaBCV}
          />
        )}

        {h.pestanaActiva === 'materiaprima' && (
          <MateriaPrimaView
            materiaPrima={h.materiaPrima} setShowModalMP={h.setShowModalMP}
            setMpEditando={h.setMpEditando} setMonedaMPEdit={h.setMonedaMPEdit}
            setShowModalEditarMP={h.setShowModalEditarMP}
          />
        )}

        {h.pestanaActiva === 'usuarios' && (
          <UsuarioView usuariosSistema={h.usuariosSistema} />
        )}
      </main>

      {/* MODALES */}
      <ModalCrearProducto show={h.showModalProducto} onClose={() => h.setShowModalProducto(false)} onSubmit={h.handleCrearProducto} nuevoProd={h.nuevoProd} setNuevoProd={h.setNuevoProd} categorias={h.categorias} iconosDisponibles={h.iconosDisponibles} monedaPrecios={h.monedaPrecios} setMonedaPrecios={h.setMonedaPrecios} />
      <ModalEditarProducto show={h.showModalEditarProd} onClose={() => h.setShowModalEditarProd(false)} onSubmit={h.handleActualizarProducto} prodEditando={h.prodEditando} setProdEditando={h.setProdEditando} categorias={h.categorias} iconosDisponibles={h.iconosDisponibles} monedaPreciosEdit={h.monedaPreciosEdit} setMonedaPreciosEdit={h.setMonedaPreciosEdit} />
      <ModalCrearMateriaPrima show={h.showModalMP} onClose={() => h.setShowModalMP(false)} onSubmit={h.handleCrearMateriaPrima} nuevaMP={h.nuevaMP} setNuevaMP={h.setNuevaMP} monedaMP={h.monedaMP} setMonedaMP={h.setMonedaMP} />
      <ModalEditarMateriaPrima show={h.showModalEditarMP} onClose={() => h.setShowModalEditarMP(false)} onSubmit={h.handleActualizarMateriaPrima} mpEditando={h.mpEditando} setMpEditando={h.setMpEditando} monedaMPEdit={h.monedaMPEdit} setMonedaMPEdit={h.setMonedaMPEdit} />
      <ModalTasaBCV show={h.showModalTasa} onClose={() => h.setShowModalTasa(false)} onSubmit={h.handleActualizarTasa} nuevaTasaInput={h.nuevaTasaInput} setNuevaTasaInput={h.setNuevaTasaInput} />
      <ModalDetallesCaja show={h.showModalDetallesCaja} onClose={() => h.setShowModalDetallesCaja(false)} cajaSeleccionada={h.cajaSeleccionada} ordenesCaja={h.ordenesCaja} cargandoOrdenes={h.cargandoOrdenes} onEliminarOrden={h.setOrdenAEliminar} />

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