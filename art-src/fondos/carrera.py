# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Fondo de la carrera (`carrera`): pista roja, banderines, festivo.

Es la unidad deportiva del municipio el día de la carrera con premio.

  lejana  cerros, la tribuna techada del otro lado de la pista, árboles y torres de luz
  media   pretil pintado a mano a todo lo ancho y, detrás, pocas cosas: gradas de concreto con
          gente, la carpa de los jueces con el trofeo y la bocina, una torre de luz y la bandera,
          con cuerdas de banderines entre ellas
  piso    pista de tartán con sus rayas de carril (mismas alturas que antes)

Sin contorno de tinta: cada cosa se separa con el tono oscuro de su propio color.

Uso:
  python art-src/fondos/carrera.py <carpeta_de_previas>             láminas viva y apagada
  python art-src/fondos/carrera.py <carpeta_de_previas> --exportar   además escribe la hoja del juego
"""
import math
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from comun import R, LEJANA, MEDIA, PISO, PIES_Y, alejar, apagada, apagar, comprobar, cuadro_de, exportar, lamina  # noqa: E402
from barrio import Vuelta, cable  # noqa: E402

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from pincel import Lienzo  # noqa: E402

N, T, P = R["neutros"], R["tierra"], R["piel"]
V, Mo, Tu, Am, Ro, Rs, Az, Na = (R[k] for k in ("verde", "morado", "turquesa", "amarillo", "rojo", "rosa", "azul", "naranja"))
CIELO = (Az[2], N[5])
WM, HM = MEDIA
S = HM - 1
PRETIL = 78                      # fila donde empieza el pretil pintado del frente
FIESTA = [Rs[2], Am[1], Tu[2], Na[1], Mo[1], V[2]]

LETRAS = {
    "C": ["111", "100", "100", "100", "111"], "A": ["010", "101", "111", "101", "101"],
    "R": ["110", "101", "110", "101", "101"], "E": ["111", "100", "110", "100", "111"],
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
    return round(14 + 4 * math.sin(k + 2) + 3 * math.sin(3 * k + 1) + 1.5 * math.sin(4 * k))


def torre_lejana(L, x):
    L.rect(x, 12, 1, 58, N[1])
    L.rect(x - 4, 9, 9, 4, N[2])
    for k in range(3):
        L.px(x - 3 + k * 3, 10, N[5]); L.px(x - 3 + k * 3, 11, N[5])


def lejana():
    L = Vuelta(*LEJANA)
    w, h = LEJANA
    for x in range(w):                                      # cerros
        L.rect(x, cresta(x), 1, h - cresta(x), Mo[2])
    # la tribuna techada del otro lado de la pista
    L.rect(70, 46, 150, 24, N[3])
    for y in range(49, 70, 4):
        L.rect(70, y, 150, 1, N[2])
    L.poligono([(64, 46), (70, 38), (220, 38), (226, 46)], Tu[1])
    L.rect(64, 46, 162, 1, Tu[0])
    for x in range(74, 220, 30):
        L.rect(x, 46, 1, 24, N[2])
    r = random.Random(13)
    for _ in range(70):                                     # la gente, en puntitos de color
        L.px(r.randint(72, 217), r.choice(range(48, 69, 4)), r.choice(FIESTA + [N[5]]))
    torre_lejana(L, 40); torre_lejana(L, 252)
    # árboles a los lados y la barda del fondo
    r = random.Random(4)
    for x in list(range(0, 66, 9)) + list(range(228, w + 4, 9)):
        ry = r.randint(6, 9)
        L.elipse(x - 6, 58 - ry, x + 6, 62, V[1])
    L.rect(0, 62, w, h - 62, V[1])
    L.rect(0, 66, w, 3, N[4])
    return alejar(L.imagen(), CIELO)


# ───────────────────────── capa media ─────────────────────────

def persona(L, x, y, playera, piel, brazos=False):
    """Alguien sentado en la grada, visto de frente: cabeza 3×3 y torso 3×3; `y` es la fila del
    asiento."""
    L.rect(x, y - 3, 3, 3, playera)
    L.rect(x, y - 6, 3, 3, piel)
    L.rect(x, y - 7, 3, 1, T[0])                            # pelo
    if brazos:                                              # echando porras
        L.px(x - 1, y - 6, piel); L.px(x - 1, y - 5, playera); L.px(x + 3, y - 6, piel); L.px(x + 3, y - 5, playera)


def gradas(L, x0, x1):
    """Gradas de concreto, cuatro escalones, con poca gente."""
    filas = (48, 56, 64, 72)
    L.rect(x0, filas[0] - 2, x1 - x0, PRETIL - filas[0] + 2, N[3])
    for k, y in enumerate(filas):
        L.rect(x0, y, x1 - x0, 2, N[4])                     # canto del escalón, con sol
        L.rect(x0, y + 2, x1 - x0, 1, N[2])
        L.rect(x0, y + 3, x1 - x0, 5, Az[3] if k % 2 else N[3])   # pintado a franjas, deslavado
    L.rect(x1 - 2, filas[0] - 2, 2, PRETIL - filas[0] + 2, N[2])
    L.rect(x0, filas[0] - 4, x1 - x0, 2, N[2])              # barandal de arriba
    for x in range(x0 + 3, x1, 16):
        L.rect(x, filas[0] - 9, 1, 7, N[2])
    L.rect(x0, filas[0] - 9, x1 - x0, 1, N[2])
    r = random.Random(7)
    pieles = [P[1], P[2], P[3], P[4]]
    for k, y in enumerate(filas):
        x = x0 + 4 + r.randint(0, 6)
        while x < x1 - 6:
            if r.random() < 0.55:
                persona(L, x, y, r.choice(FIESTA + [N[5], Az[1]]), r.choice(pieles), brazos=r.random() < 0.3)
            x += r.randint(6, 12)


def carpa(L, x0, x1):
    """La carpa de los jueces: lona a rayas con fleco de ondas, mesa con mantel y el trofeo."""
    L.rect(x0 + 2, 40, 2, PRETIL - 40, N[1]); L.rect(x1 - 4, 40, 2, PRETIL - 40, N[1])
    L.poligono([(x0 - 2, 40), (x0 + 6, 30), (x1 - 6, 30), (x1 + 2, 40)], N[5])
    for k, x in enumerate(range(x0 + 6, x1 - 6, 6)):        # rayas de la lona
        if k % 2 == 0:
            L.poligono([(x - 2, 40), (x, 30), (x + 6, 30), (x + 6, 40)], Rs[2], solo=N[5])
    L.rect(x0 - 2, 40, x1 - x0 + 5, 3, Rs[1])
    for x in range(x0 - 2, x1 + 3, 4):                      # fleco de ondas
        L.rect(x, 43, 3, 1, Rs[1]); L.px(x + 1, 44, Rs[1])
    L.linea((x0 + 6, 30), (x1 - 6, 30), N[4])
    # mesa, mantel y trofeo
    L.rect(x0 + 6, 62, x1 - x0 - 12, 16, N[5]); L.rect(x0 + 6, 62, x1 - x0 - 12, 2, Tu[2])
    L.rect(x1 - 8, 64, 2, 14, N[4])
    cx = (x0 + x1) // 2
    L.rect(cx - 3, 50, 7, 5, Am[1]); L.rect(cx + 2, 50, 2, 5, Am[0])
    L.px(cx - 4, 51, Am[1]); L.px(cx + 4, 51, Am[0]); L.rect(cx - 1, 55, 3, 4, Am[0]); L.rect(cx - 3, 59, 7, 3, T[1])
    L.px(cx - 2, 51, Am[2])
    L.rect(x0 + 10, 57, 6, 5, N[4]); L.rect(x0 + 11, 58, 4, 1, N[2])    # libreta de los tiempos
    # dos bocinas de corneta en su poste, una para cada lado
    px = x1 + 8
    L.rect(px, 20, 2, PRETIL - 20, N[1])
    for lado in (-1, 1):
        boca = px + (-7 if lado < 0 else 8)
        L.rect(min(px, boca) + (1 if lado < 0 else 1), 23, 6, 2, N[3])           # cuerpo
        L.elipse(boca - 1, 20, boca + 1, 27, N[3])                               # boca abierta
        L.rect(boca, 22, 1, 4, N[1])


def torre(L, x):
    """Torre de luz de la unidad deportiva."""
    L.rect(x, 12, 3, PRETIL - 12, N[1]); L.rect(x, 12, 1, PRETIL - 12, N[2])
    L.rect(x - 7, 3, 17, 9, N[1])
    for i in range(4):
        for j in range(2):
            L.rect(x - 6 + i * 4, 4 + j * 4, 3, 3, N[5])
    L.rect(x - 7, 11, 17, 1, N[0])


def bandera(L, x):
    """Asta con la bandera de México ondeando (los tres colores; el escudo, apenas una mancha)."""
    L.rect(x, 8, 2, PRETIL - 8, N[2]); L.px(x, 7, Am[1]); L.px(x + 1, 7, Am[1])
    for i in range(24):
        ola = round(1.5 * math.sin(i / 3.2))
        c = V[1] if i < 8 else (N[5] if i < 16 else Ro[1])
        L.rect(x + 2 + i, 10 + ola, 1, 14, c)
    L.rect(x + 16, 15, 3, 3, T[2], solo=N[5])


def banderines(L, a, b, comba, k0=0):
    """Cuerda con banderines triangulares de colores."""
    pts = cable(L, a, b, comba, N[1])
    for k, (x, y) in enumerate(pts[3:-3:7]):
        c = FIESTA[(k + k0) % len(FIESTA)]
        for dy in range(5):
            for dx in range(dy // 2, 5 - dy // 2):
                L.px(x + dx, y + 1 + dy, c)


def pretil(L):
    """Pretil bajo pintado a mano frente a la pista, a todo lo ancho: tramos de colores y el
    nombre de la carrera."""
    # tonos claros de cada rampa: va justo detrás de los obstáculos y no debe competir con ellos
    colores = [Am[2], Rs[3], Tu[3], N[5], Na[2], Az[3]]
    for k, x in enumerate(range(0, WM, 32)):
        c = colores[k % len(colores)]
        L.rect(x, PRETIL, 32, HM - PRETIL, c)
        L.rect(x + 31, PRETIL, 1, HM - PRETIL, N[3])
    L.rect(0, PRETIL, WM, 1, N[4])
    texto(L, 99, PRETIL + 3, "CARRERA", Ro[1])              # sobre el tramo blanco
    for x in (6, 230, 358):                                 # estrellitas pintadas
        c = N[5]
        L.px(x + 2, PRETIL + 3, c); L.rect(x + 1, PRETIL + 4, 3, 1, c); L.px(x + 2, PRETIL + 5, c)


def media():
    L = Vuelta(WM, HM)
    L.rect(0, PRETIL - 6, WM, 6, V[1])                      # pasto entre el pretil y lo de atrás
    L.rect(0, PRETIL - 6, WM, 1, V[2])
    gradas(L, 0, 132)
    carpa(L, 168, 222)
    torre(L, 276)
    bandera(L, 336)
    banderines(L, (132, 40), (166, 30), 4)
    banderines(L, (240, 20), (277, 14), 6, k0=2)
    banderines(L, (279, 14), (337, 9), 9, k0=4)
    pretil(L)
    return L.imagen()


# ───────────────────────── piso ─────────────────────────

def piso():
    """Pista de tartán con las rayas de los carriles en las mismas filas que antes (9 y 21)."""
    w, h = PISO
    L = Lienzo(w, h)
    L.rect(0, 0, w, h, Na[0])
    L.rect(0, 0, w, 1, Ro[1])                               # orilla de la pista, contra el pretil
    for y in (9, 21):
        L.rect(0, y, w, 1, N[4])
    for x, y in ((14, 9), (15, 9), (47, 21), (48, 21)):
        L.px(x, y, Ro[2])                                   # raya gastada
    for x, y in ((6, 4), (38, 15), (25, 27), (55, 5)):
        L.px(x, y, Ro[1])                                   # parches del tartán
    return L.imagen()


def capas():
    c = {"far": lejana(), "mid": media(), "ground": piso()}
    for (nombre, im), tam in zip(c.items(), (LEJANA, MEDIA, PISO)):
        comprobar(nombre, im, tam, cielo=CIELO if nombre == "far" else None)
    return c


def jugables():
    """Sofía y variantes de obstáculo pensadas para la carrera; el hoyo, para revisarlo en la pista."""
    o = lambda clave, v: cuadro_de(f"obst-{clave}", f"v{v}")
    return [
        (cuadro_de("sofia", "run1"), 60, PIES_Y),
        (o("chair", 2), 170, PIES_Y + 2),
        (o("fence", 2), 255, PIES_Y + 2),
        (o("wall", 4), 390, PIES_Y + 8),
        (o("hole", 1), 580, PIES_Y + 30),
        (o("hole", 0), 740, PIES_Y + 30),
        (o("table", 1), 880, PIES_Y + 2),
    ]


if __name__ == "__main__":
    previas = Path(sys.argv[1])
    previas.mkdir(parents=True, exist_ok=True)
    vivas = capas()
    apagadas = {k: apagada(v) for k, v in vivas.items()}
    lamina("Fondo de la carrera · versión VIVA (al correr)", vivas, CIELO, previas / "carrera-viva.png", encima=jugables())
    lamina("Fondo de la carrera · versión APAGADA (quieta, tristeza; calculada con apagar())", apagadas,
           tuple(apagar(c) for c in CIELO), previas / "carrera-apagada.png", encima=jugables())
    print("láminas:", previas / "carrera-viva.png", "y", previas / "carrera-apagada.png")
    if "--exportar" in sys.argv:
        exportar("carrera", vivas, CIELO)
