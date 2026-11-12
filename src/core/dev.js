// Estado del modo desarrollador (solo en memoria: se apaga al recargar la página).
// Se activa desde Configuración (tecla M), con una advertencia: desbloquea todos los niveles con ★★★
// en la partida guardada. Ya activo, Configuración muestra estas opciones:
//   noDialogues: se juega sin diálogos (ni al inicio ni al final, aunque sea la primera vez).
//   cinematics: solo cinemáticas; al entrar a un nivel se ven sus diálogos de inicio y final, sin
//               lección ni carrera (también con Tab). No se puede junto con noDialogues.
//   god: modo Dios; al entrar a un nivel se supera solo con 3 estrellas.
export const Dev = {
  enabled: false,
  noDialogues: false,
  cinematics: false,
  god: false,
};

// Apaga el modo desarrollador y todas sus opciones (el progreso desbloqueado se queda).
export function disableDev() {
  Object.assign(Dev, { enabled: false, noDialogues: false, cinematics: false, god: false });
}

// «Sin diálogos» y «solo cinemáticas» se excluyen: prender una apaga la otra.
export function setDevOption(name, on) {
  Dev[name] = on;
  if (on && name === 'noDialogues') Dev.cinematics = false;
  if (on && name === 'cinematics') Dev.noDialogues = false;
}
