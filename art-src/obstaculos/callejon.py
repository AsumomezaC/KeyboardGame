# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Callejón (52×64, textura `alley`): tres callejones de barrio, cada uno cerrado por otro portón.
Se pasa rebotando de una pared a la otra (tic-tac) y saltando el portón del fondo.

Las dos paredes son del mismo material y se ven en perspectiva: cada una es una cara lisa que va
de la orilla del cuadro (cerca) al portón (lejos). Las caras están donde Sofía apoya el pie en cada
patada de la coreografía (`alley` en choreo.js), medido con el cuadro `kick` de Sofía (el pie llega
35 px de pantalla a un lado de su centro y 33 px arriba de sus pies):
  1.ª patada, pared derecha:   columna ~42, fila ~44
  2.ª patada, pared izquierda: columna ~10, fila ~32
  3.ª patada, pared derecha:   columna ~42, fila ~21
Ahí quedan las huellas de tenis de quienes suben por el callejón. El portón es más bajo que las
paredes (fila 20 = 130 px, TOP.gate) y arriba de él se ve el fondo del mapa. Sin púas ni vidrios.

  v0 de vecindad: aplanado amarillo con guardapolvo; portón de herrería verde con su número
  v1 del mercado: bodega pintada de naranja con franja de rótulo; cortina metálica con grafiti y candado
  v2 de baldío: tabique; portón de tablas viejas; al pie, una coladera abierta

Uso:
  python art-src/obstaculos/callejon.py <carpeta_de_previas>            hoja de contacto
  python art-src/obstaculos/callejon.py <carpeta_de_previas> --exportar  además escribe la hoja del juego
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps

sys.path.insert(0, str(Path(__file__).resolve().parent))
from comun import R, PIES_Y, hoja_de_contacto, exportar, fondo, poner, cuadro_de  # noqa: E402

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from pincel import Lienzo, fuente  # noqa: E402

W, H = 52, 64
PARED_Y = 1                    # arriba de las paredes junto a la orilla (la 0 es contorno): 190 px sobre los pies
LEJOS_Y = 9                    # arriba de las paredes junto al portón (más bajo por la perspectiva)
PORTON_Y = 20                  # primera fila del portón: 130 px sobre los pies (TOP.gate de choreo.js)
BASE = 59                      # fila donde las paredes tocan la banqueta del mapa
FONDO = 52                     # fila de abajo del portón: ahí empieza el piso del callejón
PX0, PX1 = 17, 34              # orillas del portón
CERCA, LEJOS = 1, PX0 - 1      # columnas de la pared izquierda: orilla del cuadro y junto al portón
TINTA = R["tinta"][1]
PATADAS = [(42, 44), (10, 32), (42, 21)]   # dónde apoya el pie en cada patada (columna, fila)


def _lerp(a, b, t):
    return a + (b - a) * t


def cara(lado):
    """Pixeles de una pared: (x, y, u, f). u va de 0 (cerca, orilla del cuadro) a 1 (junto al
    portón); f de 0 (arriba) a 1 (abajo), siguiendo la perspectiva."""
    for xi in range(CERCA, LEJOS + 1):
        u = (xi - CERCA) / (LEJOS - CERCA)
        arriba, abajo = _lerp(PARED_Y, LEJOS_Y, u), _lerp(BASE, FONDO, u)
        x = xi if lado == "izq" else W - 1 - xi
        for y in range(round(arriba), round(abajo) + 1):
            yield x, y, u, (y - arriba) / (abajo - arriba)


def paredes(L, pintar):
    """Las dos paredes con la misma pintura: `pintar(u, f)` da el color de cada pixel."""
    for lado in ("izq", "der"):
        for x, y, u, f in cara(lado):
            L.px(x, y, pintar(u, f, lado))


def huellas(L, color):
    """Marcas de tenis donde se apoya el pie en cada patada."""
    for x, y in PATADAS:
        L.rect(x - 1, y, 3, 2, color)                                  # suela
        L.px(x + (2 if x > W // 2 else -2), y + 2, color)             # tierrita que se cae


def piso(color):
    """El piso del callejón, del pie del portón hasta donde empieza la banqueta del mapa (sin tinta ni
    orilla: se junta con la banqueta sin franja)."""
    P = Lienzo(W, H)
    for y in range(FONDO + 1, BASE + 1):
        borde = round(_lerp(LEJOS, CERCA, (y - FONDO) / (BASE - FONDO)))
        P.rect(borde + 1, y, W - 2 - 2 * borde, 1, color)
    return P


def unir(P, L):
    L.contorno(TINTA)
    M = Lienzo(W, H)
    M.p = {**P.p, **L.p}
    return M.imagen()


def tono(base, sombra, luz, u, f):
    """Mismo color en las dos paredes: más oscuro al fondo (junto al portón), canto claro arriba."""
    if f < 0.04:
        return luz
    return sombra if u > 0.72 else base


def vecindad():
    """Callejón de vecindad: aplanado amarillo con guardapolvo rojo, portón de herrería verde con su
    puerta chica y el número pintado a mano."""
    am, am_s, am_l = R["amarillo"][1], R["amarillo"][0], R["amarillo"][2]
    rj, rj_s = R["rojo"][1], R["rojo"][0]
    L = Lienzo(W, H)

    def pintar(u, f, lado):
        if f > 0.84:                                                                   # guardapolvo
            return rj_s if u > 0.72 else rj
        return tono(am, am_s, am_l, u, f)
    paredes(L, pintar)
    for x, y in ((4, 14), (5, 14), (5, 15), (W - 6, 30), (W - 5, 31), (W - 7, 31)):    # aplanado descarapelado
        L.px(x, y, R["naranja"][2])
    huellas(L, am_s)
    v, v_s, v_l = R["verde"][1], R["verde"][0], R["verde"][2]
    L.rect(PX0, PORTON_Y, PX1 - PX0 + 1, FONDO - PORTON_Y + 1, v)                      # portón
    L.rect(PX0, PORTON_Y, PX1 - PX0 + 1, 1, v_l)
    for x in range(PX0 + 2, PX1, 3):                                                   # reja de arriba
        L.rect(x, PORTON_Y + 2, 1, 7, v_s)
    L.rect(PX0, PORTON_Y + 9, PX1 - PX0 + 1, 1, v_s)
    for y in range(PORTON_Y + 12, FONDO, 4):                                           # lámina
        L.rect(PX0 + 1, y, PX1 - PX0 - 1, 1, v_s)
    L.rect(PX0 + 2, 34, 7, FONDO - 33, v_s); L.rect(PX0 + 3, 35, 5, FONDO - 35, v)    # puerta chica
    L.px(PX0 + 7, 43, R["amarillo"][1])                                                # manija
    blanco = R["neutros"][4]                                                           # «15» a mano
    for x, y in ((27, 34), (27, 35), (27, 36), (27, 37), (27, 38),
                 (29, 34), (30, 34), (31, 34), (29, 35), (29, 36), (30, 36), (31, 37), (29, 38), (30, 38), (31, 38)):
        L.px(x, y, blanco)
    P = piso(R["neutros"][2])
    P.linea((24, 54), (27, 58), R["neutros"][1])                                       # grieta
    return unir(P, L)


def mercado():
    """Callejón del mercado: bodega pintada de naranja con una franja de rótulo blanca y roja que corre
    por las dos paredes, y al fondo la cortina metálica de un local cerrado, con grafiti y candado.
    Al pie, una hoja de col que se cayó de un huacal."""
    na, na_s, na_l = R["naranja"][1], R["naranja"][0], R["naranja"][2]
    L = Lienzo(W, H)

    def pintar(u, f, lado):
        if 0.30 < f < 0.44:                                                            # franja de rótulo
            return R["neutros"][3] if u > 0.72 else R["neutros"][4]
        if 0.46 < f < 0.52:
            return R["rojo"][1] if u > 0.72 else R["rojo"][2]
        return tono(na, na_s, na_l, u, f)
    paredes(L, pintar)
    huellas(L, na_s)
    a, a_s, a_l = R["azul"][2], R["azul"][1], R["azul"][3]
    L.rect(PX0, PORTON_Y, PX1 - PX0 + 1, 3, R["neutros"][2])                           # caja de la cortina
    L.rect(PX0, PORTON_Y, PX1 - PX0 + 1, 1, R["neutros"][3])
    L.rect(PX0, PORTON_Y + 3, PX1 - PX0 + 1, FONDO - PORTON_Y - 2, a)                  # cortina
    for y in range(PORTON_Y + 4, FONDO, 2):                                            # ondas de la cortina
        L.rect(PX0, y, PX1 - PX0 + 1, 1, a_s)
    L.rect(PX0, FONDO - 1, PX1 - PX0 + 1, 2, R["neutros"][1])                          # remate de abajo
    g = R["rosa"][2]                                                                   # grafiti
    for x, y in ((19, 32), (20, 31), (21, 30), (22, 31), (23, 32), (24, 31), (25, 30), (26, 31), (27, 32),
                 (28, 31), (29, 30), (30, 31), (31, 32), (20, 34), (21, 35), (22, 35), (23, 34)):
        L.px(x, y, g)
    L.linea((18, 38), (33, 36), a_l)
    L.rect(25, FONDO - 4, 2, 3, R["amarillo"][1]); L.px(25, FONDO - 5, R["neutros"][3])  # candado
    P = piso(R["neutros"][1])
    hoja, hoja_l = R["verde"][2], R["verde"][3]                                        # hoja de col
    for x, y in ((30, 56), (31, 56), (32, 56), (31, 57), (32, 57), (33, 57), (30, 57)):
        P.px(x, y, hoja)
    P.px(31, 56, hoja_l)
    return unir(P, L)


def baldio():
    """Callejón de baldío: paredes de tabique (las hiladas siguen la perspectiva) y un portón de tablas
    viejas, de distinto largo y con la pintura turquesa casi ida. Al pie, una coladera abierta (la
    rejilla tirada al lado)."""
    tq, tq_s, junta, tq_l = R["naranja"][0], R["tierra"][1], R["tierra"][0], R["rojo"][2]
    HILADAS = 15
    L = Lienzo(W, H)

    def pintar(u, f, lado):
        fila = f * HILADAS
        if f < 0.04:
            return R["neutros"][3]                                                     # remate de cemento
        if fila % 1 < 0.22:
            return junta                                                               # junta horizontal
        paso = 0.11 * (1 - 0.45 * u)                                                   # tabiques más cortos al fondo
        if ((u / paso) + (0.5 if int(fila) % 2 else 0)) % 1 < 0.16:
            return junta                                                               # junta vertical
        return tq_s if u > 0.72 else tq
    paredes(L, pintar)
    huellas(L, R["tinta"][1])
    for x, y in ((4, 20), (6, 41), (W - 5, 12), (W - 4, 50)):                          # tabiques más claros
        L.px(x, y, tq_l)
    t, t_s, t_l = R["tierra"][3], R["tierra"][2], R["tierra"][4]
    for k, x in enumerate(range(PX0, PX1 + 1, 4)):                                     # tablas
        y0 = PORTON_Y + (0, 2, 1, 3, 0)[k % 5]
        ancho = min(4, PX1 + 1 - x)
        L.rect(x, y0, ancho, FONDO - y0 + 1, t)
        L.rect(x + ancho - 1, y0, 1, FONDO - y0 + 1, t_s)
        L.px(x + 1, y0, t_l)
    for y in (PORTON_Y + 7, FONDO - 6):                                                # travesaños con clavos
        L.rect(PX0, y, PX1 - PX0 + 1, 2, t_s); L.px(PX0 + 1, y, R["neutros"][3]); L.px(PX1 - 1, y, R["neutros"][3])
    for x, y in ((19, 26), (20, 27), (24, 33), (25, 33), (29, 40), (30, 41), (21, 44)):  # pintura turquesa que queda
        L.px(x, y, R["turquesa"][1])
    P = piso(R["tierra"][2])                                                           # tierra del callejón
    P.rect(19, 55, 8, 3, R["tinta"][1])                                                # la coladera abierta
    P.rect(19, 55, 8, 1, R["neutros"][0])
    P.rect(29, 55, 6, 3, R["neutros"][1])                                              # la rejilla tirada
    for x in range(30, 35, 2):
        P.rect(x, 55, 1, 3, R["neutros"][0])
    return unir(P, L)


def variantes():
    return [
        ("v0 · vecindad", vecindad(), "Aplanado amarillo con\nguardapolvo; portón de\nherrería con su número"),
        ("v1 · mercado", mercado(), "Bodega naranja con\nfranja de rótulo; cortina\nmetálica, grafiti, candado"),
        ("v2 · baldío", baldio(), "Tabique; portón de\ntablas viejas;\ncoladera abierta"),
    ]


# Coreografía del tic-tac (choreo.js, caso 'alley'): centro de Sofía en px de pantalla desde la orilla
# izquierda del callejón (pre = 0), altura de sus pies, cuadro y si va volteada.
SECUENCIA = [("1.ª patada", 90, 25, "kick", False), ("2.ª patada", 66, 60, "kick", True),
             ("3.ª patada", 90, 95, "kick", False), ("sobre el portón", 74, 135, "tuck", False)]


def sofia(previas, nombre):
    """Cuadro de Sofía adolescente (la que corre donde sale el callejón) si está en las previas; si
    no, el de Sofía niña más parecido."""
    for carpeta in (previas, previas.parent):
        ruta = carpeta / f"sofia-teen-{nombre}.png"
        if ruta.exists():
            return Image.open(ruta).convert("RGBA")
    return cuadro_de("sofia", {"kick": "slide"}.get(nombre, nombre))


def secuencia(ruta, cuadro, previas):
    """Agrega a la hoja de contacto una tira con el tic-tac paso a paso sobre la v0."""
    hoja = Image.open(ruta).convert("RGB")
    ancho_panel, corte = 240, (0, 150, 240, 480)
    tira = Image.new("RGB", (hoja.width, (corte[3] - corte[1]) + 52), "#211624")
    d = ImageDraw.Draw(tira)
    d.text((12, 6), "El tic-tac paso a paso (Sofía adolescente, posiciones de la coreografía):",
           fill="#f4ecd8", font=fuente(13))
    for k, (texto, cx, alto, nombre, volteada) in enumerate(SECUENCIA):
        escena = fondo(previas)
        x0 = 42
        poner(escena, cuadro, x0, PIES_Y + 2)
        s = sofia(previas, nombre)
        poner(escena, ImageOps.mirror(s) if volteada else s, x0 + cx, PIES_Y - alto, centro=True)
        panel = escena.crop(corte).convert("RGB")
        tira.paste(panel, (12 + k * ancho_panel, 46))
        d.text((16 + k * ancho_panel, 26), texto, fill="#ffd23f", font=fuente(13))
    nueva = Image.new("RGB", (hoja.width, hoja.height + tira.height), "#211624")
    nueva.paste(hoja, (0, 0)); nueva.paste(tira, (0, hoja.height))
    nueva.save(ruta)


def main():
    previas = Path(sys.argv[1]) if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else Path("previas")
    previas.mkdir(parents=True, exist_ok=True)
    vs = variantes()
    for nombre, cuadro, _ in vs:
        assert cuadro.size == (W, H), nombre
        arriba = min(y for x in range(PX0 + 1, PX1) for y in range(H) if cuadro.getpixel((x, y))[3])
        assert arriba == PORTON_Y - 1, f"{nombre}: el portón no empieza en la fila {PORTON_Y} ({arriba + 1})"
        for x, y in PATADAS:
            assert cuadro.getpixel((x, y))[3], f"{nombre}: no hay pared donde patea en ({x}, {y})"
    ruta = previas / "callejon-contacto.png"
    hoja_de_contacto("Callejón", vs, ruta, previas, prop_y=2, vuelo=None, esc=5)
    secuencia(ruta, vs[0][1], previas)
    if "--exportar" in sys.argv:
        exportar(vs, "alley")
    print("previas en", previas, "·", len(vs), "variantes")


if __name__ == "__main__":
    main()
