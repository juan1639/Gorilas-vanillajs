// Punto de entrada: carga recursos, crea el juego y conecta la interfaz HTML
import { FUENTE } from './config.js';
import { cargarSprites } from './sprites.js';
import { Sonidos } from './sonidos.js';
import { Juego } from './juego.js';

async function iniciar() {
  const canvas = document.getElementById('juego');
  const menu = document.getElementById('menu');

  try { await document.fonts.load(FUENTE); } catch (e) { /* se usa la fuente de respaldo */ }
  const sprites = await cargarSprites();

  const teclado = document.getElementById('teclado');
  teclado.hidden = true;
  const mostrarMenu = () => {
    menu.hidden = false;
    teclado.hidden = true;
    document.getElementById('nombre1').focus();
  };
  const sonidos = new Sonidos();
  const juego = new Juego(canvas, sprites, sonidos, mostrarMenu);

  const botonSonido = document.getElementById('sonido');
  botonSonido.addEventListener('click', () => {
    const activo = sonidos.alternar();
    botonSonido.textContent = activo ? 'Sonido: sí' : 'Sonido: no';
    botonSonido.setAttribute('aria-pressed', String(activo));
    botonSonido.blur();
  });

  menu.addEventListener('submit', ev => {
    ev.preventDefault();
    const leer = (id, porDefecto) => document.getElementById(id).value.trim() || porDefecto;
    const numero = (id, min, max, porDefecto) => {
      const v = parseFloat(document.getElementById(id).value);
      return isNaN(v) ? porDefecto : Math.max(min, Math.min(max, v));
    };
    const config = {
      nombres: [leer('nombre1', 'Jugador 1'), leer('nombre2', 'Jugador 2')],
      objetivo: Math.round(numero('objetivo', 1, 20, 3)),
      gravedad: numero('gravedad', 1, 50, 9.8),
    };
    menu.hidden = true;
    teclado.hidden = false;
    if (document.activeElement) document.activeElement.blur();
    juego.nuevaPartida(config);
  });

  window.addEventListener('keydown', ev => {
    if (juego.tecla(ev.key)) ev.preventDefault();
  });

  document.querySelectorAll('#teclado button').forEach(b =>
    b.addEventListener('click', () => juego.tecla(b.dataset.tecla)));
}

iniciar();
