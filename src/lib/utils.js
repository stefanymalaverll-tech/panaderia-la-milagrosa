// Helper interno para garantizar siempre un número válido en JS
const parseNum = (val, def = 0) => {
  if (val === null || val === undefined || val === '') return def;
  const num = parseFloat(val);
  return isNaN(num) ? def : num;
};

export const verificarEsPanaderia = (nombreCategoria) => {
  if (!nombreCategoria) return false;
  const nombre = nombreCategoria.toLowerCase();
  return (
    nombre.includes('panadería') ||
    nombre.includes('panaderia') ||
    nombre.includes('pan') ||
    nombre.includes('pastelería') ||
    nombre.includes('pasteleria') ||
    nombre.includes('pastel') ||
    nombre.includes('postre')
  );
};

export const convertirAUSD = (valor, moneda, tasaBCV) => {
  const num = parseNum(valor, 0);
  if (moneda === 'BS') {
    const tasa = parseNum(tasaBCV, 1);
    if (tasa <= 0) return num;
    return num / tasa;
  }
  return num;
};

export const prepararDatosProducto = (prodData, monedaPrecios, categorias, tasaBCV) => {
  const catSeleccionada = categorias.find(c => Number(c.id_categoria) === Number(prodData.id_categoria));
  const nombreCat = catSeleccionada ? catSeleccionada.nombre : '';
  const esPanaderia = verificarEsPanaderia(nombreCat);
  const tasa = parseNum(tasaBCV, 1);

  // Precios principales convertidos a USD (la DB almacena precios base en USD)
  const precioDetalUSD = convertirAUSD(prodData.precio_detal, monedaPrecios.detal, tasa);
  const precioMayorUSD = esPanaderia ? convertirAUSD(prodData.precio_mayor, monedaPrecios.mayor, tasa) : 0;
  const precioInversionUSD = esPanaderia ? 0 : convertirAUSD(prodData.precio_inversion, monedaPrecios.inversion || 'BS', tasa);

  // Cálculo explícito de los equivalentes en Bolívares
  const precioDetalBs = monedaPrecios.detal === 'BS' 
    ? parseNum(prodData.precio_detal, 0) 
    : precioDetalUSD * tasa;

  const precioMayorBs = esPanaderia 
    ? (monedaPrecios.mayor === 'BS' ? parseNum(prodData.precio_mayor, 0) : precioMayorUSD * tasa)
    : 0;

  const productoFinal = {
    nombre: String(prodData.nombre || '').trim(),
    id_categoria: Number(prodData.id_categoria) || 0,
    id_icono: Number(prodData.id_icono) || 1,
    moneda_base: monedaPrecios.detal === 'BS' ? 'Bs' : 'USD',
    precio_inversion: Number(precioInversionUSD.toFixed(2)),
    precio_detal: Number(precioDetalUSD.toFixed(2)),
    precio_mayor: Number(precioMayorUSD.toFixed(2)),
    precio_detal_bs: Number(precioDetalBs.toFixed(2)),
    precio_mayor_bs: Number(precioMayorBs.toFixed(2)),
    stock: esPanaderia ? 0 : parseNum(prodData.stock, 0),
    cant_min_mayor: esPanaderia ? parseNum(prodData.cant_min_mayor, 10) : 0,
    activo: true
  };

  return { productoFinal, esPanaderia };
};

export const calcularPreciosPorMargen = (montoInversion, mDetal, mMayor, monedaPrecios, tasa) => {
  const num = parseNum(montoInversion, 0);
  if (num <= 0 || num > 999999.99) {
    return { precio_detal: '0.00', precio_mayor: '0.00' };
  }

  const margenD = parseNum(mDetal, 0);
  const margenM = parseNum(mMayor, 0);

  let calcDetal = margenD < 100 ? num / (1 - (margenD / 100)) : num;
  let calcMayor = margenM < 100 ? num / (1 - (margenM / 100)) : num;

  const tasaBCV = parseNum(tasa, 1);
  if (tasaBCV > 0) {
    if (monedaPrecios?.detal === 'USD') calcDetal /= tasaBCV;
    if (monedaPrecios?.mayor === 'USD') calcMayor /= tasaBCV;
  }

  return {
    precio_detal: calcDetal.toFixed(2),
    precio_mayor: calcMayor.toFixed(2)
  };
};

export const manejarCambioNumero = (e, maxVal = 999999.99, esEntero = false) => {
  const val = e.target.value;
  if (val === '') return '0';
  if (val.toLowerCase().includes('e')) return '0';
  const num = esEntero ? parseInt(val, 10) : parseFloat(val);
  if (isNaN(num) || num > maxVal) return '0';
  return val;
};