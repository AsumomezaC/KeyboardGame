# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Fondo del barrio (`barrio`): cálido, casas de colores, tarde soleada.

  lejana  cerros lilas con casitas de colores apiladas y la iglesia, velados con el tono del cielo
  media   ocho fachadas distintas: casas de colores, la tiendita con su rótulo, una barda con
          bugambilia, una casa en obra negra, tinacos, tendedero, papel picado y postes con cables
  piso    banqueta de losas, guarnición pintada de amarillo y calle (mismas alturas que antes)

Sin contorno de tinta: cada cosa se separa con el tono oscuro de su propio color.

Uso:
  python art-src/fondos/barrio.py <carpeta_de_previas>             láminas viva y apagada
  python art-src/fondos/barrio.py <carpeta_de_previas> --exportar   además escribe la hoja del juego
"""
import math
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from comun import R, LEJANA, MEDIA, PISO, alejar, apagada, apagar, comprobar, exportar, lamina  # noqa: E402

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from pincel import Lienzo  # noqa: E402

N, T = R["neutros"], R["tierra"]
CIELO = (R["azul"][3], N[4])
WM, HM = MEDIA

LETRAS = {
    "A": ["010", "101", "111", "101", "101"], "B": ["110", "101", "110", "101", "110"],
    "R": ["110", "101", "110", "101", "101"], "O": ["111", "101", "101", "101", "111"],
    "T": ["111", "010", "010", "010", "010"], "E": ["111", "100", "110", "100", "111"],
    "S": ["011", "100", "010", "001", "110"],
}


def texto(L, x, y, s, color):
    for ch in s:
        for dy, fila in enumerate(LETRAS[ch]):
            for dx, v in enumerate(fila):
                if v == "1":
                    L.px(x + dx, y + dy, color)
        x += 4


class Vuelta(Lienzo):
    """Lienzo que da la vuelta a lo ancho: lo que cruza el borde sigue del otro lado."""

    def px(self, x, y, c, solo=None):
        super().px(round(x) % self.w, y, c, solo)


# ───────────────────────── capa lejana ─────────────────────────

def cresta(x):
    k = x / LEJANA[0] * 2 * math.pi
    return round(9 + 4 * math.sin(k) + 3 * math.sin(3 * k + 1) + 1.5 * math.sin(5 * k + 2))


def loma(x):
    k = x / LEJANA[0] * 2 * math.pi
    return round(36 + 3 * math.sin(2 * k + 2) + 2 * math.sin(4 * k))


def lejana(velo=True):
    """`velo=False` devuelve la capa sin pasar a la paleta lejana (la usa el fondo de noche)."""
    L = Vuelta(*LEJANA)
    w, h = LEJANA
    cerro, cerro_luz = R["morado"][2], R["azul"][3]
    for x in range(w):
        L.rect(x, cresta(x), 1, h - cresta(x), cerro)
    # casitas apiladas en la ladera, de atrás hacia adelante
    r = random.Random(11)
    colores = [R["rosa"][3], R["naranja"][2], R["amarillo"][2], R["turquesa"][3], N[4], R["rojo"][3], R["verde"][3], N[3]]
    casitas = []
    for _ in range(60):
        x = r.randrange(w)
        if 196 <= x <= 226:                       # lugar de la iglesia
            continue
        y = cresta(x) + r.randint(5, 21)
        casitas.append((y, x, r.choice([4, 5, 5, 6, 7]), r.choice([3, 3, 4]), r.choice(colores)))
    for y, x, cw, ch, c in sorted(casitas):
        L.rect(x, y - ch, cw, ch, c)
        L.px(x + 1, y - ch + 1, N[1])             # ventana
    # iglesia: dos torres y cúpula
    x0, y0 = 204, cresta(211) + 16
    L.rect(x0, y0 - 11, 16, 11, N[4])
    L.rect(x0 + 14, y0 - 11, 2, 11, N[3])
    for tx in (x0 - 1, x0 + 13):
        L.rect(tx, y0 - 20, 4, 20, N[4])
        L.rect(tx + 3, y0 - 20, 1, 20, N[3])
        L.rect(tx, y0 - 22, 4, 2, R["naranja"][2])
        L.px(tx + 1, y0 - 23, R["naranja"][2]); L.px(tx + 2, y0 - 23, R["naranja"][2])
        L.px(tx + 1, y0 - 17, N[1]); L.px(tx + 1, y0 - 16, N[1])
    L.elipse(x0 + 4, y0 - 16, x0 + 11, y0 - 8, R["naranja"][2])
    L.rect(x0 + 3, y0 - 11, 10, 11, N[4])
    L.rect(x0 + 7, y0 - 19, 2, 3, R["naranja"][2])
    L.rect(x0 + 6, y0 - 6, 4, 6, N[1])
    L.px(x0 + 7, y0 - 7, N[1]); L.px(x0 + 8, y0 - 7, N[1])
    # loma de enfrente, con árboles
    for x in range(w):
        L.rect(x, loma(x), 1, h - loma(x), N[2])
    r = random.Random(5)
    for _ in range(16):
        x = r.randrange(w)
        y = loma(x) + r.randint(0, 3)
        L.elipse(x - 3, y - 4, x + 3, y + 1, R["verde"][2])
    # luz en la cresta de los cerros (el sol viene de arriba a la izquierda)
    for x in range(w):
        if cresta(x) <= cresta(x + 1):
            L.px(x, cresta(x), cerro_luz, solo=cerro)
    return alejar(L.imagen(), CIELO) if velo else L.imagen()


# ───────────────────────── capa media ─────────────────────────

def casa(L, x, w, h, base, sombra, zoclo, cornisa):
    top = HM - h
    L.rect(x, top, w, h, base)
    L.rect(x, top, w, 2, cornisa)
    L.rect(x, top + 2, w, 1, sombra)
    L.rect(x + w - 2, top + 2, 2, h - 2, sombra)
    L.rect(x, HM - 10, w, 10, zoclo)
    return top


def ventana(L, x, y, w, h, marco=None, reja=None, cortina=None, vidrio=None):
    marco, vidrio = marco or N[4], vidrio or R["azul"][1]
    L.rect(x - 1, y - 1, w + 2, h + 2, marco)
    L.rect(x, y, w, h, vidrio)
    if cortina:
        L.rect(x, y, 2, h, cortina); L.rect(x + w - 2, y, 2, h, cortina)
        L.rect(x, y, w, 1, cortina)
    if reja:
        for i in range(x + 2, x + w - 1, 3):
            L.rect(i, y, 1, h, reja)
        L.rect(x, y + h // 2, w, 1, reja)
    L.rect(x - 2, y + h + 1, w + 4, 1, marco)                                 # repisa


def puerta(L, x, w, h, c, s, perilla=None):
    y = HM - h
    L.rect(x - 1, y - 1, w + 2, h + 1, N[4])
    L.rect(x, y, w, h, c)
    L.rect(x + w - 1, y, 1, h, s)
    L.rect(x + 1, y + 2, w - 3, 1, s); L.rect(x + 1, y + h // 2, w - 3, 1, s)
    L.px(x + w - 3, y + h // 2 + 3, perilla or R["amarillo"][1])


def tinaco(L, x, y):
    """Tinaco negro sobre su base; `y` es la fila de la azotea."""
    L.rect(x + 1, y - 2, 7, 2, N[2])
    L.rect(x, y - 10, 9, 8, N[0])
    L.rect(x + 2, y - 12, 5, 2, N[0])
    L.rect(x + 1, y - 9, 1, 6, N[1])
    L.rect(x, y - 6, 9, 1, N[1])


def varillas(L, x, y, n, r):
    for k in range(n):
        alto = r.randint(4, 8)
        L.rect(x + k * 3, y - alto, 1, alto, N[0])


def antena(L, x, y):
    L.rect(x, y - 13, 1, 13, N[0])
    L.rect(x - 3, y - 12, 7, 1, N[0]); L.rect(x - 2, y - 10, 5, 1, N[0]); L.rect(x - 1, y - 8, 3, 1, N[0])


def maceta(L, x, y, flor):
    L.rect(x, y - 3, 3, 3, T[2]); L.px(x + 2, y - 2, T[1]); L.px(x + 2, y - 1, T[1])
    L.rect(x, y - 5, 3, 2, R["verde"][1]); L.px(x - 1, y - 5, R["verde"][1]); L.px(x + 3, y - 4, R["verde"][1])
    L.px(x + 1, y - 6, flor); L.px(x, y - 5, flor)


def balcon(L, x, y, w, flores):
    """Losa, barandal de herrería y macetas; `y` es la fila de la losa."""
    L.rect(x, y, w, 2, N[3]); L.rect(x, y + 1, w, 1, N[2])
    for k, i in enumerate(range(x + 2, x + w - 3, 5)):
        maceta(L, i, y, flores[k % len(flores)])
    L.rect(x, y - 7, w, 1, N[0])
    for i in range(x, x + w, 2):
        L.rect(i, y - 7, 1, 7, N[0])


def cable(L, a, b, comba, c=N[0]):
    pts = []
    for x in range(a[0], b[0] + 1):
        t = (x - a[0]) / (b[0] - a[0])
        y = round(a[1] + (b[1] - a[1]) * t + comba * math.sin(math.pi * t))
        L.px(x, y, c)
        pts.append((x, y))
    return pts


def papel_picado(L, a, b, comba, k0=0):
    colores = [R["rosa"][2], R["amarillo"][1], R["turquesa"][2], R["morado"][1], R["naranja"][1], R["verde"][2]]
    pts = cable(L, a, b, comba, N[1])
    for k, (x, y) in enumerate(pts[2:-4:6]):
        c = colores[(k + k0) % len(colores)]
        for dy in range(1, 6):
            for dx in range(5):
                if (dy == 5 and dx in (1, 3)) or (dy == 3 and dx == 2):      # picos y calado
                    continue
                L.px(x + dx, y + dy, c)


def poste(L, pie, punta, lampara=True):
    """Poste de madera con cruceta; puede ir chueco (pie y punta en distinta columna)."""
    for y in range(6, HM):
        x = round(punta + (pie - punta) * (y - 6) / (HM - 7))
        L.rect(x, y, 3, 1, T[1])
        L.px(x, y, T[2])
    L.rect(punta - 5, 9, 13, 2, T[1])
    L.px(punta - 4, 8, N[3]); L.px(punta + 6, 8, N[3])                        # aisladores
    if lampara:
        L.rect(punta + 3, 16, 7, 1, N[1])
        L.rect(punta + 8, 17, 4, 2, N[1]); L.rect(punta + 8, 19, 4, 1, R["amarillo"][2])


def media():
    L = Vuelta(WM, HM)
    r = random.Random(3)
    V, Rs, Am, Na, Tu, Az, Mo, Ro = R["verde"], R["rosa"], R["amarillo"], R["naranja"], R["turquesa"], R["azul"], R["morado"], R["rojo"]

    # árbol detrás de la barda (lote 4)
    L.rect(160, 36, 3, 24, T[1])
    L.elipse(148, 20, 176, 44, V[1])
    L.elipse(150, 21, 168, 36, V[2])
    for x, y in ((155, 24), (159, 23), (163, 27), (153, 30), (170, 31), (166, 38), (157, 39)):
        L.px(x, y, V[3]); L.px(x + 1, y, V[3])
    for x, y in ((172, 36), (151, 38), (164, 42), (174, 28)):
        L.px(x, y, V[0]); L.px(x + 1, y + 1, V[0])

    # 1 · casa rosa de dos pisos con balcón (0-47)
    t = casa(L, 0, 48, 62, Rs[3], Rs[2], Rs[2], N[4])
    L.rect(0, 56, 46, 1, Rs[2])                                              # losa entre pisos
    L.rect(15, 35, 14, 19, N[4]); L.rect(16, 36, 12, 18, Az[1]); L.rect(21, 36, 2, 18, N[4])
    balcon(L, 10, 54, 24, [Ro[2], Am[1], N[5]])
    ventana(L, 36, 38, 7, 9, cortina=N[5])
    puerta(L, 6, 10, 24, T[2], T[1])
    ventana(L, 26, 64, 14, 11, reja=N[0])
    tinaco(L, 32, t)
    antena(L, 8, t)

    # 2 · casita amarilla de un piso, con tendedero (48-87)
    t = casa(L, 48, 40, 40, Am[2], Am[1], Na[2], N[5])
    puerta(L, 72, 9, 22, Tu[1], Tu[0])
    ventana(L, 54, 60, 11, 10, cortina=Rs[3])
    maceta(L, 56, 80, Ro[2]); maceta(L, 62, 80, N[5])
    L.rect(52, t - 11, 1, 11, T[1]); L.rect(83, t - 11, 1, 11, T[1])
    L.rect(52, t - 10, 32, 1, N[1])
    for x, cw, ch, c in ((55, 4, 6, Ro[2]), (61, 5, 4, N[5]), (68, 3, 7, Az[2]), (73, 4, 5, Am[1]), (78, 3, 4, Rs[2])):
        L.rect(x, t - 9, cw, ch, c)
        L.rect(x + cw - 1, t - 9, 1, ch, apagar_no(c))

    # 3 · la tiendita turquesa con rótulo pintado (88-143)
    t = casa(L, 88, 56, 58, Tu[2], Tu[1], Tu[1], N[4])
    L.rect(92, 36, 48, 9, N[4]); L.rect(92, 44, 48, 1, Am[1]); L.rect(92, 36, 48, 1, Am[1])
    texto(L, 99, 38, "ABARROTES", Ro[1])
    L.rect(96, 56, 30, 34, N[0])                                             # local abierto
    for fila, y in enumerate((58, 64)):                                      # anaqueles con mercancía
        L.rect(97, y + 4, 28, 1, T[2])
        for k, x in enumerate(range(98, 124, 3)):
            c = [Ro[2], Am[1], Az[2], Na[1], V[2], N[5], Rs[2]][(k * 3 + fila * 2) % 7]
            alto = 3 if (k + fila) % 3 else 2
            L.rect(x, y + 4 - alto, 2, alto, c)
    L.rect(96, 74, 30, 16, T[2]); L.rect(96, 73, 30, 2, T[3]); L.rect(124, 75, 2, 15, T[1])
    L.rect(100, 68, 4, 5, N[3]); L.rect(101, 67, 2, 1, Ro[2])               # frasco de dulces
    L.rect(109, 70, 6, 3, N[2]); L.rect(110, 68, 4, 2, N[3])                 # báscula
    for k, x in enumerate(range(94, 128, 4)):                                # toldo de rayas
        c = Ro[2] if k % 2 else N[5]
        L.rect(x, 50, 4, 5, c); L.px(x, 55, c); L.px(x + 1, 55, c); L.px(x + 2, 55, c)
    L.rect(94, 49, 34, 1, N[3])
    ventana(L, 131, 60, 8, 9, reja=N[0])
    tinaco(L, 126, t)

    # 4 · barda encalada con portón de lámina y bugambilia (144-179)
    t = casa(L, 144, 36, 34, N[4], N[3], T[3], N[3])
    L.rect(152, 62, 18, 28, N[2])
    for x in range(155, 170, 5):
        L.rect(x, 62, 1, 28, N[1])
    L.rect(152, 62, 18, 1, N[1]); L.rect(152, 75, 18, 1, N[1])
    for x, y, rx, ry in ((171, 55, 5, 4), (176, 59, 4, 5), (166, 54, 4, 3), (175, 66, 3, 4)):
        L.elipse(x - rx, y - ry, x + rx, y + ry, V[1])
    for x, y in ((168, 53), (172, 52), (174, 56), (170, 57), (177, 57), (175, 61), (178, 63), (173, 64), (176, 68), (166, 55), (179, 60)):
        L.px(x, y, Rs[2]); L.px(x + 1, y, Rs[3]); L.px(x, y + 1, Rs[2])

    # 5 · casa azul con el segundo piso en obra negra (180-231)
    t = casa(L, 180, 52, 68, Az[3], Az[2], Az[2], N[3])
    L.rect(180, t, 52, 28, N[2])                                             # block sin aplanar
    for fila, y in enumerate(range(t + 3, t + 28, 4)):
        L.rect(180, y, 52, 1, N[1])
    L.rect(230, t, 2, 28, N[1])
    L.rect(180, t + 28, 52, 2, N[3])                                         # losa
    L.rect(190, t + 8, 12, 13, N[0]); L.rect(190, t + 8, 12, 1, N[1])        # hueco de la ventana
    L.rect(212, t + 8, 10, 13, N[0]); L.rect(212, t + 8, 10, 1, N[1])
    L.rect(213, t + 14, 8, 7, Az[1])                                         # lona de plástico
    for x in (182, 196, 210, 226):
        varillas(L, x, t, 2, r)
    puerta(L, 186, 10, 24, V[1], V[0])
    ventana(L, 204, 62, 16, 12, reja=N[0], cortina=N[5])
    maceta(L, 223, 80, Am[1])

    # 6 · casa verde con zaguán de herrería (232-275)
    t = casa(L, 232, 44, 46, V[3], V[2], V[2], N[4])
    L.rect(237, 59, 22, 31, N[4])
    L.rect(238, 60, 20, 30, V[0])
    L.px(238, 60, N[4]); L.px(257, 60, N[4])
    for x in range(239, 258, 3):
        L.rect(x, 61, 1, 29, N[1])
    L.rect(238, 68, 20, 1, N[1]); L.rect(238, 82, 20, 1, N[1]); L.rect(247, 60, 2, 30, N[1])
    for x in (242, 253):
        L.px(x, 74, N[1]); L.px(x - 1, 75, N[1]); L.px(x + 1, 75, N[1]); L.px(x, 76, N[1])   # rombos
    ventana(L, 263, 58, 9, 11, cortina=Rs[3])
    maceta(L, 263, 80, Ro[2]); maceta(L, 268, 80, Na[1])
    antena(L, 268, t)
    varillas(L, 234, t, 2, r)

    # 7 · vecindad naranja de dos pisos, con el perro en la azotea (276-335)
    t = casa(L, 276, 60, 56, Na[2], Na[1], Na[1], N[4])
    L.rect(276, 60, 58, 1, Na[1])
    for x in (282, 300, 318):
        ventana(L, x, 42, 9, 9, cortina=N[5] if x != 300 else Tu[2])
    puerta(L, 281, 9, 22, Tu[1], Tu[0])
    puerta(L, 320, 9, 22, Mo[1], Mo[0])
    ventana(L, 298, 66, 14, 10, reja=N[0])
    maceta(L, 313, 80, Ro[2])
    tinaco(L, 322, t)
    px, py = 290, t                                                          # perro de azotea
    L.rect(px, py - 4, 8, 3, T[3]); L.rect(px, py - 1, 1, 1, T[3]); L.rect(px + 2, py - 1, 1, 1, T[3])
    L.rect(px + 5, py - 1, 1, 1, T[3]); L.rect(px + 7, py - 1, 1, 1, T[3])
    L.rect(px + 7, py - 7, 3, 3, T[3]); L.px(px + 10, py - 5, T[2]); L.px(px + 7, py - 8, T[2]); L.px(px + 8, py - 6, N[0])
    L.px(px - 1, py - 5, T[3]); L.px(px - 1, py - 6, T[3])

    # 8 · casa lila con ventana de arco y balcón (336-383)
    t = casa(L, 336, 48, 64, Mo[2], Mo[1], Mo[1], N[4])
    L.rect(336, 56, 46, 1, Mo[1])
    L.elipse(351, 31, 364, 42, N[4]); L.rect(351, 37, 14, 17, N[4])
    L.elipse(352, 32, 363, 42, Az[1]); L.rect(352, 37, 12, 17, Az[1]); L.rect(357, 32, 2, 22, N[4])
    balcon(L, 346, 54, 24, [Rs[2], N[5], Am[1]])
    puerta(L, 366, 10, 24, T[1], T[0])
    ventana(L, 343, 64, 13, 11, reja=N[0], cortina=Am[2])
    antena(L, 376, t)
    tinaco(L, 340, t)

    # postes (el segundo, chueco) y cables con comba; los tenis colgados
    poste(L, 148, 148)
    poste(L, 339, 344, lampara=False)
    for dy, comba in ((0, 8), (2, 11)):
        cable(L, (149, 9 + dy), (344, 9 + dy), comba)
        cable(L, (345, 9 + dy), (148 + WM, 9 + dy), comba)
    for x, y in ((250, 21), (253, 21)):
        L.rect(x, y, 1, 4 + (x % 2), N[1])
    L.rect(249, 25, 3, 2, N[5]); L.px(249, 26, Ro[2]); L.rect(252, 26, 3, 2, N[5]); L.px(254, 27, Ro[2])

    # papel picado de azotea a azotea
    papel_picado(L, (47, 29), (88, 33), 7)
    papel_picado(L, (143, 34), (181, 24), 7, k0=2)
    papel_picado(L, (275, 41), (336, 27), 7, k0=4)
    return L.imagen()


def apagar_no(c):
    """Tono oscuro de un color de la paleta: el anterior de su rampa (o él mismo si es el primero)."""
    for rampa in R.values():
        if c in rampa:
            return rampa[max(0, rampa.index(c) - 1)]
    return c


# ───────────────────────── piso ─────────────────────────

BANQUETA = (N[2], N[3], N[1])     # losa, canto con sol, juntas


def piso(banqueta=None):
    """Mismas alturas que el piso de antes: banqueta 0-8, guarnición 9-11, calle 12-31."""
    w, h = PISO
    losa, luz, junta = banqueta or BANQUETA
    L = Lienzo(w, h)
    L.rect(0, 0, w, 9, losa)
    L.rect(0, 0, w, 1, luz)                                                  # canto con sol
    for x in (0, 32):
        L.rect(x, 1, 1, 8, junta)                                            # juntas de las losas
    for x, y in ((12, 3), (13, 4), (14, 4), (15, 5)):
        L.px(x, y, junta)                                                   # cuarteadura
    L.px(33, 7, R["verde"][1]); L.px(34, 6, R["verde"][2]); L.px(34, 8, R["verde"][1])   # hierba en la junta
    L.rect(0, 9, w, 1, R["amarillo"][1])                                     # guarnición pintada
    L.rect(0, 10, w, 2, R["amarillo"][0])
    for x, y in ((7, 9), (8, 9), (8, 10), (27, 10), (28, 10), (28, 11), (41, 9), (55, 10), (56, 10), (56, 9), (57, 11)):
        L.px(x, y, N[2])                                                     # pintura botada
    L.rect(0, 12, w, h - 12, N[1])
    L.rect(0, 12, w, 1, N[0])                                                # sombra al pie de la guarnición
    r = random.Random(8)
    for _ in range(12):
        L.px(r.randrange(w), r.randint(14, h - 1), r.choice([N[0], N[2], N[2]]))
    for x in (2, 34):                                                        # raya de la calle, gastada
        L.rect(x, 22, 15, 2, N[3])
    for x, y in ((5, 22), (11, 23), (12, 23), (38, 23), (44, 22), (45, 22)):
        L.px(x, y, N[1])
    for x, y in ((20, 27), (21, 27), (22, 28), (23, 28), (24, 29)):
        L.px(x, y, N[0])                                                     # grietas
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
    lamina("Fondo del barrio · versión VIVA (al correr)", vivas, CIELO, previas / "barrio-viva.png")
    lamina("Fondo del barrio · versión APAGADA (quieta, tristeza; calculada con apagar())", apagadas,
           tuple(apagar(c) for c in CIELO), previas / "barrio-apagada.png")
    for k, v in vivas.items():
        v.save(previas / f"barrio-{k}.png")
    print("láminas:", previas / "barrio-viva.png", "y", previas / "barrio-apagada.png")
    if "--exportar" in sys.argv:
        exportar("barrio", vivas, CIELO)
