'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  calcularEstadisticasCajas, 
  filtrarHistorialCajas, 
  calcularProductosMasVendidos
} from '@/lib/utils/cajaUtils';

import {
  verificarEsPanaderia, 
  prepararDatosProducto, 
  prepararDatosMateriaPrima
} from '@/lib/utils/negocioUtils';

import { 
  estadoEntidad, 
  guardarEntidadConInventario
} from '@/lib/services/inventarioService';

export function useAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [tasaBCV, setTasaBCV] = useState(1.00);
  const [pestanaActiva, setPestanaActiva] = useState('dashboard');

  // Estados de Datos
  const [stats, setStats] = useState({ ventasHoy: 0, totalFacturas: 0, productosBajoStock: 0 });
  const [productosStockBajo, setProductosStockBajo] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [iconosDisponibles, setIconosDisponibles] = useState([]);
  const [materiaPrima, setMateriaPrima] = useState([]);
  const [usuariosSistema, setUsuariosSistema] = useState([]);

  // Estados para el Control de Caja y Estadísticas
  const [historialCajas, setHistorialCajas] = useState([]);
  const [statsCaja, setStatsCaja] = useState({ 
    ingresosUSD: 0, 
    ingresosBs: 0, 
    descuadreUSD: 0, 
    descuadreBs: 0, 
    turnosCerrados: 0 
  });

  // Filtros y Modales
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [busquedaProducto, setBusquedaProducto] = useState('');
  
  // Modal Crear Producto
  const [showModalProducto, setShowModalProducto] = useState(false);
  const [monedaPrecios, setMonedaPrecios] = useState({ inversion: 'BS', detal: 'BS', mayor: 'BS' });
  const [nuevoProd, setNuevoProd] = useState({
    nombre: '', id_categoria: 1, precio_inversion: 0, precio_detal: 0, precio_mayor: 0, stock: 0, cant_min_mayor: 0, id_icono: 1
  });

  // Modal Editar Producto
  const [showModalEditarProd, setShowModalEditarProd] = useState(false);
  const [prodEditando, setProdEditando] = useState(null);
  const [monedaPreciosEdit, setMonedaPreciosEdit] = useState({ inversion: 'USD', detal: 'USD', mayor: 'USD' });

  // Modal Crear Materia Prima
  const [showModalMP, setShowModalMP] = useState(false);
  const [monedaMP, setMonedaMP] = useState('BS');
  const [nuevaMP, setNuevaMP] = useState({ nombre: '', unidad: 'kg', costo: 0, stock: 0 });

  // Modal Editar Materia Prima
  const [showModalEditarMP, setShowModalEditarMP] = useState(false);
  const [mpEditando, setMpEditando] = useState(null);
  const [monedaMPEdit, setMonedaMPEdit] = useState('USD');

  // Modal para Registrar Compra
  const [showModalRegistroCompra, setShowModalRegistroCompra] = useState(false);

  // Modal para Editar Tasa BCV
  const [showModalTasa, setShowModalTasa] = useState(false);
  const [nuevaTasaInput, setNuevaTasaInput] = useState('');
  const [comisionAvance, setComisionAvance] = useState(0); 
  const [nuevaComisionInput, setNuevaComisionInput] = useState(''); 

  // Filtro de fechas
  const [tipoFiltro, setTipoFiltro] = useState('semanal');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Estados para Modal de Detalles de Caja
  const [showModalDetallesCaja, setShowModalDetallesCaja] = useState(false);
  const [cajaSeleccionada, setCajaSeleccionada] = useState(null);
  const [ordenesCaja, setOrdenesCaja] = useState([]);
  const [cargandoOrdenes, setCargandoOrdenes] = useState(false);
  const [ordenAEliminar, setOrdenAEliminar] = useState(null);

  // Estados para Productos Más Vendidos y Filtros
  const [filtroMasVendidos, setFiltroMasVendidos] = useState('turno');
  const [detallesOrdenesRaw, setDetallesOrdenesRaw] = useState([]);
  const [ordenesHoyRaw, setOrdenesHoyRaw] = useState([]);
  const [cajaAbiertaIdGlobal, setCajaAbiertaIdGlobal] = useState(null);

  // Notificaciones visuales (toast)
  const [notificacion, setNotificacion] = useState({ show: false, mensaje: '', tipo: 'success' });
  const timerNotificacion = useRef(null);

  const mostrarMensaje = (mensaje, tipo = 'success') => {
    if (timerNotificacion.current) clearTimeout(timerNotificacion.current);
    setNotificacion({ show: true, mensaje, tipo });
    timerNotificacion.current = setTimeout(() => {
      setNotificacion({ show: false, mensaje: '', tipo: 'success' });
    }, 3500);
  };

  useEffect(() => {
    inicializarAdmin();
  }, []);

  const inicializarAdmin = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        router.push('/');
        return;
      }

      const { data: usuarioBD, error: errUsuario } = await supabase
        .from('usuario')
        .select('*')
        .eq('email', session.user.email.toLowerCase())
        .single();

      if (errUsuario || !usuarioBD || usuarioBD.id_rol !== 1) {
        mostrarMensaje('⚠️ Acceso denegado. Se requieren permisos de administrador.', 'error');
        router.push('/');
        return;
      }
      setUsuario(usuarioBD);

      const { data: cajaAbierta } = await supabase
        .from('caja')
        .select('id_caja')
        .eq('status', 'Abierto') 
        .order('hora_apertura', { ascending: false })
        .limit(1)
        .maybeSingle(); 
        
      const cajaAbiertaId = cajaAbierta ? cajaAbierta.id_caja : null;

      const [
        resConfig,
        resStockBajo,
        resProductos,
        resCategorias,
        resIconos,
        resMP,
        resUsuarios,
        resOrdenesHoy,
        resDetallesOrdenes,
        resCajas
      ] = await Promise.all([
        supabase.from('configuracion').select('tasa_bcv, comision_avance').eq('id', 1).single(),
        supabase.from('producto').select('*, categoria(nombre), icono_producto(simbolo)').lt('stock', 5),
        supabase.from('producto').select('*, categoria(nombre), icono_producto(simbolo)').order('nombre'),
        supabase.from('categoria').select('*'),
        supabase.from('icono_producto').select('*'),
        supabase.from('materia_prima').select('*').order('nombre'),
        supabase.from('usuario').select('*'),
        supabase.from('orden').select('total_usd, id_orden, id_caja').eq('id_caja', cajaAbiertaId || 0),
        supabase.from('detalle_orden').select('cantidad, id_orden, producto(id_producto, nombre, icono_producto(simbolo)),orden!inner(id_caja)').eq('orden.id_caja', cajaAbiertaId || 0),
        supabase.from('caja').select('*, usuario(nombre), detalle_cierre_caja(monto_esperado, monto_contado, diferencia, pago(nombre, moneda))').order('hora_apertura', { ascending: false }).limit(20)
      ]);

      let tasaActual = 1.00;
      if (resConfig.data) {
        tasaActual = Number(resConfig.data.tasa_bcv);
        setTasaBCV(tasaActual);
        setNuevaTasaInput(resConfig.data.tasa_bcv);
        setComisionAvance(Number(resConfig.data.comision_avance || 0));
        setNuevaComisionInput(resConfig.data.comision_avance || 0);
      }

      if (resStockBajo.data) {
        const stockBajoFiltrado = resStockBajo.data.filter(prod => {
          const nombreCat = prod.categoria?.nombre || '';
          return !verificarEsPanaderia(nombreCat);
        });
        setProductosStockBajo(stockBajoFiltrado);
        setStats(prev => ({ ...prev, productosBajoStock: stockBajoFiltrado.length }));
      }

      if (resProductos.data) setProductos(resProductos.data);
      if (resCategorias.data) setCategorias(resCategorias.data);
      if (resIconos.data) setIconosDisponibles(resIconos.data);
      if (resMP.data) setMateriaPrima(resMP.data);
      if (resUsuarios.data) setUsuariosSistema(resUsuarios.data);

      if (resCajas.data) {
        setHistorialCajas(resCajas.data);
        setCajaAbiertaIdGlobal(cajaAbiertaId);
        setStatsCaja(calcularEstadisticasCajas(resCajas.data));
      }

      if (resOrdenesHoy.data) {
        setOrdenesHoyRaw(resOrdenesHoy.data);
        const ordenesTurnoActual = cajaAbiertaId 
          ? resOrdenesHoy.data.filter(o => o.id_caja === cajaAbiertaId)
          : [];

        const totalVentas = ordenesTurnoActual.reduce((acc, curr) => acc + Number(curr.total_usd || 0), 0);
        
        setStats(prev => ({
          ...prev,
          ventasHoy: totalVentas,
          totalFacturas: ordenesTurnoActual.length
        }));
      }

      if (resDetallesOrdenes.data) {
        setDetallesOrdenesRaw(resDetallesOrdenes.data);
      }

    } catch (error) {
      mostrarMensaje('Hubo un problema al cargar la información. Por favor, recarga la página.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cargarDatos = inicializarAdmin;

  const handleGuardarProducto = async (e, esEdicion) => {
    e.preventDefault();
    if (esEdicion && !prodEditando) return;

    try {
      const prodBase = esEdicion ? prodEditando : nuevoProd;
      const monedas = esEdicion ? monedaPreciosEdit : monedaPrecios;
      
      const { productoFinal, esPanaderia } = prepararDatosProducto(prodBase, monedas, categorias, tasaBCV);
      const stockViejo = esEdicion ? Number(prodEditando.stock_original ?? prodEditando.stock) : 0;
      const stockNuevo = Number(productoFinal.stock);
      const diferencia = stockNuevo - stockViejo;

      await guardarEntidadConInventario({
        supabase,
        esActualizacion: esEdicion,
        tablaPrincipal: 'producto',
        tablaAuditoria: 'inventario_producto',
        columnaId: 'id_producto',
        datosEntidad: productoFinal,
        idUsuario: usuario.id_usuario,
        idEntidad: esEdicion ? prodEditando.id_producto : null,
        stockViejo,
        stockNuevo,
        // Evitamos registrar stock inicial si es categoría panadería
        descripcionAuditoria: esEdicion 
          ? `Ajuste manual. Diferencia: ${diferencia > 0 ? '+' : ''}${diferencia}`
          : (!esPanaderia ? 'Registro inicial de producto' : null)
      });

      mostrarMensaje(`✅ Producto ${esEdicion ? 'actualizado' : 'creado'} exitosamente.`);
      
      if (esEdicion) {
        setShowModalEditarProd(false);
        setProdEditando(null);
      } else {
        setShowModalProducto(false);
        setNuevoProd({ nombre: '', id_categoria: 1, precio_inversion: 0, precio_detal: 0, precio_mayor: 0, stock: 0, cant_min_mayor: 10, id_icono: 1 });
      }
      inicializarAdmin();

    } catch (err) {
      mostrarMensaje(`❌ Error al ${esEdicion ? 'actualizar' : 'registrar'} producto.`, 'error');
    }
  };

  const handleArchivarProducto = async (id, estadoActual) => {
    try {
      await estadoEntidad(supabase, 'producto', 'id_producto', id, estadoActual);
      mostrarMensaje(!estadoActual ? '📂 Producto restaurado' : '📁 Producto archivado');
      inicializarAdmin();
    } catch (err) {
      mostrarMensaje('❌ Error al cambiar estado del producto.', 'error');
    }
  };

  const handleGuardarMateriaPrima = async (e, esEdicion) => {
  e.preventDefault();
  if (esEdicion && !mpEditando) return;

  try {
    const mpBase = esEdicion ? mpEditando : nuevaMP;
    
    const monedaCruda = esEdicion ? monedaMPEdit : monedaMP;
    const monedaValida = monedaCruda === 'BS' ? 'Bs' : monedaCruda;
    
    const mpPreparada = prepararDatosMateriaPrima(mpBase, monedaValida, tasaBCV);

    const { stock_original, ...mpFinal } = mpPreparada;

    const stockViejo = esEdicion ? Number(mpEditando.stock_original ?? mpEditando.stock) : 0;
    const stockNuevo = Number(mpFinal.stock);
    const diferencia = stockNuevo - stockViejo;

    await guardarEntidadConInventario({
      supabase,
      esActualizacion: esEdicion,
      tablaPrincipal: 'materia_prima',
      tablaAuditoria: 'inventario_mp',
      columnaId: 'id_materiaprima',
      datosEntidad: mpFinal,
      idUsuario: usuario.id_usuario,
      idEntidad: esEdicion ? mpEditando.id_materiaprima : null,
      stockViejo,
      stockNuevo,
      descripcionAuditoria: esEdicion 
        ? `Ajuste manual. Diferencia: ${diferencia > 0 ? '+' : ''}${diferencia}`
        : 'Registro de materia prima'
    });

    mostrarMensaje(`✅ Materia prima ${esEdicion ? 'actualizada' : 'creada'} exitosamente.`);
    
    if (esEdicion) {
      setShowModalEditarMP(false);
      setMpEditando(null);
    } else {
      setShowModalMP(false);
      setNuevaMP({ nombre: '', unidad: 'kg', costo: 0, stock: 0 });
      setMonedaMP('BS');
    }
    inicializarAdmin();

  } catch (err) {
    mostrarMensaje(
      `❌ Error al ${esEdicion ? 'actualizar' : 'registrar'}: ${err?.message || 'Error desconocido'}`, 
      'error'
    );
  }
};

  const handleArchivarMateriaPrima = async (id, estadoActual) => {
    try {
      await estadoEntidad(supabase, 'materia_prima', 'id_materiaprima', id, estadoActual);
      mostrarMensaje(!estadoActual ? '📂 Materia prima restaurada' : '📁 Materia prima archivada');
      inicializarAdmin();
    } catch (err) {
      mostrarMensaje('❌ Error al cambiar estado de la materia prima.', 'error');
    }
  };

  const handleActualizarParametros = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('configuracion')
        .update({ 
          tasa_bcv: Number(nuevaTasaInput),
          comision_avance: Number(nuevaComisionInput) // Guarda la comisión
        })
        .eq('id', 1);

      if (error) throw error;

      mostrarMensaje('✅ Parámetros actualizados correctamente.');
      setShowModalTasa(false);
      inicializarAdmin();
    } catch (err) {
      mostrarMensaje('❌ Error al actualizar los parámetros. Intenta de nuevo.', 'error');
    }
  };

  const eliminarOrden = async () => {
    if (!ordenAEliminar) return;
    try {
      if (ordenAEliminar.detalle_orden) {
        for (const det of ordenAEliminar.detalle_orden) {
          const { data: prod } = await supabase.from('producto').select('stock').eq('id_producto', det.producto.id_producto).single();
          
          if (prod) {
            const nuevoStock = prod.stock + Number(det.cantidad);
            await supabase.from('producto').update({ stock: nuevoStock }).eq('id_producto', det.producto.id_producto);
            await supabase.from('inventario_producto').insert([{
              id_producto: det.producto.id_producto,
              id_usuario: usuario.id_usuario,
              id_registro: 1,
              cantidad: det.cantidad,
              descripcion: `Devolución por orden eliminada (Ticket #${ordenAEliminar.num_ticket})`
            }]);
          }
        }
      }

      await supabase.from('pago_orden').delete().eq('id_orden', ordenAEliminar.id_orden);
      await supabase.from('detalle_orden').delete().eq('id_orden', ordenAEliminar.id_orden);
      const { error } = await supabase.from('orden').delete().eq('id_orden', ordenAEliminar.id_orden);

      if (error) throw error;

      mostrarMensaje('🗑️ Orden eliminada y stock devuelto exitosamente.');
      setOrdenAEliminar(null);
      
      if (cajaSeleccionada) handleVerDetallesCaja(cajaSeleccionada);
      inicializarAdmin();

    } catch (err) {
      console.error(err);
      mostrarMensaje('❌ Error al eliminar la orden.', 'error');
      setOrdenAEliminar(null);
    }
  };

  const historialCaja = useMemo(() => {
    return filtrarHistorialCajas(historialCajas, tipoFiltro, fechaInicio, fechaFin);
  }, [historialCajas, tipoFiltro, fechaInicio, fechaFin]);

  const productosMasVendidos = useMemo(() => {
    return calcularProductosMasVendidos(detallesOrdenesRaw, ordenesHoyRaw, cajaAbiertaIdGlobal, filtroMasVendidos);
  }, [detallesOrdenesRaw, ordenesHoyRaw, cajaAbiertaIdGlobal, filtroMasVendidos]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const productosFiltrados = productos.filter(p => {
    const coincideCategoria = filtroCategoria === 'todos' || p.id_categoria === Number(filtroCategoria);
    const coincideBusqueda = p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  const handleVerDetallesCaja = async (caja) => {
    setCajaSeleccionada(caja);
    setShowModalDetallesCaja(true);
    setCargandoOrdenes(true);
    setOrdenesCaja([]);

    try {
      const { data, error } = await supabase
        .from('orden')
        .select(`
          id_orden, num_ticket, hora_orden, total_usd, total_bs,
          detalle_orden (cantidad, precio_unitario_usd, subtotal_usd, subtotal_bs, producto (nombre, icono_producto (simbolo))),
          pago_orden (monto_usd, monto_bs, numero_referencia, es_vuelto, pago (nombre, moneda))
        `)
        .eq('id_caja', caja.id_caja)
        .order('hora_orden', { ascending: false });

      if (error) throw error;
      setOrdenesCaja(data || []);
    } catch (err) {
      mostrarMensaje('No se pudieron cargar los detalles del turno en este momento.', 'error');
    } finally {
      setCargandoOrdenes(false);
    }
  };

  return {
    loading, usuario, tasaBCV, pestanaActiva, setPestanaActiva,
    stats, productosStockBajo, productos: productosFiltrados, categorias, iconosDisponibles,
    materiaPrima, usuariosSistema, productosMasVendidos,
    historialCaja, statsCaja, filtroCategoria, setFiltroCategoria,
    busquedaProducto, setBusquedaProducto,
    showModalProducto, setShowModalProducto, monedaPrecios, setMonedaPrecios, nuevoProd, setNuevoProd,
    showModalEditarProd, setShowModalEditarProd, prodEditando, setProdEditando, monedaPreciosEdit, setMonedaPreciosEdit,
    showModalMP, setShowModalMP, monedaMP, setMonedaMP, nuevaMP, setNuevaMP,
    showModalEditarMP, setShowModalEditarMP, mpEditando, setMpEditando, monedaMPEdit, setMonedaMPEdit,
    showModalRegistroCompra, setShowModalRegistroCompra,
    showModalTasa, setShowModalTasa, nuevaTasaInput, setNuevaTasaInput,
    comisionAvance, nuevaComisionInput, setNuevaComisionInput,
    eliminarOrden, ordenAEliminar, setOrdenAEliminar,
    tipoFiltro, setTipoFiltro, fechaInicio, setFechaInicio, fechaFin, setFechaFin,
    showModalDetallesCaja, setShowModalDetallesCaja, cajaSeleccionada, ordenesCaja, cargandoOrdenes,
    notificacion, handleArchivarProducto, handleGuardarProducto, handleGuardarMateriaPrima, handleArchivarMateriaPrima, 
    handleActualizarParametros, handleLogout, handleVerDetallesCaja,
    filtroMasVendidos, setFiltroMasVendidos, cargarDatos
  };
}