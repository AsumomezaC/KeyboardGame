# La Historia de Sofía

Juego de mecanografía tipo parkour contra reloj, pensado para quien usa la distribución
**Español (Latinoamérica)** en un teclado físico **en inglés (ANSI)**.

La versión anterior (HTML puro con niveles Básico/Intermedio/Avanzado y diagnóstico) vive en la
rama `Borrador_Alfa`.

**Juégalo en línea:** https://teclea-con-sofia.vercel.app (Vercel, se publica solo con cada cambio en `main`).

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
- Pintas en una pared por presión de la pandilla, también con remordimiento.
- Una mamá que a veces deja a su hija fuera de casa por una noche (la abuela de su amigo la recibe).
- Bajo rendimiento escolar y baja autoestima.
- Un primer amor inocente (sin contenido romántico explícito).

Cualquier cambio a la historia debe mantenerse dentro de esta clasificación. Si una escena
necesitara algo más fuerte (15+), debe acordarse antes y anotarse aquí. Los personajes, nombres y
hechos son ficticios; cualquier parecido con personas reales es coincidencia.

## Capítulos

| # | Nombre | Edad | Teclas |
|---|---|---|---|
| 1 | «Me llamo Sofía» | 8-9 | `f j`, `d k`, `s l`, `a ñ` (el secreto agrega espacio y mayúsculas) |
| 2 | «Los gatos» | 10-12 | espacio, `g h`, `r u`, `i e` |
| 3 | «El día de mi suerte» | 12 | `o w`, `p q`, `t y` |
| 4-6 | En construcción | | |

- Cada capítulo tiene 10 niveles y un secreto. Se abre al superar el nivel 10 del anterior. En el
  menú, las tarjetas se deslizan: flechas, rueda del ratón, la barra, los puntos o un clic llevan a
  cualquier capítulo.
- En el mapa, ← → recorren los niveles. El secreto queda arriba: se entra con ↑ desde el nivel
  anterior o el siguiente, y se sale con ← o → (o ↓).
- Hay niveles de práctica («solo d k», «solo p q») y niveles con todas las letras aprendidas.
  Desde que se aprende el espacio, los niveles de práctica también lo usan («dk kd»). Cada
  nivel tiene un largo máximo de obstáculo; aun en los avanzados siguen saliendo obstáculos cortos.
  Las palabras salen de un banco de palabras reales sin acentos (`src/data/levelgen.js`); los
  niveles de cada capítulo se definen en `src/data/chapters.js`.
- Obstáculos según su largo: 1-2 tramo plano, 3-4 charco (salto), 5-6 barrera (deslizarse por
  debajo), 7-8 silla (salto con giro), 9-10 mesa larga (se desliza encima), 11-12 barda con cemento
  fresco al pie (corre a lo largo de la pared, con estela, y se impulsa con una voltereta), 13-14
  hoyo enorme (lo brinca como si volara).
- Cada obstáculo tiene un temporizador. Si se acaba, Sofía tropieza, se levanta (el reloj sigue) y
  vuelves a escribirlo. Solo se escribe el obstáculo actual: al terminarlo aparece una frase de
  ánimo («¡Corre!» es la más común) hasta que Sofía lo supera.
- Los tiempos de cada nivel se calculan con una persona simulada que tarda en ver cada obstáculo
  antes de escribirlo (como pasa de verdad). Las PPM de los resultados solo cuentan el tiempo en
  que se podía escribir: no cuentan las caídas, ni correr de un obstáculo al siguiente.
- Estrellas independientes: ★ terminar (a tiempo), ★ velocidad y ★ precisión. El total del
  capítulo es sobre 30 y pasa a 33 cuando aparece el secreto (con 30 ★).
- Dificultad progresiva a lo largo de los 30 niveles, en curva: sube despacio al principio y cada
  vez más rápido (`DIFFICULTY_CURVE` en `chapters.js`). El primero pide el 75 % del ritmo y 90 % de
  precisión; el último, el ritmo completo y 97 %. Los niveles 1-3 del capítulo 1 no se pierden.
- Jefes en los niveles 7 (requiere 10 ★) y 10 (requiere 20 ★). Se pierden por tiempo, por más de
  cierto número de traspiés o por más de cierto número de caídas; cada jefe es más estricto que el
  anterior. Pueden ser una carrera contra rivales, una persecución o alcanzar a alguien.
- Quien corre con Sofía aparece en pantalla y salta los mismos obstáculos: adelante si es más
  rápido, atrás si es más lento. Dani es torpe y a veces se cae. En el secreto del capítulo 2
  corre Dani.

### Modo historia

- Antes y después de cada nivel hay una escena de diálogo con estética de RPG portátil de los 90:
  personajes en escena y caja de texto que se escribe letra por letra (Enter avanza).
- La primera vez los diálogos siempre se ven. Al repetir un nivel superado aparece un menú para
  jugar sin diálogos o verlos de nuevo (H es atajo para verlos); en resultados, Enter reintenta
  sin diálogos y H con diálogos. Dentro de un diálogo repetido, Esc lo omite.
- Antes de cada nivel hay una lección: las teclas nuevas o, si el nivel no tiene, un calentamiento
  con dos pares de teclas ya aprendidas. Sale la primera vez y cada vez que se juega con historia.
- En resultados hay botones (también con su tecla) para reintentar o pasar al siguiente nivel; si
  ese nivel ya está superado, se puede elegir jugarlo con historia o sin ella.
- Personajes: Sofía; su papá Ramiro, su mamá Leticia y su hermano Tomás (Tomasito); Dani, su mejor
  amigo y vecino; la Tata, abuela de Dani y dueña de Abarrotes La Esperanza; Los Gatos (Kevin, Yesi,
  Chuy, Brayan y Memo); el perro guardián y Don Chema, el panadero del mercado.
- El guion está en `src/data/story1.js`, `story2.js` y `story3.js` (formato explicado al inicio
  de `story1.js`); el reparto, en `src/data/cast.js`.
- Al terminar un obstáculo, en lugar de siempre «¡Corre!» aparecen frases del momento de la
  historia; «¡Corre!» sigue siendo la más común y domina en el perro, la carrera y el secreto.
- Cada nivel tiene su clima (sol, jacarandas, llovizna, nublado, atardecer, ventarrón, niebla,
  noche fría, aguacero, calor). El clima se dibuja detrás de obstáculos, personajes y textos, y
  los textos de los obstáculos tienen una placa oscura para leerse igual con cualquier clima.
- En la lección de teclas nuevas, Sofía calienta (estira, zancadas, posición de salida) con cada
  pulsación y sale corriendo al terminar.

### Controles y modo desarrollador

- En pantallas normales el teclado de ayuda se parte en dos: una mitad a cada lado del texto (y el
  juego se ajusta a la altura de la pantalla). En pantallas angostas vuelve a ser un teclado completo
  debajo del texto.

- Las teclas de la barra inferior de cada pantalla también son botones: se pueden pulsar con clic.
- Modo desarrollador: presiona `|` (la tecla a la izquierda del 1 en la distribución latina) en
  cualquier menú, fuera de los niveles. Marca todos los niveles, incluso los secretos, como
  superados con ★★★ y abre todos los capítulos. Para volver a empezar, borra los datos del sitio
  en el navegador.

### Música

Música de 8 bits generada en el navegador (WebAudio, sin archivos de audio): pulsos para la
melodía, triángulo para el bajo y ruido para la batería. Pistas en `src/audio/tracks.js`.
La tecla M la prende o apaga en menús y diálogos (se recuerda entre partidas) y aparece un aviso
con el ícono de bocina. Hay pistas propias para los momentos clave: el despertar de Sofía, la
primera fila vacía, Los Gatos, los corazones rotos, el peligro en la niebla, la soledad, el
reencuentro con Dani y la victoria.

Los tiempos de cada nivel se calculan simulando a alguien que escribe al ritmo en PPM que sale de
`tuning()` en `src/data/chapters.js`; ajustar esos números ajusta la dificultad.

## Estructura

| Carpeta | Qué hay |
|---|---|
| `src/core/` | Distribución latina, dedos, captura de teclado y partidas guardadas |
| `src/game/` | Lógica de la carrera (sin gráficos), reglas de estrellas/desbloqueo y pistas |
| `src/data/` | Capítulos, generador de obstáculos, historia, reparto y climas |
| `src/audio/` | Sintetizador de 8 bits y pistas de música |
| `src/art/` | Pixel art provisional generado por código (personajes, perro, obstáculos, fondos) |
| `src/scenes/` | Escenas de Phaser: título, capítulos, mapa, diálogos, lección, carrera, resultados y climas |
| `src/ui/` | Panel HTML: teclado visual, manos, pistas y gráfica del historial |
| `tests/` | Pruebas con `node --test` |

## Publicación y buscadores

- Proyecto de Vercel `teclea-con-sofia` (plan gratuito), ligado a este repositorio.
- La dirección vieja `keyboard-game-tau.vercel.app` redirige sola a la nueva (308, sin aviso), configurado en `vercel.json`.
- `index.html` tiene título, descripción, URL canónica, vista previa para redes (`public/vista-previa.jpg`)
  y datos estructurados (schema.org `VideoGame`) que dicen para quién es el juego. La sección
  «¿Para quién es este juego?» debajo del juego explica lo mismo a las personas.
- `public/` también tiene `favicon.svg`, `robots.txt` y `sitemap.xml`. Si cambia la dirección,
  hay que actualizarla en `index.html`, `robots.txt` y `sitemap.xml`.

Fuente: [VT323](https://fonts.google.com/specimen/VT323) (licencia OFL, libre de usar y distribuir).

## Siguientes fases

1. Arte final en pixel art y efectos de sonido.
