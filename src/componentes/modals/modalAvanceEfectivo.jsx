'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ModalAvanceEfectivo({ idCaja, onClose, onExito }) {
  const [montoSolicitado, setMontoSolicitado] = useState('');
  const [porcentajeComision, setPorcentajeComision] = useState('15');
  const [cargandoComision, setCargandoComision] = useState(true);
  const [metodoIngreso, setMetodoIngreso] = useState('punto'); 
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const obtenerComisionBD = async () => {
      try {
        const { data, error } = await supabase
          .from('parametros')
          .select('valor')
          .eq('clave', 'comision_avance')
          .maybeSingle();

        if (data && data.valor !== undefined) {
          setPorcentajeComision(data.valor.toString());
        }
      } catch (err) {
        console.error('Error al consultar porcentaje de comisión:', err);
      } finally {
        setCargandoComision(false);
      }
    };

    obtenerComisionBD();
  }, []);

  const montoNum = parseFloat(montoSolicitado) || 0;
  const porcentajeNum = parseFloat(porcentajeComision) || 0;
  const comision = montoNum * (porcentajeNum / 100);
  const totalPunto = montoNum + comision;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (montoNum <= 0) return alert('Ingrese un monto válido');

    setLoading(true);
    try {
      // 1. Registramos la salida de efectivo físico de la gaveta
      const { error: errorEgreso } = await supabase.from('movimientos_caja').insert([
        {
          id_caja: idCaja,
          tipo: 'egreso',
          metodo: 'efectivo',
          monto: montoNum,
          comision: 0,
          descripcion: `Avance de efectivo: ${descripcion || 'Sin descripción'}`
        }
      ]);

      if (errorEgreso) throw errorEgreso;

      // 2. Registramos la entrada digital (Dinámico: Punto o Pago Móvil)
      const { error: errorIngreso } = await supabase.from('movimientos_caja').insert([
        {
          id_caja: idCaja,
          tipo: 'ingreso',
          metodo: metodoIngreso, // Usa el valor del selector
          monto: montoNum,
          comision: comision,
          descripcion: `Comisión (${porcentajeNum}%) por avance de efectivo (${metodoIngreso === 'punto' ? 'Punto' : 'Pago Móvil'}): ${descripcion || 'Sin descripción'}`
        }
      ]);

      if (errorIngreso) throw errorIngreso;

      alert('✅ Avance de efectivo registrado correctamente.');
      onExito();
      onClose();
    } catch (err) {
      console.error(err);
      alert('❌ Error al registrar el avance de efectivo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-base font-bold text-slate-800">💸 Registrar Avance de Efectivo</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            {/* CAMPO DE MONTO */}
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-bold uppercase text-slate-500">Monto Efectivo (Bs)</label>
              <input 
                id="montoSolicitado"
                name="montoSolicitado"
                type="number" 
                step="0.01"
                min="0"
                max="1000000"
                value={montoSolicitado}
                onChange={(e) => setMontoSolicitado(e.target.value)}
                placeholder="Ej. 1000.00"
                className="w-full mt-1 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                required
              />
            </div>

            {/* SELECTOR DE MÉTODO DE INGRESO */}
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-bold uppercase text-slate-500">Recibido por</label>
              <select
                value={metodoIngreso}
                onChange={(e) => setMetodoIngreso(e.target.value)}
                className="w-full mt-1 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white cursor-pointer"
              >
                <option value="punto">Punto de Venta</option>
                <option value="pago_movil">Pago Móvil</option>
              </select>
            </div>
          </div>

          {/* CUADRO DE RESUMEN - Actualizado con texto dinámico */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Efectivo que sale de gaveta:</span>
              <strong className="text-slate-900">Bs. {montoNum.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Comisión ({cargandoComision ? '...' : porcentajeNum}%):</span>
              <strong className="text-amber-700">+ Bs. {comision.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between border-t border-amber-200 pt-1 text-sm font-extrabold text-slate-800">
              <span>Total a recibir por {metodoIngreso === 'punto' ? 'Punto' : 'Pago Móvil'}:</span>
              <span className="text-indigo-600">Bs. {totalPunto.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-500">Descripción / Cliente (Opcional)</label>
            <input 
              type="text" 
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej. Cédula o nombre del cliente"
              className="w-full mt-1 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-lg hover:bg-slate-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading || cargandoComision}
              className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-black disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Registrando...' : 'Confirmar Avance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}