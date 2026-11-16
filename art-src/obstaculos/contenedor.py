# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Contenedor (46×36, textura `container`): tres cajas grandes de la calle, cada una otro objeto.
Se pasa con salto de gato (las manos al borde de arriba y las piernas entre los brazos), así que
todas tienen la cara de arriba plana, firme y sin nada encima, en la fila 3 del cuadro (97 px de
pantalla sobre los pies, donde la coreografía apoya las manos).

  v0 contenedor de basura de lámina del municipio, abollado y con óxido; al pie, el escurrido
  v1 congelador de paletas de la tiendita, sacado a la banqueta, con su letrero pintado a mano
  v2 gabinete de teléfonos de la banqueta, grafiteado, con la puerta botada y los cables de fuera;
    al pie, la banqueta rota

Uso:
  python art-src/obstaculos/contenedor.py <carpeta_de_previas>            hoja de contacto
  python art-src/obstaculos/contenedor.py <carpeta_de_previas> --exportar  además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from comun import R, hoja_de_contacto, exportar  # noqa: E402

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from pincel import Lienzo  # noqa: E402

W, H = 46, 36
ARRIBA = 3                     # fila de la cara de arriba (la 2 es contorno): ahí van las manos
SUELO = 33                     # fila de abajo de lo que está parado (la 34 es contorno)
# La banqueta del mapa empieza en la fila 31 del cuadro. Lo plano que va al pie (escurrido, banqueta
# rota) se pinta sobre ella con orilla de su tono oscuro, sin tinta, como al pie de la barda.
TINTA = R["tinta"][1]

# Letras de 3×5 de la fuente del juego, más la P, que el dibujo por código no usaba.
LETRAS = {
    "A": [".#.", "#.#", "###", "#.#", "#.#"],
    "E": ["###", "#..", "##.", "#..", "###"], "L": ["#..", "#..", "#..", "#..", "###"],
    "P": ["##.", "#.#", "##.", "#..", "#.."], "R": ["##.", "#.#", "##.", "#.#", "#.#"],
    "S": ["###", "#..", "###", "..#", "###"], "T": ["###", ".#.", ".#.", ".#.", ".#."],
    "U": ["#.#", "#.#", "#.#", "#.#", "###"],
}


def texto(L, x, y, s, color, solo=None):
    for ch in s:
        for dy, fila in enumerate(LETRAS[ch]):
            for dx, m in enumerate(fila):
                if m == "#":
                    L.px(x + dx, y + dy, color, solo)
        x += len(LETRAS[ch][0]) + 1


def ancho_texto(s):
    return sum(len(LETRAS[ch][0]) + 1 for ch in s) - 1


def unir(piso, L):
    """Pone el objeto (con contorno de tinta) sobre lo plano del piso."""
    L.contorno(TINTA)
    M = Lienzo(W, H)
    M.p = {**piso.p, **L.p}
    return M.imagen()


def plano(pts, color, orilla):
    """Mancha plana sobre la banqueta del mapa, con orilla de su tono oscuro."""
    P = Lienzo(W, H)
    P.poligono(pts, color)
    P.contorno(orilla)
    return P


def rueda(L, cx):
    L.rect(cx - 2, SUELO - 3, 5, 4, R["neutros"][0])
    L.px(cx, SUELO - 2, R["neutros"][2]); L.px(cx, SUELO - 1, R["neutros"][1])


def basura():
    """Contenedor de lámina verde del municipio: tapa cerrada y plana, costillas, una abolladura,
    óxido en las esquinas. Al pie, el escurrido que siempre deja."""
    v_s, v, v_l = R["verde"][0], R["verde"][1], R["verde"][2]
    oxido, oxido_l = R["naranja"][0], R["naranja"][1]
    L = Lienzo(W, H)
    L.poligono([(3, 8), (42, 8), (41, 29), (4, 29)], v)                 # caja, un poco más angosta abajo
    L.rect(3, 8, 1, 21, v_s); L.rect(41, 8, 2, 21, v_s, solo=v)
    for x in (10, 18, 27, 35):                                          # costillas de lámina, bajo el letrero
        L.rect(x, 21, 1, 7, v_s, solo=v); L.rect(x + 1, 21, 1, 7, v_l, solo=v)
    L.rect(4, 10, 37, 1, v_l, solo=v); L.rect(4, 20, 37, 1, v_s, solo=v)   # franja lisa de arriba
    L.rect(4, 28, 37, 1, v_s, solo=v)
    L.rect(1, ARRIBA, W - 2, 4, v)                                      # tapa cerrada que sobresale
    L.rect(1, ARRIBA, W - 2, 1, v_l)
    L.rect(1, 6, W - 2, 1, v_s)
    L.rect(2, 7, W - 4, 1, R["tinta"][1])                               # sombra bajo la tapa
    for x in (6, 39):                                                   # bisagras
        L.rect(x, 6, 2, 1, R["neutros"][2])
    L.rect(43, 13, 2, 9, R["neutros"][2]); L.px(44, 13, R["neutros"][3])   # tubo para levantarlo
    for x, y in ((28, 22), (29, 23), (30, 23), (31, 24), (32, 25), (33, 25)):   # abolladura: un pliegue
        L.px(x, y, v_s); L.px(x, y - 1, v_l)
    for x, y, h in ((5, 22, 7), (6, 25, 4), (39, 20, 9), (38, 24, 5)):  # óxido que sube de abajo
        L.rect(x, y, 1, h, oxido, solo=v)
    L.px(5, 21, oxido_l); L.px(39, 19, oxido_l)
    for x, y in ((12, 4), (13, 4), (31, 5)):                            # raspones de la tapa
        L.px(x, y, v_s)
    L.rect(6, 29, 33, 1, R["neutros"][0])                               # chasis
    rueda(L, 8); rueda(L, 37)
    jugo, jugo_s = R["tierra"][1], R["tierra"][0]
    P = plano([(14, 31), (33, 31), (45, 33), (45, 35), (30, 35), (12, 34)], jugo, jugo_s)  # escurrido hacia la calle
    P.rect(35, 34, 5, 1, R["tierra"][2]); P.px(43, 34, R["tierra"][2])  # brillo de lo mojado
    return unir(P, L)


def paletas():
    """Congelador horizontal de paletas que la tiendita saca a la banqueta: tapa plana con su jaladera,
    letrero pintado a mano con una paleta, rejilla del motor y el cable enrollado en el piso."""
    b, b_s, b_l = R["neutros"][4], R["neutros"][3], R["neutros"][5]
    rosa, rosa_s = R["rosa"][2], R["rosa"][1]
    L = Lienzo(W, H)
    L.rect(2, 7, W - 4, 24, b)                                          # cuerpo
    L.rect(W - 4, 7, 2, 24, b_s)
    L.rect(1, ARRIBA, W - 2, 4, b)                                      # tapa
    L.rect(1, ARRIBA, W - 2, 1, b_l)
    L.rect(1, 6, W - 2, 1, b_s)
    L.rect(19, 7, 8, 2, R["neutros"][2]); L.rect(20, 7, 6, 1, R["neutros"][3])  # jaladera
    L.rect(2, 11, W - 4, 11, rosa)                                      # franja pintada
    L.rect(2, 11, W - 4, 1, R["rosa"][3]); L.rect(2, 21, W - 4, 1, rosa_s)
    texto(L, 14, 14, "PALETAS", b_l)
    pv, pv_s, pv_l = R["verde"][2], R["verde"][1], R["verde"][3]        # paleta de limón, mordida
    L.rect(5, 13, 6, 6, pv); L.rect(6, 12, 4, 1, pv)
    L.rect(5, 13, 1, 6, pv_l); L.rect(10, 13, 1, 6, pv_s)
    L.px(9, 12, rosa); L.px(10, 13, rosa); L.px(10, 14, rosa)          # la mordida
    L.rect(7, 19, 2, 2, R["tierra"][4])                                 # palito
    L.rect(2, 23, W - 4, 1, R["turquesa"][1])                           # filete turquesa
    for y in range(25, 30, 2):                                          # rejilla del motor
        L.rect(31, y, 10, 1, R["neutros"][1])
    for x, y in ((3, 28), (4, 29), (5, 29), (3, 29), (40, 8), (41, 9)):  # óxido de las orillas
        L.px(x, y, R["naranja"][0])
    L.px(13, 26, b_s); L.px(14, 26, b_s); L.px(22, 28, b_s)             # golpes
    L.rect(2, 30, W - 4, 1, b_s)
    for x in (5, 40):                                                   # patas
        L.rect(x, 31, 2, SUELO - 30, R["neutros"][1])
    cable, cable_s = R["neutros"][0], R["tinta"][1]                     # cable desenchufado, en el piso
    P = Lienzo(W, H)
    for x, y in ((9, 33), (10, 34), (11, 34), (12, 34), (13, 33), (14, 33), (15, 34), (16, 34),
                 (17, 33), (18, 32), (19, 32), (20, 33)):
        P.px(x, y, cable)
    P.rect(21, 33, 2, 1, cable_s); P.px(23, 33, R["neutros"][2])        # clavija
    return unir(P, L)


def gabinete():
    """Gabinete de teléfonos de la banqueta, pintado de azul por el municipio y vuelto a grafitear:
    papelitos pegados, la puerta de la derecha botada y los cables de colores de fuera.
    Al pie, la banqueta rota alrededor de su base."""
    a_s, a, a_l = R["azul"][0], R["azul"][1], R["azul"][2]
    L = Lienzo(W, H)
    L.rect(2, ARRIBA, W - 4, 27, a)                                     # caja
    L.rect(1, ARRIBA, W - 2, 2, a_l)                                    # techito que sobresale
    L.rect(1, ARRIBA + 2, W - 2, 1, a_s)
    L.rect(W - 4, 6, 2, 24, a_s)
    L.rect(23, 6, 1, 23, a_s)                                           # junta de las dos puertas
    L.rect(3, 6, 1, 23, a_l)
    # puerta derecha botada: el hueco oscuro y la lámina chueca hacia afuera
    L.poligono([(25, 7), (41, 6), (41, 28), (25, 28)], R["tinta"][1])
    L.poligono([(27, 8), (42, 5), (43, 27), (28, 29)], a)
    L.linea((27, 8), (42, 5), a_l); L.linea((42, 5), (43, 27), a_s)
    L.rect(29, 9, 1, 19, a_s, solo=a)
    for k, (c, x) in enumerate(((R["rojo"][2], 25), (R["amarillo"][1], 26), (R["verde"][2], 25),
                                (R["azul"][3], 26))):                   # cables que cuelgan del hueco
        L.linea((x, 12 + 3 * k), (x - 1 + k % 2, 22 + 2 * k), c)
    L.linea((26, 26), (31, SUELO), R["rojo"][2]); L.linea((25, 27), (27, SUELO), R["amarillo"][1])
    # grafiti en la puerta izquierda
    g, g2 = R["rosa"][2], R["amarillo"][1]
    for x, y in ((6, 15), (7, 14), (8, 13), (9, 14), (10, 15), (11, 14), (12, 13), (13, 14), (14, 15),
                 (15, 14), (16, 13), (17, 14), (8, 16), (12, 16), (16, 16)):
        L.px(x, y, g)
    L.linea((5, 18), (19, 17), g2)
    # papelitos pegados: «se renta cuarto», «clases de guitarra» (tiras para arrancar el teléfono)
    for x0, y0, c in ((6, 21, R["neutros"][5]), (14, 20, R["amarillo"][2])):
        L.rect(x0, y0, 6, 6, c)
        L.rect(x0 + 1, y0 + 1, 4, 1, R["neutros"][1]); L.rect(x0 + 1, y0 + 3, 3, 1, R["neutros"][2])
        for x in range(x0, x0 + 6, 2):
            L.px(x, y0 + 5, R["neutros"][2])
    L.rect(20, 11, 2, 3, R["neutros"][2]); L.px(20, 12, R["tinta"][1])  # chapa forzada
    L.rect(2, 29, W - 4, 1, a_s)
    L.rect(4, 30, W - 8, SUELO - 29, R["neutros"][2])                   # base de concreto
    L.rect(4, 30, W - 8, 1, R["neutros"][3])
    # banqueta rota: dos placas levantadas y la tierra que asoma entre ellas
    P = plano([(1, 32), (14, 31), (15, 35), (2, 35)], R["neutros"][3], R["neutros"][1])
    Q = plano([(32, 31), (45, 32), (44, 35), (33, 35)], R["neutros"][3], R["neutros"][1])
    T = plano([(15, 33), (32, 33), (32, 35), (15, 35)], R["tierra"][2], R["tierra"][1])
    P.p = {**T.p, **Q.p, **P.p}
    P.linea((5, 33), (9, 35), R["neutros"][1]); P.linea((38, 32), (41, 35), R["neutros"][1])   # grietas
    return unir(P, L)


def variantes():
    return [
        ("v0 · basura", basura(), "Contenedor del municipio,\nabollado y oxidado;\nescurrido al pie"),
        ("v1 · paletas", paletas(), "Congelador de paletas\nde la tiendita, con\nel cable en el piso"),
        ("v2 · gabinete", gabinete(), "Gabinete de teléfonos\ngrafiteado, puerta botada;\nbanqueta rota"),
    ]


def main():
    previas = Path(sys.argv[1]) if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else Path("previas")
    previas.mkdir(parents=True, exist_ok=True)
    vs = variantes()
    for nombre, cuadro, _ in vs:
        assert cuadro.size == (W, H), nombre
        assert all(cuadro.getpixel((x, y))[3] == 0 for y in range(ARRIBA - 1) for x in range(W)), \
            f"{nombre}: hay algo encima de la cara de arriba"
        assert all(cuadro.getpixel((x, ARRIBA))[3] for x in range(2, W - 2)), f"{nombre}: la cara de arriba no es corrida"
    hoja_de_contacto("Contenedor", vs, previas / "contenedor-contacto.png", previas, prop_y=2,
                     paso=210, vuelo=("fly", 58, 0), esc=8)
    if "--exportar" in sys.argv:
        exportar(vs, "container")
    print("previas en", previas, "·", len(vs), "variantes")


if __name__ == "__main__":
    main()
