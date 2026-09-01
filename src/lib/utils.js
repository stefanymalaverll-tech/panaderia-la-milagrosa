export const verificarEsPanaderia = (nombreCategoria) => {
  if (!nombreCategoria) return false;
  const nombre = nombreCategoria.toLowerCase();
  return nombre.includes('panadería') || 
         nombre.includes('panaderia') || 
         nombre.includes('pan') || 
         nombre.includes('pastelería') || 
         nombre.includes('pasteleria') || 
         nombre.includes('pastel') || 
         nombre.includes('postre');
};

export const convertirAUSD = (valor, moneda, tasaBCV) => {
  const num = Number(valor) || 0;
  if (moneda === 'BS') {
    if (tasaBCV <= 0) return num;
    return num / tasaBCV;
  }
  return num;
};

export const prepararDatosProducto = (prodData, monedaPrecios, categorias, tasaBCV) => {
  const catSeleccionada = categorias.find(c => c.id_categoria === Number(prodData.id_categoria));
  const nombreCat = catSeleccionada ? catSeleccionada.nombre : '';
  const esPanaderia = verificarEsPanaderia(nombreCat);
  const esBaseBs = monedaPrecios.detal === 'BS';

  const productoFinal = {
    ...prodData,
    moneda_base: esBaseBs ? 'Bs' : 'USD',
    precio_detal_bs: monedaPrecios.detal === 'BS' ? prodData.precio_detal : 0,
    precio_mayor_bs: monedaPrecios.mayor === 'BS' ? prodData.precio_mayor : 0,
    precio_inversion: esPanaderia ? 0 : convertirAUSD(prodData.precio_inversion, monedaPrecios.inversion, tasaBCV),
    stock: esPanaderia ? 0 : Number(prodData.stock),
    precio_detal: convertirAUSD(prodData.precio_detal, monedaPrecios.detal, tasaBCV),
    precio_mayor: convertirAUSD(prodData.precio_mayor, monedaPrecios.mayor, tasaBCV),
  };

  return { productoFinal, esPanaderia };
};

export const calcularPreciosPorMargen = (montoInversion, mDetal, mMayor, monedaPrecios, tasa) => {
  if (!montoInversion || montoInversion === '') {
    return { precio_detal: '', precio_mayor: '' };
  }

  const num = parseFloat(montoInversion);
  if (isNaN(num) || num > 999999.99) {
    return { precio_detal: '', precio_mayor: '' };
  }

  // Cálculo basado en el margen sobre el precio de venta final (Costo / (1 - margen/100))
  // Se incluye una validación básica para evitar divisiones por cero o negativos si el margen es 100 o más.
  let calcDetal = mDetal < 100 ? num / (1 - (mDetal / 100)) : num;
  let calcMayor = mMayor < 100 ? num / (1 - (mMayor / 100)) : num;

  // Si la moneda de venta seleccionada es USD, se toma el precio en Bs y se divide entre la tasa
  if (tasa && tasa > 0) {
    if (monedaPrecios.detal === 'USD') {
      calcDetal /= tasa;
    }
    if (monedaPrecios.mayor === 'USD') {
      calcMayor /= tasa;
    }
  }

  return {
    precio_detal: calcDetal.toFixed(2),
    precio_mayor: calcMayor.toFixed(2)
  };
};

export const manejarCambioNumero = (e, maxVal = 999999.99, esEntero = false) => {
  const val = e.target.value;
  if (val === '') return '';
  if (val.toLowerCase().includes('e')) return null;
  const num = esEntero ? parseInt(val, 10) : parseFloat(val);
  if (isNaN(num) || num > maxVal) return null;
  return val;
};