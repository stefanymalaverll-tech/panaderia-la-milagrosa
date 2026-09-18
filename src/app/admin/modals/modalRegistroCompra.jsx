import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { parseNum, obtenerMontoFlotante } from '@/lib/utils/montoUtils';
import InputMontoBase from '@/componentes/ui/inputMontoBase';
import { 
  verificarEsPanaderia, 
  calcularPreciosPorMargen, 
  prepararDatosProducto 
} from '@/lib/utils/negocioUtils';

export default function ModalRegistroCompra({ show, onClose, usuarioActual, cajaActiva, tasaBcv, onCompraExitosa }) {
  const [pagadoDeCaja, setPagadoDeCaja] = useState(false);
  const [fechaCompra, setFechaCompra] = useState(new Date().toISOString().split('T')[0]);
  const [proveedor, setProveedor] = useState('');
  const [moneda, setMoneda] = useState('USD');
  const [tasaAplicada, setTasaAplicada] = useState(tasaBcv || 1);
  const [observaciones, setObservaciones] = useState('');
  
  const [productosLista, setProductosLista] = useState([]);
  const [materiasPrimasLista, setMateriasPrimasLista] = useState([]);
  const [categoriasLista, setCategoriasLista] = useState([]);
  
  const [itemsCompra, setItemsCompra] = useState([
    { tipo: 'producto', id_item: '', cantidad: 1, costo_total: '', costo_unitario: 0 }
  ]);
  const [cargando, setCargando] = useState(false);

  // Estados para el Modal de Creación Rápida
  const [showModalCrearRapido, setShowModalCrearRapido] = useState(false);
  const [indiceFilaObjetivo, setIndiceFilaObjetivo] = useState(null);
  const [tipoNuevoItem, setTipoNuevoItem] = useState('producto');
  
  // Campos del modal rápido
  const [nombreNuevoProd, setNombreNuevoProd] = useState('');
  const [idCatNuevoProd, setIdCatNuevoProd] = useState('');
  const [margenNuevoProd, setMargenNuevoProd] = useState('30');
  const [unidadNuevaMP, setUnidadNuevaMP] = useState('Kg');

  useEffect(() => {
    if (show) {
      cargarCatalogos();
      setTasaAplicada(tasaBcv || 1);
      setFechaCompra(new Date().toISOString().split('T')[0]);
    }
  }, [show, tasaBcv]);

  const cargarCatalogos = async () => {
    const { data: cats } = await supabase
      .from('categoria')
      .select('id_categoria, nombre');
    const categoriasList = cats || [];
    setCategoriasLista(categoriasList);

    const { data: prods } = await supabase
      .from('producto')
      .select('id_producto, nombre, stock, id_categoria, precio_inversion, precio_detal')
      .eq('activo', true);
    
    const productosFiltrados = (prods || []).filter(prod => {
      const cat = categoriasList.find(c => Number(c.id_categoria) === Number(prod.id_categoria));
      const nombreCat = cat ? cat.nombre : '';
      return !verificarEsPanaderia(nombreCat);
    });

    const { data: mps } = await supabase
      .from('materia_prima')
      .select('id_materiaprima, nombre, unidad, stock')
      .eq('activo', true);

    setProductosLista(productosFiltrados);
    setMateriasPrimasLista(mps || []);
  };

  if (!show) return null;

  const agregarFila = () => {
    setItemsCompra([...itemsCompra, { tipo: 'producto', id_item: '', cantidad: 1, costo_total: '', costo_unitario: 0 }]);
  };

  const actualizarFila = (index, campo, valor) => {
    const nuevos = [...itemsCompra];
    nuevos[index][campo] = valor;
    if (campo === 'tipo') {
      nuevos[index].id_item = ''; 
    }

    const cant = parseNum(campo === 'cantidad' ? valor : nuevos[index].cantidad, 0);
    const totalLinea = obtenerMontoFlotante(campo === 'costo_total' ? valor : nuevos[index].costo_total);
    
    if (cant > 0 && totalLinea > 0) {
      nuevos[index].costo_unitario = Number((totalLinea / cant).toFixed(4));
    } else {
      nuevos[index].costo_unitario = 0;
    }

    setItemsCompra(nuevos);
  };

  const eliminarFila = (index) => {
    setItemsCompra(itemsCompra.filter((_, i) => i !== index));
  };

  const calcularTotalGeneral = () => {
    return itemsCompra.reduce((acc, item) => {
      return acc + obtenerMontoFlotante(item.costo_total);
    }, 0);
  };

  const abrirModalCrearRapido = (index, tipo) => {
    setIndiceFilaObjetivo(index);
    setTipoNuevoItem(tipo);
    setNombreNuevoProd('');
    setIdCatNuevoProd(categoriasLista[0]?.id_categoria || '');
    setMargenNuevoProd('30');
    setUnidadNuevaMP('Kg');
    setShowModalCrearRapido(true);
  };

  const handleGuardarItemRapido = async (e) => {
    e.preventDefault();
    if (!nombreNuevoProd.trim()) {
      alert('Por favor indica el nombre del artículo.');
      return;
    }

    const tasaSegura = obtenerMontoFlotante(tasaAplicada, 1);
    const costoUnitarioActual = parseNum(itemsCompra[indiceFilaObjetivo]?.costo_unitario, 0);

    try {
      let idGenerado = ''; 

      if (tipoNuevoItem === 'producto') {
        if (!idCatNuevoProd) {
          alert('Por favor selecciona una categoría.'); return;
        }

        const margenNum = parseNum(margenNuevoProd, 30);
        const prodInputData = {
          nombre: nombreNuevoProd,
          id_categoria: idCatNuevoProd,
          id_icono: 1,
          precio_detal: 0, 
          stock: 0
        };

        const monedaPrecios = {
          detal: moneda === 'Bs' ? 'BS' : 'USD',
          mayor: 'USD',
          inversion: moneda === 'Bs' ? 'BS' : 'USD'
        };

        const { productoFinal } = prepararDatosProducto(prodInputData, monedaPrecios, categoriasLista, tasaSegura);

        if (costoUnitarioActual > 0) {
          const preciosCalc = calcularPreciosPorMargen(
            costoUnitarioActual, margenNum, 0, monedaPrecios, tasaSegura
          );
          const detalUSD = parseNum(preciosCalc.precio_detal, 0);
          productoFinal.precio_detal = detalUSD;
          productoFinal.precio_detal_bs = Number((detalUSD * tasaSegura).toFixed(2));
          productoFinal.precio_inversion = moneda === 'Bs' ? Number((costoUnitarioActual / tasaSegura).toFixed(2)) : Number(costoUnitarioActual.toFixed(2));
        }

        const { data: nuevoProdRes, error } = await supabase
          .from('producto')
          .insert([productoFinal])
          .select()
          .single();

        if (error) throw error;
        idGenerado = nuevoProdRes.id_producto;

      } else {
        if (!unidadNuevaMP) {
          alert('Por favor selecciona la unidad de medida.'); return;
        }

        const costoEnBs = moneda === 'USD' ? (costoUnitarioActual * tasaSegura) : costoUnitarioActual;
        const costoEnUSD = moneda === 'Bs' ? (costoUnitarioActual / tasaSegura) : costoUnitarioActual;

        const mpInputData = {
          nombre: nombreNuevoProd,
          unidad: unidadNuevaMP,
          stock: 0,
          costo: Number(costoEnUSD.toFixed(4)),
          costo_bs: Number(costoEnBs.toFixed(4)),
          moneda_base: moneda === 'USD' ? 'USD' : 'Bs'
        };

        const { data: nuevaMpRes, error } = await supabase
          .from('materia_prima')
          .insert([mpInputData])
          .select()
          .single();

        if (error) throw error;
        idGenerado = nuevaMpRes.id_materiaprima;
      }

      await cargarCatalogos();

      const nuevosItems = [...itemsCompra];
      nuevosItems[indiceFilaObjetivo].tipo = tipoNuevoItem;
      nuevosItems[indiceFilaObjetivo].id_item = String(idGenerado);
      setItemsCompra(nuevosItems);

      setShowModalCrearRapido(false);
    } catch (err) {
      console.error('Error al crear ítem rápido:', err.message);
      alert('Hubo un error al registrar el nuevo artículo.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proveedor.trim()) {
      alert('Por favor indica el proveedor o establecimiento.'); return;
    }
    if (itemsCompra.length === 0 || !itemsCompra[0].id_item) {
      alert('Agrega al menos un ítem válido a la compra.'); return;
    }

    setCargando(true);
    try {
      const tasaSegura = obtenerMontoFlotante(tasaAplicada, 1); 
      const totalGastado = parseNum(calcularTotalGeneral(), 0);
      const idUsuario = usuarioActual?.id_usuario || 1;

      const horaActual = new Date().toTimeString().split(' ')[0];
      const fechaISO = fechaCompra 
        ? new Date(`${fechaCompra}T${horaActual}`).toISOString()
        : new Date().toISOString();

      const { data: compraRes, error: errorCompra } = await supabase
        .from('compras')
        .insert([{
          proveedor: proveedor.trim(),
          total_gastado: Number(totalGastado.toFixed(2)),
          moneda,
          tasa_aplicada: Number(tasaSegura.toFixed(2)),
          id_usuario: Number(idUsuario),
          id_caja: pagadoDeCaja && cajaActiva ? cajaActiva.id_caja : null,
          observaciones: observaciones ? observaciones.trim() : null,
          fecha: fechaISO
        }])
        .select()
        .single();

      if (errorCompra) throw errorCompra;
      const idCompra = compraRes.id_compra;

      for (const item of itemsCompra) {
        const cantidadSegura = parseNum(item.cantidad, 0);
        const costoTotalSeguro = obtenerMontoFlotante(item.costo_total);
        const costoUnitarioSeguro = cantidadSegura > 0 ? costoTotalSeguro / cantidadSegura : 0;
        const subtotal = Number(costoTotalSeguro.toFixed(2));
        const isProducto = item.tipo === 'producto';

        const { error: errorDetalle } = await supabase
          .from('detalle_compra')
          .insert([{
            id_compra: Number(idCompra),
            tipo_item: item.tipo,
            id_producto: isProducto ? Number(item.id_item) : null,
            id_materiaprima: !isProducto ? Number(item.id_item) : null,
            cantidad: Number(cantidadSegura.toFixed(2)),
            costo_unitario: Number(costoUnitarioSeguro.toFixed(4)),
            subtotal
          }]);

        if (errorDetalle) throw errorDetalle;

        if (isProducto) {
          const prodActual = productosLista.find(p => String(p.id_producto) === String(item.id_item));
          const nuevoStock = parseNum(prodActual?.stock, 0) + cantidadSegura;
 
          const costoAnterior = parseNum(prodActual?.precio_inversion, 0);
          const precioDetalAnterior = parseNum(prodActual?.precio_detal, 0);
 
          let margenDetalAplicado = 30;
          if (costoAnterior > 0 && precioDetalAnterior > costoAnterior) {
            margenDetalAplicado = Math.round(100 * (1 - (costoAnterior / precioDetalAnterior)));
            if (margenDetalAplicado <= 0 || margenDetalAplicado >= 100) margenDetalAplicado = 30; 
          }

          const configMoneda = moneda === 'Bs' 
            ? { detal: 'USD', mayor: 'USD', inversion: 'BS' } 
            : { detal: 'BS', mayor: 'BS', inversion: 'USD' };

          const preciosCalculados = calcularPreciosPorMargen(
            costoUnitarioSeguro, margenDetalAplicado, 0, configMoneda, tasaSegura
          );

          const costoEnUSD = moneda === 'Bs' ? (costoUnitarioSeguro / tasaSegura) : costoUnitarioSeguro;
          const nuevoPrecioDetalUSD = parseNum(preciosCalculados.precio_detal, 0);
          const nuevoPrecioDetalBs = nuevoPrecioDetalUSD * tasaSegura;

          await supabase
            .from('producto')
            .update({ 
              stock: Number(nuevoStock.toFixed(2)),
              precio_inversion: Number(costoEnUSD.toFixed(4)),
              precio_detal: Number(nuevoPrecioDetalUSD.toFixed(2)),
              precio_detal_bs: Number(nuevoPrecioDetalBs.toFixed(2))
            })
            .eq('id_producto', Number(item.id_item));
            
        } else {
          const mpActual = materiasPrimasLista.find(m => String(m.id_materiaprima) === String(item.id_item));
          const nuevoStockMP = parseNum(mpActual?.stock, 0) + cantidadSegura;
          
          const costoEnBs = moneda === 'USD' ? (costoUnitarioSeguro * tasaSegura) : costoUnitarioSeguro;
          const costoEnUSD = moneda === 'Bs' ? (costoUnitarioSeguro / tasaSegura) : costoUnitarioSeguro;

          await supabase
            .from('materia_prima')
            .update({ 
              stock: Number(nuevoStockMP.toFixed(2)),
              costo: Number(costoEnUSD.toFixed(4)),
              costo_bs: Number(costoEnBs.toFixed(4))
            })
            .eq('id_materiaprima', Number(item.id_item));
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
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
            <span>📦</span> Registrar Compra
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Cabecera del Formulario reorganizada en bloques más limpios y proporcionales */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Proveedor (Ocupa más espacio por ser un texto largo) */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Proveedor / Establecimiento</label>
                <input 
                  type="text" 
                  value={proveedor} 
                  onChange={(e) => setProveedor(e.target.value)} 
                  placeholder="Ej. Distribuidora Mayorista C.A." 
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                />
              </div>

              {/* Fecha de Compra */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha de Compra</label>
                <input 
                  type="date" 
                  value={fechaCompra} 
                  onChange={(e) => setFechaCompra(e.target.value)} 
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 border-t border-slate-200/60">
              {/* Moneda de Factura */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Moneda de Factura</label>
                <select 
                  value={moneda} 
                  onChange={(e) => setMoneda(e.target.value)} 
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                >
                  <option value="USD">Dólares ($)</option>
                  <option value="Bs">Bolívares (Bs.)</option>
                </select>
              </div>

              {/* Tasa Aplicada (BCV) */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tasa Aplicada (BCV)</label>
                <InputMontoBase 
                  value={tasaAplicada} 
                  onChange={(formateado) => setTasaAplicada(formateado)} 
                  placeholder="0,00"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Sección de Detalle de Ítems */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Detalle de Productos o Insumos</label>
              <button 
                type="button" 
                onClick={agregarFila} 
                className="text-amber-600 hover:text-amber-700 text-xs font-bold bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition-colors border border-amber-200/60"
              >
                + Añadir otro ítem
              </button>
            </div>

            {/* Encabezados de tabla visibles solo en pantallas medianas o grandes con mejor distribución */}
            <div className="hidden md:grid grid-cols-12 gap-2 px-2 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              <div className="col-span-2">Tipo</div>
              <div className="col-span-5">Seleccionar Artículo</div>
              <div className="col-span-2 text-center">Cantidad</div>
              <div className="col-span-2 text-center">Costo Total</div>
              <div className="col-span-1 text-center" title="Costo unitario calculado automáticamente">Costo U.</div>
            </div>

            {itemsCompra.map((item, index) => {
              const listaOpciones = item.tipo === 'producto' ? productosLista : materiasPrimasLista;
              return (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-slate-50/80 p-3 md:p-2.5 rounded-xl border border-slate-200 shadow-sm">
                  {/* Tipo */}
                  <div className="md:col-span-2">
                    <span className="block md:hidden text-[10px] font-semibold text-slate-500 mb-0.5">Tipo de ítem</span>
                    <select 
                      value={item.tipo} 
                      onChange={(e) => actualizarFila(index, 'tipo', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium"
                    >
                      <option value="producto">Venta</option>
                      <option value="materia_prima">Producción</option>
                    </select>
                  </div>

                  {/* Artículo*/}
                  <div className="md:col-span-5">
                    <span className="block md:hidden text-[10px] font-semibold text-slate-500 mb-0.5">Artículo</span>
                    <select 
                      value={item.id_item} 
                      onChange={(e) => {
                        if (e.target.value === 'NUEVO_ITEM') {
                          abrirModalCrearRapido(index, item.tipo);
                        } else {
                          actualizarFila(index, 'id_item', e.target.value);
                        }
                      }} 
                      required
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs truncate"
                    >
                      <option value="">Seleccione un artículo...</option>
                      
                      {item.tipo === 'producto' && (
                        <option value="NUEVO_ITEM" className="font-bold text-amber-600">
                          ✨ + Registrar producto nuevo...
                        </option>
                      )}
                      {item.tipo === 'materia_prima' && (
                        <option value="NUEVO_ITEM" className="font-bold text-amber-600">
                          ✨ + Registrar materia prima...
                        </option>
                      )}

                      {listaOpciones.map(opt => (
                        <option key={opt.id_producto || opt.id_materiaprima} value={opt.id_producto || opt.id_materiaprima}>
                          {opt.nombre} (Stock: {opt.stock} {opt.unidad ? opt.unidad : ''})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cantidad y Costo Total*/}
                  <div className="grid grid-cols-2 md:contents gap-2">
                    <div className="md:col-span-2">
                      <span className="block md:hidden text-[10px] font-semibold text-slate-500 mb-0.5">Cantidad</span>
                      <input 
                        type="number" 
                        step="any"
                        min="0.001"
                        placeholder="Ej. 12"
                        value={item.cantidad ?? ''} 
                        onChange={(e) => actualizarFila(index, 'cantidad', e.target.value)} 
                        onKeyDown={e => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                        required
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <span className="block md:hidden text-[10px] font-semibold text-slate-500 mb-0.5">Costo Total</span>
                      <InputMontoBase 
                        placeholder="0,00"
                        value={item.costo_total} 
                        onChange={(formateado) => actualizarFila(index, 'costo_total', formateado)} 
                        required
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center"
                      />
                    </div>
                  </div>

                  {/* Costo Unitario y Botón Eliminar */}
                  <div className="flex justify-between items-center md:contents pt-1 md:pt-0">
                    <div className="md:col-span-1 text-left md:text-center text-xs md:text-[11px] text-slate-500 font-mono">
                      <span className="inline md:hidden font-semibold text-slate-600 mr-1">Costo U.:</span>
                      {item.costo_unitario ? Number(item.costo_unitario).toFixed(2) : '—'}
                    </div>

                    <div className="md:col-span-1 text-right md:text-center flex justify-end md:justify-center">
                      {itemsCompra.length > 1 && (
                        <button type="button" onClick={() => eliminarFila(index)} className="text-red-400 hover:text-red-600 font-bold px-1.5 py-1 text-xs transition-colors" title="Eliminar ítem">✕</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Observaciones y Resumen de Totales ordenados en dos columnas o bloque limpio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Observaciones</label>
              <textarea 
                value={observaciones} 
                onChange={(e) => setObservaciones(e.target.value)} 
                rows="3"
                placeholder="Número de factura o nota adicional..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              ></textarea>
            </div>

            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex justify-between items-center shadow-sm">
                <span className="text-xs font-bold text-amber-800">Total Inversión de la Compra:</span>
                <span className="text-sm font-extrabold text-amber-900">
                  {moneda === 'USD' ? '$' : 'Bs.'} {calcularTotalGeneral().toFixed(2)}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">¿Pagado con efectivo de la caja?</span>
                  <span className="text-[10px] text-slate-500">Descontará este monto del efectivo de la caja activa</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={pagadoDeCaja} 
                    onChange={(e) => setPagadoDeCaja(e.target.checked)} 
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
            <button type="submit" disabled={cargando} className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-sm disabled:opacity-50 transition-colors">
              {cargando ? 'Guardando...' : 'Guardar Compra e Ingresar Stock'}
            </button>
          </div>
        </form>
      </div>

      {/* SUB-MODAL DE CREACIÓN RÁPIDA */}
      {showModalCrearRapido && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-amber-50">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                ✨ Registrar Nuevo {tipoNuevoItem === 'producto' ? 'Producto' : 'Insumo/Materia'}
              </h4>
              <button onClick={() => setShowModalCrearRapido(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleGuardarItemRapido} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del Artículo</label>
                <input 
                  type="text"
                  value={nombreNuevoProd}
                  onChange={(e) => setNombreNuevoProd(e.target.value)}
                  placeholder={tipoNuevoItem === 'producto' ? "Ej. Refresco Cola 1.5L" : "Ej. Harina de Trigo Panadero"}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {tipoNuevoItem === 'producto' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Categoría</label>
                    <select
                      value={idCatNuevoProd}
                      onChange={(e) => setIdCatNuevoProd(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Seleccione categoría...</option>
                      {categoriasLista.map(cat => (
                        <option key={cat.id_categoria} value={cat.id_categoria}>
                          {cat.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Margen de Ganancia Detal (%)</label>
                    <input 
                      type="number"
                      step="1"
                      min="1"
                      max="99"
                      value={margenNuevoProd}
                      onChange={(e) => setMargenNuevoProd(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Se usará para calcular el precio de venta en base al costo.</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Unidad de Medida</label>
                    <select
                      value={unidadNuevaMP}
                      onChange={(e) => setUnidadNuevaMP(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Kg">Kilogramos (Kg)</option>
                      <option value="g">Gramos (g)</option>
                      <option value="L">Litros (L)</option>
                      <option value="ml">Mililitros (ml)</option>
                      <option value="Und">Unidades (Und)</option>
                      <option value="Saco">Saco</option>
                      <option value="Caja">Caja</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowModalCrearRapido(false)} 
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm"
                >
                  Crear y Seleccionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}