export const verificarEsPanaderia = (nombreCategoria) => {
  if (!nombreCategoria) return false;
  const nombre = nombreCategoria.toLowerCase();
  return nombre.includes('panadería') || 
         nombre.includes('panaderia') || 
         nombre.includes('pan') || 
         nombre.includes('pastelería') || 
         nombre.includes('pasteleria') || 
         nombre.includes('pastel') || 
         nombre.includes('postre');
};