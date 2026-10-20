// Sprites: PNG opcional en assets/ con respaldo dibujado
import { COLORES, TAM_GORILA, TAM_PLATANO, TAM_SOL, ASSETS_DIR } from './config.js';
import { crearLienzo } from './utilidades.js';

function hacerGorila(tam, brazos) { // brazos: 'abajo' | 'izq' | 'der'
  const c = crearLienzo(tam.w, tam.h);
  const g = c.getContext('2d');
  g.scale(tam.w / 30, tam.h / 30);
  g.fillStyle = COLORES.gorila;
  g.fillRect(11, 0, 8, 7);                          // cabeza
  g.fillRect(13, 7, 4, 2);                          // cuello
  g.fillRect(8, 9, 14, 10);                         // torso
  g.fillRect(8, 19, 5, 8); g.fillRect(17, 19, 5, 8); // piernas
  g.fillRect(6, 27, 7, 3); g.fillRect(17, 27, 7, 3); // pies
  if (brazos === 'izq') g.fillRect(4, 0, 4, 12); else g.fillRect(4, 9, 4, 13);
  if (brazos === 'der') g.fillRect(22, 0, 4, 12); else g.fillRect(22, 9, 4, 13);
  g.fillStyle = '#000';
  g.fillRect(12, 2, 6, 1);                          // ceja
  g.fillRect(13, 4, 1, 1); g.fillRect(16, 4, 1, 1); // ojos
  g.fillRect(11, 12, 3, 1); g.fillRect(16, 12, 3, 1); // pecho
  return c;
}

function hacerPlatano(tam) {
  const c = crearLienzo(tam.w, tam.h);
  const g = c.getContext('2d');
  g.strokeStyle = COLORES.platano;
  g.lineWidth = Math.max(2, tam.w * 0.22);
  g.lineCap = 'round';
  g.beginPath();
  g.arc(tam.w / 2, tam.h * 0.2, tam.w * 0.35, 0.15 * Math.PI, 0.85 * Math.PI);
  g.stroke();
  return c;
}

function hacerSol(tam, sorprendido) {
  const c = crearLienzo(tam.w, tam.h);
  const g = c.getContext('2d');
  const cx = tam.w / 2, cy = tam.h / 2, r = tam.w * 0.27;
  g.strokeStyle = COLORES.sol;
  g.lineWidth = 2;
  for (let i = 0; i < 16; i++) {
    const a = i * Math.PI / 8;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    g.lineTo(cx + Math.cos(a) * tam.w * 0.48, cy + Math.sin(a) * tam.h * 0.48);
    g.stroke();
  }
  g.fillStyle = COLORES.sol;
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = COLORES.cielo;
  g.fillRect(cx - r * 0.5, cy - r * 0.35, 3, 3);
  g.fillRect(cx + r * 0.5 - 3, cy - r * 0.35, 3, 3);
  if (sorprendido) {
    g.beginPath(); g.arc(cx, cy + r * 0.4, r * 0.25, 0, Math.PI * 2); g.fill();
  } else {
    g.strokeStyle = COLORES.cielo;
    g.lineWidth = 2;
    g.beginPath(); g.arc(cx, cy + r * 0.05, r * 0.55, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke();
  }
  return c;
}

// clave -> [archivo PNG en assets/, tamaño, función de respaldo]
const SPRITE_SPECS = {
  gorila:          ['gorila.png',           TAM_GORILA,  t => hacerGorila(t, 'abajo')],
  gorila_izq:      ['gorila_brazo_izq.png', TAM_GORILA,  t => hacerGorila(t, 'izq')],
  gorila_der:      ['gorila_brazo_der.png', TAM_GORILA,  t => hacerGorila(t, 'der')],
  platano:         ['platano.png',          TAM_PLATANO, hacerPlatano],
  sol:             ['sol.png',              TAM_SOL,     t => hacerSol(t, false)],
  sol_sorprendido: ['sol_sorprendido.png',  TAM_SOL,     t => hacerSol(t, true)],
};

function cargarImagen(archivo, tam, respaldo) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const c = crearLienzo(tam.w, tam.h);
      c.getContext('2d').drawImage(img, 0, 0, tam.w, tam.h);
      resolve(c);
    };
    img.onerror = () => resolve(respaldo(tam));
    img.src = ASSETS_DIR + archivo;
  });
}

export async function cargarSprites() {
  const entradas = await Promise.all(
    Object.entries(SPRITE_SPECS).map(async ([clave, [archivo, tam, respaldo]]) =>
      [clave, await cargarImagen(archivo, tam, respaldo)])
  );
  return Object.fromEntries(entradas);
}
