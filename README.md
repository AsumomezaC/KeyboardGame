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

## Capítulo 1

- Solo la fila central (`a s d f g h j k l ñ`) en minúsculas. Dos letras nuevas por nivel hasta el 5;
  el espacio entra en el 6. Antes de cada nivel con teclas nuevas hay una lección de qué dedo usar.
- Cada obstáculo depende de su largo: 1-2 caracteres = tramo plano, 3-4 = charco (salto),
  5-6 = barrera (deslizarse por debajo), 7-8 = silla (salto con giro de 360°).
- Cada obstáculo tiene un temporizador. Si se acaba, Sofía tropieza, se levanta (el reloj sigue) y
  vuelves a escribirlo. Mientras está en el suelo el teclado queda bloqueado.
- Una tecla equivocada provoca un traspié breve. Escribir rápido hace que Sofía acelere.
- Estrellas: ★ terminar (a tiempo), ★★ tiempo objetivo y 90 % de precisión,
  ★★★ tiempo exigente, 97 % de precisión y sin caídas.
- Niveles 1-3 no se pierden. 4-6, 8 y 9 tienen límite de tiempo. 7: jefe del perro (requiere 10 ★,
  pierdes con 3 caídas). 10: carrera contra rivales (requiere 20 ★, levantarse tarda más).
  Secreto: aparece con 30 ★, incluye mayúsculas con consejos de Shift y Bloq Mayús.

Los tiempos de cada nivel se calculan simulando a alguien que escribe al ritmo en PPM definido en
`src/data/chapter1.js`; ajustar esos números ajusta la dificultad.

## Estructura

| Carpeta | Qué hay |
|---|---|
| `src/core/` | Distribución latina, dedos, captura de teclado y partidas guardadas |
| `src/game/` | Lógica de la carrera (sin gráficos), reglas de estrellas/desbloqueo y pistas |
| `src/data/` | Niveles del capítulo 1 |
| `src/art/` | Pixel art provisional generado por código (personajes, perro, obstáculos, fondos) |
| `src/scenes/` | Escenas de Phaser: título, capítulos, mapa, lección, carrera y resultados |
| `src/ui/` | Panel HTML: teclado visual, manos, pistas y gráfica del historial |
| `tests/` | Pruebas con `node --test` |

Fuente: [Pixelify Sans](https://fonts.google.com/specimen/Pixelify+Sans) (licencia OFL).

## Siguientes fases

1. Historia y diálogos con retratos (con opción de omitirlos al repetir un nivel).
2. Arte final en pixel art y sonido.
