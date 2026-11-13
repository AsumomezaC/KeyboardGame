# La Historia de Sofía

Juego de mecanografía tipo parkour contra reloj, pensado para quien usa la distribución
**Español (Latinoamérica)** en un teclado físico **en inglés (ANSI)**.

La versión anterior (HTML puro con niveles Básico/Intermedio/Avanzado y diagnóstico) vive en la
rama `Borrador_Alfa`.

**Juégalo en línea:** https://teclea-con-sofia.vercel.app (Vercel, se publica solo con cada cambio en `main`).

**Desarrollo:** [AsumomezaC](https://github.com/AsumomezaC) (desarrollador principal,
[LinkedIn](https://www.linkedin.com/in/cuevas-solis-adrian-fernando)) y [Esraly](https://github.com/Esraly)
(segundo desarrollador, [LinkedIn](https://www.linkedin.com/in/jehm11)). Los créditos también
están en el pie de la página y en los datos estructurados de `index.html` (`author`).

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

## Modos de juego

Después de la pantalla de título se elige el tipo de juego (`ModesScene` en `src/scenes/MenuScenes.js`):

- **Modo Historia:** los capítulos de Sofía (todo lo que se describe abajo). La tarjeta muestra
  el total de estrellas de todos los capítulos.
- **Modo Libre:** en construcción; su tarjeta se ve en gris y no se puede entrar.

← → o un clic eligen, Enter (o un clic en la tarjeta ya elegida) entra y Esc vuelve al título.
Desde la selección de capítulo, Esc regresa a esta pantalla.

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
  anterior o el siguiente, y se sale con ← o → (o ↓). Desde el nivel 1, ← pasa al nivel 10 del
  capítulo anterior; desde el nivel 10, → pasa al nivel 1 del siguiente (si ya está abierto).
- Mientras el juego se ve en pantalla, el espacio y las flechas no desplazan la página.
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

### Modo Historia

- Antes y después de cada nivel hay una escena de diálogo con estética de RPG portátil de los 90:
  personajes en escena y caja de texto que se escribe letra por letra (Enter avanza).
- La primera vez los diálogos siempre se ven. Al repetir un nivel superado aparece un menú para
  jugar sin diálogos o verlos de nuevo (H es atajo para verlos); en resultados, Enter reintenta
  sin diálogos y H con diálogos. Dentro de un diálogo repetido, Esc lo omite.
- Antes de cada nivel hay una lección: las teclas nuevas (5 veces cada una) o, si el nivel no
  tiene, un calentamiento de 4 grupos de 3 letras distintas ya aprendidas (p. ej. «f d j»), que
  mezclan el último par con otros anteriores. Sale la primera vez y cada vez que se juega con historia.
- En resultados hay botones (también con su tecla) para reintentar y un solo botón para seguir (→):
  «Siguiente nivel», «Siguiente capítulo» (al superar el último nivel, lleva al nivel 1 del
  siguiente) o, después de un nivel secreto, «Seguir con la historia» (el nivel que sigue al
  secreto). Si ese nivel ya está superado y tiene diálogos, al iniciarlo se pregunta si se juega
  con historia o sin ella (el mismo menú que en el mapa, `src/scenes/story-choice.js`).
- Al terminar el nivel que va justo antes del secreto (el 6 en el capítulo 1, el 4 en el 2 y el 8 en
  el 3), si el secreto ya está desbloqueado aparece «Continuar al nivel secreto» (↑).
- En los diálogos los personajes se miran al hablar; solo se dan la espalda cuando es a propósito
  (p. ej. Sofía buscando a su papá en la primera fila en el nivel 7 del capítulo 1).
- Sofía tiene el pelo que le tapa la frente y enmarca la oreja, y una trenza de dos tonos con
  listón amarillo en la nuca y en la punta (peinado `braid` en `src/art/kid.js`).
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
- Cada personaje tiene su «voz» de balbuceo al hablar (como en los juegos de animalitos): tono,
  velocidad, timbre y temblor dependen de su edad y forma de ser, y cambian con la emoción. Los
  parámetros están en `voice` de cada entrada de `src/data/cast.js` (el narrador usa `NARRATOR_VOICE`).
- Quien habla hace un gesto según su emoción (pisotón si está enojado, brinco hacia atrás si se
  sorprende, se encoge si está triste, tiembla si llora, rebota si está feliz). La cámara solo se
  mueve en los momentos marcados con `fx`. Quien no habla parpadea de vez en cuando y reacciona
  (se hace para atrás) a las sacudidas y destellos.
- El fondo de cada nivel y de cada diálogo tiene detalles al fondo (gatos, bicis, botes, macetas,
  perros, carteles…) acomodados al azar pero siempre igual para el mismo nivel; dependen del lugar
  (`THEME_DETAILS` en `src/art/details.js`). Salen pocos y se apoyan en la base de las casas
  (nunca en la banqueta); en lugar de contorno negro llevan una orilla de su mismo color más
  oscuro y colores apagados, con la misma estética del fondo, para no confundirse con los obstáculos.
- Los obstáculos tienen versiones: sillas de varios colores, manteles de la mesa (sin nada encima: por ahí se desliza Sofía),
  charcos de lodo, barreras de colores y bardas con grafitis («LOS GATOS», «ASUMOMEZAC»,
  «RÁFAGA») o el cartel de la carrera. La lista está en `OBSTACLE_VARIANTS` de `src/art/props.js`.

### Controles y modo desarrollador

- En pantallas normales el teclado de ayuda se parte en dos: una mitad a cada lado del texto (y el
  juego se ajusta a la altura de la pantalla). En pantallas angostas vuelve a ser un teclado completo
  debajo del texto.

- Las teclas de la barra inferior de cada pantalla también son botones: se pueden pulsar con clic.
- **Configuración** (tecla M o el engrane de la barra de teclas; `src/ui/settings-panel.js`):
  - Volumen general, de la música y de los diálogos (voces). El general multiplica a los otros dos.
    Se recuerdan entre partidas.
  - Modo desarrollador: al activarlo avisa que podría modificar la progresión con la que fue creado
    el juego, porque marca todos los niveles, incluso los secretos, como superados con ★★★ y abre
    todos los capítulos. Para volver a empezar, borra los datos del sitio en el navegador. La tecla
    `|` (a la izquierda del 1 en la distribución latina) abre directo esa advertencia.
  - Con el modo desarrollador activo aparecen sus opciones (`src/core/dev.js`):
    - **Jugar sin diálogos:** los niveles empiezan y terminan sin escenas.
    - **Solo cinemáticas** (también con Tab): al entrar a un nivel se ven el diálogo de inicio y el
      de final, sin carrera, y se vuelve al mapa. No se puede junto con «sin diálogos».
    - **Modo Dios:** al entrar a un nivel (o reintentarlo) se supera solo con ★★★; si se entra con
      historia, primero se ven sus escenas.
  - El modo desarrollador y sus opciones no se guardan: al recargar la página se apagan.
- En celulares (pantalla táctil y angosta) no se carga el juego: aparece un aviso de que está hecho
  para computadoras y tablets, con un botón para compartir o copiar el enlace. Las tablets sí lo cargan.
- La página y el juego se cargan por separado: `src/main.js` es una entrada ligera (~7 kB comprimidos)
  que muestra la página, el aviso para celulares o una barra de carga con Sofía corriendo
  (`src/ui/loader.js`), y descarga el juego (`src/game.js`, con Phaser) con `import()`. Así la
  página abre rápido y los buscadores ven el texto sin esperar al juego. La barra avanza por
  tiempo y se completa cuando el arte del juego ya está listo.

### Progreso guardado

El avance (niveles, estrellas, historial) se guarda en el `localStorage` del navegador con la
clave `parkourTecla.save.v2`, y los volúmenes con `parkourTecla.volume`, `parkourTecla.volume.music` y
`parkourTecla.volume.voice`. No se envía a ningún servidor:
se conserva al cerrar la página, pero es de cada navegador y dispositivo, y se pierde en modo
incógnito o al borrar los datos del sitio. El aviso de privacidad está en `public/privacidad.html`
(enlazado en el pie de página).

### Música

Música de 8 bits generada en el navegador (WebAudio, sin archivos de audio): pulsos para la
melodía, triángulo para el bajo y ruido para la batería. Pistas en `src/audio/tracks.js`.
La música y las voces de los diálogos van por canales separados, con su volumen en Configuración
(tecla M). Hay pistas propias para los momentos clave: el despertar de Sofía, la
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
| `src/scenes/` | Escenas de Phaser: título, modos de juego, capítulos, mapa, diálogos, lección, carrera, resultados y climas |
| `src/ui/` | Panel HTML: teclado visual, manos, pistas, gráfica del historial y aviso para celulares |
| `tests/` | Pruebas con `node --test` |

## Publicación y buscadores

- Proyecto de Vercel `teclea-con-sofia` (plan gratuito), ligado a este repositorio.
- La dirección vieja `keyboard-game-tau.vercel.app` redirige sola a la nueva (308, sin aviso), configurado en `vercel.json`.
- `index.html` tiene título, descripción, URL canónica, vista previa para redes (`public/vista-previa.jpg`)
  y datos estructurados (schema.org `VideoGame`) que dicen para quién es el juego. La sección
  «¿Para quién es este juego?» debajo del juego explica lo mismo a las personas.
- `public/` también tiene `favicon.svg`, `robots.txt` y `sitemap.xml`. Si cambia la dirección, hay que
  actualizarla en `index.html`, `robots.txt`, `sitemap.xml` y en las URL canónicas de las páginas.
- Google Search Console: el sitio se verifica con `public/google0a349268467f5c5b.html` (no borrarlo; si se
  borra, Google deja de considerar verificada la propiedad). Allí se envía `sitemap.xml` y se pide indexar.
- Al cambiar el contenido de una página, actualiza su `<lastmod>` en `sitemap.xml`.
- Las direcciones extra de Vercel (`…-asumomeza-c.vercel.app`, `…-git-main-…`) están protegidas y llevan
  `noindex`, así que no compiten con la dirección principal.

### Licencias

- **Código:** MIT (`LICENSE`).
- **Contenido creativo** (personajes, historia, arte y música): CC BY-NC 4.0, © 2026 AsumomezaC y Esraly
  (`LICENSE-CONTENIDO.md`, que lista qué archivos son contenido). Esos archivos empiezan con una línea que lo indica.
  Al crear un archivo nuevo de personajes, guion, arte o música, agrégale esa línea y súmalo a la lista.
- Las versiones publicadas antes del 10 de noviembre de 2026 se distribuyeron con todo bajo MIT.

### Páginas legales

- `public/privacidad.html`: aviso de privacidad (México y una sección para el Espacio Económico Europeo y el
  Reino Unido). Si el juego empieza a guardar algo nuevo, hay que actualizarlo antes de publicar el cambio.
- `public/licencias.html`: créditos y licencias. El juego compilado no conserva los avisos de licencia, así que
  aquí van los de Phaser (MIT) y la fuente VT323 (OFL), con sus textos completos en `public/licencias/`.
  Si se agrega otra biblioteca o fuente, hay que sumarla.
- `public/404.html`: página para direcciones que no existen (Vercel la usa sola; lleva `noindex`).

Fuente: [VT323](https://fonts.google.com/specimen/VT323) (licencia OFL, libre de usar y distribuir).

## Siguientes fases

1. Arte final en pixel art y efectos de sonido.
