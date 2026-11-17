# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Fondo del parque (`parque`): verde, tranquilo.

  lejana  los cerros del barrio y, delante, la arboleda del parque; dos papalotes en el cielo
  media   pocas cosas y mucho aire: una jacaranda con su banca, el kiosco entre dos faroles con
          papel picado, un fresno, los columpios y un árbol chico, sobre una lomita de pasto
  piso    andador de tierra, guarnición encalada y pasto (mismas alturas que antes)

Sin contorno de tinta: cada cosa se separa con el tono oscuro de su propio color.

Uso:
  python art-src/fondos/parque.py <carpeta_de_previas>             láminas viva y apagada
  python art-src/fondos/parque.py <carpeta_de_previas> --exportar   además escribe la hoja del juego
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

N, T = R["neutros"], R["tierra"]
V, Mo, Tu, Am, Ro, Rs, Az, Na = (R[k] for k in ("verde", "morado", "turquesa", "amarillo", "rojo", "rosa", "azul", "naranja"))
CIELO = (R["azul"][3], Tu[3])
WM, HM = MEDIA
S = HM - 1


# ───────────────────────── capa lejana ─────────────────────────

def cresta(x):
    k = x / LEJANA[0] * 2 * math.pi
    return round(20 + 5 * math.sin(k + 1) + 3 * math.sin(3 * k) + 1.5 * math.sin(5 * k + 2))


def papalote(L, x, y, c, s):
    """Rombo con su cola de moñitos y el hilo que baja hacia el parque."""
    for dy in range(-3, 5):
        ancho = 3 - abs(dy) if dy <= 0 else max(0, 3 - (dy + 1) // 2)
        for dx in range(-ancho, ancho + 1):
            L.px(x + dx, y + dy, s if dx > 0 else c)
    for k in range(1, 7):
        L.px(x + k + (k // 2) % 2, y + 4 + k, c if k % 2 else N[4])
    for k in range(34):
        L.px(x - 2 - k, y + 3 + round(k * 0.9 + 0.012 * k * k), N[3])


def lejana():
    L = Vuelta(*LEJANA)
    w, h = LEJANA
    for x in range(w):                                      # los cerros del barrio, al fondo
        L.rect(x, cresta(x), 1, h - cresta(x), Mo[2])
    r = random.Random(17)
    for _ in range(18):                                     # unas cuantas casitas en la ladera
        x = r.randrange(w)
        y = cresta(x) + r.randint(6, 14)
        L.rect(x, y - 3, r.choice([4, 5, 6]), 3, r.choice([Rs[3], Na[2], Am[2], N[4], Tu[3]]))
    papalote(L, 86, 9, Ro[2], Ro[1])
    papalote(L, 236, 5, Am[1], Am[0])
    # la arboleda del parque: copas redondas en dos filas
    r = random.Random(9)
    for fila, (y0, tono) in enumerate(((40, V[1]), (47, V[2]))):
        x = -6
        while x < w:
            rx, ry = r.randint(9, 15), r.randint(7, 10)
            L.elipse(x - rx, y0 - ry + r.randint(-2, 2), x + rx, y0 + ry, tono)
            x += r.randint(11, 19)
        L.rect(0, y0 + 2, w, h - y0 - 2, tono)
    return alejar(L.imagen(), CIELO)


# ───────────────────────── capa media ─────────────────────────

def pasto(L):
    """Lomita de pasto a todo lo ancho: es la base donde se para lo demás."""
    for x in range(WM):
        k = x / WM * 2 * math.pi
        alto = round(6 + 2 * math.sin(2 * k) + math.sin(5 * k + 1))
        L.rect(x, HM - alto, 1, alto, V[1])
        L.px(x, HM - alto, V[2])


def arbol(L, x, copa_y, rx, ry, tonos, tronco=4):
    """Árbol de copa redonda. `tonos`: (sombra, base, luz) de la copa. La luz viene de arriba a la
    izquierda."""
    sombra, base, luz = tonos
    L.rect(x - tronco // 2, copa_y, tronco, HM - copa_y - 3, T[1])
    L.rect(x - tronco // 2, copa_y, 1, HM - copa_y - 3, T[2])
    L.linea((x, copa_y + ry), (x - rx // 2, copa_y - 2), T[1]); L.linea((x, copa_y + ry + 3), (x + rx // 2, copa_y), T[1])
    bolas = [(0, 0, 1.0, 1.0), (-0.55, 0.25, 0.6, 0.7), (0.55, 0.2, 0.62, 0.72), (-0.2, -0.5, 0.6, 0.6), (0.3, -0.4, 0.55, 0.6)]

    def bola(dx, dy, fx, fy, mx, my, k, c, solo=None):
        cx, cy = x + dx * rx + mx, copa_y + dy * ry + my
        L.elipse(round(cx - rx * fx * 0.75 * k), round(cy - ry * fy * 0.75 * k),
                 round(cx + rx * fx * 0.75 * k), round(cy + ry * fy * 0.75 * k), c, solo)

    # la misma copa tres veces, cada vez más chica y corrida hacia la luz: la sombra queda abajo a
    # la derecha y la luz arriba a la izquierda, sin franjas
    for b in bolas:
        bola(*b, 0, 0, 1, sombra)
    for b in bolas:
        bola(*b, -2, -3, 0.88, base, solo=sombra)
    for b in bolas[:1] + bolas[3:]:
        bola(*b, -4, -5, 0.55, luz, solo=base)


def banca(L, x):
    """Banca de parque: herrería verde y tablas."""
    for y in (72, 75):
        L.rect(x, y, 22, 2, T[3]); L.rect(x, y + 1, 22, 1, T[2])
    L.rect(x - 1, 80, 24, 2, T[3]); L.rect(x - 1, 81, 24, 1, T[2])
    for px in (x + 1, x + 19):
        L.rect(px, 71, 2, 16, V[0])
    L.rect(x - 1, 77, 2, 4, V[0]); L.rect(x + 21, 77, 2, 4, V[0])


def farol(L, x):
    """Farol de plaza: poste de fierro con tres globos."""
    L.rect(x, 44, 2, 43, N[0]); L.px(x, 44, N[1])
    L.rect(x - 1, 82, 4, 5, N[0])
    L.rect(x - 5, 46, 12, 1, N[0])
    for gx, gy in ((x - 6, 41), (x + 5, 41), (x - 1, 38)):
        L.elipse(gx, gy, gx + 3, gy + 4, N[5]); L.px(gx + 3, gy + 3, Am[2]); L.px(gx + 2, gy + 4, Am[2])


def kiosco(L, cx):
    """El kiosco de la plaza: zócalo de piedra con escalones, columnas delgadas, barandal y techo."""
    # techo de lámina y su remate
    L.poligono([(cx - 33, 45), (cx - 21, 33), (cx + 21, 33), (cx + 33, 45)], Tu[1])
    L.poligono([(cx - 33, 45), (cx - 21, 33), (cx - 9, 33), (cx - 13, 45)], Tu[2])
    L.poligono([(cx + 13, 45), (cx + 9, 33), (cx + 21, 33), (cx + 33, 45)], Tu[0])
    L.rect(cx - 34, 45, 69, 2, N[4]); L.rect(cx - 34, 46, 69, 1, Am[1])
    L.rect(cx - 7, 28, 15, 5, N[4]); L.rect(cx + 5, 28, 3, 5, N[3])
    L.poligono([(cx - 9, 28), (cx, 21), (cx + 9, 28)], Tu[1]); L.linea((cx - 9, 28), (cx, 21), Tu[2])
    L.rect(cx, 17, 1, 4, N[1]); L.px(cx, 16, Am[1])
    # columnas y barandal
    for x in (cx - 29, cx - 12, cx + 11, cx + 28):
        L.rect(x, 47, 2, 30, N[4]); L.rect(x + 1, 47, 1, 30, N[3])
    L.rect(cx - 29, 67, 59, 1, Tu[0])
    for x in range(cx - 26, cx + 28, 3):
        L.rect(x, 68, 1, 8, Tu[0])
    for x in (cx - 29, cx - 12, cx + 11, cx + 28):
        L.rect(x, 47, 2, 30, N[4]); L.rect(x + 1, 47, 1, 30, N[3])
    # zócalo y escalones
    L.rect(cx - 32, 76, 65, 11, N[3]); L.rect(cx - 32, 76, 65, 1, N[4]); L.rect(cx + 29, 77, 4, 10, N[2])
    for x in (cx - 16, cx + 15):
        L.rect(x, 77, 1, 10, N[2])
    L.rect(cx - 8, 68, 17, 8, None)                                          # entrada: sin barandal
    for k, y in enumerate((78, 81, 84)):
        L.rect(cx - 8 - k, y, 17 + 2 * k, 3, N[4]); L.rect(cx - 8 - k, y + 2, 17 + 2 * k, 1, N[2])


def columpios(L, x0, x1):
    """Columpios de tubo pintado: dos asientos, uno quedó meciéndose."""
    for x in (x0, x1):
        L.linea((x, 56), (x - 6, S - 3), Am[0]); L.linea((x, 56), (x + 6, S - 3), Am[1])
    L.rect(x0, 55, x1 - x0 + 1, 2, Am[1]); L.rect(x0, 56, x1 - x0 + 1, 1, Am[0])
    a = x0 + 11
    for x in (a, a + 6):
        L.rect(x, 57, 1, 22, N[1])
    L.rect(a - 1, 79, 9, 2, Ro[1])
    b = x1 - 16
    for k in range(22):
        L.px(b + k // 6, 57 + k, N[1]); L.px(b + 6 + k // 6, 57 + k, N[1])
    L.rect(b + 2, 78, 9, 2, Az[2])


def mata(L, x, flor):
    """Mata baja con unas flores."""
    L.elipse(x - 6, 78, x + 6, 87, V[0]); L.elipse(x - 5, 78, x + 3, 84, V[1], solo=V[0])
    for dx, dy in ((-3, 80), (1, 79), (4, 82)):
        L.px(x + dx, dy, flor)


def media():
    L = Vuelta(WM, HM)
    pasto(L)
    morada = (Mo[0], Mo[1], Mo[2])
    verde = (V[0], V[1], V[2])

    arbol(L, 36, 30, 34, 20, morada, tronco=5)                               # la jacaranda y su banca
    for x, y in ((22, 84), (27, 86), (41, 85), (47, 83), (16, 86), (52, 86)):
        L.px(x, y, Mo[2])                                                    # flores caídas en el pasto
    banca(L, 56)

    farol(L, 96)
    kiosco(L, 148)
    farol(L, 200)
    papel_picado(L, (97, 47), (115, 46), 4)
    papel_picado(L, (182, 46), (200, 47), 4, k0=3)
    mata(L, 108, Rs[2]); mata(L, 189, Am[1])

    arbol(L, 246, 32, 26, 18, verde)                                         # el fresno
    columpios(L, 290, 326)
    arbol(L, 358, 40, 19, 14, verde, tronco=3)                               # árbol chico
    mata(L, 378, N[5])
    return L.imagen()


# ───────────────────────── piso ─────────────────────────

def piso():
    """Mismas alturas que el piso de antes: andador 0-8, guarnición 9-11, pasto 12-31."""
    w, h = PISO
    L = Lienzo(w, h)
    L.rect(0, 0, w, 9, T[3])                                                 # andador de tierra apisonada
    L.rect(0, 0, w, 1, T[4])
    for x, y, n in ((9, 3, 3), (37, 6, 2), (52, 4, 3), (24, 7, 2)):
        L.rect(x, y, n, 1, T[2])
    L.rect(0, 9, w, 1, N[4])                                                 # guarnición encalada
    L.rect(0, 10, w, 2, N[3])
    for x in (0, 21, 43):
        L.rect(x, 9, 1, 3, N[2])                                             # juntas
    for x, y in ((12, 10), (13, 10), (13, 11), (33, 9), (34, 9), (55, 11), (56, 11), (56, 10)):
        L.px(x, y, N[2])                                                     # cal botada
    L.rect(0, 12, w, h - 12, V[2])                                           # pasto
    L.rect(0, 12, w, 1, V[1])
    for x, y in ((5, 16), (19, 22), (31, 15), (44, 27), (58, 19), (12, 28), (38, 21), (50, 14), (26, 30)):
        L.px(x, y, V[1]); L.px(x + 1, y - 1, V[1]); L.px(x + 2, y, V[1])     # matitas
    for x, y in ((9, 20), (47, 23), (29, 26)):
        L.px(x, y, V[3]); L.px(x + 1, y, V[3])
    for x, y, c in ((16, 18, N[5]), (41, 17, Am[1]), (55, 26, N[5])):
        L.px(x, y, c)                                                        # florecitas
    return L.imagen()


def capas():
    c = {"far": lejana(), "mid": media(), "ground": piso()}
    for (nombre, im), tam in zip(c.items(), (LEJANA, MEDIA, PISO)):
        comprobar(nombre, im, tam, cielo=CIELO if nombre == "far" else None)
    return c


def jugables():
    """Sofía y las variantes de obstáculo que más se piensan para el parque."""
    o = lambda clave, v: cuadro_de(f"obst-{clave}", f"v{v}")
    return [
        (cuadro_de("sofia", "run1"), 60, PIES_Y),
        (o("chair", 3), 170, PIES_Y + 2),
        (o("puddle", 1), 260, PIES_Y + 6),
        (o("wall", 4), 390, PIES_Y + 8),
        (o("hole", 0), 580, PIES_Y + 30),
        (o("chalk", 1), 760, PIES_Y + 4),
        (o("table", 3), 815, PIES_Y + 2),
    ]


if __name__ == "__main__":
    previas = Path(sys.argv[1])
    previas.mkdir(parents=True, exist_ok=True)
    vivas = capas()
    apagadas = {k: apagada(v) for k, v in vivas.items()}
    lamina("Fondo del parque · versión VIVA (al correr)", vivas, CIELO, previas / "parque-viva.png", encima=jugables())
    lamina("Fondo del parque · versión APAGADA (quieta, tristeza; calculada con apagar())", apagadas,
           tuple(apagar(c) for c in CIELO), previas / "parque-apagada.png", encima=jugables())
    print("láminas:", previas / "parque-viva.png", "y", previas / "parque-apagada.png")
    if "--exportar" in sys.argv:
        exportar("parque", vivas, CIELO)
