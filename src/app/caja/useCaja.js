'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function useCaja() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [notificacion, setNotificacion] = useState({ show: false, mensaje: '', tipo: 'success' });

  // --- CONTROL DE CAJA ---
  const [cajaActiva, setCajaActiva] = useState(null);
  const [modalAperturaVisible, setModalAperturaVisible] = useState(false);
  const [montoAperturaBs, setMontoAperturaBs] = useState('');
  const [procesandoApertura, setProcesandoApertura] = useState(false);

  // Vista Ordenes
  const [showModalDetallesCaja, setShowModalDetallesCaja] = useState(false);
  const [ordenesCaja, setOrdenesCaja] = useState([]);
  const [cargandoOrdenes, setCargandoOrdenes] = useState(false);

  // Estados desde Base de Datos
  const [tasaBCV, setTasaBCV] = useState(1.00);
  const [productos, setProductos] = useState([]);
  const [metodosPagoBD, setMetodosPagoBD] = useState([]);
  const [categoriasBD, setCategoriasBD] = useState(['Todas']);
  const [numOrden, setNumOrden] = useState(1);

  // Estados UI y Filtros
  const [tipoPrecio, setTipoPrecio] = useState('detal');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');

  // Carrito y Pagos
  const [carrito, setCarrito] = useState([]);
  const [pagosRegistrados, setPagosRegistrados] = useState([]); 
  const [metodoSeleccionado, setMetodoSeleccionado] = useState(''); 
  const [montoAbonoInput, setMontoAbonoInput] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [idMetodoVuelto, setIdMetodoVuelto] = useState('');
  const [numReferencia, setNumReferencia] = useState('');

  const timerNotificacion = useRef(null);

  const handleSoloNumeros = (val, setter, maxLen) => {
    const soloNumeros = val.replace(/\D/g, ''); 
    if (soloNumeros.length <= maxLen) {
      setter(soloNumeros);
    }
  };

  const mostrarMensaje = (mensaje, tipo = 'success') => {
    if (timerNotificacion.current) clearTimeout(timerNotificacion.current);
    setNotificacion({ show: true, mensaje, tipo });
    timerNotificacion.current = setTimeout(() => {
      setNotificacion({ show: false, mensaje: '', tipo: 'success' });
    }, 3500);
  };

  useEffect(() => {
    inicializarCaja();
  }, [router]);

  const inicializarCaja = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        mostrarMensaje('⚠️ Debes iniciar sesión para acceder a la caja.', 'error');
        router.push('/');
        return;
      }

      const { data: usuarioBD, error: errUsuario } = await supabase
        .from('usuario')
        .select('*')
        .eq('email', session.user.email)
        .single();

      if (errUsuario || !usuarioBD) {
        mostrarMensaje('⚠️ El usuario autenticado no existe en la BD.', 'error');
        return;
      }
      setUsuario(usuarioBD);

      const { data: cajaAbierta } = await supabase
        .from('caja')
        .select('*')
        .eq('id_usuario', usuarioBD.id_usuario)
        .eq('status', 'Abierto')
        .maybeSingle();

      if (cajaAbierta) {
        setCajaActiva(cajaAbierta);
      } else {
        setModalAperturaVisible(true);
      }

      const { data: config } = await supabase.from('configuracion').select('tasa_bcv').eq('id', 1).single();
      if (config) setTasaBCV(Number(config.tasa_bcv));

      const { data: pagos } = await supabase.from('pago').select('*').order('id_pago');
      if (pagos && pagos.length > 0) {
        setMetodosPagoBD(pagos);
        setMetodoSeleccionado(String(pagos[0].id_pago));
      }

      await cargarProductos();

      const { data: ultimaOrden } = await supabase.from('orden').select('num_ticket').order('num_ticket', { ascending: false }).limit(1);
      if (ultimaOrden && ultimaOrden.length > 0) {
        setNumOrden(ultimaOrden[0].num_ticket + 1); 
      }

    } catch (error) {
      mostrarMensaje('❌ Ocurrió un error al inicializar la caja.', 'error');
    } finally {
      setCargando(false);
    }
  };

  const cargarProductos = async () => {
    const { data: prods } = await supabase
      .from('producto')
      .select('*, icono_producto(simbolo), categoria(nombre)')
      .order('nombre');
    
    if (prods) {
      setProductos(prods);
      const cats = ['Todas', ...new Set(prods.map(p => p.categoria?.nombre).filter(Boolean))];
      setCategoriasBD(cats);
    }
  };

  const handleAbrirCaja = async () => {
    const monto = parseFloat(montoAperturaBs);
    if (isNaN(monto) || monto < 0) {
      mostrarMensaje("Por favor, ingresa un monto de apertura válido en Bs.", 'error');
      return;
    }

    setProcesandoApertura(true);
    try {
      const fechaMomentoApertura = new Date().toISOString();
      const { data: nuevaCaja, error } = await supabase
        .from('caja')
        .insert([{
          id_usuario: usuario.id_usuario,
          monto_apertura: monto,
          hora_apertura: fechaMomentoApertura,
          status: 'Abierto'
        }])
        .select()
        .single();

      if (error) throw error;
      
      setCajaActiva(nuevaCaja);
      setModalAperturaVisible(false);
    } catch (error) {
      mostrarMensaje("Error al abrir la caja. Intenta de nuevo.", 'error');
    } finally {
      setProcesandoApertura(false);
    }
  };

  const handleAbrirMisVentas = async () => {
    if (!cajaActiva?.id_caja) return;

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
        .eq('id_caja', cajaActiva.id_caja)
        .order('hora_orden', { ascending: false });

      if (error) throw error;
      setOrdenesCaja(data || []);
    } catch (err) {
      mostrarMensaje('No se pudieron cargar las ventas de este turno.', 'error');
    } finally {
      setCargandoOrdenes(false);
    }
  };

  const handleIrACierre = () => {
    if (!cajaActiva) return;
    router.push(`/caja/cierre/${cajaActiva.id_caja}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const metodoActualObj = metodosPagoBD.find(m => String(m.id_pago) === String(metodoSeleccionado)) || {};
  const esPagoMovil = metodoActualObj.nombre?.toLowerCase().includes('pago móvil') || metodoActualObj.nombre?.toLowerCase().includes('pago movil');

  const agregarAlCarrito = (prod) => {
    let precioAplicadoUSD, precioAplicadoBs;

    if (prod.moneda_base === 'Bs') {
      precioAplicadoBs = tipoPrecio === 'detal' ? Number(prod.precio_detal_bs || 0) : Number(prod.precio_mayor_bs || 0);
      precioAplicadoUSD = precioAplicadoBs / tasaBCV;
    } else {
      precioAplicadoUSD = tipoPrecio === 'detal' ? Number(prod.precio_detal || 0) : Number(prod.precio_mayor || 0);
      precioAplicadoBs = precioAplicadoUSD * tasaBCV;
    }

    const existe = carrito.find(item => item.id_producto === prod.id_producto);

    if (existe) {
      if (existe.cantidad + 1 > prod.stock) {
        mostrarMensaje(`Atención: Solo quedan ${prod.stock} unidades disponibles.`, 'error');
        return;
      }
      setCarrito(carrito.map(item => item.id_producto === prod.id_producto ? { 
        ...item, cantidad: item.cantidad + 1, precioUSD: precioAplicadoUSD, precioBs: precioAplicadoBs 
      } : item));
    } else { 
      setCarrito([...carrito, { 
        id_producto: prod.id_producto, nombre: prod.nombre, precioUSD: precioAplicadoUSD, 
        precioBs: precioAplicadoBs, cantidad: 1, stock_max: Number(prod.stock), moneda_base: prod.moneda_base 
      }]);
    }
  };

  const cambiarCantidad = (id, nuevaCant) => {
    const cant = parseFloat(nuevaCant) || 0;
    setCarrito(carrito.map(item => {
      if (item.id_producto === id) {
        if (cant > item.stock_max) { mostrarMensaje(`Stock máximo: ${item.stock_max}`); return item; }
        return { ...item, cantidad: cant };
      }
      return item;
    }));
  };

  const eliminarDelCarrito = (id) => setCarrito(carrito.filter(item => item.id_producto !== id));

  const cancelarOrden = () => {
    if (carrito.length === 0) return;
    if (confirm('¿Estás segura de cancelar la orden?')) {
      setCarrito([]); setPagosRegistrados([]); setMontoAbonoInput(''); setNumReferencia(''); 
      setIdMetodoVuelto('');
    }
  };

  const totalPagarBs = carrito.reduce((acc, item) => acc + (item.precioBs * item.cantidad), 0);
  const totalAbonadoBs = pagosRegistrados.reduce((acc, p) => acc + p.montoBs, 0);

  const balanceBs = totalPagarBs - totalAbonadoBs;

  const faltanteBs = balanceBs > 0 ? Number(balanceBs.toFixed(2)) : 0;
  const vueltoBs = balanceBs < 0 ? Number(Math.abs(balanceBs).toFixed(2)) : 0;

  const totalPagarUSD = Number((totalPagarBs / tasaBCV).toFixed(2));
  const totalAbonadoUSD = Number((totalAbonadoBs / tasaBCV).toFixed(2));
  const faltanteUSD = Number((faltanteBs / tasaBCV).toFixed(2));
  const vueltoUSD = Number((vueltoBs / tasaBCV).toFixed(2));

  const agregarPago = () => {
    const montoIngresado = parseFloat(montoAbonoInput);
    if (!montoIngresado || montoIngresado <= 0) return;
    if (esPagoMovil && !numReferencia.trim()) { alert("⚠️ Debe ingresar el número de referencia para registrar el Pago Móvil."); return; }

    const referenciaDuplicadaLocal = pagosRegistrados.some(
      (pago) => pago.numero_referencia === numReferencia.trim()
    );

    if (referenciaDuplicadaLocal) {
      alert("⚠️ Esta referencia ya se encuentra registrada en el sistema de un pago anterior.");
      return;
    }

    let montoUSDCalculado = metodoActualObj.moneda === 'Bs' ? montoIngresado / tasaBCV : montoIngresado;
    let montoBsCalculado = metodoActualObj.moneda === 'Bs' ? montoIngresado : montoIngresado * tasaBCV;

    setPagosRegistrados([...pagosRegistrados, {
      id_pago: metodoActualObj.id_pago,
      nombreMetodo: metodoActualObj.nombre,
      monedaIngresada: metodoActualObj.moneda,
      montoIngresado: montoIngresado,
      montoUSD: montoUSDCalculado,
      montoBs: montoBsCalculado,
      numero_referencia: esPagoMovil ? numReferencia.trim() : null,
      es_vuelto: false
    }]);

    setMontoAbonoInput(''); setNumReferencia('');
  };

  const eliminarPago = (index) => setPagosRegistrados(pagosRegistrados.filter((_, i) => i !== index));

  const procesarVentaReal = async () => {
    if (carrito.length === 0 || faltanteUSD > 0.001 || procesando) return;
    if (vueltoUSD > 0.001 && !idMetodoVuelto) { alert("Seleccione origen del vuelto."); return; }
    setProcesando(true);

    try {
      const detallesList = carrito.map(item => ({
        id_producto: item.id_producto, 
        cantidad: item.cantidad,
        precio_unitario_usd: Number(item.precioUSD.toFixed(2)), 
        subtotal_usd: Number((item.precioUSD * item.cantidad).toFixed(2)), 
        tipo_precio: tipoPrecio
      }));

      // AQUI ELIMINAMOS telefono_cliente Y cedula_cliente
      let pagosList = pagosRegistrados.map(p => ({
        id_pago: p.id_pago, monto_ingresado: p.montoIngresado, monto_usd: p.montoUSD, monto_bs: p.montoBs,
        numero_referencia: p.numero_referencia, es_vuelto: false
      }));

      if (vueltoUSD > 0) {
        const metodoVueltoObj = metodosPagoBD.find(m => String(m.id_pago) === String(idMetodoVuelto));
        const esVueltoBs = metodoVueltoObj?.moneda === 'Bs';
        // AQUI TAMBIEN SE ELIMINARON LOS CAMPOS RESTANTES
        pagosList.push({
          id_pago: parseInt(idMetodoVuelto), monto_ingresado: esVueltoBs ? -vueltoBs : -vueltoUSD,
          monto_usd: -vueltoUSD, monto_bs: -vueltoBs, numero_referencia: null, es_vuelto: true
        });
      }

      const { error } = await supabase.rpc('procesar_venta_caja', {
        p_id_usuario: usuario.id_usuario, p_id_caja: cajaActiva.id_caja, p_num_ticket: numOrden,
        p_total_usd: totalPagarUSD, p_total_bs: totalPagarBs, p_tasa_bcv: tasaBCV,
        p_detalles: detallesList, p_pagos: pagosList
      });

      if (error) throw error;

      mostrarMensaje(`✅ Venta #${numOrden} registrada con éxito.`);
      setCarrito([]); setPagosRegistrados([]); setMontoAbonoInput(''); setNumReferencia(''); setIdMetodoVuelto('');
      setNumOrden(prev => prev + 1);
      await cargarProductos();
    } catch (error) {
      mostrarMensaje(`❌ Ocurrió un error. Intenta nuevamente.`, 'error');
    } finally {
      setProcesando(false);
    }
  };

  return {
    usuario, cargando, notificacion, modalAperturaVisible, montoAperturaBs, setMontoAperturaBs, procesandoApertura,
    tasaBCV, productos, metodosPagoBD, categoriasBD, numOrden, tipoPrecio, setTipoPrecio,
    categoriaSeleccionada, setCategoriaSeleccionada, busqueda, setBusqueda, carrito, pagosRegistrados,
    metodoSeleccionado, setMetodoSeleccionado, montoAbonoInput, setMontoAbonoInput, procesando,
    idMetodoVuelto, setIdMetodoVuelto, numReferencia, setNumReferencia,
    handleSoloNumeros, handleAbrirCaja, handleIrACierre, handleLogout, agregarAlCarrito, cambiarCantidad,
    eliminarDelCarrito, cancelarOrden, agregarPago, eliminarPago, procesarVentaReal,
    esPagoMovil, totalPagarUSD, totalPagarBs, faltanteUSD, faltanteBs, vueltoUSD, vueltoBs, metodoActualObj,
    showModalDetallesCaja, setShowModalDetallesCaja, ordenesCaja, cargandoOrdenes,
    cajaSeleccionada: cajaActiva, handleAbrirMisVentas
  };
}