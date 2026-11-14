# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Retrato de Sofía niña para los diálogos (48×48): 8 gestos, con parpadeo («_b») y boca al hablar («_m»).

Uso:
  python art-src/retratos/sofia.py <carpeta_de_previas>             hoja de contacto y GIF
  python art-src/retratos/sofia.py <carpeta_de_previas> --exportar   además escribe la hoja del juego
"""
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw

RAIZ = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(RAIZ / "art-src"))
from paleta import RAMPAS, apagar  # noqa: E402
from pincel import Lienzo, fuente, gif, exportar_tira  # noqa: E402

W = H = 48
R = RAMPAS
TINTA = R["tinta"][1]
PIEL_L, PIEL, PIEL_S, PIEL_SS = R["piel"][5], R["piel"][4], R["piel"][3], R["piel"][2]
PELO, PELO_L, PELO_LL = R["tierra"][0], R["tierra"][1], R["tierra"][2]
PLAYERA, PLAYERA_S, PLAYERA_L = R["rojo"][2], R["rojo"][1], R["rojo"][3]
BLANCO, GRIS = R["neutros"][5], R["neutros"][3]
IRIS, IRIS_L = R["tierra"][1], R["tierra"][3]
LIGA, LIGA_S = R["amarillo"][1], R["amarillo"][0]
BOCA, LENGUA = R["rojo"][0], R["rojo"][2]
RUBOR = R["rojo"][3]
AGUA, AGUA_S = R["azul"][3], R["azul"][2]
PENA = R["azul"][1]

# Estilo «limpio» con un toque de RPG portátil: cara cuadrada y cachetona (nunca ovalada), ojos de
# óvalo oscuro, color plano, pelo en bloques y un poco de sombra en el lado lejano y la mandíbula.
CARA = [(16, 13), (39, 13), (42, 17), (43, 28), (41, 33), (36, 37), (30, 38), (24, 38), (18, 35), (15, 30), (14, 20)]
# El fleco baja en pico entre los ojos y a los lados, y deja libres las cejas.
# (el pico derecho va con las esquinas apenas matadas: ni cuadrado ni redondo)
FLECO = [(11, 5), (40, 5), (42, 6), (43, 8), (43, 19), (42, 21), (40, 16), (37, 15), (33, 15), (29, 21), (26, 15), (20, 15), (16, 18), (12, 24)]

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


def busto(L):
    # cuello y hombros (no se mueven con la cabeza)
    L.rect(21, 37, 10, 6, PIEL_S)
    L.rect(22, 41, 8, 2, PIEL_SS)
    L.poligono([(8, 47), (10, 44), (16, 42), (21, 41), (25, 43), (30, 41), (35, 42), (41, 44), (43, 47)], PLAYERA)
    L.linea((21, 41), (25, 43), PLAYERA_S); L.linea((25, 43), (30, 41), PLAYERA_S)   # cuello de la playera
    for x in range(33, 43):
        L.px(x, 47, PLAYERA_S, PLAYERA); L.px(x, 46, PLAYERA_S, PLAYERA) if x > 37 else None   # lado en sombra
    L.linea((11, 44), (16, 43), PLAYERA_L, solo=PLAYERA)                              # luz en el hombro


def trenza(L, dy):
    # cae por delante del hombro izquierdo; gajos en dos tonos y liga amarilla
    x0, y0 = 8, 26 + dy
    for k in range(0, 22):
        y = y0 + k
        if y > 47:
            break
        cx = x0 + (1 if k > 8 else 0)
        L.rect(cx, y, 5, 1, PELO)
        g = k % 4
        L.px(cx + (1 if g < 2 else 3), y, PELO_L)
        L.px(cx + 2, y, PELO_L if g in (1, 2) else PELO)
    L.rect(x0, y0 + 2, 5, 2, LIGA); L.rect(x0, y0 + 3, 5, 1, LIGA_S)                   # liga de la nuca
    L.rect(x0 + 1, 44, 5, 2, LIGA); L.rect(x0 + 1, 45, 5, 1, LIGA_S)                   # liga de la punta


def cabeza(L, dy):
    mover = lambda pts: [(x, y + dy) for x, y in pts]
    L.elipse(6, 3 + dy, 41, 38 + dy, PELO)                                            # melena
    L.poligono(mover(CARA), PIEL)
    # toque de RPG: lado lejano y mandíbula en sombra
    for y in range(17 + dy, 35 + dy):
        for x in (42, 43):
            L.px(x, y, PIEL_S, PIEL)
    for x in range(22, 40):
        for y in (37 + dy, 38 + dy):
            L.px(x, y, PIEL_S, PIEL)
    for x, y in ((40, 34), (41, 33), (40, 35), (39, 36), (38, 36), (41, 34)):
        L.px(x, y + dy, PIEL_S, PIEL)
    L.poligono(mover(FLECO), PELO)
    for x in range(12, 44):                                                           # sombra del fleco
        for y in range(12 + dy, 26 + dy):
            if L.p.get((x, y)) == PELO and L.p.get((x, y + 1)) == PIEL:
                L.px(x, y + 1, PIEL_S)
    for k, y in enumerate(range(17 + dy, 33 + dy)):                                   # mechón junto a la oreja
        L.rect(13, y, 4 if k < 9 else 2, 1, PELO)
    # brillos del pelo en bloques
    L.poligono(mover([(15, 8), (25, 6), (30, 7), (22, 10), (17, 12)]), PELO_L, solo=PELO)
    L.poligono(mover([(33, 8), (38, 9), (36, 11)]), PELO_L, solo=PELO)
    L.puntos(mover([(18, 9), (19, 8), (20, 8), (24, 7)]), PELO_LL, solo=PELO_L)
    # nariz y rubor
    L.px(31, 30 + dy, PIEL_S); L.px(32, 31 + dy, PIEL_S)
    L.rect(16, 30 + dy, 4, 2, RUBOR); L.rect(38, 30 + dy, 4, 2, RUBOR)


def cejas(L, tipo, dy):
    y = 19 + dy
    if tipo == "suaves":
        L.rect(20, y, 4, 1, PELO); L.rect(34, y, 3, 1, PELO)
    elif tipo == "tristes":                       # suben hacia el centro
        L.linea((19, y + 1), (24, y - 1), PELO); L.linea((33, y - 1), (37, y + 1), PELO)
    elif tipo == "enojo":                         # en V, gruesas
        L.linea((18, y), (25, y + 3), TINTA, 2); L.linea((32, y + 3), (37, y), TINTA, 2)
    elif tipo == "altas":
        L.rect(20, y - 2, 4, 1, PELO); L.rect(34, y - 2, 3, 1, PELO)


def ojo_oscuro(L, x0, w, y, alto=7, brillo=True):
    """Ojo de óvalo oscuro: tinta con las esquinas cortadas, iris café abajo y un brillo arriba."""
    L.rect(x0, y, w, alto, TINTA)
    for q in ((x0, y), (x0 + w - 1, y), (x0, y + alto - 1), (x0 + w - 1, y + alto - 1)):
        L.px(*q, PIEL)
    L.rect(x0 + 1, y + alto - 3, w - 2, 2, IRIS)
    if brillo:
        L.rect(x0 + 1, y + 1, 1, 2, BLANCO)


def ojos(L, tipo, dy, parpadeo=False):
    y = 23 + dy
    if parpadeo:
        L.rect(19, y + 3, 7, 1, TINTA); L.px(19, y + 4, TINTA); L.rect(33, y + 3, 5, 1, TINTA); L.px(37, y + 4, TINTA)
        return
    if tipo == "abiertos":
        ojo_oscuro(L, 20, 4, y - 1); ojo_oscuro(L, 34, 3, y - 1)
    elif tipo == "bajos":                         # mirada baja, párpado caído
        ojo_oscuro(L, 20, 4, y + 1, alto=5, brillo=False); ojo_oscuro(L, 34, 3, y + 1, alto=5, brillo=False)
        L.rect(20, y, 4, 1, PIEL_S); L.rect(34, y, 3, 1, PIEL_S)
    elif tipo == "enojo":
        ojo_oscuro(L, 20, 4, y + 1, alto=5); ojo_oscuro(L, 34, 3, y + 1, alto=5)
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


def boca(L, tipo, dy):
    y = 34 + dy
    if tipo == "linea":
        L.rect(27, y, 4, 1, BOCA)
    elif tipo == "chica":
        L.rect(27, y, 4, 2, BOCA); L.rect(28, y + 1, 2, 1, LENGUA)
    elif tipo == "sonrisa":
        L.px(26, y - 1, BOCA); L.rect(27, y, 4, 1, BOCA); L.px(31, y - 1, BOCA)
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
            L.linea(a, b, PLAYERA, 1)
    elif tipo == "gotas":
        for x, y in ((13, 30), (11, 33), (42, 29), (44, 33)):
            L.px(x, y + dy, AGUA); L.px(x, y + dy + 1, AGUA); L.px(x, y + dy - 1, AGUA_S)
    elif tipo == "rayas":                         # rayas de sobresalto
        for a, b in (((7, 5), (5, 1)), ((4, 8), (1, 5)), ((3, 12), (0, 11)), ((44, 5), (46, 2))):
            L.linea(a, b, TINTA)
    elif tipo == "brillos":
        for x, y in ((5, 4), (3, 14), (45, 4)):
            L.puntos([(x, y - 2), (x, y - 1), (x, y), (x, y + 1), (x, y + 2), (x - 2, y), (x - 1, y), (x + 1, y), (x + 2, y)], LIGA)
            L.px(x, y, BLANCO)


def retrato(nombre, parpadeo=False, habla=False):
    g = GESTOS[nombre]
    dy = g["dy"]
    L = Lienzo(W, H)
    busto(L)
    cabeza(L, dy)
    trenza(L, dy)
    ojos(L, g["ojos"], dy, parpadeo)
    cejas(L, g["cejas"], dy)
    boca(L, g["habla"] if habla else g["boca"], dy)
    L.contorno(TINTA)
    if "adorno" in g:
        adorno(L, g["adorno"], dy)                # los adornos van sin contorno
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


def hoja_de_contacto(cs, ruta, esc=4):
    cols = 6
    filas = -(-len(cs) // cols)
    cw, ch = W * esc + 14, H * esc + 28
    im = Image.new("RGB", (cols * cw + 14, filas * ch + 46), "#211624")
    d = ImageDraw.Draw(im)
    d.text((12, 8), "Sofía niña · retrato de diálogo (48×48, ×%d) · «_m» boca al hablar · «_b» parpadeo" % esc,
           fill="#f4ecd8", font=fuente(16))
    for k, (nombre, cuadro) in enumerate(cs):
        x, y = 12 + (k % cols) * cw, 40 + (k // cols) * ch
        d.rectangle([x, y, x + W * esc - 1, y + H * esc - 1], fill=CAJA)
        g = cuadro.resize((W * esc, H * esc), Image.NEAREST)
        im.paste(g, (x, y), g)
        d.text((x, y + H * esc + 3), nombre, fill="#a898ad", font=fuente(13))
    im.save(ruta)


def main():
    previas = Path(sys.argv[1]) if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else Path("previas")
    previas.mkdir(parents=True, exist_ok=True)
    cs = cuadros()
    d = dict(cs)
    hoja_de_contacto(cs, previas / "sofia-retrato-contacto.png")
    # un GIF por gesto: habla (boca abre y cierra) y parpadea si puede
    for n in GESTOS:
        sec = [n, f"{n}_m", n, f"{n}_m", n, f"{n}_m", n, f"{n}_b" if n in PARPADEAN else n]
        gif([d[x] for x in sec], previas / f"sofia-retrato-{n}.gif", 150, CAJA)
    todos = []
    for n in GESTOS:
        todos += [n, f"{n}_m", n, f"{n}_m", n, f"{n}_b" if n in PARPADEAN else n, n]
    gif([d[x] for x in todos], previas / "sofia-retrato-gestos.gif", 180, CAJA)
    if "--exportar" in sys.argv:
        exportar_tira(cs, RAIZ / "public" / "assets" / "sprites", "sofia-retrato")
        print("hoja del juego: public/assets/sprites/sofia-retrato.png + .json")
    print("previas en", previas, "·", len(cs), "cuadros")


if __name__ == "__main__":
    main()
