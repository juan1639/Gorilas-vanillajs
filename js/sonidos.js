// Efectos de sonido
import { AUDIO_DIR, VOLUMEN, SONIDOS_SPECS } from './config.js';

// Si falta un archivo de audio, ese sonido simplemente no suena.
export class Sonidos {
  constructor() {
    this.activo = true;
    this.base = {};
    this.sonando = new Set();
    for (const [clave, archivo] of Object.entries(SONIDOS_SPECS)) {
      const a = new Audio(AUDIO_DIR + archivo);
      a.preload = 'auto';
      a.addEventListener('error', () => { delete this.base[clave]; });
      this.base[clave] = a;
    }
  }

  reproducir(clave) {
    const base = this.base[clave];
    if (!this.activo || !base) return;
    const a = base.cloneNode();       // copia para que puedan solaparse
    a.volume = VOLUMEN;
    this.sonando.add(a);
    a.addEventListener('ended', () => this.sonando.delete(a));
    a.play().catch(() => this.sonando.delete(a));
  }

  pararTodo() {
    for (const a of this.sonando) a.pause();
    this.sonando.clear();
  }

  alternar() {
    this.activo = !this.activo;
    if (!this.activo) this.pararTodo();
    return this.activo;
  }
}
