import React from 'react';
import { formatearMontoBancario, obtenerMontoFlotante } from '@/lib/utils/montoUtils';

export default function InputMontoBase({
  value = '',
  onChange,
  className = '',
  ...props
}) {
  const handleChange = (e) => {
    const textoIngresado = e.target.value;
    const textoFormateado = formatearMontoBancario(textoIngresado);
    const numeroFlotante = obtenerMontoFlotante(textoFormateado);

    if (onChange) {
      onChange(textoFormateado, numeroFlotante, e);
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={value ?? ''}
      onChange={handleChange}
      className={className} 
      {...props}
    />
  );
}