'use client';

import { useLogin } from './useLogin';

export default function Home() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    cargando,
    mensajeError,
    handleLogin
  } = useLogin();

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-amber-50 relative overflow-hidden"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(217, 119, 6, 0.09) 15px, transparent 2px),
          linear-gradient(to bottom, rgba(217, 119, 6, 0.10) 15px, transparent 2px)
        `,
        backgroundSize: '40px 40px'
      }}
    > 
      <div className="w-full max-w-md bg-white/65 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-amber-100 flex flex-col items-center">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-3xl mb-3 shadow-inner mx-auto">
            🍞
          </div>
          <h1 className="text-2xl font-bold text-amber-950">Panadería La Milagrosa</h1>
          <p className="text-sm text-amber-800/70 mt-1">Ingresa los datos para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <input 
              id="email"
              name="email"
              autoComplete="email"
              type="email"
              placeholder="ejemplo@gmail.com" 
              className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/40 text-amber-950 placeholder-amber-800/40 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
              Contraseña
            </label>
            <input 
              id="password"
              name="password"
              autoComplete="current-password"
              type="password" 
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/40 text-amber-950 placeholder-amber-800/40 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {mensajeError && (
            <div className="text-center py-1">
              <p className="text-red-600 text-xs font-semibold animate-fade-in">
                {mensajeError}
              </p>
            </div>
          )}

          <button 
            type="submit"
            disabled={cargando} 
            className="w-full mt-2 py-3.5 px-4 bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-semibold rounded-xl shadow-lg shadow-amber-600/20 transition-all duration-200 cursor-pointer"
          >
            {cargando ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </main>
  );
}