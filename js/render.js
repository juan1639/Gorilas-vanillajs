// Dibujo: pinta en el canvas el estado actual del juego (no modifica nada)
import {
  ANCHO, ALTO, DURACION_EXPLOSION, TAM_PLATANO, TAM_SOL, POS_SOL,
  COLORES, FUENTE, FUENTE_GRANDE,
} from './config.js';

export class Render {
  constructor(canvas, sprites) {
    this.ctx = canvas.getContext('2d');
    this.sprites = sprites;
  }

  texto(t, x, y, alin = 'left', color = COLORES.texto, fuente = FUENTE) {
    const g = this.ctx;
    g.font = fuente;
    g.textAlign = alin;
    g.textBaseline = 'top';
    g.fillStyle = color;
    g.fillText(t, x, y);
  }

  dibujar(juego) {
    const g = this.ctx;
    g.fillStyle = COLORES.cielo;
    g.fillRect(0, 0, ANCHO, ALTO);

    g.drawImage(juego.solSorprendido ? this.sprites.sol_sorprendido : this.sprites.sol, POS_SOL.x, POS_SOL.y);
    g.drawImage(juego.ciudad.lienzo, 0, 0);
    if (juego.estado === 'menu') return;

    for (const gor of juego.gorilas) {
      if (gor.vivo) g.drawImage(this.sprites[gor.pose], gor.x, gor.y);
    }

    if (juego.platano) {
      const p = juego.platano;
      g.save();
      g.translate(p.x, p.y);
      g.rotate(p.giro);
      g.drawImage(this.sprites.platano, -TAM_PLATANO.w / 2, -TAM_PLATANO.h / 2);
      g.restore();
    }

    if (juego.explosion) this.dibujarExplosion(juego.explosion);
    this.dibujarHUD(juego);
    if (juego.estado === 'fin') this.dibujarFin(juego);
  }

  dibujarExplosion(e) {
    const g = this.ctx;
    const k = Math.min(1, e.t / (DURACION_EXPLOSION * 0.6));
    g.fillStyle = COLORES.explosion;
    g.beginPath(); g.arc(e.x, e.y, e.radio * k, 0, Math.PI * 2); g.fill();
    g.fillStyle = COLORES.explosionCentro;
    g.beginPath(); g.arc(e.x, e.y, e.radio * k * 0.5, 0, Math.PI * 2); g.fill();
  }

  dibujarHUD(juego) {
    const g = this.ctx;
    const [n1, n2] = juego.config.nombres;

    this.texto(n1, 10, 6, 'left', juego.turno === 0 ? COLORES.ventanaOn : COLORES.texto);
    this.texto(n2, ANCHO - 10, 6, 'right', juego.turno === 1 ? COLORES.ventanaOn : COLORES.texto);

    if (juego.estado === 'entrada') {
      const x = juego.turno === 0 ? 10 : ANCHO - 10;
      const alin = juego.turno === 0 ? 'left' : 'right';
      const cursor = juego.cursorVisible ? '_' : ' ';
      const sufAngulo = juego.campo === 'angulo' ? cursor : ' ';
      this.texto(`Ángulo (0 - 90): ${juego.textoAngulo}${sufAngulo}`, x, 30, alin);
      if (juego.campo === 'velocidad') this.texto(`Velocidad (1 - 200): ${juego.textoVelocidad}${cursor}`, x, 54, alin);
    }

    // Viento: flecha bajo el sol
    const yv = POS_SOL.y + TAM_SOL.h + 8;
    this.texto(juego.viento === 0 ? 'sin viento' : 'viento', ANCHO / 2, yv, 'center', COLORES.textoSuave);
    if (juego.viento !== 0) {
      const largo = juego.viento * 5;
      const ya = yv + 28;
      const x0 = ANCHO / 2, x1 = x0 + largo;
      const s = Math.sign(largo);
      g.strokeStyle = COLORES.viento;
      g.fillStyle = COLORES.viento;
      g.lineWidth = 3;
      g.beginPath(); g.moveTo(x0, ya); g.lineTo(x1, ya); g.stroke();
      g.beginPath(); g.moveTo(x1 + s * 6, ya); g.lineTo(x1, ya - 6); g.lineTo(x1, ya + 6); g.closePath(); g.fill();
    }

    // Marcador
    const marcador = `${n1}   [ ${juego.puntos[0]} - ${juego.puntos[1]} ]   ${n2}`;
    g.font = FUENTE;
    const w = g.measureText(marcador).width + 24;
    g.fillStyle = COLORES.panel;
    g.fillRect(ANCHO / 2 - w / 2, ALTO - 32, w, 26);
    this.texto(marcador, ANCHO / 2, ALTO - 30, 'center');
  }

  dibujarFin(juego) {
    const g = this.ctx;
    const [n1, n2] = juego.config.nombres;
    const ganador = juego.puntos[0] > juego.puntos[1] ? n1 : n2;
    g.fillStyle = COLORES.panelFin;
    g.fillRect(ANCHO / 2 - 280, 150, 560, 170);
    g.strokeStyle = COLORES.texto;
    g.lineWidth = 2;
    g.strokeRect(ANCHO / 2 - 276, 154, 552, 162);
    this.texto('FIN DE LA PARTIDA', ANCHO / 2, 166, 'center', COLORES.ventanaOn, FUENTE_GRANDE);
    this.texto(`¡Gana ${ganador}!  ${juego.puntos[0]} - ${juego.puntos[1]}`, ANCHO / 2, 226, 'center');
    this.texto('Enter: revancha   ·   Esc: menú', ANCHO / 2, 276, 'center', COLORES.textoSuave);
  }
}
