# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Microbús (122×48, textura `bus`): tres vehículos estacionados, de frente hacia Sofía.
Se pasa subiendo al cofre, brincando al techo, corriendo por él y bajando con un mortal (`bus` en
choreo.js). Por eso los tres tienen:
  - el cofre bajo al frente (izquierda), plano, con su cara de arriba en la fila 24 (70 px sobre los
    pies, TOP.hood): Sofía se agacha ahí en la columna ~14;
  - el techo plano, corrido y sin nada encima, con su cara de arriba en la fila 4 (130 px,
    TOP.roof), desde antes de la columna 27 (donde cae) hasta después de la 112 (donde salta).

  v0 microbús verde y blanco de ruta, golpeado
  v1 camión guajolotero trompudo, rojo y crema, con su nombre pintado
  v2 camioneta de fletes y mudanzas, con la caja rotulada a mano

Uso:
  python art-src/obstaculos/microbus.py <carpeta_de_previas>            hoja de contacto
  python art-src/obstaculos/microbus.py <carpeta_de_previas> --exportar  además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from comun import R, exportar, hoja_pasos  # noqa: E402

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from pincel import Lienzo  # noqa: E402

W, H = 122, 48
PROP_Y = 2                     # se dibuja 2 px bajo los pies (`y` en LONG_PROPS de choreo.js)
TECHO = 4                      # cara de arriba del techo (la 3 es contorno): 130 px sobre los pies
COFRE = 24                     # cara de arriba del cofre: 70 px sobre los pies
FALDON = 39                    # última fila de la carrocería
T0 = 21                        # columna donde empieza el techo (el parabrisas sube inclinado desde la 19)
RUEDAS = (13, W - 22)          # centro de cada llanta
TINTA = R["tinta"][1]
VIDRIO, VIDRIO_L, VIDRIO_S = R["azul"][2], R["azul"][3], R["azul"][1]

LETRAS = {
    "A": [".#.", "#.#", "###", "#.#", "#.#"], "E": ["###", "#..", "##.", "#..", "###"],
    "F": ["###", "#..", "##.", "#..", "#.."], "I": ["###", ".#.", ".#.", ".#.", "###"],
    "L": ["#..", "#..", "#..", "#..", "###"], "P": ["##.", "#.#", "##.", "#..", "#.."],
    "R": ["##.", "#.#", "##.", "#.#", "#.#"], "S": ["###", "#..", "###", "..#", "###"],
    "T": ["###", ".#.", ".#.", ".#.", ".#."], "U": ["#.#", "#.#", "#.#", "#.#", "###"],
    "5": ["###", "#..", "##.", "..#", "##."], " ": ["..", "..", "..", "..", ".."],
}


def texto(L, x, y, s, color):
    for c in s:
        for dy, fila in enumerate(LETRAS[c]):
            for dx, m in enumerate(fila):
                if m == "#":
                    L.px(x + dx, y + dy, color)
        x += len(LETRAS[c][0]) + 1


def casco(L, color, luz, sombra):
    """La silueta común: cofre bajo al frente y caja de techo plano."""
    L.poligono([(1, FALDON), (1, COFRE + 3), (3, COFRE), (T0 - 3, COFRE), (T0, TECHO), (W - 2, TECHO), (W - 2, FALDON)], color)
    L.rect(T0, TECHO, W - 1 - T0, 1, luz)                                         # canto de luz del techo
    L.rect(3, COFRE, T0 - 5, 1, luz)                                              # y del cofre
    L.rect(W - 2, TECHO + 1, 1, FALDON - TECHO, sombra)                           # sombra de atrás


def ruedas(L, rin):
    for cx in RUEDAS:
        L.elipse(cx - 7, FALDON - 5, cx + 7, FALDON + 2, R["tinta"][0])           # hueco de la salpicadera
        L.elipse(cx - 5, 36, cx + 5, 46, R["neutros"][0])                          # llanta
        L.elipse(cx - 2, 39, cx + 2, 43, rin); L.px(cx, 41, R["neutros"][0])
    L.rect(RUEDAS[0] + 8, FALDON + 1, RUEDAS[1] - RUEDAS[0] - 15, 1, R["tinta"][0])  # el chasis, a la sombra


def parabrisas(L):
    for y in range(TECHO + 4, COFRE - 3):
        x = T0 + 1 - round((y - TECHO) * 3 / (COFRE - TECHO))                     # sigue la inclinación del frente
        L.rect(x, y, 6, 1, VIDRIO)
        L.px(x + 1, y, VIDRIO_L)
    L.rect(T0 + 3, TECHO + 5, 1, 5, R["neutros"][5])                              # reflejo


def ventana(L, x, y, w, h, arco=False):
    L.rect(x, y, w, h, VIDRIO); L.rect(x, y, w, 2, VIDRIO_L); L.rect(x + 1, y + 2, 2, h - 4, VIDRIO_L)
    L.rect(x, y + h - 1, w, 1, VIDRIO_S)
    if arco:
        L.px(x, y, None); L.px(x + w - 1, y, None)


def unir(P, L, E=None):
    L.contorno(TINTA)
    M = Lienzo(W, H)
    M.p = {**P.p, **L.p}
    for q, c in (E.p if E else {}).items():                                       # detalles sobre la carrocería
        if q in L.p:
            M.p[q] = c
    return M.imagen()


def micro():
    """Microbús de ruta, verde y blanco: ventanas grandes, puerta de dos hojas, la franja con «RUTA 5»
    y los golpes de todos los días (defensa caída de un lado, salpicadera oxidada, un faro roto).
    Dejó su mancha de aceite en el piso."""
    bl, bl_s, ve, ve_s, ve_l = R["neutros"][4], R["neutros"][3], R["verde"][1], R["verde"][0], R["verde"][2]
    L, P, E = Lienzo(W, H), Lienzo(W, H), Lienzo(W, H)
    casco(L, bl, R["neutros"][5], bl_s)
    L.rect(1, 28, W - 2, 7, ve, solo=bl); L.rect(1, 28, W - 2, 1, ve_l, solo=ve)    # franja verde
    L.rect(1, 35, W - 2, 1, ve_s, solo=bl)
    L.rect(T0 + 1, TECHO + 1, W - 3 - T0, 2, ve, solo=bl)                         # filo verde del techo
    parabrisas(L)
    L.rect(30, 8, 9, 28, bl_s); ventana(L, 31, 9, 3, 12); ventana(L, 35, 9, 3, 12)  # puerta de dos hojas
    L.rect(34, 8, 1, 28, R["neutros"][2]); ventana(L, 31, 24, 3, 9); ventana(L, 35, 24, 3, 9)
    for x in range(42, 108, 13):                                                  # ventanas
        ventana(L, x, 9, 11, 11)
        L.rect(x, 14, 11, 1, bl_s)                                                # la corrediza
    texto(L, 60, 29, "RUTA 5", R["neutros"][5])
    L.rect(2, 29, 3, 3, R["amarillo"][1]); L.px(3, 30, R["neutros"][5])           # faro
    L.rect(T0 + 2, COFRE - 7, 4, 3, R["rosa"][2])                                 # letrero de la ruta tras el vidrio
    ruedas(L, R["neutros"][2])
    L.linea((1, 36), (9, 38), R["neutros"][1]); L.linea((1, 37), (9, 39), R["neutros"][0])  # defensa caída de un lado
    for x, y in ((8, 27), (9, 27), (9, 26), (22, 34), (23, 34), (23, 33), (W - 12, 30), (W - 11, 31), (50, 36), (51, 36)):
        E.px(x, y, R["naranja"][0])                                               # óxido
    for x, y in ((10, 30), (11, 31), (12, 30), (46, 31), (47, 32), (88, 23), (89, 24), (90, 24)):
        E.px(x, y, ve_s if y >= 28 else bl_s)                                     # golpes
    P.rect(30, 45, 13, 2, R["neutros"][0]); P.rect(32, 44, 8, 1, R["neutros"][0]); P.px(45, 46, R["neutros"][0])  # aceite
    P.px(33, 45, R["morado"][0]); P.px(37, 45, R["azul"][1])
    return unir(P, L, E)


def guajolotero():
    """Camión guajolotero de los de pueblo, trompudo: rojo abajo y crema arriba, ventanas chicas de
    arco, franjas amarillas, parrilla y faro redondo, y su nombre pintado a mano: «LUPITA»."""
    cr, cr_s, rj, rj_s, rj_l = R["neutros"][4], R["neutros"][3], R["rojo"][2], R["rojo"][1], R["rojo"][3]
    am, am_s = R["amarillo"][1], R["amarillo"][0]
    L, P, E = Lienzo(W, H), Lienzo(W, H), Lienzo(W, H)
    casco(L, cr, R["neutros"][5], cr_s)
    L.rect(1, 22, W - 2, FALDON - 21, rj, solo=cr)                                # rojo de la cintura para abajo
    L.rect(3, COFRE, T0 - 5, 1, rj_l)
    L.rect(1, 26, W - 2, 2, am, solo=rj); L.rect(1, 36, W - 2, 1, rj_s, solo=rj)   # franjas
    L.rect(T0 + 1, TECHO + 1, W - 3 - T0, 2, am, solo=cr); L.rect(T0 + 1, TECHO + 2, W - 3 - T0, 1, am_s, solo=am)
    parabrisas(L)
    for x in range(31, 112, 10):                                                  # ventanas chicas de arco
        ventana(L, x, 9, 7, 10, arco=True)
    L.rect(1, 28, 3, 8, R["neutros"][2])                                          # parrilla
    for y in range(29, 36, 2):
        L.rect(1, y, 3, 1, R["neutros"][0])
    L.elipse(5, 28, 8, 31, am); L.px(6, 29, R["neutros"][5])                      # faro redondo
    L.rect(1, 37, 8, 2, R["neutros"][3]); L.rect(1, 38, 8, 1, R["neutros"][1])    # defensa cromada
    texto(L, 58, 30, "LUPITA", cr)
    for x in (52, 84):                                                            # adornos junto al nombre
        L.px(x, 32, am); L.px(x + 1, 31, am); L.px(x + 1, 33, am); L.px(x + 2, 32, am)
    ruedas(L, am)
    for x, y in ((40, 37), (41, 37), (99, 23), (100, 23), (15, 25)):              # pintura botada: gris claro
        E.px(x, y, R["neutros"][3])
    return unir(P, L, E)


def fletes():
    """Camioneta de fletes y mudanzas: cabina azul con el copete de la caja encima, y la caja turquesa
    de lámina acanalada con su rótulo pintado a mano, «FLETES», y la cortina de atrás amarrada con
    un mecate."""
    az, az_s, az_l = R["azul"][1], R["azul"][0], R["azul"][2]
    tq, tq_s, tq_l = R["turquesa"][2], R["turquesa"][1], R["turquesa"][3]
    L, P, E = Lienzo(W, H), Lienzo(W, H), Lienzo(W, H)
    casco(L, tq, tq_l, tq_s)
    CAJA = 41                                                                     # donde empieza la caja
    L.rect(1, 12, CAJA - 1, FALDON - 11, az, solo=tq)                             # la cabina, bajo el copete
    L.rect(3, COFRE, T0 - 5, 1, az_l)
    L.rect(T0, 11, CAJA - T0, 1, tq_s, solo=tq)                                   # sombra del copete
    for y in range(13, COFRE - 2):                                                # parabrisas, bajo el copete
        x = T0 + 1 - round((y - TECHO) * 3 / (COFRE - TECHO))
        L.rect(x, y, 5, 1, VIDRIO); L.px(x + 1, y, VIDRIO_L)
    ventana(L, 28, 14, 9, 9); L.rect(27, 13, 11, 25, az_s, solo=az)               # puerta con su ventana
    L.rect(28, 24, 9, 13, az); L.rect(35, 28, 2, 1, R["neutros"][3])              # manija
    L.rect(CAJA, TECHO + 1, 1, FALDON - TECHO, tq_s)
    for x in range(CAJA + 5, W - 3, 5):                                           # lámina acanalada
        L.rect(x, TECHO + 2, 1, FALDON - TECHO - 3, tq_s, solo=tq)
    L.rect(52, 14, 50, 15, R["neutros"][4]); L.rect(52, 28, 50, 1, R["neutros"][3])  # el rótulo
    for dx, s in enumerate("FLETES"):
        for dy, fila in enumerate(LETRAS[s]):
            for k, m in enumerate(fila):
                if m == "#":
                    L.rect(56 + dx * 7 + k * 2 + 1, 16 + dy * 2 + 1, 2, 2, R["tinta"][1])   # sombra
        for dy, fila in enumerate(LETRAS[s]):
            for k, m in enumerate(fila):
                if m == "#":
                    L.rect(56 + dx * 7 + k * 2, 16 + dy * 2, 2, 2, R["rojo"][2])
    L.rect(2, 30, 3, 3, R["amarillo"][1]); L.px(3, 31, R["neutros"][5])           # faro
    L.rect(1, 36, 9, 2, R["neutros"][1]); L.rect(1, 37, 9, 1, R["neutros"][0])    # defensa
    L.rect(CAJA, 34, W - 2 - CAJA, 1, tq_s, solo=tq)
    ruedas(L, R["neutros"][3])
    for y in range(30, 37, 2):                                                    # mecate de la cortina de atrás
        E.px(W - 3, y, R["neutros"][4])
    for x, y in ((46, 36), (47, 36), (47, 37), (110, 31), (111, 32), (70, 33)):   # raspones de la caja
        E.px(x, y, R["neutros"][3])
    return unir(P, L, E)


def variantes():
    return [
        ("v0 · microbús", micro(), "Microbús de ruta verde y blanco, «RUTA 5»: defensa caída, óxido, golpes y su mancha de aceite"),
        ("v1 · guajolotero", guajolotero(), "Camión guajolotero trompudo, rojo y crema, ventanas de arco y su nombre pintado: «LUPITA»"),
        ("v2 · fletes", fletes(), "Camioneta de fletes y mudanzas: cabina azul, caja turquesa acanalada con el rótulo «FLETES»"),
    ]


# Coreografía (choreo.js, caso 'bus', con pre = 50, w = 366, post = 120 de runner.js): puntos clave
# (x desde el arranque, altura de los pies, cuadro, arco, giro).
PRE, ANCHO_PX, FIN = 50, 366, 536
H1, H2 = 0.17 * FIN, 0.72 * FIN
CLAVES = [(0, 0, "ready", 0, 0), (30, 0, "hop", 20, 0), (H1, 70, "crouch", 0, 0), (H1 + 3, 70, "hop", 25, 0),
          (PRE + 80, 130, "land", 0, 0), (PRE + 92, 130, "run", 0, 0), (H2, 130, "ready", 0, 0),
          (H2 + 3, 130, "tuck", 70, 360), (PRE + ANCHO_PX + 80, 0, "land", 0, 0), (FIN - 14, 0, "run", 0, 0), (FIN, 0, "run", 0, 0)]
PASOS = [0, 52, H1, PRE + 84, 250, H2, 442, PRE + ANCHO_PX + 80]


def main():
    previas = Path(sys.argv[1]) if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else Path("previas")
    previas.mkdir(parents=True, exist_ok=True)
    vs = variantes()
    tinta = (0x2b, 0x1d, 0x2e)
    for nombre, cuadro, _ in vs:
        assert cuadro.size == (W, H), nombre
        assert all(cuadro.getpixel((x, TECHO))[3] for x in range(T0, W - 1)), f"{nombre}: el techo no es corrido"
        assert all(cuadro.getpixel((x, TECHO - 1))[:3] == tinta for x in range(T0, W - 1)), f"{nombre}: hay algo sobre el techo"
        assert not any(cuadro.getpixel((x, y))[3] for x in range(W) for y in range(TECHO - 1)), f"{nombre}: hay algo encima del techo"
        assert all(cuadro.getpixel((x, COFRE - 1))[:3] == tinta for x in range(4, T0 - 4)), f"{nombre}: el cofre no es plano"
    hoja_pasos("Microbús", vs, previas / "microbus-contacto.png", previas, PROP_Y, PRE, CLAVES, PASOS, esc=5, corte_y=(120, 486))
    if "--exportar" in sys.argv:
        exportar(vs, "bus")
    print("previas en", previas, "·", len(vs), "variantes")


if __name__ == "__main__":
    main()
