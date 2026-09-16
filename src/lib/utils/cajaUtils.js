// Procesamiento de estadísticas globales de caja
export const calcularEstadisticasCajas = (cajas) => {
  let ingresosUSD = 0, ingresosBs = 0, descuadreUSD = 0, descuadreBs = 0, turnosCerrados = 0;
  
  cajas.forEach(caja => {
    if (caja.status?.toLowerCase() === 'cerrado') {
      turnosCerrados++;
      caja.detalle_cierre_caja?.forEach(det => {
        const monto = Number(det.monto_contado || 0);
        const diferencia = Number(det.diferencia || 0);
        const moneda = det.pago?.moneda;

        if (moneda === 'USD') {
          ingresosUSD += monto;
          descuadreUSD += diferencia;
        } else if (moneda === 'Bs' || moneda === 'BS') {
          ingresosBs += monto;
          descuadreBs += diferencia;
        }
      });
    }
  });

  return { ingresosUSD, ingresosBs, descuadreUSD, descuadreBs, turnosCerrados };
};

// Filtrado de historial de cajas por fecha
export const filtrarHistorialCajas = (historialCajas, tipoFiltro, fechaInicio, fechaFin) => {
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
};

// Cálculo de productos más vendidos
export const calcularProductosMasVendidos = (detallesOrdenesRaw, ordenesHoyRaw, cajaAbiertaIdGlobal, filtroMasVendidos) => {
  if (!detallesOrdenesRaw || detallesOrdenesRaw.length === 0) return [];

  let detallesAProcesar = detallesOrdenesRaw;

  if (filtroMasVendidos === 'turno') {
    const idsOrdenesTurno = new Set(
      ordenesHoyRaw
        .filter(o => o.id_caja === cajaAbiertaIdGlobal)
        .map(o => o.id_orden)
    );
    detallesAProcesar = detallesOrdenesRaw.filter(item => idsOrdenesTurno.has(item.id_orden));
  }

  const ventasPorProd = {};
  detallesAProcesar.forEach(item => {
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

  return Object.values(ventasPorProd)
    .sort((a, b) => b.totalCantidad - a.totalCantidad)
    .slice(0, 5);
};