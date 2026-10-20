// Funciones auxiliares

export const azar = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export function crearLienzo(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}
