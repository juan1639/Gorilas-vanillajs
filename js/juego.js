// Lógica del juego: estados, turnos, física del plátano e impactos
import {
  ANCHO, ALTO, ESCALA_TIEMPO, PASO_SIM, FACTOR_VIENTO, VIENTO_MAX, ANGULO_MAX, VELOCIDAD_MAX,
  RADIO_CRATER, RADIO_CRATER_GORILA, DURACION_EXPLOSION, DURACION_LANZAMIENTO, DURACION_BAILE,
  PERIODO_BAILE, VEL_GIRO_PLATANO, PERIODO_CURSOR, TAM_GORILA, TAM_SOL, POS_SOL,
} from './config.js';
import { azar } from './utilidades.js';
import { Ciudad } from './ciudad.js';
import { Render } from './render.js';

export class Juego {
  constructor(canvas, sprites, sonidos, alMostrarMenu) {
    this.render = new Render(canvas, sprites);
    this.sonidos = sonidos;
    this.alMostrarMenu = alMostrarMenu;
    this.estado = 'menu';
    this.ciudad = new Ciudad();      // ciudad de fondo para el menú
    this.gorilas = [];
    this.puntos = [0, 0];
    this.viento = 0;
    this.platano = null;
    this.explosion = null;
    this.solSorprendido = false;
    this.tiempoCursor = 0;
    this.cursorVisible = true;
    this.tiempoPose = 0;
    this.tiempoPrevio = null;
    requestAnimationFrame(t => this.bucle(t));
  }

  nuevaPartida(config) {
    this.config = config;
    this.puntos = [0, 0];
    this.quienEmpieza = 0;
    this.sonidos.pararTodo();
    this.nuevaRonda();
  }

  nuevaRonda() {
    this.ciudad = new Ciudad();
    this.viento = this.generarViento();
    const e = this.ciudad.edificios;
    const edificiosGorilas = [e[azar(1, 2)], e[e.length - 2 - azar(0, 1)]];
    this.gorilas = edificiosGorilas.map(b => ({
      x: Math.round(b.x + b.w / 2 - TAM_GORILA.w / 2),
      y: b.top - TAM_GORILA.h,
      pose: 'gorila',
      vivo: true,
    }));
    this.turno = this.quienEmpieza;
    this.quienEmpieza = 1 - this.quienEmpieza;
    this.platano = null;
    this.explosion = null;
    this.sonidos.reproducir('ronda');
    this.empezarEntrada();
  }

  generarViento() {
    let v = azar(-5, 5);
    if (azar(1, 3) === 1) v += v >= 0 ? azar(1, 5) : -azar(1, 5);
    return Math.max(-VIENTO_MAX, Math.min(VIENTO_MAX, v));
  }

  empezarEntrada() {
    this.estado = 'entrada';
    this.campo = 'angulo';
    this.textoAngulo = '';
    this.textoVelocidad = '';
    this.solSorprendido = false;
  }

  mostrarMenu() {
    this.estado = 'menu';
    this.alMostrarMenu();
  }

  // Devuelve true si la tecla la ha usado el juego
  tecla(k) {
    if (this.estado === 'entrada') {
      const prop = this.campo === 'angulo' ? 'textoAngulo' : 'textoVelocidad';
      if (/^[0-9]$/.test(k) || k === '.' || k === 'Backspace') {
        this.sonidos.reproducir('tecla');
        if (k === 'Backspace') this[prop] = this[prop].slice(0, -1);
        else if (this[prop].length < 5 && !(k === '.' && this[prop].includes('.'))) this[prop] += k;
      }
      else if (k === 'Enter') { this.sonidos.reproducir('enter'); this.confirmarCampo(); }
      else if (k === 'Escape') this.mostrarMenu();
      else return false;
      return true;
    }
    if (this.estado === 'fin') {
      if (k === 'Enter') this.nuevaPartida(this.config);
      else if (k === 'Escape') this.mostrarMenu();
      else return false;
      return true;
    }
    return false;
  }

  confirmarCampo() {
    if (this.campo === 'angulo') {
      const a = parseFloat(this.textoAngulo);
      if (isNaN(a) || a < 0 || a > ANGULO_MAX) { this.textoAngulo = ''; return; }
      this.campo = 'velocidad';
    } else {
      const v = parseFloat(this.textoVelocidad);
      if (isNaN(v) || v <= 0 || v > VELOCIDAD_MAX) { this.textoVelocidad = ''; return; }
      this.lanzar(parseFloat(this.textoAngulo), v);
    }
  }

  lanzar(anguloGrados, velocidad) {
    const gor = this.gorilas[this.turno];
    const dir = this.turno === 0 ? 1 : -1;
    const a = anguloGrados * Math.PI / 180;
    this.platano = {
      x: gor.x + TAM_GORILA.w / 2,
      y: gor.y - 4,
      vx: dir * velocidad * Math.cos(a),
      vy: -velocidad * Math.sin(a),
      giro: 0,
    };
    gor.pose = this.turno === 0 ? 'gorila_izq' : 'gorila_der';
    this.gorilaPose = this.turno;
    this.tiempoPose = DURACION_LANZAMIENTO;
    this.acumulador = 0;
    this.estado = 'vuelo';
  }

  // ---------- Actualización ----------
  bucle(t) {
    if (this.tiempoPrevio === null) this.tiempoPrevio = t;
    const dt = Math.min(0.05, (t - this.tiempoPrevio) / 1000);
    this.tiempoPrevio = t;
    this.actualizar(dt);
    this.render.dibujar(this);
    requestAnimationFrame(t2 => this.bucle(t2));
  }

  actualizar(dt) {
    this.tiempoCursor += dt;
    if (this.tiempoCursor >= PERIODO_CURSOR) {
      this.tiempoCursor = 0;
      this.cursorVisible = !this.cursorVisible;
    }
    if (this.tiempoPose > 0) {
      this.tiempoPose -= dt;
      if (this.tiempoPose <= 0 && this.estado !== 'baile') this.gorilas[this.gorilaPose].pose = 'gorila';
    }
    if (this.estado === 'vuelo') this.actualizarVuelo(dt);
    else if (this.estado === 'explosion') this.actualizarExplosion(dt);
    else if (this.estado === 'baile') this.actualizarBaile(dt);
  }

  actualizarVuelo(dt) {
    const p = this.platano;
    p.giro += VEL_GIRO_PLATANO * dt * (p.vx >= 0 ? 1 : -1);
    this.acumulador += dt * ESCALA_TIEMPO;
    while (this.acumulador >= PASO_SIM) {
      this.acumulador -= PASO_SIM;
      p.vx += this.viento * FACTOR_VIENTO * PASO_SIM;
      p.vy += this.config.gravedad * PASO_SIM;
      p.x += p.vx * PASO_SIM;
      p.y += p.vy * PASO_SIM;
      if (this.comprobarImpacto()) return;
    }
  }

  comprobarImpacto() {
    const p = this.platano;
    if (p.x < 0 || p.x >= ANCHO || p.y >= ALTO) {
      this.platano = null;
      this.siguienteTurno();
      return true;
    }
    if (p.y < 0) return false; // por encima de la pantalla: sigue volando

    for (let i = 0; i < this.gorilas.length; i++) {
      const g = this.gorilas[i];
      if (g.vivo && p.x >= g.x && p.x < g.x + TAM_GORILA.w && p.y >= g.y && p.y < g.y + TAM_GORILA.h) {
        this.impactoGorila(i);
        return true;
      }
    }

    const dxSol = p.x - (POS_SOL.x + TAM_SOL.w / 2);
    const dySol = p.y - (POS_SOL.y + TAM_SOL.h / 2);
    if (Math.hypot(dxSol, dySol) < TAM_SOL.w * 0.3) this.solSorprendido = true;

    if (this.ciudad.solido(p.x, p.y)) {
      this.empezarExplosion(p.x, p.y, RADIO_CRATER, null);
      return true;
    }
    return false;
  }

  impactoGorila(i) {
    this.ganadorRonda = i === this.turno ? 1 - this.turno : this.turno;
    const g = this.gorilas[i];
    this.empezarExplosion(g.x + TAM_GORILA.w / 2, g.y + TAM_GORILA.h / 2, RADIO_CRATER_GORILA, i);
  }

  empezarExplosion(x, y, radio, gorilaAlcanzado) {
    this.platano = null;
    this.explosion = { x, y, radio, t: 0, gorila: gorilaAlcanzado };
    this.sonidos.reproducir('explosion');
    if (gorilaAlcanzado !== null) this.gorilas[gorilaAlcanzado].vivo = false;
    this.estado = 'explosion';
  }

  actualizarExplosion(dt) {
    const e = this.explosion;
    e.t += dt;
    if (e.t < DURACION_EXPLOSION) return;
    this.ciudad.crater(e.x, e.y, e.radio);
    this.explosion = null;
    if (e.gorila !== null) {
      this.puntos[this.ganadorRonda]++;
      this.tiempoBaile = 0;
      this.sonidos.reproducir('aplausos');
      this.estado = 'baile';
    } else {
      this.siguienteTurno();
    }
  }

  actualizarBaile(dt) {
    this.tiempoBaile += dt;
    const g = this.gorilas[this.ganadorRonda];
    g.pose = Math.floor(this.tiempoBaile / PERIODO_BAILE) % 2 === 0 ? 'gorila_izq' : 'gorila_der';
    if (this.tiempoBaile < DURACION_BAILE) return;
    g.pose = 'gorila';
    if (this.puntos[this.ganadorRonda] >= this.config.objetivo) {
      this.estado = 'fin';
      this.sonidos.reproducir('fuegos');
    }
    else this.nuevaRonda();
  }

  siguienteTurno() {
    this.turno = 1 - this.turno;
    this.empezarEntrada();
  }
}
