# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Fondo de noche (`noche`): fresco, faroles y ventanas encendidas, un poco solitario.

Es la misma calle del barrio, de noche: cada color baja dos tonos en su rampa de la paleta (uno en
el piso), algunas ventanas quedan encendidas, la tiendita tiene la cortina abajo, el farol del
poste alumbra y en los cerros se ven lucecitas. Las estrellas y la luna las pone el juego.

Uso:
  python art-src/fondos/noche.py <carpeta_de_previas>             láminas viva y apagada
  python art-src/fondos/noche.py <carpeta_de_previas> --exportar   además escribe la hoja del juego
"""
import random
import sys
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
import barrio  # noqa: E402
from comun import R, LEJANA, MEDIA, PISO, alejar, apagada, apagar, comprobar, exportar, lamina  # noqa: E402

N = R["neutros"]
CIELO = (R["azul"][0], R["azul"][1])
LUZ, LUZ_CLARA, CORTINA = R["amarillo"][1], R["amarillo"][2], R["naranja"][2]


def _rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) + (255,)


def anochecer(im, tonos):
    """Cada color baja `tonos` lugares en su rampa (sin salirse de ella)."""
    mapa = {}
    for rampa in R.values():
        for k, c in enumerate(rampa):
            mapa[_rgb(c)] = _rgb(rampa[max(0, k - tonos)])
    sal = im.copy()
    px = sal.load()
    for y in range(sal.height):
        for x in range(sal.width):
            if px[x, y][3]:
                px[x, y] = mapa[px[x, y]]
    return sal


def rect(im, x, y, w, h, c):
    for j in range(h):
        for i in range(w):
            im.putpixel(((x + i) % im.width, y + j), _rgb(c))


def lejana():
    dia = barrio.lejana(velo=False)
    im = anochecer(dia, 2)
    r = random.Random(4)
    de_dia, px = dia.load(), im.load()
    ventanas = [(x, y) for y in range(im.height) for x in range(im.width) if de_dia[x, y] == _rgb(N[1])]
    for x, y in r.sample(ventanas, len(ventanas) // 2):          # lucecitas en la ladera
        px[x, y] = _rgb(LUZ)
    return alejar(im, CIELO)


def media():
    ventanas = []
    original = barrio.ventana

    def anota(L, x, y, w, h, marco=None, reja=None, cortina=None, vidrio=None):
        ventanas.append((x, y, w, h, bool(reja), bool(cortina)))
        original(L, x, y, w, h, marco, reja, cortina, vidrio)

    barrio.ventana = anota
    try:
        dia = barrio.media()
    finally:
        barrio.ventana = original
    im = anochecer(dia, 2)
    r = random.Random(6)
    for x, y, w, h, reja, cortina in ventanas:
        if r.random() > 0.5:
            continue
        rect(im, x, y, w, h, LUZ)
        rect(im, x, y, w, 2, LUZ_CLARA)
        if cortina:
            rect(im, x, y, 2, h, CORTINA); rect(im, x + w - 2, y, 2, h, CORTINA)
        if reja:
            for i in range(x + 2, x + w - 1, 3):
                rect(im, i, y, 1, h, N[0])
            rect(im, x, y + h // 2, w, 1, N[0])
    # la tiendita, cerrada: cortina metálica abajo
    rect(im, 96, 56, 30, 34, N[1])
    for y in range(58, 90, 3):
        rect(im, 96, y, 30, 1, N[0])
    rect(im, 110, 86, 2, 2, N[0])
    # el farol del poste, encendido, y su luz sobre la barda
    rect(im, 156, 17, 4, 2, N[2]); rect(im, 156, 19, 4, 1, LUZ_CLARA); rect(im, 157, 20, 2, 1, LUZ)
    return im


def piso():
    return anochecer(barrio.piso(), 1)


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
    notas = ("Las estrellas y la luna las dibuja el juego (no salen en esta lámina).",)
    lamina("Fondo de noche · versión VIVA (al correr)", vivas, CIELO, previas / "noche-viva.png", notas)
    lamina("Fondo de noche · versión APAGADA (quieta, tristeza; calculada con apagar())", apagadas,
           tuple(apagar(c) for c in CIELO), previas / "noche-apagada.png", notas)
    print("láminas:", previas / "noche-viva.png", "y", previas / "noche-apagada.png")
    if "--exportar" in sys.argv:
        exportar("noche", vivas, CIELO)
