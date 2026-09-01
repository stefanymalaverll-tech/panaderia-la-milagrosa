import { useState } from 'react';
import { verificarEsPanaderia, calcularPreciosPorMargen } from '@/lib/utils';

export default function ModalCrearProducto({
  show, onClose, onSubmit, nuevoProd, setNuevoProd, categorias, iconosDisponibles, monedaPrecios, setMonedaPrecios, tasa
}) {
  // Estado para controlar el porcentaje de ganancia al detal (por defecto 30%)
  const [margenDetal, setMargenDetal] = useState(30);

  if (!show) return null;

  // Detectar si la categoría seleccionada es Panadería o Pastelería
  const categoriaActual = categorias.find(c => c.id_categoria === Number(nuevoProd.id_categoria));
  const nombreCat = categoriaActual?.nombre?.toLowerCase() || '';
  const esPanaderia = verificarEsPanaderia(nombreCat);

  // Manejador para productos de reventa (calcula precio detal basado en inversión y margen)
  const actualizarConNuevosPrecios = (inversion, mDetal, moneda) => {
    // Para productos normales, solo usamos margen detal (margen mayor = 0)
    const precios = calcularPreciosPorMargen(inversion, mDetal, 0, moneda, tasa);
    setNuevoProd(prev => ({
      ...prev,
      precio_inversion: inversion,
      precio_detal: precios.precio_detal,
      precio_mayor: '' // No aplica precio mayor para productos que no son de panadería
    }));
  };

  const handleInversionChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setNuevoProd({ ...nuevoProd, precio_inversion: '', precio_detal: '', precio_mayor: '' });
      return;
    }
    if (!val.toLowerCase().includes('e')) {
      actualizarConNuevosPrecios(val, margenDetal, monedaPrecios);
    }
  };

  const handleMargenDetalChange = (e) => {
    const val = parseFloat(e.target.value) || 0;
    setMargenDetal(val);
    actualizarConNuevosPrecios(nuevoProd.precio_inversion, val, monedaPrecios);
  };

  const handleCambioMoneda = (tipo, moneda) => {
    const updatedMoneda = { ...monedaPrecios, [tipo]: moneda };
    setMonedaPrecios(updatedMoneda);
    if (!esPanaderia) {
      actualizarConNuevosPrecios(nuevoProd.precio_inversion, margenDetal, updatedMoneda);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-slate-800">Registrar Nuevo Producto</h3>
        <form onSubmit={onSubmit} className="space-y-3">
          
          <div>
            <label className="text-xs font-semibold text-slate-600">Nombre del Producto</label>
            <input 
              type="text" required 
              placeholder={esPanaderia ? "Ej. Pan Canilla" : "Ej. Refresco 2L"} 
              value={nuevoProd.nombre} 
              onChange={e => setNuevoProd({...nuevoProd, nombre: e.target.value})} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">Categoría</label>
              <select 
                value={nuevoProd.id_categoria} 
                onChange={e => setNuevoProd({...nuevoProd, id_categoria: Number(e.target.value)})} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {categorias.map(cat => (<option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Ícono</label>
              <select 
                value={nuevoProd.id_icono} 
                onChange={e => setNuevoProd({...nuevoProd, id_icono: Number(e.target.value)})} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-base mt-1 text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {iconosDisponibles.map((ico) => (<option key={ico.id_icono} value={ico.id_icono}>{ico.simbolo}</option>))}
              </select>
            </div>
          </div>

          {/* SECCIÓN DE INVERSIÓN Y MARGEN - Solo visible si NO es panadería/pastelería */}
          {!esPanaderia && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Precio Inversión Unitario</label>
                <div className="relative mt-1">
                  <input 
                    id="precio_inversion" name="precio_inversion" type="number" step="0.01" min="0" max="999999.99" required
                    value={nuevoProd.precio_inversion} 
                    onChange={handleInversionChange} 
                    onKeyDown={e => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} 
                    placeholder="0.00"
                    className="w-full bg-white border border-slate-200 rounded-lg px-10 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-500" 
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">Bs.</span>
                </div>
              </div>

              <div className="pt-1 border-t border-slate-200">
                <label className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
                  <span>Margen de Ganancia %</span>
                </label>
                <div className="relative mt-1">
                  <input
                    id="margen_detal" 
                    name="margen_detal" 
                    type="number"
                    min="0" 
                    max="100" 
                    step="1"
                    onKeyDown={e => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                    placeholder="30" 
                    required 
                    value={margenDetal} 
                    onChange={handleMargenDetalChange}
                    className="w-full bg-white border border-slate-200 rounded-lg px-7 py-1.5 text-xs font-semibold text-slate-700 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
                </div>
              </div>
            </div>
          )}

          {/* Precio Detal (Para todos los productos) */}
          <div>
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-600">Precio De Venta</label>
              <div className="flex bg-slate-200 p-0.5 rounded-lg text-[10px] font-bold">
                <button type="button" onClick={() => handleCambioMoneda('detal', 'BS')} className={`px-2 py-0.5 rounded-md transition-colors ${monedaPrecios.detal === 'BS' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-300'}`}>Bs.</button>
                <button type="button" onClick={() => handleCambioMoneda('detal', 'USD')} className={`px-2 py-0.5 rounded-md transition-colors ${monedaPrecios.detal === 'USD' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-300'}`}>$</button>
              </div>
            </div>
            <div className="relative mt-1">
              <input 
                id="precio_detal" name="precio_detal" type="number" step="0.01" min="0" max="999999.99" placeholder="0.00" required 
                value={nuevoProd.precio_detal} 
                onChange={e => {
                  const val = e.target.value;
                  if (val === '') return setNuevoProd({...nuevoProd, precio_detal: ''});
                  const num = parseFloat(val);
                  if (!isNaN(num) && !val.toLowerCase().includes('e') && num <= 999999.99) setNuevoProd({...nuevoProd, precio_detal: val});
                }} 
                onKeyDown={e => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-500" 
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                {monedaPrecios.detal === 'BS' ? 'Bs.' : '$'}
              </span>
            </div>
          </div>

          {/* Precio Mayor y Cantidad Mínima - SOLO VISIBLES si ES Panadería o Pastelería */}
          {esPanaderia && (
            <>
              <div>
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-600">Precio al Mayor</label>
                  <div className="flex bg-slate-200 p-0.5 rounded-lg text-[10px] font-bold">
                    <button type="button" onClick={() => handleCambioMoneda('mayor', 'BS')} className={`px-2 py-0.5 rounded-md transition-colors ${monedaPrecios.mayor === 'BS' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-300'}`}>Bs.</button>
                    <button type="button" onClick={() => handleCambioMoneda('mayor', 'USD')} className={`px-2 py-0.5 rounded-md transition-colors ${monedaPrecios.mayor === 'USD' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-300'}`}>$</button>
                  </div>
                </div>
                <div className="relative mt-1">
                  <input 
                    id="precio_mayor" name="precio_mayor" type="number" step="0.01" min="0" max="999999.99" placeholder="0.00" required={esPanaderia}
                    value={nuevoProd.precio_mayor} 
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '') return setNuevoProd({...nuevoProd, precio_mayor: ''});
                      const num = parseFloat(val);
                      if (!isNaN(num) && !val.toLowerCase().includes('e') && num <= 999999.99) setNuevoProd({...nuevoProd, precio_mayor: val});
                    }} 
                    onKeyDown={e => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-500" 
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                    {monedaPrecios.mayor === 'BS' ? 'Bs.' : '$'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Cantidad Mínima para Precio Mayor</label>
                <input 
                  id="min_mayor" name="min_mayor" type="number" step="1" min="0" max="999999" placeholder="0" required={esPanaderia}
                  value={nuevoProd.cant_min_mayor || ''} 
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '') return setNuevoProd({...nuevoProd, cant_min_mayor: ''});
                    const num = parseInt(val, 10);
                    if (!isNaN(num) && !val.toLowerCase().includes('e') && num <= 999999) setNuevoProd({...nuevoProd, cant_min_mayor: num});
                  }} 
                  onKeyDown={e => ['e', 'E', '+', '-', '.', ','].includes(e.key) && e.preventDefault()} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-center mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500" 
                />
              </div>
            </>
          )}

          {/* Stock Inicial - Solo visible si NO es panadería */}
          {!esPanaderia && (
            <div>
              <label className="text-xs font-semibold text-slate-600">Stock Total</label>
              <input 
                id="stock" name="stock" type="number" step="1" min="0" max="999999" placeholder="0" required={!esPanaderia}
                value={nuevoProd.stock} 
                onChange={e => {
                  const val = e.target.value;
                  if (val === '') return setNuevoProd({...nuevoProd, stock: ''});
                  const num = parseInt(val, 10);
                  if (!isNaN(num) && !val.toLowerCase().includes('e') && num <= 999999) setNuevoProd({...nuevoProd, stock: num});
                }} 
                onKeyDown={e => ['e', 'E', '+', '-', '.', ','].includes(e.key) && e.preventDefault()} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-center mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500" 
              />
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold py-2.5 rounded-xl transition-colors">
              Cancelar
            </button>
            <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold py-2.5 rounded-xl transition-colors shadow-sm">
              Guardar Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}