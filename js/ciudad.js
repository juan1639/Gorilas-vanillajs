// Ciudad: edificios generados al azar, cráteres y colisiones
import {
  ANCHO, ALTO, ANCHO_EDIFICIO_MIN, ANCHO_EDIFICIO_MAX, ALTO_EDIFICIO_MIN, ALTO_EDIFICIO_MAX,
  SEPARACION_EDIFICIOS, PROB_VENTANA_ENCENDIDA, COLORES,
} from './config.js';
import { azar, crearLienzo } from './utilidades.js';

export class Ciudad {
  constructor() {
    this.lienzo = crearLienzo(ANCHO, ALTO);
    this.ctx = this.lienzo.getContext('2d', { willReadFrequently: true });
    this.edificios = [];
    this.generar();
    this.actualizarColisiones();
  }

  generar() {
    const anchos = [];
    let total = 0;
    while (total < ANCHO) {
      const w = azar(ANCHO_EDIFICIO_MIN, ANCHO_EDIFICIO_MAX);
      anchos.push(w);
      total += w;
    }
    anchos[anchos.length - 1] -= total - ANCHO;
    if (anchos[anchos.length - 1] < ANCHO_EDIFICIO_MIN / 2) {
      const resto = anchos.pop();
      anchos[anchos.length - 1] += resto;
    }

    const g = this.ctx;
    let x = 0;
    for (const anchoTotal of anchos) {
      const w = anchoTotal - SEPARACION_EDIFICIOS;
      const top = ALTO - azar(ALTO_EDIFICIO_MIN, ALTO_EDIFICIO_MAX);
      g.fillStyle = COLORES.edificios[azar(0, COLORES.edificios.length - 1)];
      g.fillRect(x, top, w, ALTO - top);
      for (let vx = x + 5; vx + 6 <= x + w - 4; vx += 12) {
        for (let vy = top + 6; vy + 10 <= ALTO - 4; vy += 18) {
          g.fillStyle = Math.random() < PROB_VENTANA_ENCENDIDA ? COLORES.ventanaOn : COLORES.ventanaOff;
          g.fillRect(vx, vy, 6, 10);
        }
      }
      this.edificios.push({ x, w, top });
      x += anchoTotal;
    }
  }

  actualizarColisiones() {
    this.datos = this.ctx.getImageData(0, 0, ANCHO, ALTO).data;
  }

  solido(x, y) {
    x = Math.floor(x); y = Math.floor(y);
    if (x < 0 || y < 0 || x >= ANCHO || y >= ALTO) return false;
    return this.datos[(y * ANCHO + x) * 4 + 3] > 0;
  }

  crater(x, y, radio) {
    const g = this.ctx;
    g.save();
    g.globalCompositeOperation = 'destination-out';
    g.beginPath(); g.arc(x, y, radio, 0, Math.PI * 2); g.fill();
    g.restore();
    this.actualizarColisiones();
  }
}
