# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Hoyo (50×14, textura `hole`): hoyos enormes de la calle. Se pasan con un brinco largo, como si
volara, así que son planos, anchos y en el piso: nada sobresale.

  v0 bache gigante: el pavimento roto deja ver el asfalto, la grava y la tierra
  v1 socavón con el tubo del drenaje roto y agua al fondo

Sin contorno (los autores eligieron la A entre tres orillas: sin contorno, de tinta o gris claro
medio transparente como el charco). Con --opciones se vuelve a hacer la lámina con las tres.

Uso:
  python art-src/obstaculos/hoyo.py <carpeta_de_previas>             hoja de contacto
  python art-src/obstaculos/hoyo.py <carpeta_de_previas> --opciones  lámina con las tres orillas
  python art-src/obstaculos/hoyo.py <carpeta_de_previas> --exportar  además escribe la hoja del juego
"""
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
from comun import R, hoja_de_contacto, exportar, fuente  # noqa: E402

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from pincel import Lienzo  # noqa: E402

W, H = 50, 14
TINTA = R["tinta"][1]
ORILLA = "sin"                                       # elegida por los autores (opciones: "sin", "tinta", "gris")
GRIS, GRIS_ALFA = R["neutros"][3], 128
ROTO, ROTO_L, ROTO_S = R["neutros"][1], R["neutros"][2], R["neutros"][0]
# Cuánto se mete o se sale el borde en cada tramo: así el hoyo no queda como un óvalo perfecto.
MORDIDAS = [0.0, 0.08, -0.05, 0.1, 0.02, -0.08, 0.06, -0.02, 0.09, -0.06, 0.03, 0.07,
            -0.04, 0.05, -0.09, 0.02, 0.08, -0.03, 0.04, -0.07, 0.06, 0.0, -0.05, 0.09]


def mordido(cx, cy, rx, ry, salto=0):
    """Polígono de un óvalo con el borde mordido. Las mordidas pesan más en las puntas que arriba y
    abajo: con tan pocas filas, una mordida arriba parte el borde en dos escalones."""
    n = len(MORDIDAS)
    pts = []
    for k in range(n):
        a = 2 * math.pi * (k + 0.5) / n               # sin vértice justo arriba (dejaba un pico)
        m = 1 + MORDIDAS[(k + salto) % n] * abs(math.cos(a))
        pts.append((cx + rx * m * math.cos(a), cy + ry * m * math.sin(a)))
    return pts


def terminar(L, orilla):
    if orilla == "tinta":
        L.contorno(TINTA)
        return L.imagen()
    if orilla == "gris":
        antes = set(L.p)
        L.contorno(GRIS)
        im = L.imagen()
        for q in set(L.p) - antes:
            im.putpixel(q, im.getpixel(q)[:3] + (GRIS_ALFA,))
        return im
    return L.imagen()


def hueco(L, salto, capas):
    """El hueco visto un poco desde arriba: cada capa es el mismo borde mordido, un pixel más abajo
    y más angosta, así la pared del fondo queda en bandas curvas (asfalto, grava, tierra…)."""
    borde = mordido(24.5, 6.6, 19.5, 4.2, salto)
    L.poligono(borde, capas[0], solo=(ROTO, ROTO_L))
    for k, c in enumerate(capas[1:], 1):
        L.poligono([(24.3 + (x - 24.3) * (1 - 0.1 * k), y + k) for x, y in borde], c, solo=tuple(capas[:k]))


def pavimento(L, salto):
    L.poligono(mordido(24.5, 6.5, 23.2, 5.4, salto), ROTO)              # pavimento roto
    for x0, x1 in ((5, 11), (19, 27), (35, 41)):
        L.rect(x0, 2, x1 - x0, 1, ROTO_L, solo=ROTO)                     # cantos con luz


def bache(orilla=ORILLA):
    """Bache gigante: pavimento roto, y adentro el corte del asfalto, la grava y la tierra."""
    L = Lienzo(W, H)
    pavimento(L, 0)
    hueco(L, 5, [ROTO_S, R["tierra"][2], R["tierra"][1], R["tierra"][0], R["tinta"][0]])
    for x in range(8, 42, 3):                                            # piedras de la grava
        L.px(x, 5 + (x % 2), R["neutros"][2], solo=R["tierra"][2])
    for x, y in ((14, 8), (15, 8), (33, 9)):                             # pedazos de asfalto caídos
        L.px(x, y, ROTO, solo=(R["tierra"][1], R["tierra"][0]))
    L.px(14, 7, ROTO_L, solo=R["tierra"][1])
    return terminar(L, orilla)


def socavon(orilla=ORILLA):
    """Socavón: el tubo del drenaje roto asoma de la pared y abajo hay agua."""
    L = Lienzo(W, H)
    pavimento(L, 7)
    for a, b in (((6, 4), (2, 3)), ((42, 4), (47, 5)), ((30, 11), (33, 12))):   # grietas
        L.linea(a, b, ROTO_S, solo=(ROTO, ROTO_L))
    hueco(L, 2, [ROTO_S, R["tierra"][1], R["tierra"][0], R["azul"][1], R["azul"][0]])   # agua al fondo
    L.rect(19, 9, 7, 1, R["azul"][3], solo=R["azul"][1]); L.px(30, 10, R["azul"][2], solo=R["azul"][1])
    tubo, tubo_s = R["neutros"][3], R["neutros"][2]                      # boca del tubo de drenaje
    L.elipse(11, 4, 16, 8, tubo); L.rect(15, 5, 1, 3, tubo_s)
    L.rect(12, 5, 3, 3, R["tinta"][0]); L.px(12, 5, tubo); L.px(16, 4, None)
    L.px(13, 8, R["azul"][3]); L.px(13, 9, R["azul"][2])                 # chorrito
    return terminar(L, orilla)


def variantes(orilla=ORILLA):
    return [
        ("v0 · bache gigante", bache(orilla), "Pavimento roto: asfalto,\ngrava y tierra"),
        ("v1 · socavón", socavon(orilla), "Tubo del drenaje roto\ny agua al fondo"),
    ]


def opciones(previas):
    """Lámina con las tres orillas, una hoja de contacto debajo de otra."""
    hojas = []
    for letra, modo, nombre in (("A", "sin", "sin contorno"), ("B", "tinta", "contorno de tinta"),
                                ("C", "gris", "orilla gris claro medio transparente (como el charco)")):
        ruta = previas / f"hoyo-{modo}.png"
        hoja_de_contacto(f"Hoyo {letra} · {nombre}", variantes(modo), ruta, previas, prop_y=30, paso=300,
                         vuelo=("fly", 110, 0), esc=8)
        hojas.append(Image.open(ruta))
    im = Image.new("RGB", (max(h.width for h in hojas), sum(h.height + 10 for h in hojas)), "#211624")
    y = 0
    for h in hojas:
        im.paste(h, (0, y))
        ImageDraw.Draw(im).line([(0, y + h.height + 4), (im.width, y + h.height + 4)], fill="#ffd23f", width=2)
        y += h.height + 10
    im.save(previas / "hoyo-opciones.png")
    print("lámina:", previas / "hoyo-opciones.png", fuente and "")


def main():
    previas = Path(sys.argv[1]) if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else Path("previas")
    previas.mkdir(parents=True, exist_ok=True)
    if "--opciones" in sys.argv:
        opciones(previas)
        return
    vs = variantes()
    assert all(c.size == (W, H) for _, c, _ in vs)
    hoja_de_contacto("Hoyo", vs, previas / "hoyo-contacto.png", previas, prop_y=30, paso=300,
                     vuelo=("fly", 110, 0), esc=8)
    if "--exportar" in sys.argv:
        exportar(vs, "hole")
    print("previas en", previas, "·", len(vs), "variantes")


if __name__ == "__main__":
    main()
