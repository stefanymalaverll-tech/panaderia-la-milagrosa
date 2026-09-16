'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { verificarEsPanaderia } from '@/lib/utils/negocioUtils';

export default function CatalogoProductos({ caja }) {
  const {
    tipoPrecio, setTipoPrecio,
    busqueda, setBusqueda,
    categoriasBD, categoriaSeleccionada, setCategoriaSeleccionada,
    productos, tasaBCV, agregarAlCarrito
  } = caja; 

  const inputBuscadorRef = useRef(null);
  const categoriasRef = useRef(null);

  // 🔹 Estados para visibilidad de flechas de categorías
  const [mostrarFlechaIzq, setMostrarFlechaIzq] = useState(false);
  const [mostrarFlechaDer, setMostrarFlechaDer] = useState(false);

  // ⚡ Verificar si hay desbordamiento en las categorías para mostrar/ocultar flechas
  const verificarScrollCategorias = useCallback(() => {
    if (!categoriasRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = categoriasRef.current;
    
    // Si hay scroll hacia la izquierda
    setMostrarFlechaIzq(scrollLeft > 5);
    // Si todavía queda contenido a la derecha
    setMostrarFlechaDer(scrollLeft + clientWidth < scrollWidth - 5);
  }, []);

  useEffect(() => {
    verificarScrollCategorias();
    window.addEventListener('resize', verificarScrollCategorias);
    return () => window.removeEventListener('resize', verificarScrollCategorias);
  }, [verificarScrollCategorias, categoriasBD]);

  const scrollearCategorias = (direccion) => {
    if (!categoriasRef.current) return;
    const desplazamiento = 180;
    categoriasRef.current.scrollBy({
      left: direccion === 'izq' ? -desplazamiento : desplazamiento,
      behavior: 'smooth'
    });
  };

  // ⚡ 1. Atajos de teclado para velocidad en caja
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2' || (e.key === '/' && document.activeElement.tagName !== 'INPUT')) {
        e.preventDefault();
        inputBuscadorRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setBusqueda('');
        inputBuscadorRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setBusqueda]);

  // 🔍 Búsqueda mejorada (Soporta Nombre, Código de barra y Precios Bs/USD)
  const productosFiltrados = productos
    .filter(p => {
      if (!p.activo) return false;

      const coincideCat = (categoriaSeleccionada === 'Todas' || p.categoria?.nombre === categoriaSeleccionada);
      if (!coincideCat) return false;

      if (!busqueda.trim()) return true;

      const query = busqueda.toLowerCase().trim();
      const coincideNombre = p.nombre.toLowerCase().includes(query);
      const coincideCodigo = p.codigo_barra ? p.codigo_barra.toLowerCase().includes(query) : false;
      const coincidePrecioBs = (p.precio_detal_bs?.toString() || '').includes(query);
      const coincidePrecioUSD = (p.precio_detal?.toString() || '').includes(query);

      return coincideNombre || coincideCodigo || coincidePrecioBs || coincidePrecioUSD;
    })
    .sort((a, b) => {
      const esPanaderiaA = verificarEsPanaderia(a.categoria?.nombre);
      const cantA = caja.carrito.find(item => item.id_producto === a.id_producto)?.cantidad || 0;
      const agotadoA = !esPanaderiaA && (Number(a.stock) - Number(cantA)) <= 0;

      const esPanaderiaB = verificarEsPanaderia(b.categoria?.nombre);
      const cantB = caja.carrito.find(item => item.id_producto === b.id_producto)?.cantidad || 0;
      const agotadoB = !esPanaderiaB && (Number(b.stock) - Number(cantB)) <= 0;

      if (agotadoA && !agotadoB) return 1;
      if (!agotadoA && agotadoB) return -1;
      return a.nombre.localeCompare(b.nombre);
    });

  return (
    <section className="flex flex-col gap-3 h-full min-h-0 w-full overflow-hidden">
      
      {/* 📦 CAJA 1: Encabezado (Título + Buscador + Precios) */}
      <div className="flex flex-col gap-2 shrink-0">
        <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
          Catálogo de Productos
        </span>
      
        <div className="flex items-center gap-2 w-full">
          {/* Campo de Búsqueda (flex-1 para que ocupe todo el espacio sobrante) */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">
              🔍
            </span>
            <input 
              ref={inputBuscadorRef}
              id="buscar-producto" 
              name="buscarProducto" 
              type="text" 
              placeholder="Busca el producto por nombre o precio . . ." 
              value={busqueda} 
              onChange={(e) => setBusqueda(e.target.value)} 
              onKeyDown={(e) => {
                if (e.key === 'Enter' && productosFiltrados.length === 1) {
                  const prod = productosFiltrados[0];
                  const esPan = verificarEsPanaderia(prod.categoria?.nombre);
                  const cant = caja.carrito.find(item => item.id_producto === prod.id_producto)?.cantidad || 0;
                  const sinStock = !esPan && (Number(prod.stock) - cant <= 0);

                  if (esPan || !sinStock) {
                    agregarAlCarrito(prod);
                    setBusqueda(''); 
                  }
                }
              }}
              className="w-full pl-9 pr-9 py-2.5 rounded-full bg-slate-50 border border-slate-300 text-[12px] font-medium text-slate-800 placeholder:text-slate-400 placeholder:italic focus:outline-none focus:bg-white focus:border-slate-400 transition-all" 
            />

            {busqueda && (
              <button 
                onClick={() => { setBusqueda(''); inputBuscadorRef.current?.focus(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-black bg-slate-300 hover:bg-slate-400 rounded-full w-4 h-4 flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* Selector Detal / Mayor (shrink-0 para que mantenga su tamaño ideal) */}
          <div className="bg-slate-100/80 p-0.5 rounded-xl flex gap-0.5 text-[10px] font-bold shrink-0">
            <button 
              onClick={() => setTipoPrecio('detal')} 
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-black ${
                tipoPrecio === 'detal' 
                  ? 'bg-amber-500 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Al Detal
            </button>
            <button 
              onClick={() => setTipoPrecio('mayor')} 
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-black ${
                tipoPrecio === 'mayor' 
                  ? 'bg-amber-500 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Al Mayor
            </button>
          </div>
        </div>
      </div>

      {/* 📦 CAJA 2: Categorías (Ahora abarcan el 100% del ancho solitas) */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center shrink-0 relative w-full overflow-hidden">
        
        {/* Contenedor de Categorías + Navegación con Flechas */}
        <div className="relative flex items-center flex-1 min-w-0 overflow-hidden">
          
          {/* Flecha Izquierda */}
          {mostrarFlechaIzq && (
            <button
              onClick={() => scrollearCategorias('izq')}
              className="absolute left-0 z-10 h-full px-1.5 bg-gradient-to-r from-white via-white/90 to-transparent text-slate-600 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-all"
              aria-label="Anterior categoría"
            >
              <span className="bg-slate-100 hover:bg-slate-200 p-1 rounded-full text-[10px] font-extrabold shadow-xs border border-slate-200">
                ◀
              </span>
            </button>
          )}

          {/* Lista de Categorías */}
          <div 
            ref={categoriasRef}
            onScroll={verificarScrollCategorias}
            className="flex gap-1 overflow-x-auto min-w-0 flex-1 scroll-smooth py-0.5 select-none no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categoriasBD.map((cat) => (
              <button 
                key={cat} 
                onClick={() => setCategoriaSeleccionada(cat)} 
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                  categoriaSeleccionada === cat 
                    ? 'bg-slate-900 text-amber-400 shadow-xs scale-[1.01]' 
                    : 'text-slate-600 hover:bg-slate-100 font-bold'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Flecha Derecha */}
          {mostrarFlechaDer && (
            <button
              onClick={() => scrollearCategorias('der')}
              className="absolute right-0 z-10 h-full px-1.5 bg-gradient-to-l from-white via-white/90 to-transparent text-slate-600 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-all"
              aria-label="Siguiente categoría"
            >
              <span className="bg-slate-100 hover:bg-slate-200 p-1 rounded-full text-[10px] font-extrabold shadow-xs border border-slate-200">
                ▶
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 📦 CAJA 3: Área del Grid de Productos */}
      <div className="w-full flex-1 min-h-0 overflow-y-auto pt-1 pr-4 custom-scrollbar">
        {productosFiltrados.length === 0 ? (
          <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center text-slate-400 font-semibold text-xs gap-2 py-12">
            <span className="text-3xl opacity-60">🔎</span>
            <span>No se encontraron productos coincidentes</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1 pb-4">
            {productosFiltrados.map((prod) => {
              let precioMostrarUSD, precioMostrarBs;
              if (prod.moneda_base === 'Bs') {
                precioMostrarBs = tipoPrecio === 'detal' ? Number(prod.precio_detal_bs || 0) : Number(prod.precio_mayor_bs || 0);
                precioMostrarUSD = precioMostrarBs / tasaBCV;
              } else {
                precioMostrarUSD = tipoPrecio === 'detal' ? Number(prod.precio_detal || 0) : Number(prod.precio_mayor || 0);
                precioMostrarBs = precioMostrarUSD * tasaBCV;
              }

              const esPanaderia = verificarEsPanaderia(prod.categoria?.nombre);
              const itemEnCarrito = caja.carrito.find(item => item.id_producto === prod.id_producto);
              const cantidadEnCarrito = itemEnCarrito ? Number(itemEnCarrito.cantidad) : 0;
              const stockRestante = esPanaderia ? 999 : Number((Number(prod.stock) - cantidadEnCarrito).toFixed(2)); 
              const sinStock = !esPanaderia && stockRestante <= 0;

              return (
                <div
                  key={prod.id_producto}
                  onClick={() => { if (esPanaderia || !sinStock) agregarAlCarrito(prod); }}
                  className={`group flex flex-col justify-between p-3.5 rounded-2xl transition-all duration-100 min-h-[110px] relative border bg-white select-none ${
                    (!esPanaderia && sinStock) 
                      ? 'cursor-not-allowed opacity-50 grayscale border-slate-200' 
                      : 'cursor-pointer hover:shadow-md hover:border-amber-400 active:scale-95'
                  } ${cantidadEnCarrito > 0 && !(!esPanaderia && sinStock) ? 'border-amber-400 ring-1 ring-amber-400/30' : 'border-slate-200 shadow-sm'}`}
                >
                  
                  {/* BADGE DE CANTIDAD EN CARRITO */}
                  {cantidadEnCarrito > 0 && (
                    <div className="absolute -top-2.5 -right-2 bg-slate-900 text-amber-400 border-2 border-white text-[11px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-sm z-10">
                      {cantidadEnCarrito}
                    </div>
                  )}

                  {/* Título e Ícono */}
                  <div className="flex items-start gap-2 mb-2">
                    {prod.icono_producto?.simbolo && (
                      <span className="text-[20px] shrink-0 drop-shadow-sm leading-none mt-0.5">
                        {prod.icono_producto.simbolo}
                      </span>
                    )}
                    <h3 className={`font-bold text-[13.5px] leading-snug line-clamp-2 ${
                      (!esPanaderia && sinStock) ? 'text-slate-400' : 'text-slate-800 group-hover:text-slate-950'
                    }`}>
                      {prod.nombre}
                    </h3>
                  </div>

                  {/* Precios y Badge de Stock */}
                  <div className="mt-auto flex justify-between items-end">
                    <div className="flex flex-col justify-end min-w-[50px]">
                      {!esPanaderia && (
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border uppercase tracking-tight shrink-0 w-max ${
                          sinStock
                            ? 'bg-slate-100 text-slate-500 border-slate-200'
                            : stockRestante <= 5
                              ? 'bg-red-50 text-red-600 border-red-200' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                        }`}>
                          {sinStock ? 'Agotado' : `Stock: ${stockRestante}`}
                        </span>
                      )}
                    </div>

                    <div className="text-right leading-none shrink-0">
                      <p className={`text-[13px] font-black ${sinStock ? 'text-slate-400' : 'text-slate-900'}`}>
                        Bs. {precioMostrarBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold mt-1">
                        ${precioMostrarUSD.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}