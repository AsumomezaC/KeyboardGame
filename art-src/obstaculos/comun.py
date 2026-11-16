# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Lo común de los scripts de obstáculos: la hoja de contacto (cada variante ampliada y todas a
tamaño de juego sobre un fondo, junto a Sofía) y la exportación de la hoja del juego.

La hoja del juego es una tira con un cuadro por variante («v0», «v1»…), del mismo tamaño que el
obstáculo dibujado por código: así no cambian ni su tamaño ni su zona de choque.

El fondo de la hoja de contacto se toma de la carpeta de previas (o de la de arriba), de los
archivos fondo-far-<ambiente>.png, fondo-mid-<ambiente>.png y fondo-ground-<ambiente>.png (las
capas del juego a tamaño real). Si no están, se usa un fondo liso.
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw

RAIZ = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(RAIZ / "art-src"))
from paleta import RAMPAS as R  # noqa: E402
from pincel import fuente, exportar_tira  # noqa: E402

SPRITES = RAIZ / "public" / "assets" / "sprites"
ESC = 3                       # pixeles de pantalla por pixel de arte
ANCHO, ALTO = 960, 540        # pantalla del juego
SUELO_Y, PIES_Y = 444, 458    # borde de arriba del piso y donde pisan los personajes
CIELOS = {"barrio": ("#7ec8f5", "#fde8c8")}


def _rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def cuadro_de(hoja, nombre):
    """Un cuadro de una hoja del juego (p. ej. Sofía quieta) como imagen."""
    marcos = json.loads((SPRITES / f"{hoja}.json").read_text(encoding="utf-8"))["frames"]
    f = marcos[nombre]["frame"]
    return Image.open(SPRITES / f"{hoja}.png").convert("RGBA").crop((f["x"], f["y"], f["x"] + f["w"], f["y"] + f["h"]))


def _mosaico(base, capa, y):
    g = capa.resize((capa.width * ESC, capa.height * ESC), Image.NEAREST)
    for x in range(0, ANCHO, g.width):
        base.alpha_composite(g, (x, y))


def fondo(previas, ambiente="barrio"):
    """La pantalla del juego (960×540) con el fondo del ambiente, sin nada encima."""
    base = Image.new("RGBA", (ANCHO, ALTO), R["neutros"][3])
    capas = {}
    for capa in ("far", "mid", "ground"):
        for carpeta in (previas, previas.parent):
            ruta = carpeta / f"fondo-{capa}-{ambiente}.png"
            if ruta.exists():
                capas[capa] = Image.open(ruta).convert("RGBA")
                break
    if len(capas) < 3:
        ImageDraw.Draw(base).rectangle([0, SUELO_Y, ANCHO, ALTO], fill=R["neutros"][1])
        return base
    a, b = (_rgb(c) for c in CIELOS[ambiente])
    d = ImageDraw.Draw(base)
    for y in range(SUELO_Y):
        d.line([(0, y), (ANCHO, y)], fill=tuple(round(a[i] + (b[i] - a[i]) * y / SUELO_Y) for i in range(3)))
    _mosaico(base, capas["far"], SUELO_Y - capas["far"].height * ESC + 30)
    _mosaico(base, capas["mid"], SUELO_Y - capas["mid"].height * ESC)
    _mosaico(base, capas["ground"], SUELO_Y)
    return base


def poner(base, cuadro, x, y_pies, centro=False, giro=0):
    """Pega un cuadro a tamaño de juego con su borde de abajo en `y_pies`."""
    g = cuadro.resize((cuadro.width * ESC, cuadro.height * ESC), Image.NEAREST)
    if giro:
        g = g.rotate(giro, Image.NEAREST, expand=True)
    base.alpha_composite(g, (round(x - (g.width / 2 if centro else 0)), round(y_pies - g.height)))


def hoja_de_contacto(titulo, variantes, ruta, previas, prop_y, paso=None, vuelo=None, esc=8):
    """`variantes`: lista de (nombre, imagen, descripción). `prop_y`: cuánto baja el obstáculo
    respecto a los pies (el `y` de PROPS). `vuelo`: (cuadro de Sofía, altura, giro) para verla
    pasando sobre la primera variante."""
    w, h = variantes[0][1].size
    cw = max(w * esc + 16, 150)
    arriba = 44 + h * esc + 64
    corte = (0, 230, ANCHO, ALTO - 20)                      # franja de la pantalla del juego
    im = Image.new("RGB", (max(len(variantes) * cw + 24, ANCHO + 24), arriba + (corte[3] - corte[1]) + 44), "#211624")
    d = ImageDraw.Draw(im)
    d.text((12, 8), f"{titulo} · {len(variantes)} variantes ({w}×{h}, ×{esc})", fill="#f4ecd8", font=fuente(18))
    for k, (nombre, cuadro, texto) in enumerate(variantes):
        x = 12 + k * cw
        d.rectangle([x, 40, x + w * esc - 1, 40 + h * esc - 1], fill=R["neutros"][3])
        g = cuadro.resize((w * esc, h * esc), Image.NEAREST)
        im.paste(g, (x, 40), g)
        d.text((x, 44 + h * esc), nombre, fill="#ffd23f", font=fuente(13))
        for n, renglon in enumerate(texto.split("\n")):
            d.text((x, 60 + h * esc + n * 15), renglon, fill="#a898ad", font=fuente(12))
    d.text((12, arriba - 4), "Dentro del juego (×3, fondo del barrio) junto a Sofía:", fill="#f4ecd8", font=fuente(13))
    escena = fondo(previas)
    poner(escena, cuadro_de("sofia", "idle0"), 70, PIES_Y, centro=True)
    paso = paso or max(w * ESC + 60, (ANCHO - 170) // len(variantes))
    for k, (_, cuadro, _) in enumerate(variantes):
        x = 150 + k * paso
        poner(escena, cuadro, x, PIES_Y + prop_y)
        if vuelo and k == 0:
            nombre, altura, giro = vuelo
            poner(escena, cuadro_de("sofia", nombre), x + w * ESC / 2, PIES_Y - altura, centro=True, giro=giro)
    im.paste(escena.crop(corte).convert("RGB"), (12, arriba + 18))
    im.save(ruta)


def exportar(variantes, clave):
    """Escribe public/assets/sprites/obst-<clave>.png + .json con los cuadros v0, v1…"""
    exportar_tira([(f"v{k}", cuadro) for k, (_, cuadro, _) in enumerate(variantes)], SPRITES, f"obst-{clave}")
    print(f"hoja del juego: public/assets/sprites/obst-{clave}.png + obst-{clave}.json")
