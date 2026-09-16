/* Cambia el estado (activo/inactivo) de cualquier entidad */
export const estadoEntidad = async (supabase, tabla, columnaId, idValor, estadoActual) => {
  const { error } = await supabase
    .from(tabla)
    .update({ activo: !estadoActual })
    .eq(columnaId, idValor);

  if (error) throw error;
  return !estadoActual;
};

/* Registra un movimiento de auditoría dinámico (sirve para productos y materia prima)*/
export const registrarMovimientoInventario = async ({
  supabase,
  tablaAuditoria,
  columnaForanea,
  idEntidad,
  idUsuario,
  diferenciaStock,
  descripcion
}) => {
  if (diferenciaStock === 0) return;

  const { error } = await supabase.from(tablaAuditoria).insert([{
    [columnaForanea]: idEntidad,
    id_usuario: idUsuario,
    id_registro: diferenciaStock > 0 ? 1 : 2, // 1: Entrada, 2: Salida
    cantidad: Math.abs(diferenciaStock),
    descripcion: descripcion || `Ajuste de inventario. Diferencia: ${diferenciaStock > 0 ? '+' : ''}${diferenciaStock}`
  }]);

  if (error) throw error;
};

/* Función para CREAR o ACTUALIZAR cualquier entidad con inventario*/
export const guardarEntidadConInventario = async ({
  supabase,
  esActualizacion,
  tablaPrincipal,
  tablaAuditoria,
  columnaId,
  datosEntidad,
  idUsuario,
  idEntidad = null,
  stockViejo = 0,
  stockNuevo = 0,
  descripcionAuditoria = ''
}) => {
  let entidadResultante = null;

  if (esActualizacion) {
    // 1. Validar y registrar diferencia de stock primero (por seguridad)
    const diferenciaStock = stockNuevo - stockViejo;
    await registrarMovimientoInventario({
      supabase, tablaAuditoria, columnaForanea: columnaId,
      idEntidad, idUsuario, diferenciaStock, descripcion: descripcionAuditoria
    });

    // 2. Actualizar registro principal
    const { data, error } = await supabase
      .from(tablaPrincipal)
      .update(datosEntidad)
      .eq(columnaId, idEntidad)
      .select()
      .single();

    if (error) throw error;
    entidadResultante = data;

  } else {
    // 1. Crear registro principal
    const { data, error } = await supabase
      .from(tablaPrincipal)
      .insert([datosEntidad])
      .select()
      .single();

    if (error) throw error;
    entidadResultante = data;

    // 2. Registrar inventario inicial si aplica
    await registrarMovimientoInventario({
      supabase, tablaAuditoria, columnaForanea: columnaId,
      idEntidad: entidadResultante[columnaId], idUsuario, diferenciaStock: stockNuevo, descripcion: descripcionAuditoria
    });
  }

  return entidadResultante;
};