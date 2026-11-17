# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Lo común de los scripts de fondos: la versión apagada, la comprobación de paleta, la escena
armada como en el juego, la lámina de revisión y la exportación de la hoja.

Cada ambiente tiene tres capas que se repiten a lo ancho: lejana (320×80), media (384×90) y piso
(64×32). El fondo no lleva contorno de tinta. Todo color sale de la paleta maestra y la versión
apagada se calcula con `apagar()`, color por color.

Normas de los fondos:
- La capa lejana se acerca al tono del cielo, para que se note que está lejos. La paleta maestra no
  tiene tonos intermedios para eso, así que la capa lejana usa su propia paleta, la «paleta
  lejana»: cada color de la paleta maestra mezclado con el tono medio del cielo del ambiente
  (`lejos()` y `alejar()`). Solo la usa la capa lejana.
- El fondo lleva un nivel de detalle un poco menor que lo jugable, para distinguirse a simple vista
  de los obstáculos: formas grandes, pocos adornos chicos y nada de texturas pixel por pixel.

La hoja del juego (fondo-<ambiente>.png + .json) trae los cuadros `far`, `mid`, `ground` y sus
parejas `far-apagado`, `mid-apagado`, `ground-apagado`; los colores del cielo van en `meta.cielo`.
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw

RAIZ = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(RAIZ / "art-src"))
from paleta import RAMPAS as R, VIVA, apagar  # noqa: E402
from pincel import AVISO, fuente  # noqa: E402

SPRITES = RAIZ / "public" / "assets" / "sprites"
LEJANA, MEDIA, PISO = (320, 80), (384, 90), (64, 32)
ESC = 3
ANCHO, ALTO = 960, 540
SUELO_Y, PIES_Y = 444, 458          # GROUND_TOP y FEET_Y del juego: no cambian
SUBE_LEJANA = 30                    # la capa lejana baja 30 px de pantalla, como en backdrop()
PARALAJE = {"far": 0.15, "mid": 0.45, "ground": 1}


def _rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def _hex(c):
    return "#%02x%02x%02x" % tuple(c[:3])


VELO_LEJANO = 0.55                  # cuánto del tono del cielo lleva cada color de la capa lejana


def tono_cielo(cielo):
    """Tono medio del degradado del cielo (arriba, abajo)."""
    return _hex(tuple(round((p + q) / 2) for p, q in zip(_rgb(cielo[0]), _rgb(cielo[1]))))


def lejos(color, cielo):
    """Pareja de un color de la paleta maestra en la paleta lejana de ese cielo."""
    a, b = _rgb(color), _rgb(tono_cielo(cielo))
    return _hex(tuple(round(p + (q - p) * VELO_LEJANO) for p, q in zip(a, b)))


def alejar(im, cielo):
    """La misma imagen con cada color cambiado por su pareja de la paleta lejana."""
    px = im.load()
    sal = Image.new("RGBA", im.size, (0, 0, 0, 0))
    q = sal.load()
    for y in range(im.height):
        for x in range(im.width):
            c = px[x, y]
            if c[3]:
                q[x, y] = _rgb(lejos(_hex(c), cielo)) + (255,)
    return sal


def comprobar(nombre, im, tam, cielo=None):
    """La capa mide lo acordado, no tiene transparencias parciales ni tinta, y todo color es de la
    paleta maestra (o, si se da `cielo`, de la paleta lejana de ese cielo)."""
    assert im.size == tam, f"{nombre}: mide {im.size}, debe medir {tam}"
    validos = set(VIVA) - set(R["tinta"])
    if cielo:
        validos = {lejos(c, cielo) for c in validos}
    for _, c in im.getcolors(im.width * im.height):
        if c[3] == 0:
            continue
        assert c[3] == 255, f"{nombre}: transparencia parcial {c}"
        assert _hex(c) in validos, f"{nombre}: {_hex(c)} no es de la paleta (o es tinta)"


def apagada(im):
    """La misma imagen con cada color cambiado por su pareja apagada."""
    px = im.load()
    sal = Image.new("RGBA", im.size, (0, 0, 0, 0))
    q = sal.load()
    cache = {}
    for y in range(im.height):
        for x in range(im.width):
            c = px[x, y]
            if c[3]:
                if c not in cache:
                    cache[c] = _rgb(apagar(_hex(c))) + (255,)
                q[x, y] = cache[c]
    return sal


def cuadro_de(hoja, nombre):
    marcos = json.loads((SPRITES / f"{hoja}.json").read_text(encoding="utf-8"))["frames"]
    f = marcos[nombre]["frame"]
    return Image.open(SPRITES / f"{hoja}.png").convert("RGBA").crop((f["x"], f["y"], f["x"] + f["w"], f["y"] + f["h"]))


def _mosaico(base, capa, y, corrida):
    g = capa.resize((capa.width * ESC, capa.height * ESC), Image.NEAREST)
    x = -(round(corrida) % g.width)
    while x < ANCHO:
        base.alpha_composite(g, (x, y))
        x += g.width


def escena(capas, cielo, encima=(), avance=0):
    """La pantalla del juego (960×540) con el fondo armado como en backdrop(). `encima`: lista de
    (imagen, x, y de su borde de abajo) a tamaño de arte, que se pegan a ×3."""
    base = Image.new("RGBA", (ANCHO, ALTO), cielo[1])
    a, b = _rgb(cielo[0]), _rgb(cielo[1])
    d = ImageDraw.Draw(base)
    for y in range(SUELO_Y):
        d.line([(0, y), (ANCHO, y)], fill=tuple(round(a[i] + (b[i] - a[i]) * y / SUELO_Y) for i in range(3)))
    _mosaico(base, capas["far"], SUELO_Y - capas["far"].height * ESC + SUBE_LEJANA, avance * PARALAJE["far"])
    _mosaico(base, capas["mid"], SUELO_Y - capas["mid"].height * ESC, avance * PARALAJE["mid"])
    _mosaico(base, capas["ground"], SUELO_Y, avance)
    for im, x, y in encima:
        g = im.resize((im.width * ESC, im.height * ESC), Image.NEAREST)
        base.alpha_composite(g, (round(x), round(y - g.height)))
    return base


def jugables():
    """Sofía y algunos obstáculos ya hechos, colocados como en el juego (x, borde de abajo)."""
    o = lambda clave, v: cuadro_de(f"obst-{clave}", f"v{v}")
    return [
        (cuadro_de("sofia", "run1"), 60, PIES_Y),
        (o("chair", 0), 170, PIES_Y + 2),
        (o("puddle", 0), 260, PIES_Y + 6),
        (o("wall", 2), 390, PIES_Y + 8),
        (o("hole", 0), 580, PIES_Y + 30),
        (o("chalk", 1), 760, PIES_Y + 4),
        (o("table", 0), 815, PIES_Y + 2),
    ]


def lamina(titulo, capas, cielo, ruta, notas=(), avance=0):
    """Las tres capas ampliadas a ×3, una sobre otra, y debajo la escena armada con lo jugable."""
    margen = 12
    ancho = max(capas["mid"].width * ESC, ANCHO) + margen * 2
    alto = 40
    for k in ("far", "mid", "ground"):
        alto += 22 + capas[k].height * ESC + 8
    alto += 22 + ALTO + 10 + 16 * len(notas) + 8
    im = Image.new("RGB", (ancho, alto), "#211624")
    d = ImageDraw.Draw(im)
    d.text((margen, 8), titulo, fill="#f4ecd8", font=fuente(18))
    y = 40
    nombres = {"far": "Capa lejana", "mid": "Capa media", "ground": "Piso (se repite; aquí cuatro veces)"}
    medio = tuple(round((p + q) / 2) for p, q in zip(_rgb(cielo[0]), _rgb(cielo[1])))
    for k in ("far", "mid", "ground"):
        c = capas[k]
        d.text((margen, y), f"{nombres[k]} · {c.width}×{c.height} (×{ESC})", fill="#ffd23f", font=fuente(13))
        y += 22
        veces = 4 if k == "ground" else 1
        d.rectangle([margen, y, margen + c.width * ESC * veces - 1, y + c.height * ESC - 1], fill=medio)
        g = c.resize((c.width * ESC, c.height * ESC), Image.NEAREST)
        for n in range(veces):
            im.paste(g, (margen + n * g.width, y), g)
        y += c.height * ESC + 8
    d.text((margen, y), "Escena armada como en el juego (×3) con Sofía y obstáculos ya hechos:", fill="#ffd23f", font=fuente(13))
    y += 22
    im.paste(escena(capas, cielo, jugables(), avance).convert("RGB"), (margen, y))
    y += ALTO + 10
    for n in notas:
        d.text((margen, y), n, fill="#a898ad", font=fuente(12))
        y += 16
    im.save(ruta)


def exportar(ambiente, capas, cielo):
    """Escribe public/assets/sprites/fondo-<ambiente>.png + .json (seis cuadros y los cielos)."""
    orden = [("far", capas["far"]), ("mid", capas["mid"]), ("ground", capas["ground"])]
    orden += [(f"{n}-apagado", apagada(c)) for n, c in orden]
    ancho = max(c.width for _, c in orden)
    hoja = Image.new("RGBA", (ancho, sum(c.height for _, c in orden)), (0, 0, 0, 0))
    marcos, y = {}, 0
    for n, c in orden:
        hoja.paste(c, (0, y))
        marcos[n] = {"frame": {"x": 0, "y": y, "w": c.width, "h": c.height}}
        y += c.height
    nombre = f"fondo-{ambiente}"
    hoja.save(SPRITES / f"{nombre}.png")
    meta = {"image": f"{nombre}.png", "size": {"w": hoja.width, "h": hoja.height}, "scale": "1", "license": AVISO,
            "cielo": {"vivo": list(cielo), "apagado": [apagar(c) for c in cielo]}}
    (SPRITES / f"{nombre}.json").write_text(json.dumps({"frames": marcos, "meta": meta}, ensure_ascii=False, indent=1) + "\n",
                                           encoding="utf-8")
    print(f"hoja del juego: public/assets/sprites/{nombre}.png + {nombre}.json")
