export const parseNum = (val, def = 0) => {
  if (val === null || val === undefined || val === '') return def;
  const num = parseFloat(val);
  return isNaN(num) ? def : num;
};

export const convertirMoneda = (valor, origen, destino, tasa) => {
  const num = parseNum(valor, 0);
  const tasaBCV = parseNum(tasa, 1);
  
  if (tasaBCV <= 0 || origen === destino) return num;
  if (origen === 'USD' && destino === 'BS') return num * tasaBCV;
  if (origen === 'BS' && destino === 'USD') return num / tasaBCV;
  return num;
};

export const manejarCambioNumero = (e, maxVal = 99999999.99, esEntero = false) => {
  const val = e.target.value;
  if (val === '') return '0';
  if (val.toLowerCase().includes('e')) return '0';
  const num = esEntero ? parseInt(val, 10) : parseFloat(val);
  if (isNaN(num) || num > maxVal) return '0';
  return val;
};

// Máscara bancaria unificada para Bolívares y Dólares
export const formatearMontoBancario = (valor) => {
  const soloNumeros = String(valor || '').replace(/\D/g, '');
  if (!soloNumeros) return '';
  return (parseInt(soloNumeros, 10) / 100).toFixed(2).replace('.', ',');
};

// Transforma la coma visual en punto flotante para que JS lo procese bien al validar/guardar
export const obtenerMontoFlotante = (valor) => {
  if (!valor) return 0;
  const montoFormateado = formatearMontoBancario(valor);
  return montoFormateado ? parseFloat(montoFormateado.replace(',', '.')) : 0;
};