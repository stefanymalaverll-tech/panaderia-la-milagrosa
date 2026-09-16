import { parseNum, convertirMoneda } from './montoUtils';

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

export const prepararDatosProducto = (prodData, monedaPrecios, categorias, tasaBCV) => {
  const catSeleccionada = categorias.find(c => Number(c.id_categoria) === Number(prodData.id_categoria));
  const nombreCat = catSeleccionada ? catSeleccionada.nombre : '';
  const esPanaderia = verificarEsPanaderia(nombreCat);
  const tasa = parseNum(tasaBCV, 1);

  // Toma el valor ingresado por el usuario (según la moneda que seleccionó visualmente) y lo convierte a USD para la DB
  const precioDetalUSD = convertirMoneda(prodData.precio_detal, monedaPrecios.detal, 'USD', tasa);
  const precioMayorUSD = esPanaderia ? convertirMoneda(prodData.precio_mayor, monedaPrecios.mayor, 'USD', tasa) : 0;
  const precioInversionUSD = esPanaderia ? 0 : convertirMoneda(prodData.precio_inversion, monedaPrecios.inversion || 'BS', 'USD', tasa);

  // Cálculo explícito de los equivalentes en Bolívares para los campos _bs
  const precioDetalBs = convertirMoneda(precioDetalUSD, 'USD', 'BS', tasa);
  const precioMayorBs = esPanaderia ? convertirMoneda(precioMayorUSD, 'USD', 'BS', tasa) : 0;

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

export const calcularPreciosPorMargen = (montoInversionInput, mDetal, mMayor, monedaPrecios, tasa) => {
  const num = parseNum(montoInversionInput, 0);
  if (num <= 0 || num > 999999.99) {
    return { precio_detal: '0.00', precio_mayor: '0.00' };
  }

  const margenD = parseNum(mDetal, 0);
  const margenM = parseNum(mMayor, 0);

  // Como el input se escribe directamente en la moneda seleccionada (ej. Bs), 
  let calcDetal = margenD < 100 ? num / (1 - (margenD / 100)) : num;
  let calcMayor = margenM < 100 ? num / (1 - (margenM / 100)) : num;

  const tasaBCV = parseNum(tasa, 1);
  const monedaInv = monedaPrecios?.inversion || 'BS';
  const monedaDetal = monedaPrecios?.detal || 'USD';
  const monedaMayor = monedaPrecios?.mayor || 'USD';

  if (tasaBCV > 0) {
    // Si la inversión se escribió en BS pero el usuario quiere ver el detal en USD
    if (monedaInv === 'BS' && monedaDetal === 'USD') {
      calcDetal /= tasaBCV;
    } 
    // Si la inversión se escribió en USD pero el usuario quiere ver el detal en BS
    else if (monedaInv === 'USD' && monedaDetal === 'BS') {
      calcDetal *= tasaBCV;
    }

    if (monedaInv === 'BS' && monedaMayor === 'USD') {
      calcMayor /= tasaBCV;
    } else if (monedaInv === 'USD' && monedaMayor === 'BS') {
      calcMayor *= tasaBCV;
    }
  }

  return {
    precio_detal: calcDetal.toFixed(2),
    precio_mayor: calcMayor.toFixed(2)
  };
};

export const prepararDatosMateriaPrima = (mpBase, moneda, tasaBCV) => {
  const tasa = Number(tasaBCV) || 1;
  const esBs = moneda === 'Bs' || moneda === 'BS';
  
  // Selecciona el campo correcto dependiendo de si la moneda es Bs o USD
  const valorIngresado = Number(esBs ? (mpBase.costo_bs ?? mpBase.costo ?? 0) : (mpBase.costo ?? mpBase.costo_bs ?? 0));

  let costoUSD = 0;
  let costoBs = 0;

  if (esBs) {
    costoBs = valorIngresado;
    costoUSD = tasa > 0 ? Number((valorIngresado / tasa).toFixed(4)) : 0;
  } else {
    costoUSD = valorIngresado;
    costoBs = Number((valorIngresado * tasa).toFixed(2));
  }

  return {
    ...mpBase,
    moneda_base: esBs ? 'Bs' : 'USD',
    costo: costoUSD,
    costo_bs: costoBs,
    stock: Number(mpBase.stock || 0)
  };
};