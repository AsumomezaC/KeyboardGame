# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Fondo del mercado (`mercado`): lonas de colores, costales, canastas, bullicio.

Es la calle de afuera del mercado municipal, en la mañana.

  lejana  cerros, los techos del pueblo y la parroquia con su cúpula de azulejo, velados con el cielo
  media   la fachada del mercado con su arco y el rótulo pintado, y sobre la banqueta tres puestos
          bajo lonas (fruta, pan y chiles), costales, canastas, un diablito con cajas y algo de
          gente con su bolsa del mandado; papel picado de lado a lado
  piso    banqueta de cemento con hojas tiradas, guarnición y calle de adoquín (mismas alturas)

Sin contorno de tinta: cada cosa se separa con el tono oscuro de su propio color.

Uso:
  python art-src/fondos/mercado.py <carpeta_de_previas>             láminas viva y apagada
  python art-src/fondos/mercado.py <carpeta_de_previas> --exportar   además escribe la hoja del juego
"""
import math
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from comun import R, LEJANA, MEDIA, PISO, PIES_Y, alejar, apagada, apagar, comprobar, cuadro_de, exportar, lamina  # noqa: E402
from barrio import Vuelta, papel_picado  # noqa: E402

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from pincel import Lienzo  # noqa: E402

N, T, P = R["neutros"], R["tierra"], R["piel"]
V, Mo, Tu, Am, Ro, Rs, Az, Na = (R[k] for k in ("verde", "morado", "turquesa", "amarillo", "rojo", "rosa", "azul", "naranja"))
CIELO = (Na[2], Am[2])
WM, HM = MEDIA
S = HM - 1

LETRAS = {
    "M": ["101", "111", "111", "101", "101"], "E": ["111", "100", "110", "100", "111"],
    "R": ["110", "101", "110", "101", "101"], "C": ["111", "100", "100", "100", "111"],
    "A": ["010", "101", "111", "101", "101"], "D": ["110", "101", "101", "101", "110"],
    "O": ["111", "101", "101", "101", "111"],
}


def texto(L, x, y, s, color):
    for ch in s:
        for dy, fila in enumerate(LETRAS[ch]):
            for dx, v in enumerate(fila):
                if v == "1":
                    L.px(x + dx, y + dy, color)
        x += 4


# ───────────────────────── capa lejana ─────────────────────────

def cresta(x):
    k = x / LEJANA[0] * 2 * math.pi
    return round(16 + 5 * math.sin(k + 0.5) + 2.5 * math.sin(3 * k + 2) + 1.5 * math.sin(5 * k))


def lejana():
    L = Vuelta(*LEJANA)
    w, h = LEJANA
    for x in range(w):
        L.rect(x, cresta(x), 1, h - cresta(x), Mo[2])
    # techos del pueblo, en hileras escalonadas
    # dos hileras bajas, con huecos y pocos colores: que se vea pueblo, no un mosaico
    r = random.Random(23)
    # empiezan arriba: lo de abajo de esta capa queda tapado por los puestos de la capa media
    for fila, y0 in enumerate((40, 48)):
        x = r.randint(-4, 4)
        while x < w:
            cw, ch = r.randint(10, 18), r.randint(4, 8)
            c = r.choice([N[4], N[4], Rs[3], Am[2]])
            L.rect(x, y0 - ch, cw, h - y0 + ch, c)
            L.px(x + 3, y0 - ch + 2, N[2])
            x += cw + r.randint(2, 10) - 2 * fila
    # la parroquia: cúpula de azulejo amarillo, linternilla y una torre
    cx, base = 150, 38
    L.rect(cx - 16, base - 6, 32, h - base + 6, N[4])
    L.rect(cx + 12, base - 6, 4, h - base + 6, N[3])
    L.elipse(cx - 11, base - 22, cx + 11, base, Am[1])
    L.elipse(cx - 11, base - 22, cx - 2, base - 6, Am[2], solo=Am[1])
    L.rect(cx - 3, base - 29, 6, 8, N[4]); L.rect(cx - 1, base - 33, 2, 4, N[4]); L.px(cx, base - 35, N[3])
    L.rect(cx - 30, base - 30, 9, h - base + 30, N[4]); L.rect(cx - 23, base - 30, 2, h - base + 30, N[3])
    L.rect(cx - 30, base - 33, 9, 3, Am[1]); L.rect(cx - 27, base - 37, 3, 4, N[4])
    L.rect(cx - 28, base - 24, 4, 6, N[1])                                   # campanario
    L.rect(cx - 4, base + 4, 8, 12, N[1])                                    # puerta
    return alejar(L.imagen(), CIELO)


# ───────────────────────── capa media ─────────────────────────

def fachada(L, x0, x1):
    """El mercado municipal: muro amarillo con guardapolvo, techo de bóveda de lámina, el arco de
    la entrada con lo de adentro en sombra y el rótulo pintado a mano."""
    cx = (x0 + x1) // 2
    L.poligono([(x0 + 4, 26), (cx, 12), (x1 - 4, 26)], N[2])                 # bóveda de lámina
    L.poligono([(x0 + 4, 26), (cx, 12), (cx, 26)], N[3])
    L.rect(x0, 24, x1 - x0, S - 24 + 1, Am[2])
    L.rect(x0, 24, x1 - x0, 2, N[4]); L.rect(x0, 26, x1 - x0, 1, Am[1])
    L.rect(x1 - 2, 26, 2, S - 25, Am[1])
    L.rect(x0, S - 9, x1 - x0, 10, Ro[1]); L.rect(x0, S - 9, x1 - x0, 1, Ro[0])   # guardapolvo
    L.rect(cx - 26, 30, 52, 9, N[5]); L.rect(cx - 26, 38, 52, 1, Ro[1])       # rótulo
    texto(L, cx - 14, 32, "MERCADO", Ro[1])
    # arco de la entrada
    L.elipse(cx - 17, 44, cx + 17, 72, N[0])
    L.rect(cx - 17, 58, 35, S - 58 + 1, N[0])
    L.elipse(cx - 19, 42, cx + 19, 70, N[4], solo=Am[2])                      # marco del arco
    L.elipse(cx - 17, 44, cx + 17, 72, N[0])
    for k, x in enumerate(range(cx - 14, cx + 13, 7)):                       # lonas de adentro, en sombra
        L.rect(x, 62, 6, 3, (Rs[1], Am[0], Tu[0], V[0])[k % 4])
    for x in (x0 + 8, x1 - 22):                                              # ventanas altas con herrería
        L.rect(x, 44, 14, 20, N[4]); L.rect(x + 1, 45, 12, 18, Az[1])
        for i in range(x + 3, x + 13, 3):
            L.rect(i, 45, 1, 18, N[0])
        L.rect(x + 1, 54, 12, 1, N[0])


def lona(L, x0, x1, alto, c, s):
    """Lona tendida entre dos palos, con su comba y la sombra que echa sobre el puesto."""
    for x in range(x0 - 2, x1 + 3):
        t = (x - x0) / (x1 - x0)
        y = round(alto + 3 * math.sin(math.pi * min(max(t, 0), 1)))
        L.rect(x, alto - 8, 1, y - alto + 9, c)                              # lona: arriba recta, abajo con comba
        L.rect(x, y - 1, 1, 2, s)
    L.rect(x0 - 2, alto - 8, x1 - x0 + 5, 1, s)
    for x in (x0 + 1, x1 - 1):
        L.rect(x, alto - 10, 1, S - alto + 11, T[1])


def mesa(L, x0, x1, y):
    L.rect(x0, y, x1 - x0, 2, T[3]); L.rect(x0, y + 1, x1 - x0, 1, T[2])
    L.rect(x0, y + 2, x1 - x0, S - y - 1, T[3])                              # frente de tablas
    for yy in range(y + 6, S, 5):
        L.rect(x0, yy, x1 - x0, 1, T[2])
    L.rect(x1 - 2, y + 2, 2, S - y - 1, T[2])


def montones(L, x0, x1, y, colores):
    """Montoncitos de fruta (o pan, o chile) sobre la mesa."""
    for k, x in enumerate(range(x0, x1 - 6, 8)):
        c, s = colores[k % len(colores)]
        L.elipse(x, y - 5, x + 7, y + 1, c)
        L.elipse(x + 4, y - 3, x + 7, y + 1, s, solo=c)


def costal(L, x, y, contenido):
    """Costal abierto con el borde enrollado; `y` es la fila del piso."""
    L.rect(x, y - 9, 9, 10, T[4]); L.rect(x + 7, y - 9, 2, 10, T[3])
    L.rect(x - 1, y - 10, 11, 2, T[3])
    L.rect(x + 1, y - 11, 7, 1, contenido)
    L.px(x + 3, y - 12, contenido); L.px(x + 5, y - 12, contenido)


def canasta(L, x, y, c=T[3]):
    L.poligono([(x, y - 6), (x + 10, y - 6), (x + 9, y), (x + 1, y)], c)
    L.rect(x, y - 6, 11, 1, T[4]); L.rect(x + 1, y - 3, 9, 1, T[2])
    L.linea((x + 1, y - 7), (x + 5, y - 11), T[2]); L.linea((x + 5, y - 11), (x + 9, y - 7), T[2])


def diablito(L, x, y):
    """Diablito (carretilla de carga) con dos cajas de jitomate."""
    L.rect(x + 1, y - 22, 1, 22, N[1]); L.linea((x + 1, y - 22), (x - 2, y - 25), N[1])
    L.rect(x + 1, y - 1, 9, 1, N[1])
    L.elipse(x - 1, y - 3, x + 3, y + 1, N[0])
    for k in range(2):
        yy = y - 2 - k * 8
        L.rect(x + 2, yy - 7, 10, 7, T[3]); L.rect(x + 2, yy - 7, 10, 1, T[4]); L.rect(x + 2, yy - 4, 10, 1, T[2])
        L.rect(x + 3, yy - 9, 8, 2, Ro[2])


def gente(L, x, ropa, piel, pelo=None, bolsa=None):
    """Alguien de pie, de lado, a pocos pixeles; `bolsa`: la bolsa del mandado a rayas."""
    L.rect(x + 1, S - 6, 1, 7, N[1]); L.rect(x + 3, S - 6, 1, 7, N[1])     # piernas
    L.rect(x, S - 15, 5, 9, ropa)
    L.rect(x + 1, S - 20, 4, 5, piel)
    L.rect(x + 1, S - 21, 4, 2, pelo or T[0])
    if bolsa:
        L.rect(x + 5, S - 11, 4, 5, bolsa); L.rect(x + 5, S - 9, 4, 1, N[5])
        L.px(x + 6, S - 12, bolsa); L.px(x + 7, S - 12, bolsa)


def media():
    L = Vuelta(WM, HM)
    fachada(L, 0, 116)

    # 1 · puesto de fruta bajo lona rosa (130-188)
    lona(L, 130, 188, 42, Rs[2], Rs[1])
    mesa(L, 133, 186, 70)
    montones(L, 135, 186, 70, [(Na[1], Na[0]), (V[2], V[1]), (Ro[2], Ro[1]), (Am[1], Am[0])])
    costal(L, 190, S, Ro[1]); canasta(L, 201, S)

    # 2 · puesto de pan bajo lona azul: canastas de conchas (232-282)
    lona(L, 232, 282, 46, Az[2], Az[1])
    mesa(L, 235, 280, 72)
    for x in range(238, 276, 13):
        canasta(L, x, 72)
        for k in range(3):
            L.elipse(x + 1 + k * 3, 63, x + 4 + k * 3, 66, (T[3], N[4], Rs[3])[k % 3])   # conchas
    gente(L, 286, Mo[1], P[2], bolsa=Rs[2])

    # 3 · diablito, costales de chile y frijol, y otro puesto chico bajo lona amarilla (300-384)
    diablito(L, 304, S)
    costal(L, 322, S, Ro[0]); costal(L, 333, S, N[0])
    lona(L, 348, 382, 50, Am[1], Am[0])
    mesa(L, 350, 380, 74)
    montones(L, 352, 380, 74, [(V[2], V[1]), (Ro[2], Ro[1])])
    gente(L, 214, Tu[1], P[3], bolsa=Az[2])
    gente(L, 120, Na[1], P[1], pelo=N[0])

    # papel picado de la fachada a los palos de las lonas
    papel_picado(L, (116, 26), (232, 24), 5)                                  # por encima de las lonas
    papel_picado(L, (282, 26), (384, 24), 5, k0=3)
    return L.imagen()


# ───────────────────────── piso ─────────────────────────

def piso():
    """Mismas alturas que antes: banqueta 0-8, guarnición 9-11, calle de adoquín 12-31."""
    w, h = PISO
    L = Lienzo(w, h)
    L.rect(0, 0, w, 9, N[2])                                                 # banqueta de cemento
    L.rect(0, 0, w, 1, N[3])
    for x in (0, 32):
        L.rect(x, 1, 1, 8, N[1])
    L.rect(14, 5, 3, 1, V[2]); L.px(15, 4, V[2]); L.rect(47, 3, 2, 1, Na[1])   # una hoja y una cáscara tiradas
    L.rect(0, 9, w, 1, N[3]); L.rect(0, 10, w, 2, N[2])                      # guarnición
    L.rect(0, 12, w, h - 12, T[2])                                           # adoquín
    L.rect(0, 12, w, 1, T[1])
    for k, y in enumerate(range(13, h, 7)):                                  # adoquines grandes, solo las juntas
        L.rect(0, y + 6, w, 1, T[1])
        for x in range(8 * (k % 2), w, 16):
            L.rect(x, y, 1, 6, T[1])
    return L.imagen()


def capas():
    c = {"far": lejana(), "mid": media(), "ground": piso()}
    for (nombre, im), tam in zip(c.items(), (LEJANA, MEDIA, PISO)):
        comprobar(nombre, im, tam, cielo=CIELO if nombre == "far" else None)
    return c


def jugables():
    """Sofía y variantes de obstáculo pensadas para el mercado."""
    o = lambda clave, v: cuadro_de(f"obst-{clave}", f"v{v}")
    return [
        (cuadro_de("sofia", "run1"), 60, PIES_Y),
        (o("chair", 1), 170, PIES_Y + 2),
        (o("puddle", 1), 260, PIES_Y + 6),
        (o("fence", 1), 360, PIES_Y + 2),
        (o("hole", 0), 520, PIES_Y + 30),
        (o("table", 2), 690, PIES_Y + 2),
        (o("chalk", 0), 870, PIES_Y + 4),
    ]


if __name__ == "__main__":
    previas = Path(sys.argv[1])
    previas.mkdir(parents=True, exist_ok=True)
    vivas = capas()
    apagadas = {k: apagada(v) for k, v in vivas.items()}
    lamina("Fondo del mercado · versión VIVA (al correr)", vivas, CIELO, previas / "mercado-viva.png", encima=jugables())
    lamina("Fondo del mercado · versión APAGADA (quieta, tristeza; calculada con apagar())", apagadas,
           tuple(apagar(c) for c in CIELO), previas / "mercado-apagada.png", encima=jugables())
    print("láminas:", previas / "mercado-viva.png", "y", previas / "mercado-apagada.png")
    if "--exportar" in sys.argv:
        exportar("mercado", vivas, CIELO)
