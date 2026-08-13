export default function UsuarioView({ usuariosSistema }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-6">👥 Usuarios y Roles del Sistema</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700 uppercase text-xs">
            <tr>
              <th className="p-3 rounded-l-lg">ID</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Correo Electrónico</th>
              <th className="p-3 rounded-r-lg">Rol / Permisos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {usuariosSistema.map((usr) => (
              <tr key={usr.id_usuario} className="hover:bg-slate-50">
                <td className="p-3 text-slate-600">{usr.id_usuario}</td>
                <td className="p-3 font-medium text-slate-800">{usr.nombre}</td>
                <td className="p-3 text-slate-600">{usr.email}</td>
                <td className="p-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${usr.id_rol === 1 ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                    {usr.id_rol === 1 ? 'Administrador' : 'Cajero'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}