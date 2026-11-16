# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Barda (50×46, textura `wall`): cinco bardas de barrio, cada una de su material y con el grafiti o
cartel que ya tenía. Se pasa corriendo por la pared (a 78 px de pantalla del piso) y saliendo con
voltereta: la pared es lisa donde se corre y al pie hay algo que no se puede pisar.

  v0 de block en obra negra, con el gato de Los Gatos; al pie, cemento fresco con conos
  v1 de tabique, con «LOS GATOS»; al pie, una zanja abierta con cinta de precaución
  v2 aplanada y pintada de rosa, con el aplanado caído y «ASUMOMEZAC»; al pie, un registro sin tapa con
    una rama metida para avisar
  v3 de lámina oxidada de terreno baldío, con «RÁFAGA» y un rayo; al pie, nopales y un maguey
  v4 pintada de añil con guardapolvo, con el cartel de la carrera; al pie, una jardinera con flores

Uso:
  python art-src/obstaculos/barda.py <carpeta_de_previas>            hoja de contacto
  python art-src/obstaculos/barda.py <carpeta_de_previas> --exportar  además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from comun import R, hoja_de_contacto, exportar  # noqa: E402

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from pincel import Lienzo  # noqa: E402

W, H = 50, 46
BASE = 39                      # fila de la línea de tinta donde la barda toca la banqueta del mapa
SUELO = 44                     # fila de abajo (la 45 es contorno)
# Lo que hay al pie y no se pisa va en dos capas: lo plano (cemento, zanja, registro, tierra) se pinta
# sobre el piso del mapa con una orilla de su propio tono oscuro, sin tinta, para que se integre; lo
# que está parado (conos, rama, nopales, jardinera) lleva contorno de tinta como todo lo jugable.
TINTA = R["tinta"][1]
SOMBRA_LETRA = R["tinta"][1]

# Letras de 3×5 (M de 5, N de 4), las mismas del dibujo por código.
LETRAS = {
    "A": [".#.", "#.#", "###", "#.#", "#.#"], "C": ["###", "#..", "#..", "#..", "###"],
    "E": ["###", "#..", "##.", "#..", "###"], "F": ["###", "#..", "##.", "#..", "#.."],
    "G": ["###", "#..", "#.#", "#.#", "###"], "L": ["#..", "#..", "#..", "#..", "###"],
    "M": ["#...#", "##.##", "#.#.#", "#...#", "#...#"], "O": ["###", "#.#", "#.#", "#.#", "###"],
    "R": ["##.", "#.#", "##.", "#.#", "#.#"], "S": ["###", "#..", "###", "..#", "###"],
    "T": ["###", ".#.", ".#.", ".#.", ".#."], "U": ["#.#", "#.#", "#.#", "#.#", "###"],
    "Z": ["###", "..#", ".#.", "#..", "###"], "0": ["###", "#.#", "#.#", "#.#", "###"],
    "5": ["###", "#..", "###", "..#", "###"],
}
ACENTOS = {"Á": "A"}


def ancho_texto(s):
    return sum(2 if ch == " " else len(LETRAS[ACENTOS.get(ch, ch)][0]) + 1 for ch in s) - 1


def texto(L, x, y, s, color, sombra=None):
    """Escribe con la fuente de 3×5; la sombra va un pixel abajo a la derecha."""
    for ch in s:
        if ch == " ":
            x += 2
            continue
        filas = LETRAS[ACENTOS.get(ch, ch)]
        for capa, (dx0, c) in enumerate(((1, sombra), (0, color))):
            if c is None:
                continue
            for dy, fila in enumerate(filas):
                for dx, m in enumerate(fila):
                    if m == "#":
                        L.px(x + dx + dx0, y + dy + dx0, c)
        if ch in ACENTOS:
            L.px(x + len(filas[0]) - 1, y - 2, color)
        x += len(filas[0]) + 1


def centro(s):
    return round((W - ancho_texto(s)) / 2)


def cono(L, x):
    """Cono de tránsito de 5 de ancho, parado en el piso."""
    n, n_s, b = R["naranja"][1], R["naranja"][0], R["neutros"][5]
    L.rect(x + 2, SUELO - 6, 1, 1, n)
    L.rect(x + 1, SUELO - 5, 3, 2, n); L.rect(x + 3, SUELO - 5, 1, 2, n_s)
    L.rect(x + 1, SUELO - 3, 3, 1, b)
    L.rect(x + 1, SUELO - 2, 3, 1, n); L.rect(x + 3, SUELO - 2, 1, 1, n_s)
    L.rect(x, SUELO - 1, 5, 2, n_s)


def unir(piso, L):
    """Pone la barda y lo que está parado (con contorno de tinta) sobre lo plano del piso."""
    L.contorno(TINTA)
    M = Lienzo(W, H)
    M.p = {**piso.p, **L.p}
    return M.imagen()


def plano(pts, color, orilla):
    """Mancha plana sobre el piso del mapa, con orilla de su tono oscuro."""
    P = Lienzo(W, H)
    P.poligono(pts, color)
    P.contorno(orilla)
    return P


def block():
    """Barda de block gris en obra negra: castillos con la varilla de fuera y el gato de Los Gatos.
    Al pie, cemento fresco (con huellitas de gato) entre dos conos."""
    blk, blk_s, blk_l = R["neutros"][2], R["neutros"][1], R["neutros"][3]
    L = Lienzo(W, H)
    L.rect(1, 3, W - 2, BASE - 3, blk)
    for k, y in enumerate(range(3, BASE, 5)):                 # hiladas de block de 8×4
        L.rect(1, y + 4, W - 2, 1, blk_s, solo=blk)
        for x in range(1 + (4 if k % 2 else 0), W - 1, 8):
            L.rect(x, y, 1, 4, blk_s, solo=blk)
    L.rect(1, 3, W - 2, 1, blk_l)
    for x in (1, W - 5):                                      # castillos de concreto
        L.rect(x, 3, 4, BASE - 3, blk_l); L.rect(x + 3, 3, 1, BASE - 3, blk)
        for xv in (x + 1, x + 2):                             # varillas oxidadas de fuera
            L.rect(xv, 1, 1, 2, R["naranja"][0])
    t, t_l = R["turquesa"][1], R["turquesa"][2]               # el gato pintado
    L.rect(18, 13, 12, 7, t); L.rect(18, 10, 2, 3, t); L.rect(28, 10, 2, 3, t)
    L.rect(19, 13, 10, 1, t_l)
    L.px(21, 15, R["amarillo"][2]); L.px(26, 15, R["amarillo"][2])
    L.rect(30, 17, 5, 1, t); L.px(34, 16, t)
    P = plano([(3, 40), (46, 40), (47, SUELO), (2, SUELO)], blk_l, blk_s)   # cemento fresco
    for x, y in ((13, 41), (17, 43), (21, 41), (25, 43), (29, 41)):   # huellitas de gato
        P.px(x, y, blk); P.px(x + 1, y, blk)
    P.rect(9, 42, 6, 1, R["neutros"][4]); P.rect(33, 43, 8, 1, R["neutros"][4])   # brillo de lo mojado
    cono(L, 2); cono(L, W - 7)
    return unir(P, L)


def tabique():
    """Barda de tabique rojo con remate de cemento y «LOS GATOS» con orejitas.
    Al pie, la zanja de una obra de agua: tierra sacada, el hoyo y cinta de precaución."""
    tq, tq_l, junta = R["naranja"][0], R["rojo"][2], R["tierra"][1]
    L = Lienzo(W, H)
    L.rect(1, 3, W - 2, BASE - 3, tq)
    for k, y in enumerate(range(3, BASE, 3)):                 # tabiques de 6×2
        L.rect(1, y + 2, W - 2, 1, junta, solo=tq)
        for x in range(1 + (3 if k % 2 else 0), W - 1, 6):
            L.rect(x, y, 1, 2, junta, solo=tq)
            L.px(x + 1, y, tq_l, solo=tq)
    L.rect(1, 1, W - 2, 2, R["neutros"][3]); L.rect(1, 2, W - 2, 1, R["neutros"][2])   # remate
    texto(L, centro("LOS GATOS"), 14, "LOS GATOS", R["turquesa"][2], SOMBRA_LETRA)
    L.rect(10, 9, 2, 3, R["turquesa"][2]); L.rect(14, 9, 2, 3, R["turquesa"][2])        # orejitas
    tierra, tierra_l, hoyo = R["tierra"][2], R["tierra"][3], R["tierra"][0]
    P = plano([(14, 40), (35, 40), (34, SUELO), (15, SUELO)], hoyo, tierra)  # la zanja, con tierra regada
    P.rect(17, 42, 16, 2, R["azul"][1]); P.rect(17, 42, 16, 1, R["azul"][2])           # tubo
    for x, y in ((12, 42), (37, 41), (38, 43), (11, 44)):
        P.px(x, y, tierra)
    for x0, x1 in ((1, 10), (39, 48)):                        # montones de tierra sacada
        L.elipse(x0, 34, x1, SUELO + 3, tierra)
        L.elipse(x0 + 2, 35, x1 - 3, 38, tierra_l, solo=tierra)
    L.px(4, 37, R["tierra"][4]); L.px(43, 36, R["tierra"][4])
    for x in (5, W - 6):                                      # estacas y cinta de precaución
        L.rect(x, 30, 1, 6, R["tierra"][4])
    for x in range(5, W - 5):
        L.px(x, 31 + (1 if 12 < x < 37 else 0), R["amarillo"][1] if (x // 3) % 2 else R["tinta"][1])
    return unir(P, L)


def aplanado():
    """Barda aplanada y pintada de rosa mexicano, con el aplanado caído (se asoma el tabique) y la
    firma «ASUMOMEZAC» en aerosol. Al pie, un registro sin tapa, con la tapa rota y una rama metida para
    avisar, como se hace en la calle."""
    rosa, rosa_s, rosa_l = R["rosa"][2], R["rosa"][1], R["rosa"][3]
    L = Lienzo(W, H)
    L.rect(1, 3, W - 2, BASE - 3, rosa)
    L.rect(1, 1, W - 2, 2, rosa_s); L.rect(1, 1, W - 2, 1, rosa_l)    # pretil
    for caido in ([(3, 22), (9, 20), (12, 25), (10, 31), (4, 33)],
                  [(36, 5), (44, 4), (47, 9), (42, 12), (37, 10)]):  # aplanado caído
        L.poligono(caido, R["naranja"][0])
        xs, ys = [p[0] for p in caido], [p[1] for p in caido]
        for y in range(min(ys), max(ys) + 1, 3):
            L.rect(min(xs), y, max(xs) - min(xs) + 1, 1, R["tierra"][1], solo=R["naranja"][0])
    for x, y in ((3, 22), (9, 20), (36, 5), (44, 4), (12, 25)):
        L.px(x, y - 1, R["neutros"][4], solo=rosa)            # borde de cal
    texto(L, centro("ASUMOMEZAC"), 13, "ASUMOMEZAC", R["amarillo"][1], SOMBRA_LETRA)
    L.linea((6, 22), (44, 20), R["amarillo"][1])              # subrayado de aerosol
    banq, banq_l = R["neutros"][2], R["neutros"][3]
    P = plano([(22, 40), (37, 40), (37, SUELO), (22, SUELO)], R["tinta"][1], banq_l)   # el registro sin tapa
    P.rect(22, 40, 16, 1, R["neutros"][0])
    for x, y, w in ((8, 42, 4), (13, 43, 3)):                 # pedazos de la tapa rota
        P.rect(x, y, w, 2, banq_l); P.rect(x, y + 1, w, 1, R["neutros"][1])
    rama, hoja = R["tierra"][1], R["verde"][2]                # la rama que avisa del registro
    L.linea((30, 43), (33, 29), rama); L.linea((31, 39), (28, 33), rama); L.linea((32, 34), (36, 30), rama)
    for x, y in ((33, 28), (34, 29), (32, 29), (27, 32), (28, 32), (36, 29), (37, 30), (29, 34)):
        L.px(x, y, hoja)
    L.px(32, 28, R["verde"][3]); L.px(37, 29, R["verde"][3])
    return unir(P, L)


def lamina():
    """Barda de lámina acanalada de terreno baldío, oxidada, con «RÁFAGA» y un rayo.
    Al pie, tierra con nopales y un maguey."""
    a, a_s, a_l = R["azul"][1], R["azul"][0], R["azul"][2]
    oxido = R["naranja"][0]
    L = Lienzo(W, H)
    for x in range(1, W - 1):                                 # canales de la lámina
        y0 = 1 if x < 26 else 2                               # dos hojas, la de la derecha más baja
        L.rect(x, y0, 1, BASE - y0, (a_l, a, a, a_s)[x % 4])
    L.rect(25, 2, 2, BASE - 2, a_s)                           # traslape de las hojas
    for x in (3, 14, 23, 34, 46):                             # tornillos
        L.px(x, 4, R["neutros"][3]); L.px(x, 31, R["neutros"][3])
    for x, largo in ((7, 9), (18, 5), (30, 12), (41, 7), (44, 4)):   # escurrido de óxido
        L.rect(x, 3, 1, largo, oxido)
        L.px(x, 3 + largo, R["naranja"][1])
    texto(L, centro("RÁFAGA") + 3, 15, "RÁFAGA", R["rojo"][2], SOMBRA_LETRA)
    am = R["amarillo"][1]                                     # el rayo
    L.linea((9, 11), (6, 17), am); L.linea((6, 17), (10, 17), am); L.linea((10, 17), (7, 23), am)
    P = plano([(2, 40), (47, 40), (45, SUELO), (4, SUELO)], R["tierra"][2], R["tierra"][1])   # tierra del baldío
    P.rect(4, 41, 6, 1, R["tierra"][3]); P.rect(30, 42, 8, 1, R["tierra"][3])
    v, v_s, v_l = R["verde"][2], R["verde"][1], R["verde"][3]
    for cx, cy, rx, ry in ((7, 39, 3, 4), (12, 36, 3, 4), (10, 41, 2, 3), (39, 38, 3, 4), (44, 41, 2, 3)):
        L.elipse(cx - rx, cy - ry, cx + rx, cy + ry, v)       # pencas de nopal
        L.px(cx - 1, cy - 1, v_l); L.px(cx + 1, cy + 1, v_s)
    for k, dx in enumerate((-6, -4, -2, 0, 2, 4, 6)):         # maguey
        alto = 9 - abs(dx)
        L.linea((26, SUELO - 1), (26 + dx, SUELO - 1 - alto), v_s if k % 2 else R["turquesa"][1])
    return unir(P, L)


def anil():
    """Barda pintada de azul añil con guardapolvo rojo y el cartel de la carrera pegado con cinta.
    Al pie, una jardinera de tabique con flores."""
    an, an_s, an_l = R["azul"][1], R["azul"][0], R["azul"][2]
    L = Lienzo(W, H)
    L.rect(1, 3, W - 2, BASE - 3, an)
    L.rect(1, 1, W - 2, 2, R["neutros"][4]); L.rect(1, 2, W - 2, 1, R["neutros"][3])   # remate encalado
    L.rect(1, 3, W - 2, 1, an_s)
    L.rect(1, 31, W - 2, BASE - 31, R["rojo"][1]); L.rect(1, 31, W - 2, 1, R["rojo"][2])   # guardapolvo
    for x, y in ((4, 9), (5, 9), (45, 22), (44, 23), (6, 26)):
        L.px(x, y, an_l)                                      # pintura descarapelada
    L.rect(9, 6, 32, 22, R["amarillo"][2]); L.rect(9, 6, 32, 3, R["rojo"][2])   # el cartel
    L.rect(9, 27, 32, 1, R["neutros"][3])
    texto(L, centro("CARRERA"), 11, "CARRERA", R["tinta"][1])
    texto(L, centro("5000"), 19, "5000", R["verde"][1])
    for x, y in ((8, 5), (39, 5), (8, 26), (39, 26)):         # cinta
        L.rect(x, y, 3, 2, R["neutros"][3])
    tq, junta = R["naranja"][0], R["tierra"][1]
    L.rect(3, 38, W - 6, SUELO - 37, tq)                      # jardinera de tabique, sobre la banqueta
    L.rect(3, 38, W - 6, 1, R["neutros"][3])
    for x in range(6, W - 3, 6):
        L.rect(x, 39, 1, 2, junta); L.rect(x - 3, 42, 1, 2, junta)
    L.rect(3, 41, W - 6, 1, junta)
    hoja, hoja_s = R["verde"][2], R["verde"][1]
    for x in range(4, W - 4, 3):                              # matas
        L.rect(x, 35, 2, 3, hoja_s if x % 2 else hoja)
    for k, x in enumerate(range(5, W - 5, 5)):                # flores
        L.px(x, 34, (R["rosa"][2], R["amarillo"][1], R["rojo"][2])[k % 3])
        L.px(x + 1, 35, (R["rosa"][3], R["amarillo"][2], R["rojo"][3])[k % 3])
    return unir(Lienzo(W, H), L)


def variantes():
    return [
        ("v0 · block", block(), "Obra negra con el gato;\ncemento fresco y conos"),
        ("v1 · tabique", tabique(), "«LOS GATOS»; zanja\ncon cinta de precaución"),
        ("v2 · aplanado", aplanado(), "Rosa, aplanado caído,\nfirma; registro sin tapa\ncon una rama"),
        ("v3 · lámina", lamina(), "Baldío, oxidada,\n«RÁFAGA»; nopales"),
        ("v4 · añil", anil(), "Guardapolvo y cartel\nde la carrera; jardinera"),
    ]


def main():
    previas = Path(sys.argv[1]) if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else Path("previas")
    previas.mkdir(parents=True, exist_ok=True)
    vs = variantes()
    for nombre, cuadro, _ in vs:
        assert cuadro.size == (W, H) and cuadro.getbbox()[3] == H, f"{nombre}: no pisa la última fila"
    hoja_de_contacto("Barda", vs, previas / "barda-contacto.png", previas, prop_y=8, paso=165,
                     vuelo=("run2", 78, 16), esc=5)
    if "--exportar" in sys.argv:
        exportar(vs, "wall")
    print("previas en", previas, "·", len(vs), "variantes")


if __name__ == "__main__":
    main()
