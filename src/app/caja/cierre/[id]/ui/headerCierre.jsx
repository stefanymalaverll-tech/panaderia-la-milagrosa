export default function HeaderCierre({ id, totalOrdenes }) {
  return (
    <div className="text-center mb-8 pb-6 border-b border-stone-200">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-900 mb-3 text-3xl mx-auto border border-amber-200 shadow-inner">
        🍞
      </div>
      <h2 className="text-xs font-bold uppercase tracking-widest text-amber-800 mb-1">Panadería La Milagrosa</h2>
      <h1 className="text-2xl font-black tracking-tight text-slate-900">Cierre de Caja</h1>
      
      <div 
        className="mt-6 grid grid-cols-3 gap-2 text-xs font-medium text-slate-700 p-4 rounded-none border border-stone-200 text-center" 
        style={{ backgroundColor: '#fcfbf7' }}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">CAJA ID</span>
          <strong className="text-slate-900 text-base font-black">#{id}</strong>
        </div>
        
        <div className="flex flex-col items-center justify-center text-center">
          <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">FECHA</span>
          <strong className="text-slate-900 text-sm font-bold">{new Date().toLocaleDateString()}</strong>
          <span className="text-[10px] text-slate-400 font-medium">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        <div className="flex flex-col items-center justify-center text-center">
          <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">ÓRDENES</span>
          <strong className="text-amber-800 text-base font-black flex items-center justify-center gap-1">
            🛒 {totalOrdenes}
          </strong>
        </div>
      </div>
    </div>
  );
}