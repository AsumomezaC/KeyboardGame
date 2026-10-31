# Parkour Tecla

Juego de mecanografía tipo parkour contra reloj, pensado para quien usa la distribución
**Español (Latinoamérica)** en un teclado físico **en inglés (ANSI)**.

## Cómo jugar

Abre `index.html` con doble clic en Chrome, Edge o Firefox. No hace falta instalar nada.

1. Empieza por el **Diagnóstico de teclado**: escribe los símbolos que uses (con Shift, AltGr,
   teclas muertas y códigos Alt). El juego guarda qué combinación física produce cada carácter
   y corrige sus pistas con eso.
2. Luego juega **Ruta de los símbolos**: escribe el texto de cada obstáculo antes de llegar a él.

`<` y `>` no tienen tecla en un teclado ANSI con distribución latina; se escriben con
`Alt` + `60` / `Alt` + `62` en el teclado numérico.

## Estructura

| Archivo | Qué hace |
|---|---|
| `js/layout.js` | Mapa de la distribución latina por tecla física, combinaciones aprendidas y textos de pista |
| `js/input.js` | Captura con un `textarea` oculto; el sistema resuelve teclas muertas y códigos Alt |
| `js/keyboard-view.js` | Teclado ANSI dibujado con resaltado de la combinación a presionar |
| `js/levels.js` | Obstáculos de cada nivel: `[texto, tipo]` (`muro`, `hueco`, `pared`) |
| `js/game.js` | Bucle del juego, física sencilla, dibujo en canvas y estadísticas |
| `js/main.js` | Pantallas (menú, diagnóstico, juego, resultados) |

Los scripts son clásicos (sin módulos ES) para que funcionen abriendo el archivo directamente.

## Siguientes pasos

- Más niveles por familia de teclas y fragmentos de código.
- Obstáculos generados a partir de tus teclas débiles (práctica adaptativa).
- Sprites, animaciones y sonido.
