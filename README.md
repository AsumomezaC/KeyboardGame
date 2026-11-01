# Parkour Tecla

Juego de mecanografía tipo parkour contra reloj, pensado para quien usa la distribución
**Español (Latinoamérica)** en un teclado físico **en inglés (ANSI)**.

La versión anterior (HTML puro con niveles Básico/Intermedio/Avanzado y diagnóstico) vive en la
rama `Borrador_Alfa`.

## Cómo correrlo

Necesitas [Node.js](https://nodejs.org) (versión LTS, gratuito).

```bash
npm install
npm run dev      # abre http://localhost:5173
npm test         # pruebas de reglas, tiempos y pistas
npm run build    # versión final en dist/ (publicable en GitHub Pages)
```

## Clasificación de contenido: 12+

La historia está escrita para mayores de 12 años. Toca temas de familia disfuncional con un tono
de telenovela exagerado, sin violencia gráfica ni lenguaje vulgar:

- Un padre con problemas de alcohol (se muestra una botella y se habla de la cantina) y apuestas.
- Discusiones familiares, favoritismo entre hermanos y abandono emocional.
- Una pandilla de adolescentes que entra a un lugar prohibido; persecución de un perro guardián.
- Hambre y el robo de un pan, presentado con remordimiento, no como algo deseable.
- Un primer amor inocente (sin contenido romántico explícito).

Cualquier cambio a la historia debe mantenerse dentro de esta clasificación. Si una escena
necesitara algo más fuerte (15+), debe acordarse antes y anotarse aquí. Los personajes, nombres y
hechos son ficticios; cualquier parecido con personas reales es coincidencia.

## Capítulo 1: «Me llamo Sofía»

- Solo la fila central (`a s d f g h j k l ñ`) en minúsculas. 1: `f j`, 2: `d k`, 3: combina
  `d f j k`, 4: `s l`, 5: `a ñ`, 6: `g h`; el 7 repasa palabras sin espacios y el espacio entra en
  el 8. Antes de cada nivel con teclas nuevas hay una lección de qué dedo usar.
- Cada obstáculo depende de su largo: 1-2 caracteres = tramo plano, 3-4 = charco (salto),
  5-6 = barrera (deslizarse por debajo), 7-8 = silla (salto con giro de 360°).
- Cada obstáculo tiene un temporizador. Si se acaba, Sofía tropieza, se levanta (el reloj sigue) y
  vuelves a escribirlo. Mientras está en el suelo el teclado queda bloqueado.
- Solo se escribe el obstáculo actual: al terminarlo aparece «¡Corre!» y el siguiente se desbloquea
  cuando Sofía lo supera.
- Una tecla equivocada provoca un traspié breve. Escribir rápido hace que Sofía acelere.
- Estrellas independientes: ★ terminar (a tiempo), ★ velocidad (tiempo objetivo del nivel) y
  ★ precisión. Se puede llegar a ★★ por velocidad o por precisión.
- Dificultad progresiva: el nivel 1 pide el 75 % del ritmo (más tiempo para el límite y para la
  estrella de velocidad) y 90 % de precisión; ambos suben poco a poco hasta el ritmo completo y
  97 % en el nivel 10.
- El total del capítulo se muestra sobre 30 y pasa a 33 cuando aparece el nivel secreto.
- Niveles 1-3 no se pierden. 4-6, 8 y 9 tienen límite de tiempo. 7: jefe del perro (requiere 10 ★,
  pierdes con 3 caídas). 10: carrera contra rivales (requiere 20 ★, levantarse tarda más).
  Secreto: aparece con 30 ★, incluye mayúsculas con consejos de Shift y Bloq Mayús.

### Modo historia

- Antes y después de cada nivel hay una escena de diálogo con estética de RPG portátil de los 90:
  personajes en escena y caja de texto que se escribe letra por letra (Enter avanza).
- La primera vez los diálogos siempre se ven. Al repetir un nivel superado aparece un menú para
  jugar sin diálogos o verlos de nuevo (H es atajo para verlos); en resultados, Enter reintenta
  sin diálogos y H con diálogos. Dentro de un diálogo repetido, Esc lo omite.
- Personajes: Sofía; su papá Ramiro, su mamá Leticia y su hermano Tomasito; Dani, su amistad
  de la infancia y vecindad (su género nunca se define); Los Gatos (Kevin, Yesi, Chuy, Brayan y
  Memo); el perro guardián y Don Chema, el panadero del mercado.
- El guion está en `src/data/story1.js` (formato explicado al inicio del archivo).
- Al terminar un obstáculo, en lugar de siempre «¡Corre!» aparecen frases del momento de la
  historia; «¡Corre!» sigue siendo la más común y domina en el perro, la carrera y el secreto.
- Cada nivel tiene su clima (sol, jacarandas, llovizna, nublado, atardecer, ventarrón, niebla,
  noche fría, aguacero, calor). El clima se dibuja detrás de obstáculos, personajes y textos, y
  los textos de los obstáculos tienen una placa oscura para leerse igual con cualquier clima.
- En la lección de teclas nuevas, Sofía calienta (estira, zancadas, posición de salida) con cada
  pulsación y sale corriendo al terminar.

### Música

Música de 8 bits generada en el navegador (WebAudio, sin archivos de audio): pulsos para la
melodía, triángulo para el bajo y ruido para la batería. Pistas en `src/audio/tracks.js`.
La tecla M la prende o apaga en menús y diálogos (se recuerda entre partidas) y aparece un aviso
con el ícono de bocina. Hay pistas propias para los momentos clave: el despertar de Sofía, la
primera fila vacía, Los Gatos, los corazones rotos, el peligro en la niebla, la soledad, el
reencuentro con Dani y la victoria.

Los tiempos de cada nivel se calculan simulando a alguien que escribe al ritmo en PPM definido en
`src/data/chapter1.js`; ajustar esos números ajusta la dificultad.

## Estructura

| Carpeta | Qué hay |
|---|---|
| `src/core/` | Distribución latina, dedos, captura de teclado y partidas guardadas |
| `src/game/` | Lógica de la carrera (sin gráficos), reglas de estrellas/desbloqueo y pistas |
| `src/data/` | Niveles, historia y climas del capítulo 1 |
| `src/audio/` | Sintetizador de 8 bits y pistas de música |
| `src/art/` | Pixel art provisional generado por código (personajes, perro, obstáculos, fondos) |
| `src/scenes/` | Escenas de Phaser: título, capítulos, mapa, diálogos, lección, carrera, resultados y climas |
| `src/ui/` | Panel HTML: teclado visual, manos, pistas y gráfica del historial |
| `tests/` | Pruebas con `node --test` |

Fuente: [Pixelify Sans](https://fonts.google.com/specimen/Pixelify+Sans) (licencia OFL).

## Siguientes fases

1. Arte final en pixel art y efectos de sonido.
