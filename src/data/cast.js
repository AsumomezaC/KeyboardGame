// Reparto de la historia: nombre que aparece en la caja de diálogo y, si no es el mismo id,
// qué sprite usa. Formato de las escenas: ver el inicio de story1.js.

export const CAST = {
  sofia: { name: 'Sofía' },
  ramiro: { name: 'Papá' },
  leticia: { name: 'Mamá' },
  tomasito: { name: 'Tomasito' },
  tomas: { name: 'Tomás' },
  dani: { name: 'Dani' },
  tata: { name: 'Tata' },
  kevin: { name: 'Kevin' },
  yesi: { name: 'Yesi' },
  chuy: { name: 'Chuy' },
  brayan: { name: 'Brayan' },
  memo: { name: 'Memo' },
  panadero: { name: 'Don Chema' },
  perro: { name: 'Perro guardián', sprite: 'dog', frame: 'bark' },
};

// Frase común al terminar un obstáculo; cada nivel la mezcla con las suyas (correRate = qué tanto sale).
export const CORRE = '¡Corre!';
