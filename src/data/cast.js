// Reparto de la historia: nombre que aparece en la caja de diálogo y, si no es el mismo id,
// qué sprite usa. Formato de las escenas: ver el inicio de story1.js.

// voice: cómo «balbucea» cada personaje al hablar (ver Music.voice). pitch en Hz (más bajo =
// más grave), speed = qué tan rápido aparece su texto, duty/wave = timbre, formant = brillo,
// range = cuánto sube y baja, slide = deslizamiento al inicio de cada sílaba, wobble = temblor.
export const CAST = {
  // Niña de 8 a 12 años: aguda, ágil y decidida.
  sofia: { name: 'Sofía', voice: { pitch: 520, speed: 1.05, duty: 25, formant: 1900, range: 1 } },
  // Papá: grave, lento y arrastrando las palabras.
  ramiro: { name: 'Papá', voice: { pitch: 150, speed: 0.8, duty: 50, formant: 850, range: 0.7, slide: 0.94, wobble: 3 } },
  // Mamá: media, rápida y cortante.
  leticia: { name: 'Mamá', voice: { pitch: 360, speed: 1.1, duty: 25, formant: 1500, range: 0.9, len: 0.06 } },
  // Niño pequeño: muy agudo, rápido y saltón.
  tomasito: { name: 'Tomasito', voice: { pitch: 720, speed: 1.2, duty: 25, formant: 2300, range: 1.5, len: 0.06 } },
  tomas: { name: 'Tomás', voice: { pitch: 600, speed: 1.1, duty: 25, formant: 2100, range: 1.2 } },
  // Niño de 8 a 12 años: un poco más grave que Sofía, amable.
  dani: { name: 'Dani', voice: { pitch: 430, speed: 1, duty: 50, formant: 1600, range: 1.1 } },
  // Abuela: suave, pausada y con un ligero temblor.
  tata: { name: 'Tata', voice: { pitch: 310, speed: 0.75, wave: 'triangle', formant: 1200, range: 0.8, wobble: 6, len: 0.09 } },
  // Los Gatos: adolescentes. Kevin tranquilo y grave; Yesi aguda y filosa.
  kevin: { name: 'Kevin', voice: { pitch: 220, speed: 0.95, duty: 50, formant: 1100, range: 0.8 } },
  yesi: { name: 'Yesi', voice: { pitch: 430, speed: 1.15, duty: 12, formant: 2100, range: 1.1, len: 0.06 } },
  chuy: { name: 'Chuy', voice: { pitch: 240, speed: 1.05, duty: 50, formant: 1250, range: 1 } },
  brayan: { name: 'Brayan', voice: { pitch: 270, speed: 1.2, duty: 25, formant: 1400, range: 1.3, len: 0.06 } },
  memo: { name: 'Memo', voice: { pitch: 190, speed: 0.85, duty: 50, formant: 1000, range: 0.7, len: 0.09 } },
  // Panadero: grave y potente, de vendedor de mercado.
  panadero: { name: 'Don Chema', voice: { pitch: 135, speed: 0.95, duty: 50, formant: 950, range: 0.9, vol: 0.7 } },
  perro: { name: 'Perro guardián', sprite: 'dog', frame: 'bark', voice: { growl: true, speed: 0.8 } },
};

// Narrador: un tic suave, casi de máquina de escribir.
export const NARRATOR_VOICE = { pitch: 900, speed: 1, wave: 'triangle', formant: 2600, range: 0.3, len: 0.03, vol: 0.25 };

// Frase común al terminar un obstáculo; cada nivel la mezcla con las suyas (correRate = qué tanto sale).
export const CORRE = '¡Corre!';
