export default function SmsNotificacion({ notificacion }) {
  if (!notificacion.show) return null;

  return (
    <div
      className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border transition-all animate-bounce ${
        notificacion.tipo === 'error'
          ? 'bg-red-900 border-red-700'
          : 'bg-slate-900 border-slate-700'
      }`}
    >
      <span className="text-lg">{notificacion.tipo === 'error' ? '❌' : '✨'}</span>
      <p className="text-xs font-bold">{notificacion.mensaje}</p>
    </div>
  );
}