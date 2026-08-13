'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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
  const [productosMasVendidos, setProductosMasVendidos] = useState([]);

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
    nombre: '', id_categoria: 1, precio_inversion: 0, precio_detal: 0, precio_mayor: 0, stock: 0, cant_min_mayor: 10, id_icono: 1
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

  // Modal para Editar Tasa BCV
  const [showModalTasa, setShowModalTasa] = useState(false);
  const [nuevaTasaInput, setNuevaTasaInput] = useState('');
  const [productoAEliminar, setProductoAEliminar] = useState(null);

  // Filtro de fechas
  const [tipoFiltro, setTipoFiltro] = useState('semanal');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Estados para Modal de Detalles de Caja
  const [showModalDetallesCaja, setShowModalDetallesCaja] = useState(false);
  const [cajaSeleccionada, setCajaSeleccionada] = useState(null);
  const [ordenesCaja, setOrdenesCaja] = useState([]);
  const [cargandoOrdenes, setCargandoOrdenes] = useState(false);

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
        supabase.from('configuracion').select('tasa_bcv').eq('id', 1).single(),
        supabase.from('producto').select('*, icono_producto(simbolo)').lt('stock', 5),
        supabase.from('producto').select('*, categoria(nombre), icono_producto(simbolo)').order('nombre'),
        supabase.from('categoria').select('*'),
        supabase.from('icono_producto').select('*'),
        supabase.from('materia_prima').select('*').order('nombre'),
        supabase.from('usuario').select('*'),
        supabase.from('orden').select('total_usd, id_orden', { count: 'exact' }).gte('hora_orden', new Date().toISOString().split('T')[0]),
        supabase.from('detalle_orden').select('cantidad, producto(id_producto, nombre, icono_producto(simbolo))'),
        supabase.from('caja').select('*, usuario(nombre), detalle_cierre_caja(monto_esperado, monto_contado, diferencia, pago(nombre, moneda))').order('hora_apertura', { ascending: false }).limit(20)
      ]);

      let tasaActual = 1.00;
      if (resConfig.data) {
        tasaActual = Number(resConfig.data.tasa_bcv);
        setTasaBCV(tasaActual);
        setNuevaTasaInput(resConfig.data.tasa_bcv);
      }
      if (resStockBajo.data) {
        setProductosStockBajo(resStockBajo.data);
        setStats(prev => ({ ...prev, productosBajoStock: resStockBajo.data.length }));
      }
      if (resProductos.data) setProductos(resProductos.data);
      if (resCategorias.data) setCategorias(resCategorias.data);
      if (resIconos.data) setIconosDisponibles(resIconos.data);
      if (resMP.data) setMateriaPrima(resMP.data);
      if (resUsuarios.data) setUsuariosSistema(resUsuarios.data);

      if (resOrdenesHoy.data) {
        const totalVentas = resOrdenesHoy.data.reduce((acc, curr) => acc + Number(curr.total_usd || 0), 0);
        setStats(prev => ({
          ...prev,
          ventasHoy: totalVentas,
          totalFacturas: resOrdenesHoy.count || resOrdenesHoy.data.length
        }));
      }

      if (resDetallesOrdenes.data) {
        const ventasPorProd = {};
        resDetallesOrdenes.data.forEach(item => {
          if (!item.producto) return;
          const id = item.producto.id_producto;
          const nombre = item.producto.nombre;
          const simbolo = item.producto.icono_producto?.simbolo || '📦';
          const cantidad = Number(item.cantidad || 0);

          if (!ventasPorProd[id]) {
            ventasPorProd[id] = { id, nombre, simbolo, totalCantidad: 0 };
          }
          ventasPorProd[id].totalCantidad += cantidad;
        });

        const topProductos = Object.values(ventasPorProd)
          .sort((a, b) => b.totalCantidad - a.totalCantidad)
          .slice(0, 3);

        setProductosMasVendidos(topProductos);
      }

      if (resCajas.data) {
        setHistorialCajas(resCajas.data);
        let ingresosUSD = 0, ingresosBs = 0, descuadresUSD = 0, descuadresBs = 0, turnos = 0;

        resCajas.data.forEach(caja => {
          if (caja.status?.toLowerCase() === 'cerrado') {
            turnos++;
            caja.detalle_cierre_caja?.forEach(det => {
              const monto = Number(det.monto_contado || 0);
              const diferencia = Number(det.diferencia || 0);
              const moneda = det.pago?.moneda;

              if (moneda === 'USD') {
                ingresosUSD += monto;
                descuadresUSD += diferencia;
              } else if (moneda === 'Bs' || moneda === 'BS') {
                ingresosBs += monto;
                descuadresBs += diferencia;
              }
            });
          }
        });

        setStatsCaja({ ingresosUSD, ingresosBs, descuadreUSD: descuadresUSD, descuadreBs: descuadresBs, turnosCerrados: turnos });
      }

    } catch (error) {
      mostrarMensaje('Hubo un problema al cargar la información. Por favor, recarga la página.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const convertirAUSD = (valor, moneda) => {
    const num = Number(valor) || 0;
    if (moneda === 'BS') {
      if (tasaBCV <= 0) return num;
      return num / tasaBCV;
    }
    return num;
  };

  const handleCrearProducto = async (e) => {
    e.preventDefault();
    try {
      const esBaseBs = monedaPrecios.detal === 'BS';
      const productoFinal = {
        ...nuevoProd,
        moneda_base: esBaseBs ? 'Bs' : 'USD',
        precio_detal_bs: monedaPrecios.detal === 'BS' ? nuevoProd.precio_detal : 0,
        precio_mayor_bs: monedaPrecios.mayor === 'BS' ? nuevoProd.precio_mayor : 0,
        precio_inversion: convertirAUSD(nuevoProd.precio_inversion, monedaPrecios.inversion),
        precio_detal: convertirAUSD(nuevoProd.precio_detal, monedaPrecios.detal),
        precio_mayor: convertirAUSD(nuevoProd.precio_mayor, monedaPrecios.mayor),
      };

      const { data: prodCreado, error } = await supabase
        .from('producto')
        .insert([productoFinal])
        .select()
        .single();

      if (error) throw error;

      await supabase.from('inventario_producto').insert([{
        id_producto: prodCreado.id_producto,
        id_usuario: usuario.id_usuario,
        id_registro: 1,
        cantidad: nuevoProd.stock,
        descripcion: 'Registro inicial de producto'
      }]);

      mostrarMensaje('✅ Producto agregado exitosamente.');
      setShowModalProducto(false);
      setNuevoProd({ nombre: '', id_categoria: 1, precio_inversion: 0, precio_detal: 0, precio_mayor: 0, stock: 0, cant_min_mayor: 10, id_icono: 1 });
      inicializarAdmin();
    } catch (err) {
      mostrarMensaje('❌ Error al registrar producto. Verifica los datos.', 'error');
    }
  };

  const handleActualizarProducto = async (e) => {
    e.preventDefault();
    if (!prodEditando) return;
    try {
      const esBaseBs = monedaPreciosEdit.detal === 'BS';
      const productoActualizado = {
        nombre: prodEditando.nombre,
        id_categoria: prodEditando.id_categoria,
        id_icono: prodEditando.id_icono,
        stock: prodEditando.stock,
        cant_min_mayor: prodEditando.cant_min_mayor,
        moneda_base: esBaseBs ? 'Bs' : 'USD',
        precio_detal_bs: monedaPreciosEdit.detal === 'BS' ? prodEditando.precio_detal : 0,
        precio_mayor_bs: monedaPreciosEdit.mayor === 'BS' ? prodEditando.precio_mayor : 0,
        precio_inversion: convertirAUSD(prodEditando.precio_inversion, monedaPreciosEdit.inversion),
        precio_detal: convertirAUSD(prodEditando.precio_detal, monedaPreciosEdit.detal),
        precio_mayor: convertirAUSD(prodEditando.precio_mayor, monedaPreciosEdit.mayor),
      };

      if (prodEditando.stock !== productoActualizado.stock) {
        const diferenciaStock = productoActualizado.stock - prodEditando.stock;
        await supabase.from('inventario_producto').insert([{
          id_producto: prodEditando.id_producto,
          id_usuario: usuario.id_usuario,
          id_registro: diferenciaStock > 0 ? 1 : 2,
          cantidad: Math.abs(diferenciaStock),
          descripcion: `Ajuste manual desde panel de administración. Diferencia: ${diferenciaStock > 0 ? '+' : ''}${diferenciaStock}`
        }]);
      }

      const { error } = await supabase
        .from('producto')
        .update(productoActualizado)
        .eq('id_producto', prodEditando.id_producto);

      if (error) throw error;

      mostrarMensaje('✅ Producto actualizado correctamente.');
      setShowModalEditarProd(false);
      setProdEditando(null);
      inicializarAdmin();
    } catch (err) {
      mostrarMensaje('❌ Error al actualizar producto. Intenta de nuevo.', 'error');
    }
  };

  const handleCrearMateriaPrima = async (e) => {
    e.preventDefault();
    try {
      const mpFinal = {
        ...nuevaMP,
        costo: convertirAUSD(nuevaMP.costo, monedaMP)
      };

      const { data: mpCreada, error } = await supabase
        .from('materia_prima')
        .insert([mpFinal])
        .select()
        .single();

      if (error) throw error;

      await supabase.from('inventario_mp').insert([{
        id_materiaprima: mpCreada.id_materiaprima,
        id_usuario: usuario.id_usuario,
        id_registro: 1,
        cantidad: nuevaMP.stock,
        descripcion: 'Registro inicial de materia prima'
      }]);

      mostrarMensaje('✅ Materia prima agregada con éxito.');
      setShowModalMP(false);
      setNuevaMP({ nombre: '', unidad: 'kg', costo: 0, stock: 0 });
      inicializarAdmin();
    } catch (err) {
      mostrarMensaje('❌ Error al registrar materia prima. Intenta de nuevo.', 'error');
    }
  };

  const handleActualizarMateriaPrima = async (e) => {
    e.preventDefault();
    if (!mpEditando) return;
    try {
      const mpActualizada = {
        nombre: mpEditando.nombre,
        unidad: mpEditando.unidad,
        stock: mpEditando.stock,
        costo: convertirAUSD(mpEditando.costo, monedaMPEdit)
      };

      if (mpEditando.stock !== mpActualizada.stock) {
        const diferenciaStock = mpActualizada.stock - mpEditando.stock;
        await supabase.from('inventario_mp').insert([{
          id_materiaprima: mpEditando.id_materiaprima,
          id_usuario: usuario.id_usuario,
          id_registro: diferenciaStock > 0 ? 1 : 2,
          cantidad: Math.abs(diferenciaStock),
          descripcion: `Ajuste manual desde panel de administración. Diferencia: ${diferenciaStock > 0 ? '+' : ''}${diferenciaStock}`
        }]);
      }

      const { error } = await supabase
        .from('materia_prima')
        .update(mpActualizada)
        .eq('id_materiaprima', mpEditando.id_materiaprima);

      if (error) throw error;

      mostrarMensaje('✅ Materia prima actualizada correctamente.');
      setShowModalEditarMP(false);
      setMpEditando(null);
      inicializarAdmin();
    } catch (err) {
      mostrarMensaje('❌ Error al actualizar materia prima. Intenta de nuevo.', 'error');
    }
  };

  const handleActualizarTasa = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('configuracion')
        .update({ tasa_bcv: Number(nuevaTasaInput) })
        .eq('id', 1);

      if (error) throw error;

      mostrarMensaje('✅ Tasa BCV actualizada correctamente.');
      setShowModalTasa(false);
      inicializarAdmin();
    } catch (err) {
      mostrarMensaje('❌ Error al actualizar la tasa. Intenta de nuevo.', 'error');
    }
  };

  const eliminarProducto = async () => {
    if (!productoAEliminar) return;
    try {
      const { error } = await supabase.from('producto').delete().eq('id_producto', productoAEliminar);
      if (error) throw error;
      mostrarMensaje('🗑️ Producto eliminado correctamente.');
      setProductoAEliminar(null);
      inicializarAdmin();
    } catch (err) {
      mostrarMensaje('❌ Error al eliminar producto. Intenta de nuevo.', 'error');
      setProductoAEliminar(null);
    }
  };

  const historialCaja = useMemo(() => {
    const ahora = new Date();
    return historialCajas.filter(caja => {
      const fechaCaja = new Date(caja.hora_apertura);
      if (tipoFiltro === 'semanal') {
        const unaSemanaAtras = new Date();
        unaSemanaAtras.setDate(ahora.getDate() - 7);
        return fechaCaja >= unaSemanaAtras && fechaCaja <= ahora;
      } 
      if (tipoFiltro === 'quincenal') {
        const unaQuincenaAtras = new Date();
        unaQuincenaAtras.setDate(ahora.getDate() - 15);
        return fechaCaja >= unaQuincenaAtras && fechaCaja <= ahora;
      } 
      if (tipoFiltro === 'mensual') {
        const unMesAtras = new Date();
        unMesAtras.setMonth(ahora.getMonth() - 1);
        return fechaCaja >= unMesAtras && fechaCaja <= ahora;
      } 
      if (tipoFiltro === 'personalizado' && fechaInicio && fechaFin) {
        const inicio = new Date(fechaInicio);
        inicio.setHours(0, 0, 0, 0);
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);
        return fechaCaja >= inicio && fechaCaja <= fin;
      }
      return true;
    });
  }, [historialCajas, tipoFiltro, fechaInicio, fechaFin]);

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
          detalle_orden (cantidad, precio_unitario_usd, subtotal_usd, producto (nombre, icono_producto (simbolo))),
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
    showModalTasa, setShowModalTasa, nuevaTasaInput, setNuevaTasaInput,
    productoAEliminar, setProductoAEliminar,
    tipoFiltro, setTipoFiltro, fechaInicio, setFechaInicio, fechaFin, setFechaFin,
    showModalDetallesCaja, setShowModalDetallesCaja, cajaSeleccionada, ordenesCaja, cargandoOrdenes,
    notificacion, handleCrearProducto, handleActualizarProducto, handleCrearMateriaPrima,
    handleActualizarMateriaPrima, handleActualizarTasa, eliminarProducto, handleLogout, handleVerDetallesCaja
  };
}