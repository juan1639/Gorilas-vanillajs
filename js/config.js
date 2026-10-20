// Constantes ajustables del juego

export const ANCHO = 800;
export const ALTO = 500;

export const ESCALA_TIEMPO = 4;          // segundos simulados por segundo real
export const PASO_SIM = 0.02;            // paso fijo de la simulación (s)
export const FACTOR_VIENTO = 0.5;        // aceleración horizontal por unidad de viento
export const VIENTO_MAX = 10;
export const ANGULO_MAX = 90;
export const VELOCIDAD_MAX = 200;

export const RADIO_CRATER = 18;
export const RADIO_CRATER_GORILA = 40;
export const DURACION_EXPLOSION = 0.4;
export const DURACION_LANZAMIENTO = 0.3; // tiempo con el brazo levantado al lanzar
export const DURACION_BAILE = 5.2;
export const PERIODO_BAILE = 0.3;
export const VEL_GIRO_PLATANO = 10;      // rad/s
export const PERIODO_CURSOR = 0.4;

export const ANCHO_EDIFICIO_MIN = 45;
export const ANCHO_EDIFICIO_MAX = 85;
export const ALTO_EDIFICIO_MIN = 70;
export const ALTO_EDIFICIO_MAX = 290;
export const SEPARACION_EDIFICIOS = 2;
export const PROB_VENTANA_ENCENDIDA = 0.75;

export const TAM_GORILA = { w: 30, h: 30 };
export const TAM_PLATANO = { w: 14, h: 14 };
export const TAM_SOL = { w: 46, h: 46 };
export const POS_SOL = { x: ANCHO / 2 - TAM_SOL.w / 2, y: 10 };

export const COLORES = {
  cielo: '#0000aa',
  edificios: ['#00a8a8', '#a80000', '#a8a8a8'],
  ventanaOn: '#fcfc54',
  ventanaOff: '#545454',
  gorila: '#fca854',
  platano: '#fcfc54',
  sol: '#fcfc54',
  texto: '#ffffff',
  textoSuave: '#a8a8c8',
  explosion: '#fc5454',
  explosionCentro: '#fcfc54',
  viento: '#fc5454',
  panel: 'rgba(0, 0, 0, 0.9)',
  panelFin: '#000055',
};

export const FAMILIA = '"VT323", "Courier New", Courier, monospace';
export const FUENTE = `22px ${FAMILIA}`;
export const FUENTE_GRANDE = `44px ${FAMILIA}`;

export const ASSETS_DIR = 'assets/';
export const AUDIO_DIR = 'audio/';
export const VOLUMEN = 0.8;

// clave -> archivo en audio/
export const SONIDOS_SPECS = {
  explosion: 'sonido-explo-granada.mp3',
  tecla:     'numkey.wav',
  enter:     'key.wav',
  ronda:     'fight-deep-voice.mp3',
  aplausos:  'aplausoseagle.mp3',
  fuegos:    'fireworks.mp3',
};
