# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Puestos (152×52, textura `stalls`): cuatro tianguis, cada uno de tres puestos con otra mercancía.
Se pasa rebotando de toldo en toldo y cayendo con doble giro (`stalls` en choreo.js). Por eso en
todos:
  - hay tres toldos de 46 px de ancho, a las alturas de STALL_TOPS (filas 18, 10 y 14: 100, 124 y
    112 px sobre los pies, TOP.stalls); Sofía cae en el centro de cada uno (columnas ~25, ~75 y ~123);
  - cada toldo es plano, corrido y sin nada encima; lo que distingue a cada puesto va debajo.

  v0 frutas y verduras, bajo lonas rosa mexicano
  v1 antojitos y aguas frescas, bajo toldos de rayas con flecos
  v2 piñatas y juguetes, bajo lonas azules con papel picado
  v3 flores, bajo lonas verdes remendadas

Uso:
  python art-src/obstaculos/puestos.py <carpeta_de_previas>            hoja de contacto
  python art-src/obstaculos/puestos.py <carpeta_de_previas> --exportar  además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from comun import R, exportar, hoja_pasos  # noqa: E402

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from pincel import Lienzo  # noqa: E402

W, H = 152, 52
PROP_Y = 2                     # se dibuja 2 px bajo los pies (`y` en LONG_PROPS de choreo.js)
TOPES = (18, 10, 14)           # fila de la cara de arriba de cada toldo (STALL_TOPS de props.js)
ANCHO_T, PASO = 46, 50         # ancho de cada toldo y distancia entre puestos
GRUESO = 5                     # filas del toldo
BASE = H - 2                   # última fila de los palos: la tinta (H-1) queda en la banqueta
MESA = H - 14                  # fila de la cubierta de la mesa
TINTA = R["tinta"][1]
PALO, PALO_S = R["tierra"][2], R["tierra"][1]

LETRAS = {
    "A": [".#.", "#.#", "###", "#.#", "#.#"], "C": ["###", "#..", "#..", "#..", "###"],
    "O": ["###", "#.#", "#.#", "#.#", "###"], "S": ["###", "#..", "###", "..#", "###"],
    "T": ["###", ".#.", ".#.", ".#.", ".#."],
}


def texto(L, x, y, s, color):
    for c in s:
        for dy, fila in enumerate(LETRAS[c]):
            for dx, m in enumerate(fila):
                if m == "#":
                    L.px(x + dx, y + dy, color)
        x += len(LETRAS[c][0]) + 1


def x_de(i):
    return 2 + i * PASO


def armazon(L, i, mesa=R["tierra"][3], mesa_s=R["tierra"][2]):
    """Los dos palos y la mesa de un puesto."""
    x, t = x_de(i), TOPES[i]
    for px in (x + 3, x + 41):
        L.rect(px, t + GRUESO, 2, BASE - t - GRUESO + 1, PALO); L.rect(px + 1, t + GRUESO, 1, BASE - t - GRUESO + 1, PALO_S)
    L.rect(x + 4, MESA, 38, 3, mesa); L.rect(x + 4, MESA + 2, 38, 1, mesa_s)
    for px in (x + 6, x + 38):
        L.rect(px, MESA + 3, 2, BASE - MESA - 2, PALO_S)


def lona(L, i, color, luz, sombra, rayas=None):
    """El toldo: plano y corrido arriba. `rayas`: segundo color para un toldo de franjas."""
    x, t = x_de(i), TOPES[i]
    L.rect(x, t, ANCHO_T, GRUESO, color)
    if rayas:
        for k in range(3, ANCHO_T, 6):
            L.rect(x + k, t, 3, GRUESO, rayas)
    L.rect(x, t + GRUESO - 1, ANCHO_T, 1, sombra, solo=color)
    L.rect(x, t, ANCHO_T, 1, luz, solo=color)


def unir(P, L, E=None):
    L.contorno(TINTA)
    M = Lienzo(W, H)
    M.p = {**P.p, **L.p}
    for q, c in (E.p if E else {}).items():
        if q in L.p:
            M.p[q] = c
    return M.imagen()


def monton(L, x, y, n, colores, luz=None):
    """Un montón de fruta en pirámide: `n` piezas de 3 px en la fila de abajo, que termina en `y`."""
    k = 0
    for fila in range(3):
        for j in range(n - fila):
            c = colores[k % len(colores)]; k += 1
            px = x + j * 3 + fila * 2
            L.rect(px, y - 2 - fila * 2, 3, 3, c)
            if luz:
                L.px(px, y - 2 - fila * 2, luz)


def frutas():
    """Tianguis de frutas y verduras bajo las lonas rosa mexicano: sandías y naranjas, plátanos y
    jitomates, nopales y chiles, con el cartón del precio colgado y huacales al pie."""
    L, P, E = Lienzo(W, H), Lienzo(W, H), Lienzo(W, H)
    for i in range(3):
        armazon(L, i)
        lona(L, i, R["rosa"][2], R["rosa"][3], R["rosa"][1])
        x, t = x_de(i), TOPES[i]
        for k in (0, ANCHO_T - 1):                                                # mecates de las esquinas
            L.linea((x + k, t + GRUESO), (x + k + (2 if k == 0 else -2), t + GRUESO + 4), R["neutros"][4])
        L.rect(x + 7, MESA + 5, 9, 6, R["tierra"][3]); L.rect(x + 7, MESA + 7, 9, 1, R["tierra"][1])     # huacal al pie
        L.rect(x + 7, MESA + 9, 9, 1, R["tierra"][1])
        L.rect(x + 18, t + GRUESO + 3, 8, 6, R["neutros"][4]); L.px(x + 22, t + GRUESO + 2, R["neutros"][4])  # cartón del precio
        L.rect(x + 20, t + GRUESO + 5, 4, 1, R["rojo"][1]); L.rect(x + 20, t + GRUESO + 7, 3, 1, R["rojo"][1])   # el precio, a plumón
    x = x_de(0)                                                                   # sandías y naranjas
    for k in range(3):
        L.elipse(x + 6 + k * 7, MESA - 5, x + 11 + k * 7, MESA - 1, R["verde"][1]); L.rect(x + 8 + k * 7, MESA - 5, 1, 5, R["verde"][0])
    L.rect(x + 27, MESA - 4, 6, 4, R["rojo"][2]); L.rect(x + 27, MESA - 1, 6, 1, R["verde"][1]); L.px(x + 29, MESA - 3, R["tinta"][0])  # rebanada
    monton(L, x + 33, MESA - 1, 3, [R["naranja"][1]], R["naranja"][2])
    x = x_de(1)                                                                   # plátanos y jitomates
    for k in range(4):
        L.rect(x + 6 + k * 4, MESA - 3, 3, 3, R["amarillo"][1]); L.px(x + 6 + k * 4, MESA - 4, R["amarillo"][0]); L.px(x + 8 + k * 4, MESA - 1, R["amarillo"][0])
    monton(L, x + 24, MESA - 1, 5, [R["rojo"][2], R["rojo"][1]], R["rojo"][3])
    for k in range(5):                                                            # racimo colgado del palo
        L.rect(x + 37 - k % 2, TOPES[1] + GRUESO + 2 + k * 2, 3, 2, R["amarillo"][1])
    x = x_de(2)                                                                   # nopales, chiles y limones
    for k in range(3):
        L.elipse(x + 6 + k * 5, MESA - 6, x + 9 + k * 5, MESA - 1, R["verde"][2]); L.px(x + 7 + k * 5, MESA - 4, R["verde"][0])
    monton(L, x + 22, MESA - 1, 3, [R["verde"][1]], R["verde"][3])
    monton(L, x + 32, MESA - 1, 3, [R["rojo"][1], R["verde"][0]])
    for px, py in ((20, BASE), (21, BASE), (22, BASE - 1), (70, BASE), (71, BASE), (118, BASE), (119, BASE - 1), (120, BASE)):
        P.px(px, py, R["verde"][2])                                               # hojas tiradas, sin tinta
    return unir(P, L, E)


def antojitos():
    """Puestos de antojitos bajo toldos de rayas con flecos: vitroleros de aguas frescas, el trompo de
    pastor con su letrero de «TACOS» y el comal con la olla."""
    L, P, E = Lienzo(W, H), Lienzo(W, H), Lienzo(W, H)
    pares = ((R["rojo"][2], R["neutros"][4]), (R["amarillo"][1], R["neutros"][4]), (R["naranja"][1], R["neutros"][4]))
    for i, (a, b) in enumerate(pares):
        armazon(L, i, R["neutros"][4], R["neutros"][3])
        lona(L, i, a, a, a, rayas=b)
        x, t = x_de(i), TOPES[i]
        for k in range(0, ANCHO_T, 3):                                            # flecos
            L.px(x + k + 1, t + GRUESO, a if (k // 3) % 2 == 0 else b)
        L.rect(x + 4, MESA + 3, 38, 5, a); L.rect(x + 4, MESA + 7, 38, 1, R["tinta"][1])   # faldón del mantel
        for k in range(1, 38, 4):
            L.px(x + 4 + k, MESA + 7, a)
    x = x_de(0)                                                                   # aguas frescas
    for k, (c, c_l) in enumerate(((R["rosa"][1], R["rosa"][3]), (R["neutros"][4], R["neutros"][5]), (R["verde"][2], R["verde"][3]))):
        vx = x + 6 + k * 11
        L.rect(vx, MESA - 9, 8, 9, c); L.rect(vx, MESA - 9, 8, 2, R["turquesa"][3]); L.rect(vx + 1, MESA - 7, 1, 6, c_l)
        L.rect(vx + 1, MESA - 11, 6, 2, R["azul"][2])                             # tapa
    x = x_de(1)                                                                   # tacos al pastor
    L.rect(x + 12, TOPES[1] + GRUESO + 2, 21, 7, R["neutros"][4])
    texto(L, x + 13, TOPES[1] + GRUESO + 3, "TACOS", R["rojo"][1])
    L.rect(x + 11, MESA - 14, 1, 14, R["neutros"][1])                             # trompo
    L.poligono([(x + 8, MESA - 12), (x + 14, MESA - 12), (x + 12, MESA - 3), (x + 10, MESA - 3)], R["naranja"][0])
    L.rect(x + 9, MESA - 10, 5, 1, R["naranja"][1]); L.rect(x + 10, MESA - 6, 3, 1, R["naranja"][1])
    L.rect(x + 10, MESA - 14, 3, 2, R["amarillo"][1])                             # la piña
    L.rect(x + 18, MESA - 2, 10, 2, R["neutros"][0])                              # plancha con tortillas
    for k in range(3):
        L.rect(x + 19 + k * 3, MESA - 3, 2, 1, R["amarillo"][2])
    for k, c in enumerate((R["verde"][2], R["rojo"][1], R["neutros"][4])):        # salsas y cebolla
        L.rect(x + 31 + k * 3, MESA - 3, 2, 3, c)
    x = x_de(2)                                                                   # la olla y el comal
    L.rect(x + 7, MESA - 8, 11, 8, R["azul"][1]); L.rect(x + 6, MESA - 9, 13, 2, R["azul"][2])
    for px, py in ((9, 5), (13, 4), (15, 6), (11, 3)):
        L.px(x + px, MESA - py, R["neutros"][5])                                  # peltre con pintitas
    L.rect(x + 22, MESA - 2, 16, 2, R["neutros"][0]); L.rect(x + 21, MESA - 3, 18, 1, R["neutros"][1])   # comal
    for k in range(3):
        L.rect(x + 23 + k * 5, MESA - 4, 4, 1, R["amarillo"][2])
    for px, py in ((x_de(1) + 11, MESA - 16), (x_de(1) + 12, MESA - 18), (x + 12, MESA - 11), (x + 13, MESA - 13)):
        P.px(px, py, R["neutros"][5])                                             # humito, sin tinta
    return unir(P, L, E)


def pinata(L, cx, cy, cuerpo, picos):
    """Piñata de estrella de siete picos (se ven cinco), colgada de un mecate."""
    for dx, dy in ((0, -5), (-5, -1), (5, -1), (-3, 5), (3, 5)):
        L.linea((cx, cy), (cx + dx, cy + dy), picos, g=2)
    L.elipse(cx - 2, cy - 2, cx + 3, cy + 3, cuerpo)
    L.px(cx, cy, R["neutros"][5])


def juguetes():
    """Puestos de piñatas y juguetes bajo lonas azules con una tira de papel picado: piñatas de
    estrella colgadas, pelotas, trompos y máscaras de luchador."""
    L, P, E = Lienzo(W, H), Lienzo(W, H), Lienzo(W, H)
    picado = (R["rosa"][2], R["amarillo"][1], R["turquesa"][2], R["naranja"][1], R["morado"][1], R["verde"][2])
    for i in range(3):
        armazon(L, i)
        lona(L, i, R["azul"][2], R["azul"][3], R["azul"][1])
        x, t = x_de(i), TOPES[i]
        for k in range(8):                                                        # tira de papel picado
            c = picado[(k + i * 2) % len(picado)]
            L.rect(x + 6 + k * 4, t + GRUESO + 1, 3, 3, c); L.px(x + 7 + k * 4, t + GRUESO + 3, None)
    x = x_de(0)                                                                   # pelotas y trompos
    for k, c in enumerate((R["rojo"][2], R["amarillo"][1], R["verde"][2])):
        L.elipse(x + 6 + k * 7, MESA - 6, x + 11 + k * 7, MESA - 1, c); L.rect(x + 6 + k * 7, MESA - 4, 6, 1, R["neutros"][5])
    for k, c in enumerate((R["morado"][1], R["naranja"][1], R["turquesa"][2])):
        tx = x + 29 + k * 4
        L.rect(tx, MESA - 4, 3, 2, c); L.px(tx + 1, MESA - 2, c); L.px(tx + 1, MESA - 1, R["neutros"][1]); L.px(tx + 1, MESA - 5, R["tierra"][3])
    x = x_de(1)                                                                   # las piñatas grandes
    pinata(L, x + 14, TOPES[1] + GRUESO + 11, R["amarillo"][1], R["rosa"][2])
    pinata(L, x + 31, TOPES[1] + GRUESO + 13, R["turquesa"][2], R["naranja"][1])
    for k, c in enumerate((R["rojo"][2], R["verde"][2], R["morado"][1], R["amarillo"][1], R["rosa"][2])):
        L.rect(x + 7 + k * 7, MESA - 4, 5, 4, c); L.rect(x + 7 + k * 7, MESA - 4, 5, 1, R["neutros"][4])   # cajitas
    x = x_de(2)                                                                   # máscaras de luchador
    for k, (c, c2) in enumerate(((R["azul"][1], R["neutros"][5]), (R["rojo"][2], R["amarillo"][1]), (R["verde"][1], R["neutros"][5]))):
        mx = x + 7 + k * 11
        L.elipse(mx, MESA - 8, mx + 6, MESA - 1, c)
        L.px(mx + 1, MESA - 5, c2); L.px(mx + 2, MESA - 5, c2); L.px(mx + 4, MESA - 5, c2); L.px(mx + 5, MESA - 5, c2)
        L.rect(mx + 2, MESA - 3, 3, 1, c2)
    for px, c in ((30, picado[0]), (33, picado[1]), (84, picado[2]), (87, picado[0]), (131, picado[3])):
        P.px(px, BASE, c)                                                         # confeti tirado, sin tinta
    return unir(P, L, E)


def cubeta(L, x, y, flor, centro, n=3, alto=6):
    """Cubeta con un ramo: `y` es la fila donde se apoya."""
    L.rect(x, y - 4, 2 * n + 1, 5, R["neutros"][2]); L.rect(x, y - 4, 2 * n + 1, 1, R["neutros"][3])
    for k in range(n):
        fx = x + k * 2 + (k % 2)
        L.rect(fx, y - 4 - alto + (k % 2), 1, alto, R["verde"][1])
        L.rect(fx - 1, y - 6 - alto + (k % 2), 3, 2, flor); L.px(fx, y - 6 - alto + (k % 2), centro)


def flores():
    """Puestos de flores bajo lonas verdes remendadas: cubetas de cempasúchil, rosas, alcatraces y
    girasoles en la mesa y al pie."""
    L, P, E = Lienzo(W, H), Lienzo(W, H), Lienzo(W, H)
    ramos = ((R["naranja"][1], R["amarillo"][1]), (R["rosa"][2], R["rosa"][3]), (R["neutros"][5], R["amarillo"][1]),
             (R["amarillo"][1], R["tierra"][1]), (R["morado"][1], R["morado"][2]), (R["rojo"][2], R["rojo"][3]))
    for i in range(3):
        armazon(L, i, R["neutros"][2], R["neutros"][1])
        lona(L, i, R["verde"][1], R["verde"][2], R["verde"][0])
        x, t = x_de(i), TOPES[i]
        for k in range(4):                                                        # cubetas en la mesa
            flor, centro = ramos[(i * 2 + k) % len(ramos)]
            cubeta(L, x + 6 + k * 9, MESA - 1, flor, centro, n=3, alto=5 + (k + i) % 2 * 2)
        flor, centro = ramos[(i * 2 + 4) % len(ramos)]                            # y una grande al pie
        cubeta(L, x + 14, BASE, flor, centro, n=4, alto=3)
        for k in range(3):                                                        # ramitos colgados del travesaño
            fx = x + 12 + k * 10
            L.rect(fx, t + GRUESO + 1, 1, 3, R["verde"][0]); L.rect(fx - 1, t + GRUESO + 4, 3, 2, ramos[(i + k) % len(ramos)][0])
    for i, (dx, w) in enumerate(((9, 5), (27, 6), (15, 4))):                      # remiendos de la lona
        E.rect(x_de(i) + dx, TOPES[i] + 1, w, 3, R["neutros"][3])
    for px, c in ((24, R["naranja"][1]), (27, R["rosa"][2]), (78, R["naranja"][1]), (126, R["amarillo"][1]), (129, R["rosa"][2])):
        P.px(px, BASE, c)                                                         # pétalos tirados, sin tinta
    return unir(P, L, E)


def variantes():
    return [
        ("v0 · frutas", frutas(), "Frutas y verduras bajo lonas rosa mexicano: sandías, plátanos, jitomates, nopales, el cartón del precio y huacales"),
        ("v1 · antojitos", antojitos(), "Antojitos bajo toldos de rayas con flecos: aguas frescas, el trompo con su letrero «TACOS», la olla y el comal"),
        ("v2 · juguetes", juguetes(), "Piñatas y juguetes bajo lonas azules con papel picado: piñatas de estrella, pelotas, trompos y máscaras de luchador"),
        ("v3 · flores", flores(), "Flores bajo lonas verdes remendadas: cubetas de cempasúchil, rosas, alcatraces y girasoles"),
    ]


# Coreografía (choreo.js, caso 'stalls', con pre = 50, w = 456, post = 120 de runner.js): puntos clave
# (x desde el arranque, altura de los pies, cuadro, arco, giro).
PRE, ANCHO_PX, FIN = 50, 456, 626
H1, H2, H3 = 0.2 * FIN, 0.44 * FIN, 0.67 * FIN
T1, T2, T3 = 100, 124, 112
CLAVES = [(0, 0, "ready", 0, 0), (40, 0, "hop", 30, 0), (H1, T1, "land", 0, 0), (H1 + 3, T1, "hop", 70, 0),
          (H2, T2, "land", 0, 0), (H2 + 3, T2, "hop", 60, 0), (H3, T3, "land", 0, 0),
          (H3 + 3, T3, "tuck", 90, 720), (PRE + ANCHO_PX + 70, 0, "land", 0, 0), (FIN - 25, 0, "run", 0, 0), (FIN, 0, "run", 0, 0)]
PASOS = [0, 70, H1, 200, H2, 348, H3, 500, PRE + ANCHO_PX + 70]


def main():
    previas = Path(sys.argv[1]) if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else Path("previas")
    previas.mkdir(parents=True, exist_ok=True)
    vs = variantes()
    tinta = (0x2b, 0x1d, 0x2e)
    for nombre, cuadro, _ in vs:
        assert cuadro.size == (W, H), nombre
        for i, t in enumerate(TOPES):
            cols = range(x_de(i), x_de(i) + ANCHO_T)
            assert all(cuadro.getpixel((x, t))[3] for x in cols), f"{nombre}: el toldo {i} no es corrido"
            assert all(cuadro.getpixel((x, t - 1))[:3] == tinta for x in cols), f"{nombre}: hay algo sobre el toldo {i}"
            assert not any(cuadro.getpixel((x, y))[3] for x in cols for y in range(t - 1)), f"{nombre}: hay algo encima del toldo {i}"
    hoja_pasos("Puestos", vs, previas / "puestos-contacto.png", previas, PROP_Y, PRE, CLAVES, PASOS, esc=5, corte_y=(110, 486), x0=220)
    if "--exportar" in sys.argv:
        exportar(vs, "stalls")
    print("previas en", previas, "·", len(vs), "variantes")


if __name__ == "__main__":
    main()
