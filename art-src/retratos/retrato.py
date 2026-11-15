# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Retrato común de los diálogos (48×48): cara, 8 gestos con parpadeo («_b») y boca al hablar («_m»),
hoja de contacto, GIF y exportación. Cada personaje pone su aspecto con `vestir(...)`: colores,
peinado (funciones que dibujan el pelo por capas), lentes y, si hace falta, sus propios gestos.

Estilo «limpio» con un toque de RPG portátil: cara cuadrada y cachetona (nunca ovalada), ojos de
óvalo oscuro, color plano, pelo en bloques y un poco de sombra en el lado lejano y la mandíbula.
"""
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw

RAIZ = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(RAIZ / "art-src"))
from paleta import RAMPAS  # noqa: E402
from pincel import Lienzo, fuente, gif, exportar_tira  # noqa: E402

W = H = 48
R = RAMPAS
TINTA = R["tinta"][1]
BLANCO = R["neutros"][5]
BOCA, LENGUA = R["rojo"][0], R["rojo"][2]
RUBOR = R["rojo"][3]
AGUA, AGUA_S = R["azul"][3], R["azul"][2]
PENA = R["azul"][1]
VENA = R["rojo"][2]
BRILLO = R["amarillo"][1]

# --- aspecto: lo cambia cada personaje con vestir() ---
PIEL, PIEL_S, PIEL_SS = R["piel"][4], R["piel"][3], R["piel"][2]
PELO = R["tierra"][0]                      # también pinta las cejas
PLAYERA, PLAYERA_S, PLAYERA_L = R["rojo"][2], R["rojo"][1], R["rojo"][3]
IRIS = R["tierra"][1]
LENTES = None                              # color del armazón, o None
CRISTAL = R["neutros"][4]                  # cristal de los lentes
PARPADO = None                             # párpado caído; None = sombra de la piel
PELO_DETRAS = None                         # f(L, dy): pelo detrás de la cara
PELO_DELANTE = None                        # f(L, dy): fleco (deja sombra sobre la frente)
PELO_ENCIMA = None                         # f(L, dy): mechones y brillos, después de la sombra
COLGANTE = None                            # f(L, dy): lo que cae por delante del busto (trenza)
REMATE = None                              # f(L, dy, gesto, parpadeo): detalles sobre la cara (pestañas…)
ADORNO_EXTRA = None                        # f(L, gesto): adornos propios, sin contorno (después de los comunes)
NARIZ = None                               # puntos de la nariz con la cabeza en dy=0; None = la de siempre


def vestir(**cambios):
    """Cambia el aspecto (colores, peinado, lentes, GESTOS…) del retrato."""
    globals().update(cambios)


CARA = [(16, 13), (39, 13), (42, 17), (43, 28), (41, 33), (36, 37), (30, 38), (24, 38), (18, 35), (15, 30), (14, 20)]

# Cada gesto: cejas, ojos, boca en reposo, boca al hablar, cuánto baja la cabeza y adornos.
GESTOS = {
    "idle":  dict(cejas="suaves", ojos="abiertos", boca="linea", habla="chica", dy=1),
    "talk":  dict(cejas="suaves", ojos="abiertos", boca="sonrisa", habla="abierta", dy=0),
    "sad":   dict(cejas="tristes", ojos="bajos", boca="triste", habla="triste_m", dy=2, adorno="pena"),
    "angry": dict(cejas="enojo", ojos="enojo", boca="enojo", habla="grito", dy=0, adorno="vena"),
    "cry":   dict(cejas="tristes", ojos="llanto", boca="ondas", habla="llanto_m", dy=1, adorno="gotas"),
    "shock": dict(cejas="altas", ojos="platos", boca="o", habla="o_m", dy=-1, adorno="rayas"),
    "happy": dict(cejas="suaves", ojos="felices", boca="sonrisota", habla="risa", dy=0),
    "cheer": dict(cejas="altas", ojos="felices", boca="risa", habla="risota", dy=-1, adorno="brillos"),
}
PARPADEAN = ["idle", "talk", "sad", "angry", "shock"]

# Lentes: hueco de cada cristal (x0, x1) y filas (y0, y1) con la cabeza en dy=0. El armazón va un
# pixel por fuera. Los ojos cerrados (arcos y rayas) caben dentro con un pixel libre a cada lado.
LENTE_IZQ, LENTE_DER, LENTE_Y = (18, 26), (32, 39), (21, 29)


def mover(pts, dy):
    return [(x, y + dy) for x, y in pts]


def busto(L):
    # cuello y hombros (no se mueven con la cabeza)
    L.rect(21, 37, 10, 6, PIEL_S)
    L.rect(22, 41, 8, 2, PIEL_SS)
    L.poligono([(8, 47), (10, 44), (16, 42), (21, 41), (25, 43), (30, 41), (35, 42), (41, 44), (43, 47)], PLAYERA)
    L.linea((21, 41), (25, 43), PLAYERA_S); L.linea((25, 43), (30, 41), PLAYERA_S)   # cuello de la playera
    for x in range(33, 43):
        L.px(x, 47, PLAYERA_S, PLAYERA); L.px(x, 46, PLAYERA_S, PLAYERA) if x > 37 else None   # lado en sombra
    L.linea((11, 44), (16, 43), PLAYERA_L, solo=PLAYERA)                              # luz en el hombro


def cabeza(L, dy):
    if PELO_DETRAS:
        PELO_DETRAS(L, dy)
    L.poligono(mover(CARA, dy), PIEL)
    # toque de RPG: lado lejano y mandíbula en sombra
    for y in range(17 + dy, 35 + dy):
        for x in (42, 43):
            L.px(x, y, PIEL_S, PIEL)
    for x in range(22, 40):
        for y in (37 + dy, 38 + dy):
            L.px(x, y, PIEL_S, PIEL)
    for x, y in ((40, 34), (41, 33), (40, 35), (39, 36), (38, 36), (41, 34)):
        L.px(x, y + dy, PIEL_S, PIEL)
    if PELO_DELANTE:
        PELO_DELANTE(L, dy)
    for x in range(12, 44):                                                           # sombra del fleco
        for y in range(12 + dy, 26 + dy):
            if L.p.get((x, y)) == PELO and L.p.get((x, y + 1)) == PIEL:
                L.px(x, y + 1, PIEL_S)
    if PELO_ENCIMA:
        PELO_ENCIMA(L, dy)
    # nariz y rubor
    nx, ny = (29, 31) if LENTES else (31, 30)      # con lentes baja: no queda bajo el armazón
    L.puntos(mover(NARIZ or [(nx, ny), (nx + 1, ny + 1)], dy), PIEL_S)
    L.rect(16, 30 + dy, 4, 2, RUBOR); L.rect(38, 30 + dy, 4, 2, RUBOR)


def cejas(L, tipo, dy):
    y = 19 + dy - (1 if LENTES else 0)            # con lentes suben un pixel: quedan sobre el armazón
    if tipo == "suaves":
        L.rect(20, y, 4, 1, PELO); L.rect(34, y, 3, 1, PELO)
    elif tipo == "tristes":                       # suben hacia el centro
        L.linea((19, y + 1), (24, y - 1), PELO); L.linea((33, y - 1), (37, y + 1), PELO)
    elif tipo == "enojo":                         # en V, gruesas
        L.linea((18, y), (25, y + 3), TINTA, 2); L.linea((32, y + 3), (37, y), TINTA, 2)
    elif tipo == "altas":
        L.rect(20, y - 2, 4, 1, PELO); L.rect(34, y - 2, 3, 1, PELO)
    elif tipo == "fruncidas":                     # ceño leve: bajan hacia el centro, sin llegar al enojo
        L.linea((19, y), (24, y + 2), PELO); L.rect(22, y + 2, 3, 1, PELO)
        L.linea((33, y + 2), (37, y), PELO); L.rect(33, y + 2, 2, 1, PELO)
    elif tipo in ("galan", "galan_ceja"):         # gruesas y bajas, cerca del ojo; «_ceja»: una levantada
        L.rect(19, y + 1, 6, 2, PELO); L.px(19, y + 2, PIEL); L.px(24, y + 1, PIEL)
        sube = 2 if tipo == "galan_ceja" else 0
        L.rect(33, y + 1 - sube, 5, 2, PELO); L.px(33, y + 1 - sube, PIEL); L.px(37, y + 2 - sube, PIEL)


def ojo_oscuro(L, x0, w, y, alto=7, brillo=True):
    """Ojo de óvalo oscuro: tinta con las esquinas cortadas, iris café abajo y un brillo arriba."""
    fondo = CRISTAL if LENTES else PIEL
    L.rect(x0, y, w, alto, TINTA)
    for q in ((x0, y), (x0 + w - 1, y), (x0, y + alto - 1), (x0 + w - 1, y + alto - 1)):
        L.px(*q, fondo)
    L.rect(x0 + 1, y + alto - 3, w - 2, 2, IRIS)
    if brillo:
        L.rect(x0 + 1, y + 1, 1, 2, BLANCO)


def ojos(L, tipo, dy, parpadeo=False):
    y = 23 + dy
    if parpadeo and LENTES:                       # más corto: no toca el armazón
        L.rect(20, y + 3, 5, 1, TINTA); L.px(20, y + 4, TINTA); L.rect(34, y + 3, 4, 1, TINTA); L.px(37, y + 4, TINTA)
        return
    if parpadeo:
        L.rect(19, y + 3, 7, 1, TINTA); L.px(19, y + 4, TINTA); L.rect(33, y + 3, 5, 1, TINTA); L.px(37, y + 4, TINTA)
        return
    if tipo == "abiertos":
        ojo_oscuro(L, 20, 4, y - 1); ojo_oscuro(L, 34, 3, y - 1)
    elif tipo == "bajos":                         # mirada baja, párpado caído
        ojo_oscuro(L, 20, 4, y + 1, alto=5, brillo=False); ojo_oscuro(L, 34, 3, y + 1, alto=5, brillo=False)
        L.rect(20, y, 4, 1, PARPADO or PIEL_S); L.rect(34, y, 3, 1, PARPADO or PIEL_S)
    elif tipo == "enojo":
        ojo_oscuro(L, 20, 4, y + 1, alto=5); ojo_oscuro(L, 34, 3, y + 1, alto=5)
    elif tipo == "galan":                         # entornados, con el párpado marcado
        ojo_oscuro(L, 20, 4, y + 2, alto=4); ojo_oscuro(L, 34, 3, y + 2, alto=4)
        L.rect(19, y + 1, 6, 1, TINTA); L.rect(33, y + 1, 5, 1, TINTA)
    elif tipo == "platos" and LENTES:             # con lentes: el cristal se pone blanco y la pupila, diminuta
        for (a, b) in (LENTE_IZQ, LENTE_DER):
            L.rect(a, LENTE_Y[0] + dy, b - a + 1, LENTE_Y[1] - LENTE_Y[0] + 1, BLANCO)
        L.rect(22, y + 1, 2, 2, TINTA); L.rect(35, y + 1, 2, 2, TINTA)
    elif tipo == "platos":                        # ojos como platos, pupila diminuta
        L.elipse(18, y - 2, 26, y + 6, BLANCO); L.elipse(32, y - 2, 38, y + 6, BLANCO)
        for (a, b, c, d) in ((18, y - 2, 26, y + 6), (32, y - 2, 38, y + 6)):
            cx, cy = (a + c) / 2, (b + d) / 2
            for t in range(0, 360, 6):
                L.px(cx + math.cos(math.radians(t)) * ((c - a) / 2 + 0.6), cy + math.sin(math.radians(t)) * ((d - b) / 2 + 0.6), TINTA)
        L.rect(22, y + 1, 2, 2, TINTA); L.rect(35, y + 1, 2, 2, TINTA)
    elif tipo == "felices":                       # arcos ^ ^
        L.puntos([(19, y + 3), (20, y + 2), (21, y + 1), (22, y + 1), (23, y + 1), (24, y + 2), (25, y + 3)], TINTA)
        L.puntos([(20, y + 3), (24, y + 3)], TINTA)
        L.puntos([(33, y + 3), (34, y + 2), (35, y + 1), (36, y + 1), (37, y + 2), (38, y + 3)], TINTA)
    elif tipo == "llanto":                        # apretados, con ríos de lágrimas
        L.puntos([(19, y + 1), (20, y + 2), (21, y + 3), (22, y + 3), (23, y + 3), (24, y + 2), (25, y + 1)], TINTA)
        L.puntos([(33, y + 1), (34, y + 2), (35, y + 3), (36, y + 3), (37, y + 2), (38, y + 1)], TINTA)
        for yy in range(y + 4, 37 + dy):
            L.rect(21, yy, 3, 1, AGUA); L.px(23, yy, AGUA_S)
            L.rect(35, yy, 2, 1, AGUA); L.px(36, yy, AGUA_S)
        L.rect(20, 36 + dy, 5, 1, AGUA); L.rect(34, 36 + dy, 4, 1, AGUA)


def cristales(L, dy):
    """Cristal claro de los lentes: va antes de los ojos, que se dibujan encima."""
    y0, y1 = LENTE_Y[0] + dy, LENTE_Y[1] + dy
    for (a, b) in (LENTE_IZQ, LENTE_DER):
        L.rect(a, y0, b - a + 1, y1 - y0 + 1, CRISTAL)
        L.px(a, y0, PIEL); L.px(b, y0, PIEL); L.px(a, y1, PIEL); L.px(b, y1, PIEL)


def armazon(L, dy):
    """Armazón de los lentes: va después de los ojos (las lágrimas salen por debajo)."""
    y0, y1 = LENTE_Y[0] + dy, LENTE_Y[1] + dy
    for (a, b) in (LENTE_IZQ, LENTE_DER):
        L.rect(a + 1, y0 - 1, b - a - 1, 1, LENTES); L.rect(a + 1, y1 + 1, b - a - 1, 1, LENTES)
        L.rect(a - 1, y0 + 1, 1, y1 - y0 - 1, LENTES); L.rect(b + 1, y0 + 1, 1, y1 - y0 - 1, LENTES)
        L.puntos([(a, y0), (b, y0), (a, y1), (b, y1)], LENTES)                        # esquinas matadas
    L.rect(LENTE_IZQ[1] + 2, y0 + 3, LENTE_DER[0] - LENTE_IZQ[1] - 3, 1, LENTES)      # puente
    L.rect(14, y0 + 3, LENTE_IZQ[0] - 15, 1, LENTES)                                  # patilla hacia la oreja


def boca(L, tipo, dy):
    y = 34 + dy
    if tipo == "linea":
        L.rect(27, y, 4, 1, BOCA)
    elif tipo == "chica":
        L.rect(27, y, 4, 2, BOCA); L.rect(28, y + 1, 2, 1, LENGUA)
    elif tipo == "sonrisa":
        L.px(26, y - 1, BOCA); L.rect(27, y, 4, 1, BOCA); L.px(31, y - 1, BOCA)
    elif tipo == "media":                         # media sonrisa: sube de un solo lado
        L.rect(27, y, 5, 1, BOCA); L.px(32, y - 1, BOCA); L.px(33, y - 2, BOCA)
    elif tipo == "abierta":
        L.rect(27, y - 1, 5, 4, BOCA); L.px(27, y + 2, PIEL); L.px(31, y + 2, PIEL); L.rect(28, y + 1, 3, 1, LENGUA)
    elif tipo == "triste":
        L.px(26, y + 1, BOCA); L.rect(27, y, 4, 1, BOCA); L.px(31, y + 1, BOCA)
    elif tipo == "triste_m":
        L.px(26, y + 1, BOCA); L.rect(27, y, 4, 2, BOCA); L.px(31, y + 1, BOCA); L.rect(28, y + 1, 2, 1, LENGUA)
    elif tipo == "enojo":
        L.px(25, y + 1, BOCA); L.rect(26, y, 6, 1, BOCA); L.px(32, y + 1, BOCA)
    elif tipo == "grito":
        L.rect(26, y - 1, 7, 4, BOCA); L.px(26, y - 1, PIEL); L.px(32, y - 1, PIEL); L.rect(28, y + 1, 3, 2, LENGUA)
    elif tipo == "ondas":
        L.puntos([(25, y), (26, y + 1), (27, y), (28, y + 1), (29, y), (30, y + 1), (31, y), (32, y + 1)], BOCA)
    elif tipo == "llanto_m":
        L.rect(26, y - 1, 7, 5, BOCA); L.px(26, y - 1, PIEL); L.px(32, y - 1, PIEL)
        L.px(26, y + 3, PIEL); L.px(32, y + 3, PIEL); L.rect(28, y + 2, 3, 2, LENGUA)
    elif tipo == "o":
        L.rect(28, y - 1, 3, 4, BOCA); L.px(29, y + 1, LENGUA)
    elif tipo == "o_m":
        L.rect(27, y - 2, 5, 6, BOCA); L.px(27, y - 2, PIEL); L.px(31, y - 2, PIEL); L.px(27, y + 3, PIEL); L.px(31, y + 3, PIEL)
        L.rect(28, y + 1, 3, 2, LENGUA)
    elif tipo == "sonrisota":
        L.px(24, y - 2, BOCA); L.px(25, y - 1, BOCA); L.rect(26, y, 7, 1, BOCA); L.px(33, y - 1, BOCA); L.px(34, y - 2, BOCA)
    elif tipo in ("risa", "risota"):
        alto = 3 if tipo == "risa" else 5
        L.rect(25, y - 1, 9, 1, BOCA)
        for k in range(alto):
            L.rect(25 + min(k, 2), y + k, 9 - 2 * min(k, 2), 1, BOCA)
        L.rect(28, y + alto - 2, 3, 2, LENGUA)


def adorno(L, tipo, dy):
    if tipo == "pena":                            # rayas azules de tristeza
        for x, y0, y1 in ((2, 6, 12), (5, 4, 11), (8, 3, 8)):
            L.linea((x, y0), (x, y1), PENA)
    elif tipo == "vena":                          # marca roja de enojo
        for a, b in (((2, 2), (4, 4)), ((8, 2), (6, 4)), ((2, 9), (4, 7)), ((8, 9), (6, 7))):
            L.linea(a, b, VENA, 1)
    elif tipo == "gotas":
        for x, y in ((13, 30), (11, 33), (42, 29), (44, 33)):
            L.px(x, y + dy, AGUA); L.px(x, y + dy + 1, AGUA); L.px(x, y + dy - 1, AGUA_S)
    elif tipo == "rayas":                         # rayas de sobresalto
        for a, b in (((7, 5), (5, 1)), ((4, 8), (1, 5)), ((3, 12), (0, 11)), ((44, 5), (46, 2))):
            L.linea(a, b, TINTA)
    elif tipo == "brillos":
        for x, y in ((5, 4), (3, 14), (45, 4)):
            L.puntos([(x, y - 2), (x, y - 1), (x, y), (x, y + 1), (x, y + 2), (x - 2, y), (x - 1, y), (x + 1, y), (x + 2, y)], BRILLO)
            L.px(x, y, BLANCO)


def retrato(nombre, parpadeo=False, habla=False):
    g = GESTOS[nombre]
    dy = g["dy"]
    L = Lienzo(W, H)
    busto(L)
    cabeza(L, dy)
    if COLGANTE:
        COLGANTE(L, dy)
    if LENTES:
        cristales(L, dy)
    ojos(L, g["ojos"], dy, parpadeo)
    if LENTES:
        armazon(L, dy)
    cejas(L, g["cejas"], dy)
    boca(L, g["habla"] if habla else g["boca"], dy)
    if REMATE:
        REMATE(L, dy, g, parpadeo)
    L.contorno(TINTA)
    if "adorno" in g:
        adorno(L, g["adorno"], dy)                # los adornos van sin contorno
    if ADORNO_EXTRA:
        ADORNO_EXTRA(L, g)
    return L.imagen()


def cuadros():
    out = []
    for n in GESTOS:
        out.append((n, retrato(n)))
        out.append((f"{n}_m", retrato(n, habla=True)))
        if n in PARPADEAN:
            out.append((f"{n}_b", retrato(n, parpadeo=True)))
    return out


CAJA = "#f8f8f8"   # el blanco de la caja de diálogo del juego


def hoja_de_contacto(cs, ruta, titulo, esc=4):
    cols = 6
    filas = -(-len(cs) // cols)
    cw, ch = W * esc + 14, H * esc + 28
    im = Image.new("RGB", (cols * cw + 14, filas * ch + 46), "#211624")
    d = ImageDraw.Draw(im)
    d.text((12, 8), "%s · retrato de diálogo (48×48, ×%d) · «_m» boca al hablar · «_b» parpadeo" % (titulo, esc),
           fill="#f4ecd8", font=fuente(16))
    for k, (nombre, cuadro) in enumerate(cs):
        x, y = 12 + (k % cols) * cw, 40 + (k // cols) * ch
        d.rectangle([x, y, x + W * esc - 1, y + H * esc - 1], fill=CAJA)
        g = cuadro.resize((W * esc, H * esc), Image.NEAREST)
        im.paste(g, (x, y), g)
        d.text((x, y + H * esc + 3), nombre, fill="#a898ad", font=fuente(13))
    im.save(ruta)


def main(ident, titulo):
    """`ident` es el id del personaje en el juego: la hoja sale como <ident>-retrato.png + .json."""
    previas = Path(sys.argv[1]) if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else Path("previas")
    previas.mkdir(parents=True, exist_ok=True)
    cs = cuadros()
    d = dict(cs)
    hoja_de_contacto(cs, previas / f"{ident}-retrato-contacto.png", titulo)
    # un GIF por gesto: habla (boca abre y cierra) y parpadea si puede
    for n in GESTOS:
        sec = [n, f"{n}_m", n, f"{n}_m", n, f"{n}_m", n, f"{n}_b" if n in PARPADEAN else n]
        gif([d[x] for x in sec], previas / f"{ident}-retrato-{n}.gif", 150, CAJA)
    todos = []
    for n in GESTOS:
        todos += [n, f"{n}_m", n, f"{n}_m", n, f"{n}_b" if n in PARPADEAN else n, n]
    gif([d[x] for x in todos], previas / f"{ident}-retrato-gestos.gif", 180, CAJA)
    if "--exportar" in sys.argv:
        exportar_tira(cs, RAIZ / "public" / "assets" / "sprites", f"{ident}-retrato")
        print(f"hoja del juego: public/assets/sprites/{ident}-retrato.png + .json")
    print("previas en", previas, "·", len(cs), "cuadros")
