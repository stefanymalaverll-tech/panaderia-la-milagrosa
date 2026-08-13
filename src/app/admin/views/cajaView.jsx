import { Eye } from 'lucide-react';

export default function CajaView({
  tipoFiltro, setTipoFiltro, fechaInicio, setFechaInicio, fechaFin, setFechaFin,
  statsCaja, historialCaja, handleVerDetallesCaja
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-800">Reportes de Caja</h2>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button onClick={() => setTipoFiltro('semanal')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${tipoFiltro === 'semanal' ? 'bg-slate-800 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>📅 Semanal</button>
          <button onClick={() => setTipoFiltro('quincenal')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${tipoFiltro === 'quincenal' ? 'bg-slate-800 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>⚡ Quincenal</button>
          <button onClick={() => setTipoFiltro('mensual')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${tipoFiltro === 'mensual' ? 'bg-slate-800 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>🗓️ Mensual</button>
          <button onClick={() => setTipoFiltro('personalizado')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${tipoFiltro === 'personalizado' ? 'bg-slate-800 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>🔍 Personalizado</button>
        </div>

        {tipoFiltro === 'personalizado' && (
          <div className="flex items-center gap-2 w-full md:w-auto animate-fadeIn">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Desde</label>
              <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-400" />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Hasta</label>
              <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-400" />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between border-l-4 border-l-amber-500">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ingresos Totales (Cajas Cerradas)</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">${statsCaja.ingresosUSD.toFixed(2)}</h3>
            <p className="text-sm font-bold text-slate-800 mt-1">Bs. {statsCaja.ingresosBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-amber-100 p-3 rounded-xl text-2xl">📈</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between border-l-4 border-l-blue-500">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Turnos Completados</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{statsCaja.turnosCerrados}</h3>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl text-2xl">👥</div>
        </div>

        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between border-l-4 ${statsCaja.descuadreUSD < 0 || statsCaja.descuadreBs < 0 ? 'border-l-red-500' : 'border-l-green-500'}`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Balance de Descuadres</p>
            <h3 className={`text-xl font-extrabold mt-1 ${statsCaja.descuadreUSD < 0 ? 'text-red-600' : 'text-green-600'}`}>${statsCaja.descuadreUSD.toFixed(2)} USD</h3>
            <h3 className={`text-xl font-extrabold mt-1 ${statsCaja.descuadreBs < 0 ? 'text-red-600' : 'text-green-600'}`}>Bs. {statsCaja.descuadreBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</h3>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl text-2xl">⚖️</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-1">📋 Historial de Turnos y Arqueos</h2>
        <p className="text-xs text-slate-500 mb-6">Auditoría de cierres y arqueos de caja.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700 uppercase text-xs">
              <tr>
                <th className="p-3 rounded-l-lg">Turno / Cajero</th>
                <th className="p-3">Horario</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Fondo Inicial</th>
                <th className="p-3">Cierre USD</th>
                <th className="p-3">Cierre Bs</th>
                <th className="p-3">Auditoría (Descuadre)</th>
                <th className="p-3 rounded-r-lg text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historialCaja.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-6 text-center text-slate-500">No hay registros de cajas para el período seleccionado.</td>
                </tr>
              ) : (
                historialCaja.map((caja) => {
                  const diferenciaTotal = caja.detalle_cierre_caja?.reduce((acc, det) => acc + Number(det.diferencia || 0), 0) || 0;
                  let esperadoUSD = 0, contadoUSD = 0, esperadoBs = 0, contadoBs = 0;

                  caja.detalle_cierre_caja?.forEach(det => {
                    const esp = Number(det.monto_esperado || 0);
                    const cont = Number(det.monto_contado || 0);
                    const moneda = det.pago?.moneda?.toUpperCase();
                    if (moneda === 'USD') { esperadoUSD += esp; contadoUSD += cont; }
                    else if (moneda === 'BS') { esperadoBs += esp; contadoBs += cont; }
                  });

                  return (
                    <tr key={caja.id_caja} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-bold text-slate-700">Turno #{caja.id_caja}</div>
                        <div className="text-xs font-medium text-slate-500 bg-slate-100 inline-block px-2 py-0.5 rounded mt-1">{caja.usuario?.nombre || 'Desconocido'}</div>
                      </td>
                      <td className="p-3 text-slate-600 text-xs">
                        <div><span className="font-bold text-slate-400">Apertura:</span> {new Date(caja.hora_apertura).toLocaleString()}</div>
                        <div><span className="font-bold text-slate-400">Cierre:</span> {caja.hora_cierre ? new Date(caja.hora_cierre).toLocaleString() : '---'}</div>
                      </td>
                      <td className="p-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold shadow-sm border ${caja.status?.toLowerCase() === 'abierto' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                          {caja.status?.toLowerCase() === 'abierto' ? '🟢 En Curso' : '⚫ Cerrado'}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-600">Bs. {Number(caja.monto_apertura).toFixed(2)}</td>
                      <td className="p-3 text-xs whitespace-nowrap">
                        <div><span className="text-slate-500">Esperado: <span className="font-bold text-slate-600">${esperadoUSD.toFixed(2)}</span></span></div>
                        <div><span className="text-slate-500">Contado: <span className="font-bold text-slate-600">${contadoUSD.toFixed(2)}</span></span></div>
                      </td>
                      <td className="p-3 text-xs whitespace-nowrap">
                        <div><span className="text-slate-500">Esperado: <span className="font-bold text-slate-600">Bs. {esperadoBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span></span></div>
                        <div><span className="text-slate-500">Contado: <span className="font-bold text-slate-600">Bs. {contadoBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span></span></div>
                      </td>
                      <td className="p-3">
                        {caja.status?.toLowerCase() === 'abierto' ? (
                          <span className="text-slate-400 italic text-xs">Esperando cierre...</span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <span className={`font-bold text-xs ${diferenciaTotal === 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {diferenciaTotal === 0 ? '✅ Cuadre Exacto' : `⚠️ Diferencia: ${diferenciaTotal.toFixed(2)}`}
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {caja.detalle_cierre_caja?.map((det, idx) => (
                                <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                                  {det.pago?.nombre}: {Number(det.diferencia).toFixed(2)} {det.pago?.moneda}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center flex justify-center">
                        <button onClick={() => handleVerDetallesCaja(caja)} title="Ver Facturas del Turno" className="flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-300 p-2 rounded-xl transition-all cursor-pointer shadow-sm group">
                          <Eye className="w-5 h-5 transition-transform group-hover:scale-110" strokeWidth={1.5} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}