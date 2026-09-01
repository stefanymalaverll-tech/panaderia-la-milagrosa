import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { verificarEsPanaderia } from '@/lib/utils';

export default function ModalRegistroCompra({ show, onClose, usuarioActual, tasaBcv, onCompraExitosa }) {
  const [proveedor, setProveedor] = useState('');
  const [moneda, setMoneda] = useState('USD');
  const [tasaAplicada, setTasaAplicada] = useState(tasaBcv || 1);
  const [observaciones, setObservaciones] = useState('');
  
  const [productosLista, setProductosLista] = useState([]);
  const [materiasPrimasLista, setMateriasPrimasLista] = useState([]);
  
  const [itemsCompra, setItemsCompra] = useState([
    { tipo: 'producto', id_item: '', cantidad: 1, costo_unitario: 0 }
  ]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (show) {
      cargarCatalogos();
      setTasaAplicada(tasaBcv || 1);
    }
  }, [show, tasaBcv]);

  const cargarCatalogos = async () => {
    // 1. Cargar categorías para evaluar sus nombres
    const { data: cats } = await supabase
      .from('categoria')
      .select('id_categoria, nombre');
    const categoriasList = cats || [];

    // 2. Cargar productos activos
    const { data: prods } = await supabase
      .from('producto')
      .select('id_producto, nombre, stock, id_categoria')
      .eq('activo', true);
    
    // Filtrar usando la función verificarEsPanaderia para excluir lo que no sea reventa
    const productosFiltrados = (prods || []).filter(prod => {
      const cat = categoriasList.find(c => c.id_categoria === Number(prod.id_categoria));
      const nombreCat = cat ? cat.nombre : '';
      // Si verificarEsPanaderia da true, significa que es producción propia/panadería, por lo que NO debe aparecer en compras de reventa
      return !verificarEsPanaderia(nombreCat);
    });

    // 3. Cargar materias primas activas
    const { data: mps } = await supabase
      .from('materia_prima')
      .select('id_materiaprima, nombre, unidad, stock')
      .eq('activo', true);

    setProductosLista(productosFiltrados);
    setMateriasPrimasLista(mps || []);
  };

  if (!show) return null;

  const agregarFila = () => {
    setItemsCompra([...itemsCompra, { tipo: 'producto', id_item: '', cantidad: 1, costo_unitario: 0 }]);
  };

  const actualizarFila = (index, campo, valor) => {
    const nuevos = [...itemsCompra];
    nuevos[index][campo] = valor;
    if (campo === 'tipo') {
      nuevos[index].id_item = ''; 
    }
    setItemsCompra(nuevos);
  };

  const eliminarFila = (index) => {
    setItemsCompra(itemsCompra.filter((_, i) => i !== index));
  };

  const calcularTotalGeneral = () => {
    return itemsCompra.reduce((acc, item) => {
      return acc + (Number(item.cantidad) * Number(item.costo_unitario) || 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proveedor.trim()) {
      alert('Por favor indica el proveedor o establecimiento.');
      return;
    }
    if (itemsCompra.length === 0 || !itemsCompra[0].id_item) {
      alert('Agrega al menos un ítem válido a la compra.');
      return;
    }

    setCargando(true);
    try {
      const totalGastado = calcularTotalGeneral();
      const idUsuario = usuarioActual?.id_usuario || 1;

      const { data: compraRes, error: errorCompra } = await supabase
        .from('compras')
        .insert([{
          proveedor,
          total_gastado: totalGastado,
          moneda,
          tasa_aplicada: Number(tasaAplicada),
          id_usuario: idUsuario,
          observaciones
        }])
        .select()
        .single();

      if (errorCompra) throw errorCompra;
      const idCompra = compraRes.id_compra;

      for (const item of itemsCompra) {
        const subtotal = Number(item.cantidad) * Number(item.costo_unitario);
        const isProducto = item.tipo === 'producto';

        const { error: errorDetalle } = await supabase
          .from('detalle_compra')
          .insert([{
            id_compra: idCompra,
            tipo_item: item.tipo,
            id_producto: isProducto ? item.id_item : null,
            id_materiaprima: !isProducto ? item.id_item : null,
            cantidad: Number(item.cantidad),
            costo_unitario: Number(item.costo_unitario),
            subtotal
          }]);

        if (errorDetalle) throw errorDetalle;

        if (isProducto) {
          const prodActual = productosLista.find(p => String(p.id_producto) === String(item.id_item));
          const nuevoStock = Number(prodActual?.stock || 0) + Number(item.cantidad);
          const costoEnUSD = moneda === 'Bs' ? Number(item.costo_unitario) / Number(tasaAplicada) : Number(item.costo_unitario);

          await supabase
            .from('producto')
            .update({ 
              stock: nuevoStock,
              precio_inversion: costoEnUSD 
            })
            .eq('id_producto', item.id_item);

        } else {
          const mpActual = materiasPrimasLista.find(m => String(m.id_materiaprima) === String(item.id_item));
          const nuevoStockMP = Number(mpActual?.stock || 0) + Number(item.cantidad);
          
          const costoEnBs = moneda === 'USD' ? Number(item.costo_unitario) * Number(tasaAplicada) : Number(item.costo_unitario);
          const costoEnUSD = moneda === 'Bs' ? Number(item.costo_unitario) / Number(tasaAplicada) : Number(item.costo_unitario);

          await supabase
            .from('materia_prima')
            .update({ 
              stock: nuevoStockMP,
              costo: costoEnUSD,
              costo_bs: costoEnBs
            })
            .eq('id_materiaprima', item.id_item);
        }
      }

      alert('¡Compra registrada e inventario actualizado con éxito!');
      onCompraExitosa();
      onClose();
    } catch (error) {
      console.error('Error al procesar la compra:', error.message);
      alert('Hubo un error al guardar la compra.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-sm font-bold text-slate-800">📦 Registrar Compra / Entrada de Mercancía</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Proveedor</label>
              <input 
                type="text" 
                value={proveedor} 
                onChange={(e) => setProveedor(e.target.value)} 
                placeholder="Ej. Distribuidora Mayorista" 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Moneda de Factura</label>
              <select 
                value={moneda} 
                onChange={(e) => setMoneda(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="USD">Dólares ($)</option>
                <option value="Bs">Bolívares (Bs.)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tasa Aplicada (BCV)</label>
              <input 
                type="number" 
                step="any"
                value={tasaAplicada} 
                onChange={(e) => setTasaAplicada(e.target.value)} 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Detalle de Productos o Insumos</label>
              <button 
                type="button" 
                onClick={agregarFila} 
                className="text-amber-600 hover:text-amber-700 text-xs font-bold"
              >
                + Añadir otro ítem
              </button>
            </div>

            <div className="grid grid-cols-12 gap-2 px-1 text-[11px] font-bold text-slate-500 uppercase">
              <div className="col-span-2">Tipo</div>
              <div className="col-span-5">Seleccionar Artículo</div>
              <div className="col-span-2">Cantidad</div>
              <div className="col-span-2">Costo Unitario</div>
              <div className="col-span-1"></div>
            </div>

            {itemsCompra.map((item, index) => {
              const listaOpciones = item.tipo === 'producto' ? productosLista : materiasPrimasLista;
              return (
                <div key={index} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="col-span-2">
                    <select 
                      value={item.tipo} 
                      onChange={(e) => actualizarFila(index, 'tipo', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium"
                    >
                      <option value="producto">Reventa</option>
                      <option value="materia_prima">Materia Prima</option>
                    </select>
                  </div>

                  <div className="col-span-5">
                    <select 
                      value={item.id_item} 
                      onChange={(e) => actualizarFila(index, 'id_item', e.target.value)} 
                      required
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
                    >
                      <option value="">Seleccione un producto...</option>
                      {listaOpciones.map(opt => (
                        <option key={opt.id_producto || opt.id_materiaprima} value={opt.id_producto || opt.id_materiaprima}>
                          {opt.nombre} (Stock actual: {opt.stock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <input 
                      type="number" 
                      step="any"
                      min="0.001"
                      placeholder="Ej. 12"
                      value={item.cantidad} 
                      onChange={(e) => actualizarFila(index, 'cantidad', e.target.value)} 
                      required
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
                    />
                  </div>

                  <div className="col-span-2">
                    <input 
                      type="number" 
                      step="any"
                      min="0"
                      placeholder="Ej. 3.50"
                      value={item.costo_unitario} 
                      onChange={(e) => actualizarFila(index, 'costo_unitario', e.target.value)} 
                      required
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
                    />
                  </div>

                  <div className="col-span-1 text-center">
                    {itemsCompra.length > 1 && (
                      <button type="button" onClick={() => eliminarFila(index)} className="text-red-400 hover:text-red-600 font-bold px-1">✕</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Observaciones</label>
            <textarea 
              value={observaciones} 
              onChange={(e) => setObservaciones(e.target.value)} 
              rows="2"
              placeholder="Número de factura o nota adicional..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            ></textarea>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex justify-between items-center">
            <span className="text-xs font-bold text-amber-800">Total Inversión de la Compra:</span>
            <span className="text-sm font-extrabold text-amber-900">
              {moneda === 'USD' ? '$' : 'Bs.'} {calcularTotalGeneral().toFixed(2)}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
            <button type="submit" disabled={cargando} className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm disabled:opacity-50">
              {cargando ? 'Guardando...' : 'Guardar Compra e Ingresar Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}