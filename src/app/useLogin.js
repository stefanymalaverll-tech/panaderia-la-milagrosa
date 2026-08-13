'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function useLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensajeError('');
    
    const respuesta = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    const { data, error } = respuesta;

    if (error) {
      setMensajeError("Correo o contraseña incorrectos");
      setCargando(false);
      return;
    }

    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuario')
      .select('id_rol')
      .eq('email', email)
      .single();

    if (usuarioError || !usuarioData) {
      setMensajeError("Error al verificar los permisos del usuario.");
      setCargando(false);
      return;
    }

    setCargando(false);

    if (usuarioData.id_rol === 1) {
      router.push('/admin');
    } else if (usuarioData.id_rol === 2) {
      router.push('/caja');
    } else {
      setMensajeError("Rol de usuario no reconocido.");
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    cargando,
    mensajeError,
    handleLogin
  };
}