# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Muñeco de niño (24×32) que comparten los personajes de complexión «kid». Con `complexion("toddler")`
se encoge a niño chiquito (20×26): piernas y torso cortos, misma cabeza. Con `complexion("teen")`
el mismo muñeco se estira a adolescente (24×36): piernas, torso y brazos más largos, misma cabeza.
Con `complexion("adult")` pasa a adulto (28×46): más alto todavía, con el torso y las extremidades
más gruesos.

Cada personaje tiene su script (sofia.py, dani.py…): llama a `vestir()` con sus colores, peinado y
carrera propia, cambia las poses que sean solo suyas en `POSES` y termina con `main()`.

Los nombres de cuadro son los que pide el juego (run0…run5, idle0, slide, talk… y los «_b» de
parpadeo). Los pies caen siempre en la última fila del cuadro (la del contorno).
"""
import json
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

RAIZ = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(RAIZ / "art-src"))
from paleta import RAMPAS, apagar  # noqa: E402

W, H = 24, 32
SUELO = 29  # fila de arriba del tenis apoyado (ocupa 29 y 30; la 31 es contorno)
SUELO_NINO = 29   # las poses se escriben siempre con las medidas del niño
ESTIRA = None     # (piernas, torso, brazos) respecto al niño; None = niño
GRUESO = 2        # grosor de brazos y piernas
ANCHO = 5         # ancho del torso
CORRE_X = 0       # las poses se escriben para un cuadro de 24 de ancho; esto las centra en uno más ancho

COMPLEXIONES = {
    "toddler": dict(W=20, H=26, ESTIRA=(0.7, 0.75, 0.65), GRUESO=2, ANCHO=5, CORRE_X=-2),
    "kid": dict(W=24, H=32, ESTIRA=None, GRUESO=2, ANCHO=5, CORRE_X=0),
    "teen": dict(W=24, H=36, ESTIRA=(1.3, 1.2, 1.2), GRUESO=2, ANCHO=5, CORRE_X=0),
    "adult": dict(W=28, H=46, ESTIRA=(1.75, 1.55, 1.5), GRUESO=3, ANCHO=7, CORRE_X=2),
}


def complexion(nombre):
    """Cambia el tamaño del cuadro y las proporciones del muñeco."""
    c = COMPLEXIONES[nombre]
    globals().update(c, SUELO=c["H"] - 1 - c["GRUESO"])


R = RAMPAS
TINTA = R["tinta"][1]
PIEL, PIEL_S = R["piel"][4], R["piel"][3]
PELO, PELO_L = R["tierra"][0], R["tierra"][1]
PLAYERA, PLAYERA_S = R["rojo"][2], R["rojo"][1]
SHORT, SHORT_S = R["azul"][1], R["azul"][0]
TENIS, TENIS_S = R["neutros"][5], R["neutros"][3]
BLANCO = R["neutros"][5]   # ojos como platos y dientes (no cambia con el color de los tenis)
LIGA = R["amarillo"][1]
BOCA = R["rojo"][0]
RUBOR = R["rojo"][3]
LAGRIMA = R["azul"][3]
LENGUA = R["rojo"][2]
ACENTO = R["rojo"][2]      # franja del tenis
# "trenza" (Sofía), "cola" (cola de caballo alta), "revuelto" (pelo corto con picos), "gorra" (al
# revés), "rapado", "corto", "peinado" (de raya al lado, bien relamido) o "chongo" (pelo recogido en
# un chongo alto)
PEINADO = "trenza"
ARETE = None               # color del arete, o None
GORRA, GORRA_S, GORRA_L = R["rojo"][2], R["rojo"][1], R["rojo"][3]
PANTALON = False           # pantalón largo: toda la pierna del color del short
MANGA_LARGA = False        # sudadera: todo el brazo del color de la playera, solo la mano de piel
LENTES = None              # color del armazón, o None
BIGOTE = False             # bigote del color del pelo
BARBA = None               # color de la barba de días, o None
JUGUETE = None             # (color, claro, sombra): dinosaurio de juguete en la mano cercana, o None
OJERAS = False             # ojeras: un pixel de sombra bajo cada ojo
SIN_MANGA = False          # camiseta de tirantes: el brazo entero es piel
PANZA = False              # barriga: el torso sale un pixel al frente
BOTELLA = None             # (vidrio, brillo, etiqueta): botella en la mano cercana, o None
# Personaje que no corre en ningún nivel: su hoja solo trae los cuadros de pie que usan los diálogos
# (idle, cheer y los gestos, con sus parpadeos). Sin carrera, obstáculos, caída ni calentamiento.
SOLO_PARADO = False
# Personaje que solo corre para perseguir: su hoja trae los cuadros de pie, la carrera, la salida y
# las poses de obstáculo que usa el juego al perseguir. Sin caída ni calentamiento.
PERSIGUE = False
PERSECUCION = ("ready", "hop", "slide", "tuck", "fly")
PARADO = ("idle0", "idle1", "cheer0", "cheer1", "talk", "sad", "angry", "cry", "shock")
CRISTAL = R["neutros"][4]  # cristal de los lentes


def vestir(**cambios):
    """Cambia colores, peinado, lentes o la carrera (`CARRERA`) del muñeco para un personaje."""
    desconocidos = [k for k in cambios if k not in globals()]
    assert not desconocidos, f"vestir(): no existe {desconocidos}"
    globals().update(cambios)


class Lienzo:
    def __init__(self):
        self.p = {}

    def px(self, x, y, c):
        x, y = round(x), round(y)
        if c is None:
            self.p.pop((x, y), None)
        elif 0 <= x < W and 0 <= y < H:
            self.p[(x, y)] = c

    def rect(self, x, y, w, h, c):
        for j in range(h):
            for i in range(w):
                self.px(round(x) + i, round(y) + j, c)

    def linea(self, a, b, c, g=2):
        """Bresenham con pincel cuadrado de g×g (la esquina de arriba-izquierda es el punto)."""
        x0, y0, x1, y1 = round(a[0]), round(a[1]), round(b[0]), round(b[1])
        dx, dy = abs(x1 - x0), -abs(y1 - y0)
        sx, sy = (1 if x0 < x1 else -1), (1 if y0 < y1 else -1)
        err = dx + dy
        while True:
            self.rect(x0, y0, g, g, c)
            if x0 == x1 and y0 == y1:
                break
            e2 = 2 * err
            if e2 >= dy:
                err += dy; x0 += sx
            if e2 <= dx:
                err += dx; y0 += sy

    def elipse(self, x0, y0, x1, y1, c):
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        rx, ry = (x1 - x0 + 1) / 2, (y1 - y0 + 1) / 2
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1.0:
                    self.px(x, y, c)

    def contorno(self, c):
        borde = set()
        for (x, y) in self.p:
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                q = (x + dx, y + dy)
                if q not in self.p and 0 <= q[0] < W and 0 <= q[1] < H:
                    borde.add(q)
        for q in borde:
            self.p[q] = c

    def imagen(self):
        im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        for (x, y), c in self.p.items():
            im.putpixel((x, y), tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) + (255,))
        return im


def polar(o, largo, grados):
    """Punto a `largo` de `o`; 0° cuelga hacia abajo, positivo hacia adelante (derecha)."""
    a = math.radians(grados)
    return (o[0] + math.sin(a) * largo, o[1] + math.cos(a) * largo)


# ---------- partes ----------

def cabeza(L, h, cara, parpadeo=False):
    hx, hy = h
    if PEINADO == "revuelto":
        L.elipse(hx - 5, hy - 6, hx + 3, hy + 2, PELO)             # pelo corto
        for x, y in ((hx - 4, hy - 7), (hx - 1, hy - 7), (hx + 2, hy - 7), (hx - 6, hy - 3), (hx - 6, hy)):
            L.px(x, y, PELO)                                       # picos
        for x, y in ((hx - 3, hy - 5), (hx - 2, hy - 5), (hx - 4, hy - 3)):
            L.px(x, y, PELO_L)
        L.rect(hx - 3, hy + 2, 3, 3, PIEL_S)                       # nuca
        L.elipse(hx - 2, hy - 3, hx + 5, hy + 5, PIEL)             # cara
        L.rect(hx - 2, hy - 4, 7, 2, PELO)                         # fleco corto y disparejo
        for x in (hx - 2, hx, hx + 3):
            L.px(x, hy - 2, PELO)
        L.px(hx + 5, hy - 2, PELO)
        L.px(hx + 1, hy - 4, PELO_L)
        L.px(hx - 2, hy - 1, PELO); L.px(hx - 2, hy, PELO)         # patilla corta
        L.px(hx - 2, hy + 1, PIEL_S); L.px(hx - 2, hy + 2, PIEL_S)  # oreja
    elif PEINADO == "corto":
        L.elipse(hx - 5, hy - 6, hx + 3, hy + 2, PELO)             # pelo corto, sin picos
        L.px(hx - 3, hy - 5, PELO_L); L.px(hx - 2, hy - 5, PELO_L); L.px(hx - 4, hy - 3, PELO_L)
        L.rect(hx - 3, hy + 2, 3, 3, PIEL_S)                       # nuca
        L.elipse(hx - 2, hy - 3, hx + 5, hy + 5, PIEL)             # cara
        L.rect(hx - 2, hy - 4, 7, 2, PELO)                         # nacimiento del pelo
        L.px(hx + 3, hy - 3, PIEL); L.px(hx + 4, hy - 3, PIEL)     # entrada
        L.px(hx + 5, hy - 2, PIEL_S)
        L.px(hx - 2, hy - 2, PELO); L.px(hx - 2, hy - 1, PELO); L.px(hx - 2, hy, PELO)   # patilla
        L.px(hx - 2, hy + 1, PIEL_S); L.px(hx - 2, hy + 2, PIEL_S)  # oreja
    elif PEINADO == "peinado":
        L.elipse(hx - 5, hy - 6, hx + 3, hy + 2, PELO)             # casquete liso, sin picos
        L.rect(hx - 3, hy + 2, 3, 3, PIEL_S)                       # nuca
        L.elipse(hx - 2, hy - 3, hx + 5, hy + 5, PIEL)             # cara
        L.rect(hx - 2, hy - 4, 7, 2, PELO)                         # fleco peinado de lado, parejo
        L.px(hx + 5, hy - 3, PELO); L.px(hx + 5, hy - 2, PELO)
        L.px(hx - 2, hy - 2, PELO); L.px(hx - 2, hy - 1, PELO)     # patilla corta
        L.px(hx - 2, hy, PIEL_S); L.px(hx - 2, hy + 1, PIEL_S)     # oreja
        for x, y in ((hx - 3, hy - 6), (hx - 2, hy - 5), (hx - 1, hy - 4)):
            L.px(x, y, PELO_L)                                     # la raya
        for x, y in ((hx + 1, hy - 5), (hx + 2, hy - 5), (hx + 3, hy - 4)):
            L.px(x, y, PELO_L)                                     # brillo de pelo relamido
    elif PEINADO == "chongo":
        L.elipse(hx - 5, hy - 6, hx + 3, hy + 2, PELO)             # pelo recogido, pegado a la cabeza
        L.elipse(hx - 8, hy - 7, hx - 5, hy - 4, PELO)             # chongo alto, atrás
        L.px(hx - 7, hy - 6, PELO_L)
        L.px(hx - 3, hy - 5, PELO_L); L.px(hx - 2, hy - 5, PELO_L); L.px(hx - 4, hy - 3, PELO_L)
        L.rect(hx - 3, hy + 2, 3, 3, PIEL_S)                       # nuca
        L.elipse(hx - 2, hy - 3, hx + 5, hy + 5, PIEL)             # cara
        L.rect(hx - 2, hy - 4, 7, 2, PELO)                         # pelo estirado hacia atrás
        L.px(hx + 4, hy - 3, PIEL); L.px(hx + 5, hy - 2, PIEL_S)
        L.px(hx - 2, hy - 2, PELO); L.px(hx - 2, hy - 1, PELO); L.px(hx - 2, hy, PELO)   # patilla
        L.px(hx - 2, hy + 1, PIEL_S); L.px(hx - 2, hy + 2, PIEL_S)  # oreja
    elif PEINADO == "rapado":
        L.elipse(hx - 5, hy - 5, hx + 3, hy + 2, PELO)             # cráneo rapado, pegado a la cabeza
        L.px(hx - 3, hy - 4, PELO_L); L.px(hx - 2, hy - 5, PELO_L)
        L.rect(hx - 3, hy + 2, 3, 3, PIEL_S)                       # nuca
        L.elipse(hx - 2, hy - 3, hx + 5, hy + 5, PIEL)             # cara
        L.rect(hx - 2, hy - 4, 7, 1, PELO)                         # nacimiento del pelo, alto
        L.px(hx - 2, hy - 3, PELO); L.px(hx + 4, hy - 3, PELO); L.px(hx + 5, hy - 2, PIEL_S)
        L.px(hx - 2, hy - 2, PELO); L.px(hx - 2, hy - 1, PELO)     # patilla
        L.px(hx - 2, hy, PIEL_S); L.px(hx - 2, hy + 1, PIEL_S)     # oreja
    elif PEINADO == "gorra":
        L.elipse(hx - 5, hy - 5, hx + 3, hy + 2, PELO)             # pelo corto bajo la gorra
        L.rect(hx - 3, hy + 2, 3, 3, PIEL_S)                       # nuca
        L.elipse(hx - 2, hy - 3, hx + 5, hy + 5, PIEL)             # cara
        # gorra al revés: copa sobre la frente y visera hacia atrás
        L.rect(hx - 3, hy - 7, 7, 1, GORRA)
        L.rect(hx - 5, hy - 6, 10, 1, GORRA)
        L.rect(hx - 5, hy - 5, 11, 2, GORRA)
        L.rect(hx - 5, hy - 3, 11, 1, GORRA_S)                     # banda
        L.rect(hx - 9, hy - 4, 4, 2, GORRA_S)                      # visera
        L.px(hx - 9, hy - 4, None)
        L.px(hx - 2, hy - 6, GORRA_L); L.px(hx - 1, hy - 6, GORRA_L); L.px(hx - 3, hy - 5, GORRA_L)
        L.px(hx + 5, hy - 2, PIEL_S)
        L.px(hx - 2, hy - 2, PELO); L.px(hx - 2, hy - 1, PELO); L.px(hx - 2, hy, PELO)   # patilla
        L.px(hx - 2, hy + 1, PIEL_S); L.px(hx - 2, hy + 2, PIEL_S)  # oreja
    else:
        L.elipse(hx - 6, hy - 6, hx + 3, hy + 4, PELO)             # melena
        for x, y in ((hx - 4, hy - 4), (hx - 3, hy - 5), (hx - 2, hy - 5), (hx - 1, hy - 5), (hx - 5, hy - 2)):
            L.px(x, y, PELO_L)                                     # brillo, luz de arriba-izquierda
        L.elipse(hx - 2, hy - 3, hx + 5, hy + 5, PIEL)             # cara
        L.rect(hx - 2, hy - 4, 7, 3, PELO)                         # fleco
        L.px(hx + 5, hy - 2, PELO)
        for x in (hx - 2, hx - 1, hx + 2):
            L.px(x, hy - 1, PELO)                                  # puntas del fleco
        L.px(hx + 1, hy - 3, PELO_L); L.px(hx + 2, hy - 3, PELO_L)
        for y in (hy, hy + 1, hy + 2):
            L.px(hx - 2, y, PELO)                                  # patilla
    L.px(hx - 1, hy + 3, PIEL_S); L.px(hx - 1, hy + 4, PIEL_S)     # sombra del pelo en la mejilla
    if ARETE:
        L.px(hx - 2, hy + 3, ARETE); L.px(hx - 2, hy + 4, ARETE)
    for x in range(hx, hx + 4):
        L.px(x, hy + 5, PIEL_S)                                    # sombra de la barbilla
    ex, ex2, ey = hx + 1, hx + 4, hy + 1
    L.px(hx, hy + 3, RUBOR); L.px(hx + 1, hy + 3, RUBOR)
    T = TINTA
    # ojos
    if parpadeo:
        L.px(ex - 1, ey + 1, T); L.px(ex, ey + 1, T); L.px(ex2, ey + 1, T)
    elif cara == "feliz":
        for x, y in ((ex - 1, ey + 1), (ex, ey), (ex + 1, ey + 1), (ex2, ey), (ex2 + 1, ey + 1)):
            L.px(x, y, T)
    elif cara in ("sola", "triste"):
        # mirada baja: párpado caído
        L.px(ex, ey, PIEL_S); L.px(ex2, ey, PIEL_S)
        L.px(ex, ey + 1, T); L.px(ex2, ey + 1, T)
        if cara == "triste":
            L.px(ex - 1, ey, T); L.px(ex2 + 1, ey, T)             # cejas caídas hacia afuera
    elif cara == "enojo":
        L.px(ex - 1, ey - 1, T); L.px(ex, ey, T); L.px(ex2, ey, T); L.px(ex2 + 1, ey - 1, T)  # ceño
        L.px(ex, ey + 1, T); L.px(ex2, ey + 1, T)
    elif cara == "llanto":
        L.px(ex - 1, ey, T); L.px(ex, ey + 1, T); L.px(ex2, ey + 1, T); L.px(ex2 + 1, ey, T)  # ojos apretados
        for y in (ey + 2, ey + 3, ey + 4):
            L.px(ex - 1, y, LAGRIMA)
        L.px(ex2 + 1, ey + 2, LAGRIMA); L.px(ex2 + 1, ey + 3, LAGRIMA)
    elif cara == "susto":
        L.rect(ex - 1, ey - 1, 2, 3, BLANCO); L.rect(ex2, ey - 1, 2, 3, BLANCO)   # ojos como platos
        L.px(ex, ey, T); L.px(ex2, ey, T)
    elif cara == "auch":
        for x, y in ((ex - 1, ey), (ex, ey + 1), (ex - 1, ey + 2), (ex2 + 1, ey), (ex2, ey + 1), (ex2 + 1, ey + 2)):
            L.px(x, y, T)                                          # > <
    else:
        L.rect(ex, ey, 1, 2, T); L.rect(ex2, ey, 1, 2, T)
    if OJERAS:
        for x in (ex, ex2):
            if L.p.get((x, ey + 2)) in (PIEL, RUBOR):
                L.px(x, ey + 2, PIEL_S)
    # boca
    if cara == "feliz":
        L.rect(hx + 2, hy + 3, 2, 2, BOCA); L.px(hx + 2, hy + 4, LENGUA)
    elif cara in ("sola", "triste"):
        L.px(hx + 3, hy + 4, BOCA)
        if cara == "triste":
            L.px(hx + 2, hy + 5, BOCA)
    elif cara == "enojo":
        L.rect(hx + 1, hy + 4, 3, 1, BOCA)
    elif cara in ("llanto", "susto", "habla"):
        L.rect(hx + 2, hy + 4, 2, 2, BOCA)
        if cara == "llanto":
            L.px(hx + 2, hy + 5, LENGUA)
    elif cara == "aprieta":
        L.rect(hx + 1, hy + 4, 3, 1, BOCA)                         # boca cerrada y firme (esfuerzo, sin dientes)
    elif cara == "auch":
        # dientes: solo cuando la pose lo pide (dolor en la caída)
        L.rect(hx + 1, hy + 4, 3, 1, BLANCO); L.px(hx + 4, hy + 4, BOCA); L.px(hx, hy + 4, BOCA)
    else:
        L.px(hx + 2, hy + 4, BOCA); L.px(hx + 3, hy + 4, BOCA)
    if BARBA:
        for x, y in ((hx, hy + 4), (hx + 4, hy + 4), (hx + 1, hy + 5), (hx + 3, hy + 5)):
            L.px(x, y, BARBA)
    if BIGOTE:
        L.rect(hx + 1, hy + 3, 4, 1, PELO)
    if LENTES:
        # lentes: cristal claro alrededor de cada ojo (lo que ya es tinta se respeta: el ojo se sigue
        # viendo) y una barra de armazón arriba, con su patilla
        for x0 in (ex - 1, ex2 - 1):
            for x in range(x0, x0 + 3):
                for y in (ey, ey + 1):
                    if L.p.get((x, y)) != TINTA:
                        L.px(x, y, CRISTAL)
        L.rect(hx - 2, ey - 1, 8, 1, LENTES)


def trenza(L, h, puntos):
    """`puntos`: desplazamientos desde la nuca. Dos tonos alternados para que se lea trenzada."""
    if PEINADO == "cola":
        # cola de caballo alta: sale de la coronilla, lisa y gruesa, con su liga
        tx, ty = h[0] - 6, h[1] - 3
        for k, (dx, dy) in enumerate(puntos):
            x, y = tx + dx, ty + dy
            L.rect(x - 1, y, 3 if k < len(puntos) - 2 else 2, 1, PELO)
            if k % 3 == 1:
                L.px(x, y, PELO_L)
        L.rect(tx, ty - 1, 2, 2, LIGA)
        return
    tx, ty = h[0] - 6, h[1] + 2
    n = len(puntos)
    for k, (dx, dy) in enumerate(puntos):
        x, y = tx + dx, ty + dy
        a, b = (PELO, PELO_L) if k % 2 == 0 else (PELO_L, PELO)
        if k == n - 2:
            a = b = LIGA                                           # liga de la punta
        L.px(x, y, a)
        if k < n - 1:
            L.px(x + 1, y, b)
    L.px(tx + 1, ty, LIGA); L.px(tx + 1, ty - 1, LIGA)             # liga de la nuca


def pierna(L, cadera, rod, tob, lejos):
    piel = PIEL_S if lejos else PIEL
    tob = (tob[0], min(tob[1], SUELO))
    if PANTALON:
        L.linea(rod, tob, SHORT_S if lejos else SHORT, GRUESO)
        L.linea(cadera, rod, SHORT_S if lejos else SHORT, GRUESO)
    else:
        L.linea(rod, tob, piel, GRUESO)
        L.linea(cadera, rod, piel, GRUESO)
        medio = ((cadera[0] + rod[0]) / 2, (cadera[1] + rod[1]) / 2)
        L.linea(cadera, medio, SHORT_S if lejos else SHORT, GRUESO)  # pierna del short
    # tenis: apoyado queda plano; en el aire apunta perpendicular a la pantorrilla
    plano = round(tob[1]) >= SUELO
    dx, dy = tob[0] - rod[0], tob[1] - rod[1]
    n = math.hypot(dx, dy) or 1
    ux, uy = (1, 0) if plano else (dy / n, -dx / n)
    punta = (tob[0] + ux * 2, min(tob[1] + uy * 2, SUELO))
    L.linea(tob, punta, TENIS_S if lejos else TENIS, GRUESO)
    if plano:
        L.px(round(tob[0]) + 1, round(tob[1]), ACENTO)             # franja del tenis
        L.px(round(tob[0]), round(tob[1]) + 1, TENIS_S)
    else:
        L.px(round(tob[0] + ux), round(tob[1] + uy), ACENTO)


def brazo(L, hombro, codo, mano, lejos):
    piel = PIEL_S if lejos else PIEL
    if MANGA_LARGA:
        L.linea(codo, mano, PLAYERA_S if lejos else PLAYERA, GRUESO)
        L.linea(hombro, codo, PLAYERA_S if lejos else PLAYERA, GRUESO)
        L.linea(mano, mano, piel, GRUESO)
        return
    L.linea(codo, mano, piel, GRUESO)
    L.linea(hombro, codo, piel, GRUESO)
    if not SIN_MANGA:
        manga = ((hombro[0] + codo[0]) / 2, (hombro[1] + codo[1]) / 2)
        L.linea(hombro, manga, PLAYERA_S if lejos else PLAYERA, GRUESO)


def botella(L, codo, mano):
    """Botella en la mano cercana, siempre con el cuello hacia arriba: si el brazo cuelga, la lleva
    agarrada del cuello; si no, la sostiene por abajo. Lleva su propio contorno para que se lea
    también encima de la ropa."""
    vidrio, brillo, etiqueta = BOTELLA
    mx, my = round(mano[0]), round(mano[1])
    cuelga = my - round(codo[1]) >= 3
    x, y = (mx, my + 3) if cuelga else (mx + 1, my - 6)            # esquina de arriba del cuerpo
    L.rect(x - 1, y - 1, 5, 8, TINTA)
    L.rect(x, y - 3, 3, 3, TINTA)
    L.rect(x, y, 3, 6, vidrio)
    L.px(x + 1, y - 2, vidrio); L.px(x + 1, y - 1, vidrio)         # cuello
    L.px(x, y, brillo); L.px(x, y + 1, brillo)
    L.rect(x, y + 3, 3, 2, etiqueta)


DINO = ("...XX", "..XXX", "XXXX.", ".S.S.")   # X cuerpo, S patas (en sombra)


def juguete(L, mano, cabeza_y):
    """Dinosaurio de juguete en la mano cercana: cabeza arriba a la derecha, cola a la izquierda.
    Nunca sube más allá de la barbilla (no tapa la cara) ni se sale del cuadro."""
    color, claro, sombra = JUGUETE
    x0 = min(round(mano[0]) - 1, W - 7)
    y0 = max(round(mano[1]) - 2, round(cabeza_y) + 7)
    for j, fila in enumerate(DINO):
        for i, c in enumerate(fila):
            if c != ".":
                L.px(x0 + i, y0 + j, color if c == "X" else sombra)
    L.px(x0 + 4, y0, TINTA)                                        # ojo
    L.px(x0 + 2, y0 + 1, claro); L.px(x0 + 1, y0 + 2, claro)       # lomo
    L.px(x0, y0 + 2, sombra)                                       # punta de la cola


def torso(L, hombro, cadera):
    sx, sy, cx, cy = round(hombro[0]), round(hombro[1]), round(cadera[0]), round(cadera[1])
    if abs(cy - sy) >= abs(cx - sx):                               # de pie o inclinada: por filas
        y0, y1 = sy, cy + 1
        for y in range(y0, y1 + 1):
            t = (y - y0) / max(1, y1 - y0)
            x = round(sx + (cx - sx) * t)
            short = y >= y1 - 2
            m = ANCHO // 2
            L.rect(x - m, y, ANCHO, 1, SHORT if short else PLAYERA)
            L.px(x + m, y, SHORT_S if short else PLAYERA_S)        # lado en sombra (derecha)
            if PANZA and not short and t > 0.45:
                L.px(x + m + 1, y, PLAYERA_S)                      # barriga
        L.rect(cx - m, y1 - 3, ANCHO, 1, PLAYERA_S)                # sombra del dobladillo
        L.px(sx, y0 - 1, PIEL_S); L.px(sx + 1, y0 - 1, PIEL_S)     # cuello
    else:                                                          # acostada: por columnas
        paso = 1 if cx > sx else -1
        cols = list(range(sx, cx + paso, paso))
        for k, x in enumerate(cols):
            t = k / max(1, len(cols) - 1)
            y = round(sy + (cy - sy) * t)
            short = k >= len(cols) - 3
            m = ANCHO // 2
            L.rect(x, y - m, 1, ANCHO, SHORT if short else PLAYERA)
            L.px(x, y + m, SHORT_S if short else PLAYERA_S)        # panza en sombra


def articulaciones(pose):
    """Completa la pose: acepta ángulos ("pierna_c": (muslo, pantorrilla)) o puntos ("rod_c", "pie_c"…)."""
    c, s = pose["cadera"], pose["hombro"]
    j = dict(pose)
    j["cad_c"], j["cad_l"] = (c[0] - 1, c[1]), (c[0] + 1, c[1])
    j["hom_c"], j["hom_l"] = (s[0] - 1, s[1] + 1), (s[0] + 1, s[1] + 1)
    if "hombro_l" in pose:
        j["hom_l"] = (s[0] + pose["hombro_l"][0], s[1] + pose["hombro_l"][1])
    largo = pose.get("largo", (3, 3))
    for lado in "cl":
        if f"pierna_{lado}" in pose:
            muslo, pant = pose[f"pierna_{lado}"]
            rod = polar(j[f"cad_{lado}"], 4, muslo)
            pie = polar(rod, 5, pant)
            if pose.get(f"apoyo_{lado}"):
                pie = (pie[0], SUELO_NINO)
            j[f"rod_{lado}"], j[f"pie_{lado}"] = rod, pie
        if f"brazo_{lado}" in pose:
            alto, bajo = pose[f"brazo_{lado}"]
            lg = pose.get(f"largo_{lado}", largo)
            codo = polar(j[f"hom_{lado}"], lg[0], alto)
            j[f"codo_{lado}"], j[f"mano_{lado}"] = codo, polar(codo, lg[1], bajo)
    return estirar(j) if ESTIRA else j


PUNTOS = ("cadera", "hombro", "cabeza", "cad_c", "cad_l", "hom_c", "hom_l",
          "rod_c", "rod_l", "pie_c", "pie_l", "codo_c", "codo_l", "mano_c", "mano_l")


def estirar(j):
    """Pasa una pose escrita con medidas de niño a la complexión actual: alarga cada hueso desde la
    cadera, conserva la distancia al piso del punto más bajo y, si la figura no cabe en el cuadro,
    acorta los brazos (arriba) o la aprieta a lo ancho y la centra."""
    ep, et, eb = ESTIRA
    de = lambda o, a, b, k: (o[0] + (b[0] - a[0]) * k, o[1] + (b[1] - a[1]) * k)
    while True:
        n = dict(j)
        n["hombro"] = de(j["cadera"], j["cadera"], j["hombro"], et)
        n["cabeza"] = de(n["hombro"], j["hombro"], j["cabeza"], 1)
        for lado in "cl":
            n[f"hom_{lado}"] = de(n["hombro"], j["hombro"], j[f"hom_{lado}"], 1)
            n[f"rod_{lado}"] = de(j[f"cad_{lado}"], j[f"cad_{lado}"], j[f"rod_{lado}"], ep)
            n[f"pie_{lado}"] = de(n[f"rod_{lado}"], j[f"rod_{lado}"], j[f"pie_{lado}"], ep)
            n[f"codo_{lado}"] = de(n[f"hom_{lado}"], j[f"hom_{lado}"], j[f"codo_{lado}"], eb)
            n[f"mano_{lado}"] = de(n[f"codo_{lado}"], j[f"codo_{lado}"], j[f"mano_{lado}"], eb)
        dy = max(j[k][1] for k in PUNTOS) + (SUELO - SUELO_NINO) - max(n[k][1] for k in PUNTOS)
        if min(n[k][1] for k in PUNTOS) + dy >= 1 or eb <= 0.8:
            break
        eb -= 0.05                                                 # las manos se salían por arriba
    atras = 10 if PEINADO in ("gorra", "chongo") else 7            # la visera o el chongo salen por detrás
    x0 = min(min(n[k][0] for k in PUNTOS) - 1, n["cabeza"][0] - atras)
    x1 = max(max(n[k][0] for k in PUNTOS) + 3, n["cabeza"][0] + 6)
    k = min(1, (W - 2) / (x1 - x0))                                # aprieta a lo ancho si no cabe
    medio = (x0 + x1) / 2
    dx = CORRE_X
    if k < 1:
        dx = W / 2 - medio
    elif x0 + dx < 1:
        dx = 1 - x0
    elif x1 + dx > W - 1:
        dx = W - 1 - x1
    for q in PUNTOS:
        n[q] = (round(medio + (n[q][0] - medio) * k + dx), round(n[q][1] + dy))
    if n["cabeza"][1] < 8:                                         # el pelo no se sale por arriba: hunde el cuello
        n["cabeza"] = (n["cabeza"][0], 8)
    for lado in "cl":                                              # el pie que pisaba sigue pisando
        if j[f"pie_{lado}"][1] >= SUELO_NINO:
            n[f"pie_{lado}"] = (n[f"pie_{lado}"][0], SUELO)
    return n


def figura(pose, parpadeo=False):
    L = Lienzo()
    j = articulaciones(pose)
    h = j["cabeza"]
    frente = j.get("brazo_l_frente", False)      # el brazo lejano pasa por delante del pelo
    detras = j.get("brazos_detras", False)       # los dos brazos pasan por detrás de la cabeza
    if not frente:
        brazo(L, j["hom_l"], j["codo_l"], j["mano_l"], True)
    pierna(L, j["cad_l"], j["rod_l"], j["pie_l"], True)
    torso(L, j["hombro"], j["cadera"])
    pierna(L, j["cad_c"], j["rod_c"], j["pie_c"], False)
    if detras:
        brazo(L, j["hom_c"], j["codo_c"], j["mano_c"], False)
    if PEINADO in ("trenza", "cola"):
        trenza(L, h, j["trenza"])
    cabeza(L, h, j.get("cara", "corre"), parpadeo)
    if frente:
        brazo(L, j["hom_l"], j["codo_l"], j["mano_l"], False)
    if not detras:
        brazo(L, j["hom_c"], j["codo_c"], j["mano_c"], False)
    if BOTELLA:
        botella(L, j["codo_c"], j["mano_c"])
    if JUGUETE:
        juguete(L, j["mano_c"], h[1])
    L.contorno(TINTA)
    return L.imagen()


# ---------- poses ----------

# Ciclo de una pierna (muslo, pantorrilla): contacto, apoyo, empuje, patada atrás, paso, rodilla al frente.
PIERNAS = [(48, 22), (10, -12), (-40, -52), (-32, -100), (12, -95), (62, -18)]
# Ciclo de un brazo (alto, bajo): va al revés que la pierna de su lado.
BRAZOS = [(-55, 20), (-25, 45), (35, 120), (55, 135), (20, 100), (-40, 30)]
REBOTE = [0, 1, -1, 0, 1, -1]


def carrera(i):
    b = REBOTE[i]
    cadera = (10, 20 + b)
    hombro = (14, 14 + b)
    cab = (16, 9 + REBOTE[(i - 1) % 6])                            # la cabeza sigue al cuerpo un cuadro tarde
    fase = i * math.pi / 3
    tr = [(-k, round(1.3 * math.sin(fase - k * 0.9)) - (1 if k > 3 else 0)) for k in range(1, 8)]
    return {
        "cadera": cadera, "hombro": hombro, "cabeza": cab, "cara": "corre",
        "pierna_c": PIERNAS[i], "pierna_l": PIERNAS[(i + 3) % 6],
        "apoyo_c": i == 1, "apoyo_l": i == 4,
        "brazo_c": BRAZOS[i], "brazo_l": BRAZOS[(i + 3) % 6],
        "trenza": tr,
    }


CARRERA = carrera          # cada personaje principal pone la suya con vestir(CARRERA=…)
# Cuadros de más de un personaje. «runN_t» es la variante de tropiezo del cuadro runN: el juego la
# usa solo en uno de cada varios ciclos de carrera.
EXTRAS = {}

CUELGA = [(1, 1), (1, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7)]
POSES = {
    # Sofía quieta: pequeña y sola (los demás personajes cambian idle0 e idle1 por su postura).
    # Cabeza hundida entre los hombros, mirada baja, manos juntas, trenza caída.
    "idle0": {"cadera": (12, 20), "hombro": (12, 15), "cabeza": (12, 10), "cara": "sola",
              "pierna_c": (4, -2), "pierna_l": (-6, 2), "apoyo_c": True, "apoyo_l": True,
              "brazo_c": (0, 70), "brazo_l": (6, 8), "trenza": CUELGA},
    "idle1": {"cadera": (12, 20), "hombro": (12, 16), "cabeza": (12, 11), "cara": "sola",
              "pierna_c": (4, -2), "pierna_l": (-6, 2), "apoyo_c": True, "apoyo_l": True,
              "brazo_c": (0, 70), "brazo_l": (6, 8), "trenza": CUELGA},
    # Festejo: puño al pecho y salto con el puño en alto.
    "cheer0": {"cadera": (12, 21), "hombro": (12, 16), "cabeza": (13, 10), "cara": "feliz",
               "pierna_c": (28, -24), "pierna_l": (-6, -30), "apoyo_c": True, "apoyo_l": True,
               "brazo_c": (65, 130), "brazo_l": (-40, -150),
               "trenza": [(0, 1), (-1, 2), (-1, 3), (-1, 4), (-2, 5), (-2, 6), (-2, 7)]},
    "cheer1": {"cadera": (12, 18), "hombro": (12, 14), "cabeza": (13, 8), "cara": "feliz",
               "pierna_c": (40, -50), "pierna_l": (-25, -80),
               "brazo_c": (100, 100), "largo": (4, 4),
               "brazo_l": (-150, -175), "brazo_l_frente": True, "largo_l": (3, 5), "hombro_l": (-2, 0),
               "trenza": [(0, 1), (-1, 2), (-1, 3), (-2, 4), (-2, 5), (-3, 6), (-3, 7)]},
}
CAE = [(0, 1), (-1, 2), (-1, 3), (-1, 4), (-2, 5), (-2, 6), (-2, 7)]          # cuelga suelta por la espalda
VIENTO = [(-1, 0), (-2, 0), (-3, 1), (-4, 1), (-5, 0), (-6, 0), (-7, 1)]       # hacia atrás
SUBE = [(-1, 0), (-2, -1), (-3, -1), (-4, -2), (-5, -2), (-5, -3), (-6, -4)]   # se levanta (cae o se asusta)


def P(cadera, hombro, cabeza, rod_c, pie_c, rod_l, pie_l, codo_c, mano_c, codo_l, mano_l, cara, trenza, **mas):
    return dict(cadera=cadera, hombro=hombro, cabeza=cabeza, rod_c=rod_c, pie_c=pie_c, rod_l=rod_l, pie_l=pie_l,
                codo_c=codo_c, mano_c=mano_c, codo_l=codo_l, mano_l=mano_l, cara=cara, trenza=trenza, **mas)


POSES.update({
    # salida de carrera
    "ready": P((11, 21), (14, 14), (16, 9), (15, 25), (15, 29), (9, 25), (7, 29), (17, 17), (19, 15), (12, 18), (15, 19), "aprieta", CAE),
    "set": P((9, 22), (14, 19), (17, 15), (13, 26), (12, 29), (8, 28), (4, 29), (16, 24), (17, 29), (14, 24), (15, 29), "aprieta", CAE),
    # obstáculos
    "hop": P((11, 20), (14, 13), (15, 8), (16, 20), (20, 22), (8, 23), (4, 24), (17, 16), (20, 15), (10, 16), (7, 15), "habla", VIENTO),
    "slide": P((14, 27), (9, 22), (8, 17), (18, 27), (20, 27), (17, 24), (19, 29), (13, 20), (16, 18), (7, 26), (6, 28), "habla",
               [(0, -1), (-1, -2), (-1, -3), (-1, -4), (0, -5), (0, -6), (1, -7)]),
    "tuck": P((11, 19), (14, 13), (15, 8), (16, 16), (12, 20), (15, 18), (11, 22), (16, 16), (17, 18), (14, 17), (15, 19), "aprieta", SUBE),
    "fly": P((8, 19), (13, 15), (17, 12), (5, 18), (2, 18), (4, 22), (2, 23), (16, 18), (20, 18), (10, 13), (8, 11), "feliz", VIENTO),
    # caída de caricatura: tropieza, cae de panza con una pierna al aire, se levanta
    "trip": P((8, 21), (13, 17), (17, 14), (7, 25), (4, 28), (5, 22), (3, 19), (16, 21), (19, 24), (12, 21), (15, 24), "auch", SUBE),
    "down": P((7, 28), (13, 28), (17, 25), (4, 29), (2, 29), (5, 25), (4, 21), (11, 28), (9, 29), (15, 29), (18, 29), "auch",
              [(-1, 0), (-2, 0), (-3, -1), (-4, -1), (-5, -1), (-6, 0), (-7, 0)]),
    "getup": P((11, 24), (13, 17), (14, 12), (15, 25), (15, 29), (9, 28), (5, 29), (15, 21), (16, 24), (12, 21), (13, 24), "aprieta", CAE),
    # calentamiento
    "stretch0": P((12, 20), (12, 16), (13, 11), (13, 25), (13, 29), (11, 25), (10, 29), (13, 9), (13, 2), (12, 9), (11, 2), "corre", CUELGA,
                  brazos_detras=True),
    "stretch1": P((12, 20), (11, 16), (12, 11), (13, 25), (13, 29), (11, 25), (10, 29), (10, 9), (8, 3), (9, 9), (6, 4), "corre", CUELGA,
                  brazos_detras=True),
    "lunge0": P((11, 22), (13, 15), (14, 10), (16, 25), (17, 29), (7, 26), (3, 29), (15, 19), (16, 23), (13, 19), (15, 22), "aprieta", CAE),
    "lunge1": P((12, 22), (12, 15), (13, 10), (8, 26), (4, 29), (16, 25), (17, 29), (14, 19), (16, 23), (12, 19), (15, 22), "aprieta", CAE),
    # gestos de diálogo (de telenovela)
    "talk": P((12, 20), (12, 14), (13, 9), (13, 25), (13, 29), (11, 25), (10, 29), (14, 17), (17, 16), (11, 18), (10, 21), "habla", CUELGA),
    "sad": P((12, 20), (12, 16), (13, 11), (13, 25), (13, 29), (11, 25), (10, 29), (11, 20), (11, 23), (13, 20), (13, 23), "triste", CUELGA),
    "angry": P((12, 20), (12, 14), (13, 9), (14, 24), (15, 29), (10, 24), (9, 29), (15, 17), (13, 20), (9, 17), (11, 20), "enojo", SUBE),
    "cry": P((12, 20), (12, 15), (13, 10), (13, 25), (13, 29), (11, 25), (10, 29), (14, 19), (15, 16), (11, 19), (13, 16), "llanto", CUELGA),
    "shock": P((12, 20), (12, 14), (13, 9), (15, 24), (16, 29), (10, 24), (8, 29), (15, 18), (18, 16), (9, 17), (6, 15), "susto", SUBE),
})
PARPADEAN = ["idle0", "idle1", "cheer0", "talk", "sad", "angry", "shock"]


def cuadros():
    if SOLO_PARADO:
        out = [(n, figura(POSES[n])) for n in PARADO]
        out += [(f"{n}_b", figura(POSES[n], parpadeo=True)) for n in PARPADEAN]
        return out
    if PERSIGUE:
        out = [(f"run{i}", figura(CARRERA(i))) for i in range(6)]
        out += [(n, figura(POSES[n])) for n in PARADO + PERSECUCION]
        out += [(f"{n}_b", figura(POSES[n], parpadeo=True)) for n in PARPADEAN]
        return out
    out = [(f"run{i}", figura(CARRERA(i))) for i in range(6)]
    out += [(n, figura(p)) for n, p in POSES.items()]
    out += [(n, figura(p)) for n, p in EXTRAS.items()]
    out += [(f"{n}_b", figura(POSES[n], parpadeo=True)) for n in PARPADEAN]
    return out


# ---------- revisión y exportación ----------

def fuente(t):
    for ruta in ("C:/Windows/Fonts/segoeui.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"):
        if Path(ruta).exists():
            return ImageFont.truetype(ruta, t)
    return ImageFont.load_default(size=t)


FONDO_VIVO = RAMPAS["amarillo"][2]
FONDO_APAGADO = apagar(RAMPAS["turquesa"][1])


def hoja_de_contacto(cs, ruta, titulo, esc=5):
    cols = 8
    filas = -(-len(cs) // cols)
    cw, ch = W * esc + 16, H * esc + 30
    im = Image.new("RGB", (cols * cw + 16, filas * ch + 150), "#211624")
    d = ImageDraw.Draw(im)
    d.text((12, 8), "%s · todos los cuadros (%d×%d, ×%d)" % (titulo, W, H, esc), fill="#f4ecd8", font=fuente(18))
    for k, (nombre, cuadro) in enumerate(cs):
        x, y = 12 + (k % cols) * cw, 40 + (k // cols) * ch
        fondo = FONDO_APAGADO if nombre.startswith(("idle", "sad", "cry")) else FONDO_VIVO
        d.rectangle([x, y, x + W * esc - 1, y + H * esc - 1], fill=fondo)
        g = cuadro.resize((W * esc, H * esc), Image.NEAREST)
        im.paste(g, (x, y), g)
        d.text((x, y + H * esc + 4), nombre, fill="#a898ad", font=fuente(13))
    # tamaño real en el juego (×3) y siluetas
    y = 40 + filas * ch + 8
    d.text((12, y), "A tamaño de juego (×3) y silueta:", fill="#f4ecd8", font=fuente(13))
    for k, (nombre, cuadro) in enumerate(cs[:10]):
        x = 12 + k * (W * 3 + 10)
        d.rectangle([x, y + 22, x + W * 3 - 1, y + 22 + H * 3 - 1], fill=FONDO_VIVO if k % 2 == 0 else "#f4ecd8")
        g = cuadro.resize((W * 3, H * 3), Image.NEAREST)
        if k % 2:
            sil = Image.new("RGBA", g.size, "#2b1d2e")
            im.paste(sil, (x, y + 22), g)
        else:
            im.paste(g, (x, y + 22), g)
    im.save(ruta)


def gif(cs, nombres, ruta, ms, fondo, esc=8):
    por_nombre = dict(cs)
    fr = []
    for n in nombres:
        base = Image.new("RGBA", (W * esc, H * esc), fondo)
        g = por_nombre[n].resize((W * esc, H * esc), Image.NEAREST)
        base.alpha_composite(g)
        ImageDraw.Draw(base).rectangle([0, (H - 1) * esc + esc // 2, W * esc, H * esc], fill="#75657f")
        fr.append(base.convert("RGB"))
    # Una sola paleta para todos los cuadros: si cada cuadro lleva la suya, los visores mezclan colores.
    tira = Image.new("RGB", (W * esc * len(fr), H * esc))
    for k, f in enumerate(fr):
        tira.paste(f, (k * W * esc, 0))
    comun = tira.quantize(colors=64, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    fr = [f.quantize(palette=comun, dither=Image.Dither.NONE) for f in fr]
    fr[0].save(ruta, save_all=True, append_images=fr[1:], duration=ms, loop=0, optimize=False)


def exportar(cs, carpeta, nombre):
    carpeta.mkdir(parents=True, exist_ok=True)
    tira = Image.new("RGBA", (W * len(cs), H), (0, 0, 0, 0))
    marcos = {}
    for k, (cuadro_nombre, cuadro) in enumerate(cs):
        tira.paste(cuadro, (k * W, 0))
        marcos[cuadro_nombre] = {"frame": {"x": k * W, "y": 0, "w": W, "h": H}}
    tira.save(carpeta / f"{nombre}.png")
    meta = {"image": f"{nombre}.png", "size": {"w": tira.width, "h": H}, "scale": "1",
            "license": "Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md)."}
    (carpeta / f"{nombre}.json").write_text(json.dumps({"frames": marcos, "meta": meta}, ensure_ascii=False, indent=1) + "\n",
                                        encoding="utf-8")


APOYADOS = ("run1", "run4", "idle", "cheer0", "ready", "set", "slide", "down", "getup", "stretch", "lunge",
            "talk", "sad", "angry", "cry", "shock")


def revisar(cs):
    """Nada toca el borde de arriba ni los lados, y los cuadros apoyados en el piso llegan a la última fila."""
    for nombre, cuadro in cs:
        caja = cuadro.getbbox()
        assert caja[0] >= 0 and caja[2] <= W and caja[1] >= 0, f"{nombre}: fuera del cuadro ({caja})"
        if nombre.startswith(APOYADOS):
            assert caja[3] == H, f"{nombre}: no toca la última fila ({caja})"


def main(nombre, titulo):
    """Previas (hoja de contacto y GIF) en la carpeta dada; con --exportar, también la hoja del juego."""
    previas = Path(sys.argv[1]) if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else Path("previas")
    previas.mkdir(parents=True, exist_ok=True)
    cs = cuadros()
    hoja_de_contacto(cs, previas / f"{nombre}-contacto.png", titulo)
    gif(cs, ["idle0", "idle1"], previas / f"{nombre}-idle.gif", 500, FONDO_APAGADO)
    gif(cs, ["cheer0", "cheer1"], previas / f"{nombre}-cheer.gif", 250, FONDO_VIVO)
    if PERSIGUE:
        gif(cs, [f"run{i}" for i in range(6)], previas / f"{nombre}-run.gif", 83, FONDO_VIVO)
        gif(cs, ["run0", "run1", "hop", "hop", "run3", "run4", "slide", "slide", "run0", "tuck", "tuck", "run3", "fly", "fly"],
            previas / f"{nombre}-obstaculos.gif", 160, FONDO_VIVO)
    elif not SOLO_PARADO:
        ciclo = [f"run{i}" for i in range(6)]
        if any(n.endswith("_t") for n in EXTRAS):   # tres ciclos normales y uno con el tropiezo, como en el juego
            ciclo = ciclo * 3 + [f"run{i}_t" if f"run{i}_t" in EXTRAS else f"run{i}" for i in range(6)]
        gif(cs, ciclo, previas / f"{nombre}-run.gif", 83, FONDO_VIVO)
        gif(cs, ["run0", "trip", "trip", "down", "down", "down", "getup", "getup"], previas / f"{nombre}-caida.gif", 140, FONDO_VIVO)
        gif(cs, ["stretch0", "stretch1", "stretch0", "stretch1", "lunge0", "lunge1", "lunge0", "lunge1"],
            previas / f"{nombre}-calentamiento.gif", 400, FONDO_VIVO)
        gif(cs, ["ready", "ready", "set", "set", "run5", "run0", "run1", "run2", "run3", "run4"], previas / f"{nombre}-salida.gif", 160, FONDO_VIVO)
    gif(cs, ["talk", "talk_b", "sad", "sad_b", "angry", "angry_b", "cry", "cry", "shock", "shock_b", "cheer0", "cheer0_b"],
        previas / f"{nombre}-gestos.gif", 450, FONDO_APAGADO)
    revisar(cs)
    if "--exportar" in sys.argv:
        exportar(cs, RAIZ / "public" / "assets" / "sprites", nombre)
        print(f"hoja del juego: public/assets/sprites/{nombre}.png + {nombre}.json")
    print("previas en", previas, "·", len(cs), "cuadros")
