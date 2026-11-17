# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Fondo de la zona prohibida (`prohibida`): atardecer morado-naranja, abandonado, tierra, llantas
y barriles.

  lejana  siluetas de fábricas con chimeneas, un tanque y una torre de luz, veladas con el cielo
  media   pocas construcciones y mucho terreno abierto: bodega de lámina oxidada, tanque elevado,
          llantas y tambos tras una cerca de púas con letrero, bodega de concreto con la cortina
          abajo, y un terreno con un carro abandonado, nopales y un poste chueco
  piso    tierra apisonada, sin banqueta (mismas alturas que antes)

Sin contorno de tinta: cada cosa se separa con el tono oscuro de su propio color.

Uso:
  python art-src/fondos/prohibida.py <carpeta_de_previas>             láminas viva y apagada
  python art-src/fondos/prohibida.py <carpeta_de_previas> --exportar   además escribe la hoja del juego
"""
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from comun import R, LEJANA, MEDIA, PISO, alejar, apagada, apagar, comprobar, exportar, lamina  # noqa: E402
from barrio import Vuelta  # noqa: E402

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from pincel import Lienzo  # noqa: E402

N, T = R["neutros"], R["tierra"]
Na, Ro, Mo, Am, V, Tu = R["naranja"], R["rojo"], R["morado"], R["amarillo"], R["verde"], R["turquesa"]
CIELO = (Mo[0], Na[1])
WM, HM = MEDIA
SOL = Na[2]                      # el último sol en los cantos de arriba

LETRAS = {
    "N": ["101", "111", "111", "111", "101"], "O": ["111", "101", "101", "101", "111"],
    "P": ["110", "101", "110", "100", "100"], "A": ["010", "101", "111", "101", "101"],
    "S": ["011", "100", "010", "001", "110"], "R": ["110", "101", "110", "101", "101"],
}


def texto(L, x, y, s, color):
    for ch in s:
        if ch == " ":
            x += 2
            continue
        for dy, fila in enumerate(LETRAS[ch]):
            for dx, v in enumerate(fila):
                if v == "1":
                    L.px(x + dx, y + dy, color)
        x += 4


# ───────────────────────── capa lejana ─────────────────────────

def lejana():
    L = Vuelta(*LEJANA)
    w, h = LEJANA
    r = random.Random(21)
    x = 0
    while x < w - 20:                                       # naves y fábricas, en silueta
        ancho, alto = r.randint(22, 44), r.randint(46, 62)
        c = r.choice([N[0], Mo[0], N[0]])
        L.rect(x, h - alto, ancho, alto, c)
        if r.random() < 0.6:                                # chimenea
            cx = x + r.randint(3, ancho - 6)
            L.rect(cx, h - alto - r.randint(10, 18), 3, 20, c)
        for _ in range(r.randint(0, 3)):                    # alguna ventana con el reflejo del sol
            L.rect(x + r.randint(2, ancho - 5), h - alto + r.randint(5, 14), 3, 2, Na[1])
        x += ancho + r.randint(2, 10)
    # tanque esférico y torre de luz
    L.elipse(96, 16, 110, 30, N[0]); L.rect(99, 29, 2, 12, N[0]); L.rect(106, 29, 2, 12, N[0])
    for k in range(9):
        L.px(250 - k // 2, 8 + k * 3, N[0]); L.px(258 + k // 2, 8 + k * 3, N[0])
        L.px(250 - k // 2, 9 + k * 3, N[0]); L.px(258 + k // 2, 9 + k * 3, N[0])
        L.px(250 - k // 2, 10 + k * 3, N[0]); L.px(258 + k // 2, 10 + k * 3, N[0])
    L.rect(250, 4, 9, 4, N[0]); L.rect(244, 9, 21, 1, N[0]); L.rect(246, 15, 17, 1, N[0])
    return alejar(L.imagen(), CIELO)


# ───────────────────────── capa media ─────────────────────────

def hierba(L, x, y, c=Am[0]):
    L.px(x, y, c); L.px(x, y - 1, c); L.px(x + 1, y, c); L.px(x + 2, y, c); L.px(x + 2, y - 2, c); L.px(x + 2, y - 1, c)


def llanta(L, x, y):
    L.rect(x + 1, y - 2, 8, 3, N[0]); L.rect(x, y - 1, 10, 1, N[0]); L.rect(x + 3, y - 2, 4, 1, N[1])


def tambo(L, x, y, c, s):
    L.rect(x, y - 12, 8, 13, c); L.rect(x + 6, y - 12, 2, 13, s)
    L.rect(x, y - 9, 8, 1, s); L.rect(x, y - 4, 8, 1, s); L.rect(x, y - 12, 8, 1, SOL)


def cerca(L, x0, x1, caida=None):
    """Postes y tres hilos de alambre de púas; `caida`: columna donde los hilos están vencidos."""
    for x in range(x0, x1 + 1):
        for k, y in enumerate((64, 71, 78)):
            dy = 0
            if caida and abs(x - caida) < 12:
                dy = round((12 - abs(x - caida)) * (0.5 + 0.25 * k))
            L.px(x, y + dy, N[2])
            if x % 6 == 0 and k == 0:
                L.px(x, y + dy - 1, N[2])
    for x in range(x0, x1 + 1, 18):
        L.rect(x, 61, 2, 29, N[1]); L.rect(x, 61, 2, 1, SOL)


def terreno(L, x0, x1):
    """Lomita de tierra seca al fondo de un terreno abierto, para que no quede hueco."""
    import math
    for x in range(x0, x1 + 1):
        alto = round(4 + 2 * math.sin((x - x0) / (x1 - x0) * math.pi) + math.sin(x / 7))
        L.rect(x, HM - alto, 1, alto, T[2])
        L.px(x, HM - alto, T[3])


def media():
    L = Vuelta(WM, HM)
    S = HM - 1

    # A · bodega grande de lámina oxidada, con techo de dos aguas (0-95)
    L.poligono([(0, 34), (47, 20), (95, 34), (95, S), (0, S)], T[1])
    for x in range(7, 96, 8):
        L.rect(x, 24, 1, 66, T[0], solo=T[1])
    for x, y, w, h in ((10, 40, 14, 9), (60, 52, 20, 8), (30, 70, 9, 14), (78, 30, 12, 7), (4, 76, 12, 8)):
        L.rect(x, y, w, h, T[2], solo=T[1])                                  # parches de óxido
    L.linea((0, 34), (47, 20), SOL); L.linea((47, 20), (95, 34), T[2])
    L.rect(34, 52, 30, 38, N[0])                                             # portón corredizo, a medias
    L.rect(34, 52, 12, 38, T[0]); L.rect(39, 52, 1, 38, T[1]); L.rect(33, 50, 32, 2, N[1])
    for k, x in enumerate(range(12, 84, 12)):                                # ventanas altas, varias rotas
        L.rect(x, 38, 8, 6, N[0] if k % 3 else Na[1])
        if k == 2:
            L.px(x + 2, 40, T[1]); L.px(x + 3, 41, T[1]); L.px(x + 5, 39, T[1])

    # B · terreno abierto: tanque elevado, llantas, tambos y el letrero en la cerca (96-185)
    terreno(L, 96, 185)
    for x in (128, 152):
        L.rect(x, 30, 2, 58, N[0])
    L.linea((129, 36), (152, 62), N[0]); L.linea((152, 36), (129, 62), N[0])
    L.rect(124, 12, 34, 20, N[1]); L.rect(152, 12, 6, 20, N[0]); L.rect(124, 12, 34, 1, SOL)
    L.rect(124, 20, 34, 1, N[0]); L.rect(130, 23, 9, 6, T[2])               # cincho y óxido
    L.poligono([(124, 12), (141, 6), (157, 12)], N[1]); L.linea((124, 12), (141, 6), SOL)
    cerca(L, 98, 184, caida=170)
    L.rect(102, 62, 35, 11, Ro[1]); L.rect(102, 62, 35, 1, Ro[2]); L.rect(102, 72, 35, 1, Ro[0])
    texto(L, 105, 65, "NO PASAR", N[5])
    for y in (S, S - 4, S - 8):                                              # llantas apiladas
        llanta(L, 142, y)
    llanta(L, 154, S)
    tambo(L, 108, S, Na[0], Ro[0]); tambo(L, 118, S, Ro[0], Mo[0])
    hierba(L, 172, S); hierba(L, 99, S)

    # C · bodega de concreto con la cortina abajo y un rótulo despintado (186-265)
    X = 186
    L.rect(X, 44, 80, 46, N[1]); L.rect(X, 44, 80, 2, SOL); L.rect(X, 46, 80, 1, N[0])
    L.rect(X + 78, 46, 2, 44, N[0])
    L.rect(X + 6, 50, 52, 8, N[2])
    for x in (9, 17, 22, 34, 41, 48):
        L.rect(X + x, 52, 4, 4, N[1])                                        # letras ya borradas
    L.rect(X + 10, 62, 34, 28, N[0])
    for y in range(64, 90, 4):
        L.rect(X + 10, y, 34, 1, N[1])
    L.rect(X + 52, 64, 10, 9, N[0]); L.rect(X + 56, 64, 1, 9, N[1]); L.rect(X + 52, 68, 10, 1, N[1])

    # D · terreno abierto: carro abandonado sobre blocks, nopales, cajas y el poste chueco (266-383)
    terreno(L, 266, 383)
    X = 44
    L.rect(X + 258, 76, 40, 9, Tu[0])
    L.poligono([(X + 266, 76), (X + 270, 67), (X + 287, 67), (X + 292, 76)], Tu[0])
    L.rect(X + 271, 69, 7, 6, N[0]); L.rect(X + 280, 69, 7, 6, N[0]); L.rect(X + 258, 76, 40, 1, Tu[1])
    L.linea((X + 266, 76), (X + 270, 67), SOL); L.rect(X + 270, 67, 17, 1, SOL)
    for x, y, w, h in ((260, 79, 8, 4), (284, 80, 10, 3), (274, 77, 5, 2)):
        L.rect(X + x, y, w, h, T[2])
    L.rect(X + 263, 85, 6, 5, N[1]); L.rect(X + 288, 85, 6, 5, N[1])         # blocks en lugar de llantas
    L.rect(X + 263, 82, 6, 3, N[0]); L.rect(X + 288, 82, 6, 3, N[0])
    for x in (296, 362):                                                     # nopales
        L.elipse(x + 4, 72, x + 9, 84, V[0]); L.elipse(x, 67, x + 4, 76, V[0]); L.elipse(x + 8, 64, x + 12, 74, V[0])
        L.px(x + 2, 66, Ro[1]); L.px(x + 10, 63, Ro[1]); L.rect(x + 6, 84, 2, 6, V[0])
    for x, y in ((372, S), (372, S - 7)):                                    # cajas de madera
        L.rect(x, y - 6, 7, 7, T[3]); L.rect(x, y - 6, 7, 1, T[4]); L.rect(x + 6, y - 6, 1, 7, T[2]); L.rect(x, y - 3, 7, 1, T[2])
    hierba(L, 290, S); hierba(L, 350, S); hierba(L, 380, S)

    # poste chueco con el cable roto colgando, y el cable que viene de la bodega
    for y in range(8, HM):
        x = round(352 - (S - y) * 0.09)
        L.rect(x, y, 2, 1, T[0]); L.px(x, y, T[1])
    L.rect(340, 11, 13, 2, T[0])
    for k in range(26):
        L.px(341 - k // 5, 13 + k, N[0])
    for x in range(96, 342):
        t = (x - 96) / 246
        L.px(x, round(30 + (12 - 30) * t + 11 * (1 - (2 * t - 1) ** 2)), N[0])
    return L.imagen()


# ───────────────────────── piso ─────────────────────────

def piso():
    """Tierra apisonada, sin banqueta. La franja donde se corre (filas 0-8) es más clara."""
    w, h = PISO
    L = Lienzo(w, h)
    L.rect(0, 0, w, 9, T[3])
    L.rect(0, 0, w, 1, T[4])
    L.rect(0, 9, w, 3, T[2])
    L.rect(0, 12, w, h - 12, T[2])
    L.rect(0, 12, w, 1, T[1])
    for x, y, n in ((6, 4, 3), (30, 6, 2), (47, 3, 4)):                      # piedritas y grietas del camino
        L.rect(x, y, n, 1, T[2])
    for x0 in (0, 32):                                                       # huellas de llanta
        for x in range(x0, x0 + 20, 3):
            L.rect(x, 19, 2, 1, T[1]); L.rect(x + 1, 25, 2, 1, T[1])
    for x, y in ((12, 15), (40, 28), (55, 16), (25, 30)):
        L.rect(x, y, 2, 1, N[1]); L.px(x, y - 1, N[2])                       # piedras
    return L.imagen()


def capas():
    c = {"far": lejana(), "mid": media(), "ground": piso()}
    for (nombre, im), tam in zip(c.items(), (LEJANA, MEDIA, PISO)):
        comprobar(nombre, im, tam, cielo=CIELO if nombre == "far" else None)
    return c


if __name__ == "__main__":
    previas = Path(sys.argv[1])
    previas.mkdir(parents=True, exist_ok=True)
    vivas = capas()
    apagadas = {k: apagada(v) for k, v in vivas.items()}
    lamina("Fondo de la zona prohibida · versión VIVA (al correr)", vivas, CIELO, previas / "prohibida-viva.png")
    lamina("Fondo de la zona prohibida · versión APAGADA (quieta, tristeza; calculada con apagar())", apagadas,
           tuple(apagar(c) for c in CIELO), previas / "prohibida-apagada.png")
    print("láminas:", previas / "prohibida-viva.png", "y", previas / "prohibida-apagada.png")
    if "--exportar" in sys.argv:
        exportar("prohibida", vivas, CIELO)
